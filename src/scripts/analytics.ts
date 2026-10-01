/** Sends a Meta Pixel standard event when the pixel is installed; no-op otherwise. */
type Fbq = (cmd: 'track', event: string, params?: Record<string, unknown>) => void;

export function track(event: string, params?: Record<string, unknown>) {
  const fbq = (window as unknown as { fbq?: Fbq }).fbq;
  if (typeof fbq === 'function') fbq('track', event, params);
}
