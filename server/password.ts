import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

export function hashPassword(senha: string): string {
  const salt = randomBytes(16).toString('hex');
  return `${salt}:${scryptSync(senha, salt, 64).toString('hex')}`;
}

export function verifyPassword(senha: string, armazenado: string): boolean {
  const [salt, hash] = armazenado.split(':');
  if (!salt || !hash) return false;
  const esperado = Buffer.from(hash, 'hex');
  const recebido = scryptSync(senha, salt, esperado.length);
  return timingSafeEqual(esperado, recebido);
}
