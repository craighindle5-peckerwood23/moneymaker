import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerSupabase } from '@/lib/supabaseServer';
import { createJobSchema } from '@/lib/validation';
import crypto from 'crypto';
import { printJobTicket } from '@/lib/printer';

export async function GET(req: NextRequest) {
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: dbUser } = await supabase
    .from('users')
    .select('business_id')
    .eq('id', user.id)
    .single();

  if (!dbUser?.business_id) {
    return NextResponse.json({ jobs: [] });
  }

  const { data: jobs } = await supabase
    .from('jobs')
    .select('id, status, description, price, code, created_at')
    .eq('business_id', dbUser.business_id)
    .order('created_at', { ascending: false });

  return NextResponse.json({ jobs: jobs ?? [] });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = createJobSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: dbUser } = await supabase
    .from('users')
    .select('business_id')
    .eq('id', user.id)
    .single();

  if (!dbUser?.business_id) {
    return NextResponse.json({ error: 'No business linked' }, { status: 400 });
  }

  const { customerName, customerPhone, customerEmail, description, price } = parsed.data;

  // create or find customer
  const { data: customer } = await supabase
    .from('customers')
    .insert({
      business_id: dbUser.business_id,
      name: customerName,
      phone: customerPhone,
      email: customerEmail
    })
    .select('id, name')
    .single();

  const code = crypto.randomBytes(6).toString('hex'); // simple code for now

  const { data: job, error } = await supabase
    .from('jobs')
    .insert({
      business_id: dbUser.business_id,
      customer_id: customer?.id,
      status: 'pending',
      description,
      price,
      code
    })
    .select('id, code')
    .single();

  if (error || !job) {
    return NextResponse.json({ error: 'Failed to create job' }, { status: 500 });
  }

  // fire-and-forget print
  printJobTicket({
    jobId: job.id,
    businessName: 'Your Business', // later: fetch from businesses table
    customerName: customer?.name,
    code: job.code,
    description,
    price: price ?? null
  });

  return NextResponse.json({ job });
}
