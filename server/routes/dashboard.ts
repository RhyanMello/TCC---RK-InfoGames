import { Router } from 'express';
import { db } from '../db.ts';
import { mesAtual, ultimosMeses } from './periodo.ts';

export const dashboardRouter = Router();

const soma = (sql: string, ...params: string[]) => (db.prepare(sql).get(...params) as { v: number | null }).v ?? 0;

const totalVendas = (mes: string) => soma("SELECT SUM(valor) AS v FROM vendas WHERE strftime('%Y-%m', data) = ?", mes);
const totalServicos = (mes: string) => soma("SELECT SUM(valor) AS v FROM servicos WHERE strftime('%Y-%m', data) = ?", mes);

dashboardRouter.get('/', (_req, res) => {
  const mes = mesAtual();
  const vendasMes = totalVendas(mes);
  const servicosMes = totalServicos(mes);
  const despesasMes = soma("SELECT SUM(valor) AS v FROM despesas WHERE strftime('%Y-%m', data) = ?", mes);

  const vendasPorCategoria = db
    .prepare(
      `SELECT IFNULL(p.categoria, 'Outros') AS categoria, SUM(v.valor) AS total
       FROM vendas v LEFT JOIN produtos p ON p.id = v.produto_id
       WHERE strftime('%Y-%m', v.data) = ?
       GROUP BY 1 ORDER BY total DESC`,
    )
    .all(mes);

  const topVendas = db
    .prepare(
      `SELECT produto_nome AS produto, SUM(qtd) AS qtd, SUM(valor) AS total
       FROM vendas WHERE strftime('%Y-%m', data) = ?
       GROUP BY produto_nome ORDER BY qtd DESC, total DESC LIMIT 6`,
    )
    .all(mes);

  res.json({
    mes,
    faturamento: vendasMes + servicosMes,
    totalVendas: soma("SELECT COUNT(*) AS v FROM vendas WHERE strftime('%Y-%m', data) = ?", mes),
    lucro: vendasMes + servicosMes - despesasMes,
    lucroServicos: servicosMes,
    faturamentoPorMes: ultimosMeses(4).map((m) => ({ mes: m, total: totalVendas(m) + totalServicos(m) })),
    vendasPorCategoria,
    topVendas,
  });
});
