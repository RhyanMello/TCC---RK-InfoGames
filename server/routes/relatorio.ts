import { Router } from 'express';
import { db } from '../db.ts';
import { HttpError } from '../http.ts';
import { mesAtual } from './periodo.ts';

export const relatorioRouter = Router();

/** Meses que têm algum lançamento (vendas, serviços ou despesas), do mais recente para o mais antigo. */
relatorioRouter.get('/meses', (_req, res) => {
  const rows = db
    .prepare(
      `SELECT DISTINCT m FROM (
         SELECT strftime('%Y-%m', data) AS m FROM vendas
         UNION SELECT strftime('%Y-%m', data) FROM servicos
         UNION SELECT strftime('%Y-%m', data) FROM despesas
       ) ORDER BY m DESC`,
    )
    .all() as { m: string }[];
  const meses = rows.map((r) => r.m);
  if (!meses.includes(mesAtual())) meses.unshift(mesAtual());
  res.json(meses);
});

relatorioRouter.get('/:mes', (req, res) => {
  const mes = String(req.params.mes);
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(mes)) throw new HttpError(400, 'Mês inválido.');

  const vendas = db
    .prepare(
      `SELECT v.id, v.data, c.nome AS cliente, v.produto_nome AS produto, v.pagamento, v.qtd, v.valor
       FROM vendas v JOIN clientes c ON c.id = v.cliente_id
       WHERE strftime('%Y-%m', v.data) = ? ORDER BY v.data, v.id`,
    )
    .all(mes) as { valor: number; qtd: number }[];

  const servicos = db
    .prepare(
      `SELECT s.id, s.data, c.nome AS cliente, s.tipo, s.descricao, s.valor
       FROM servicos s JOIN clientes c ON c.id = s.cliente_id
       WHERE strftime('%Y-%m', s.data) = ? ORDER BY s.data, s.id`,
    )
    .all(mes) as { valor: number }[];

  const despesas = db
    .prepare("SELECT id, data, nome, tipo, valor FROM despesas WHERE strftime('%Y-%m', data) = ? ORDER BY data, id")
    .all(mes) as { valor: number }[];

  const soma = (lista: { valor: number }[]) => lista.reduce((s, x) => s + x.valor, 0);
  const totalVendas = soma(vendas);
  const totalServicos = soma(servicos);
  const totalDespesas = soma(despesas);

  res.json({
    mes,
    vendas,
    servicos,
    despesas,
    totais: {
      vendas: totalVendas,
      itensVendidos: vendas.reduce((s, v) => s + v.qtd, 0),
      servicos: totalServicos,
      faturamento: totalVendas + totalServicos,
      despesas: totalDespesas,
      lucro: totalVendas + totalServicos - totalDespesas,
    },
  });
});
