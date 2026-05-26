import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabaseServer';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { jobId: string } }
) {
  const { jobId } = params;
  const body = await req.json();
  const { status } = body as { status?: string };

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

  const { data, error } = await supabase
    .from('jobs')
    .update({ status })
    .eq('id', jobId)
    .eq('business_id', dbUser.business_id)
    .select('id, status')
    .single();

  if (error) {
    return NextResponse.json({ error: 'Failed to update job' }, { status: 500 });
  }

  return NextResponse.json({ job: data });
}
