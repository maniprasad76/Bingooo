export const BINGOOO_PHONE_DISPLAY = '+91 79817 87317';
export const BINGOOO_PHONE_RAW = '917981787317';
export const BINGOOO_PHONE_TEL = 'tel:+917981787317';
export const BINGOOO_EMAIL_SUPPORT = 'bingooo.sklm@gmail.com';
export const BINGOOO_EMAIL_HELLO = 'bingooo.sklm@gmail.com';
export const BINGOOO_INSTAGRAM_URL = 'https://www.instagram.com/bingooo.co.in';
export const BINGOOO_INSTAGRAM_HANDLE = '@bingooo.co.in';
export const BINGOOO_YOUTUBE_URL = 'https://www.youtube.com/@bingooo_co';
export const BINGOOO_YOUTUBE_HANDLE = '@bingooo_co';
export const BINGOOO_TWITTER_URL = 'https://twitter.com/bingooo_co';
export const BINGOOO_TWITTER_HANDLE = '@bingooo_co';
export const BINGOOO_COMMUNITY_URL = 'https://chat.whatsapp.com/HRFrD7YPl8f1xdLvPXvDiQ';

export function getWhatsAppUrl(message?: string): string {
  const defaultMsg = 'Hi Bingooo, I would like to inquire about your menswear collection and custom designs.';
  const text = encodeURIComponent(message || defaultMsg);
  return `https://wa.me/${BINGOOO_PHONE_RAW}?text=${text}`;
}

export function getEmailUrl(subject?: string, body?: string): string {
  const s = subject ? encodeURIComponent(subject) : encodeURIComponent('Inquiry from Bingooo Store');
  const b = body ? `&body=${encodeURIComponent(body)}` : '';
  return `mailto:${BINGOOO_EMAIL_SUPPORT}?subject=${s}${b}`;
}
