import { Router } from 'express';
import { CATEGORIAS_PRODUTO } from '../../shared/constants.ts';
import { db } from '../db.ts';
import { HttpError, parseId, Validator } from '../http.ts';

export const produtosRouter = Router();

function read(body: unknown) {
  const v = new Validator(body);
  const dados = {
    nome: v.text('nome', { required: true, max: 120, label: 'o nome' }),
    categoria: v.oneOf('categoria', CATEGORIAS_PRODUTO, 'a categoria'),
    sku: v.text('sku', { max: 40 }) || null,
    preco: v.int('preco', { required: true, label: 'o preço' }),
    custo: v.int('custo'),
    estoque: v.int('estoque', { required: true, label: 'o estoque' }),
  };
  v.check();
  return dados;
}

produtosRouter.get('/', (req, res) => {
  const q = `%${String(req.query.q ?? '').trim()}%`;
  res.json(
    db
      .prepare("SELECT * FROM produtos WHERE nome LIKE ? OR categoria LIKE ? OR IFNULL(sku, '') LIKE ? ORDER BY nome")
      .all(q, q, q),
  );
});

produtosRouter.post('/', (req, res) => {
  const d = read(req.body);
  const r = db
    .prepare('INSERT INTO produtos (nome, categoria, sku, preco, custo, estoque) VALUES (?, ?, ?, ?, ?, ?)')
    .run(d.nome, d.categoria, d.sku, d.preco, d.custo, d.estoque);
  res.status(201).json(db.prepare('SELECT * FROM produtos WHERE id = ?').get(r.lastInsertRowid));
});

produtosRouter.put('/:id', (req, res) => {
  const id = parseId(req.params.id);
  const d = read(req.body);
  const r = db
    .prepare('UPDATE produtos SET nome = ?, categoria = ?, sku = ?, preco = ?, custo = ?, estoque = ? WHERE id = ?')
    .run(d.nome, d.categoria, d.sku, d.preco, d.custo, d.estoque, id);
  if (!r.changes) throw new HttpError(404, 'Produto não encontrado.');
  res.json(db.prepare('SELECT * FROM produtos WHERE id = ?').get(id));
});

produtosRouter.delete('/:id', (req, res) => {
  const r = db.prepare('DELETE FROM produtos WHERE id = ?').run(parseId(req.params.id));
  if (!r.changes) throw new HttpError(404, 'Produto não encontrado.');
  res.status(204).end();
});
