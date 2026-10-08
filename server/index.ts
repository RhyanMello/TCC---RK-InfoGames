import express from 'express';
import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { authRouter, requireAuth } from './auth.ts';
import { errorHandler } from './http.ts';
import { clientesRouter } from './routes/clientes.ts';
import { dashboardRouter } from './routes/dashboard.ts';
import { despesasRouter } from './routes/despesas.ts';
import { produtosRouter } from './routes/produtos.ts';
import { relatorioRouter } from './routes/relatorio.ts';
import { servicosRouter } from './routes/servicos.ts';
import { vendasRouter } from './routes/vendas.ts';

const app = express();
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});
app.use('/api/auth', authRouter);
app.use('/api', requireAuth);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/clientes', clientesRouter);
app.use('/api/produtos', produtosRouter);
app.use('/api/vendas', vendasRouter);
app.use('/api/despesas', despesasRouter);
app.use('/api/servicos', servicosRouter);
app.use('/api/relatorio', relatorioRouter);
app.use(errorHandler);

// Em produção (npm run build && npm start) a própria API serve o front-end compilado.
const dist = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'dist');
if (existsSync(dist)) {
  app.use(express.static(dist));
  app.get(/^(?!\/api).*/, (_req, res) => res.sendFile(resolve(dist, 'index.html')));
}

// Em desenvolvimento (--dev) a API fica sempre na 3001, para onde o Vite redireciona /api.
// Em produção usa a porta definida pela hospedagem (PORT).
const port = process.argv.includes('--dev') ? 3001 : Number(process.env.PORT ?? 3001);
app.listen(port, () => console.log(`API da RK InfoGames em http://localhost:${port}`));
