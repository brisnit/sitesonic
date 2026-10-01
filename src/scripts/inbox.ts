/**
 * Posts form fields to the inbox endpoint (Web3Forms or any JSON endpoint).
 * Resolves only on confirmed delivery; throws otherwise. Some services answer
 * 200 with { success: false }, which counts as a failure.
 */
export async function deliver(endpoint: string, fields: Record<string, string>) {
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(fields),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const body = await res.json().catch(() => null);
  if (body && (body.success === false || body.success === 'false' || body.ok === false)) {
    console.warn('Not delivered:', body.message ?? body);
    throw new Error('Not delivered');
  }
}
