import { Router } from 'express';
import { TIPOS_SERVICO } from '../../shared/constants.ts';
import { db, findOrCreateCliente } from '../db.ts';
import { HttpError, parseId, Validator } from '../http.ts';

export const servicosRouter = Router();

const SELECT = `
  SELECT s.id, s.cliente_id, c.nome AS cliente_nome, s.tipo, s.valor, s.data, s.descricao
  FROM servicos s JOIN clientes c ON c.id = s.cliente_id`;

function read(body: unknown) {
  const v = new Validator(body);
  const dados = {
    cliente: v.text('cliente', { required: true, max: 120, label: 'o cliente' }),
    tipo: v.oneOf('tipo', TIPOS_SERVICO, 'o tipo de serviço'),
    valor: v.int('valor', { required: true, label: 'o valor' }),
    data: v.date('data', 'a data'),
    descricao: v.text('descricao', { max: 1000 }),
  };
  v.check();
  return dados;
}

servicosRouter.get('/', (req, res) => {
  const q = `%${String(req.query.q ?? '').trim()}%`;
  // A pesquisa também aceita a data no formato brasileiro (DD/MM/AAAA).
  res.json(
    db
      .prepare(
        `${SELECT}
         WHERE c.nome LIKE ? OR s.tipo LIKE ? OR s.descricao LIKE ? OR strftime('%d/%m/%Y', s.data) LIKE ?
         ORDER BY s.data DESC, s.id DESC`,
      )
      .all(q, q, q, q),
  );
});

servicosRouter.post('/', (req, res) => {
  const d = read(req.body);
  const r = db
    .prepare('INSERT INTO servicos (cliente_id, tipo, valor, data, descricao) VALUES (?, ?, ?, ?, ?)')
    .run(findOrCreateCliente(d.cliente), d.tipo, d.valor, d.data, d.descricao);
  res.status(201).json(db.prepare(`${SELECT} WHERE s.id = ?`).get(r.lastInsertRowid));
});

servicosRouter.put('/:id', (req, res) => {
  const id = parseId(req.params.id);
  const d = read(req.body);
  const r = db
    .prepare('UPDATE servicos SET cliente_id = ?, tipo = ?, valor = ?, data = ?, descricao = ? WHERE id = ?')
    .run(findOrCreateCliente(d.cliente), d.tipo, d.valor, d.data, d.descricao, id);
  if (!r.changes) throw new HttpError(404, 'Serviço não encontrado.');
  res.json(db.prepare(`${SELECT} WHERE s.id = ?`).get(id));
});

servicosRouter.delete('/:id', (req, res) => {
  const r = db.prepare('DELETE FROM servicos WHERE id = ?').run(parseId(req.params.id));
  if (!r.changes) throw new HttpError(404, 'Serviço não encontrado.');
  res.status(204).end();
});
