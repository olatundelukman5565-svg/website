export function buildWhatsappUrl(rawNumber: string, message?: string): string {
  const digits = rawNumber.replace(/[^0-9]/g, "");
  const base = `https://wa.me/${digits}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
