import { Router } from 'express';
import { db } from '../db.ts';

export const clientesRouter = Router();

clientesRouter.get('/', (_req, res) => {
  res.json(db.prepare('SELECT id, nome FROM clientes ORDER BY nome').all());
});
