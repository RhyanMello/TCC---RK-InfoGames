import { Router } from 'express';
import { METODOS_PAGAMENTO } from '../../shared/constants.ts';
import { db, findOrCreateCliente } from '../db.ts';
import { HttpError, parseId, Validator } from '../http.ts';

export const vendasRouter = Router();

const SELECT = `
  SELECT v.id, v.cliente_id, c.nome AS cliente_nome, v.produto_id, v.produto_nome,
         v.pagamento, v.qtd, v.valor, v.data, v.detalhes
  FROM vendas v JOIN clientes c ON c.id = v.cliente_id`;

vendasRouter.get('/', (req, res) => {
  const q = `%${String(req.query.q ?? '').trim()}%`;
  res.json(
    db
      .prepare(`${SELECT} WHERE v.produto_nome LIKE ? OR c.nome LIKE ? OR v.pagamento LIKE ? ORDER BY v.data DESC, v.id DESC`)
      .all(q, q, q),
  );
});

vendasRouter.post('/', (req, res) => {
  const v = new Validator(req.body);
  const cliente = v.text('cliente', { required: true, max: 120, label: 'o cliente' });
  const produtoNome = v.text('produto', { required: true, max: 120, label: 'o produto' });
  const pagamento = v.oneOf('pagamento', METODOS_PAGAMENTO, 'o método de pagamento');
  const data = v.date('data', 'a data');
  const valor = v.int('valor', { required: true, label: 'o valor' });
  const detalhes = v.text('detalhes', { max: 500 }) || null;
  v.check();

  const produto = db.prepare('SELECT id, nome FROM produtos WHERE nome = ? COLLATE NOCASE').get(produtoNome) as
    | { id: number; nome: string }
    | undefined;

  const r = db
    .prepare(
      'INSERT INTO vendas (cliente_id, produto_id, produto_nome, pagamento, qtd, valor, data, detalhes) VALUES (?, ?, ?, ?, 1, ?, ?, ?)',
    )
    .run(findOrCreateCliente(cliente), produto?.id ?? null, produto?.nome ?? produtoNome, pagamento, valor, data, detalhes);
  res.status(201).json(db.prepare(`${SELECT} WHERE v.id = ?`).get(r.lastInsertRowid));
});

vendasRouter.delete('/:id', (req, res) => {
  const r = db.prepare('DELETE FROM vendas WHERE id = ?').run(parseId(req.params.id));
  if (!r.changes) throw new HttpError(404, 'Venda não encontrada.');
  res.status(204).end();
});
