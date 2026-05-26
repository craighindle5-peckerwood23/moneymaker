export type PrintPayload = {
  jobId: string;
  businessName: string;
  customerName?: string;
  code: string;
  description?: string;
  price?: number | null;
};

export async function printJobTicket(payload: PrintPayload) {
  // Phase 1: just log
  console.log('PRINT JOB TICKET', payload);

  // Phase 2: call local/remote print service
  const printerApiUrl = process.env.PRINTER_API_URL;
  if (!printerApiUrl) return;

  try {
    await fetch(printerApiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  } catch (e) {
    console.error('Printer error', e);
  }
}
