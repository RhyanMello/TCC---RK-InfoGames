import { Router } from 'express';
import { TIPOS_DESPESA } from '../../shared/constants.ts';
import { db } from '../db.ts';
import { Validator } from '../http.ts';
import { mesAtual } from './periodo.ts';

export const despesasRouter = Router();

despesasRouter.get('/', (_req, res) => {
  const mes = mesAtual();
  const despesas = db
    .prepare("SELECT * FROM despesas WHERE strftime('%Y-%m', data) = ? ORDER BY data DESC, id DESC")
    .all(mes);
  const totais = db
    .prepare("SELECT tipo, SUM(valor) AS total FROM despesas WHERE strftime('%Y-%m', data) = ? GROUP BY tipo")
    .all(mes) as { tipo: string; total: number }[];
  const porTipo = Object.fromEntries(TIPOS_DESPESA.map((t) => [t, totais.find((x) => x.tipo === t)?.total ?? 0]));
  res.json({ despesas, porTipo, total: totais.reduce((s, x) => s + x.total, 0) });
});

despesasRouter.post('/', (req, res) => {
  const v = new Validator(req.body);
  const nome = v.text('nome', { required: true, max: 120, label: 'o nome' });
  const valor = v.int('valor', { required: true, label: 'o valor' });
  const tipo = v.oneOf('tipo', TIPOS_DESPESA, 'o tipo');
  v.check();
  const r = db
    .prepare("INSERT INTO despesas (nome, tipo, valor, data) VALUES (?, ?, ?, date('now', 'localtime'))")
    .run(nome, tipo, valor);
  res.status(201).json(db.prepare('SELECT * FROM despesas WHERE id = ?').get(r.lastInsertRowid));
});
