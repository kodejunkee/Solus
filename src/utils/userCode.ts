const ALLOWED_CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

export function generateUserCode(): string {
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += ALLOWED_CHARS[Math.floor(Math.random() * ALLOWED_CHARS.length)];
  }
  return code;
}
