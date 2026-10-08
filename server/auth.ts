import { randomBytes } from 'node:crypto';
import { Router, type NextFunction, type Request, type Response } from 'express';
import { db } from './db.ts';
import { HttpError, Validator } from './http.ts';
import { verifyPassword } from './password.ts';

interface UsuarioRow {
  id: number;
  nome: string;
  usuario: string;
  senha_hash: string;
}

export const authRouter = Router();

authRouter.post('/login', (req, res) => {
  const v = new Validator(req.body);
  const usuario = v.text('usuario', { required: true, label: 'o usuário' });
  const senha = v.text('senha', { required: true, label: 'a senha' });
  v.check();

  const row = db.prepare('SELECT * FROM usuarios WHERE usuario = ?').get(usuario) as UsuarioRow | undefined;
  if (!row || !verifyPassword(senha, row.senha_hash)) throw new HttpError(401, 'Usuário ou senha incorretos.');

  const token = randomBytes(32).toString('hex');
  db.prepare('INSERT INTO sessoes (token, usuario_id) VALUES (?, ?)').run(token, row.id);
  res.json({ token, usuario: { id: row.id, nome: row.nome } });
});

authRouter.post('/logout', (req, res) => {
  const token = bearer(req);
  if (token) db.prepare('DELETE FROM sessoes WHERE token = ?').run(token);
  res.status(204).end();
});

function bearer(req: Request): string | null {
  const h = req.headers.authorization;
  return h?.startsWith('Bearer ') ? h.slice(7) : null;
}

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const token = bearer(req);
  const sessao = token ? db.prepare('SELECT usuario_id FROM sessoes WHERE token = ?').get(token) : undefined;
  if (!sessao) throw new HttpError(401, 'Sessão expirada. Entre novamente.');
  next();
}
