export function buildWhatsAppUrl(phone: string): string | null {
  let digits = phone.replace(/\D/g, "");
  if (!digits) return null;

  if (digits.startsWith("0")) {
    digits = `44${digits.slice(1)}`;
  }

  return `https://wa.me/${digits}`;
}

export function buildTelUrl(phone: string): string | null {
  const digits = phone.replace(/\D/g, "");
  if (!digits) return null;
  return `tel:${digits.startsWith("0") ? digits : `+${digits}`}`;
}
