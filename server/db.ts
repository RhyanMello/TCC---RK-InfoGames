import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { hashPassword } from './password.ts';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dbPath = process.env.RK_DB ?? resolve(root, 'data', 'rk.db');
mkdirSync(dirname(dbPath), { recursive: true });

export const db = new DatabaseSync(dbPath);
db.exec('PRAGMA foreign_keys = ON; PRAGMA journal_mode = WAL;');

// Valores monetários são guardados em centavos (INTEGER) e datas em ISO (AAAA-MM-DD).
db.exec(`
  CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    usuario TEXT NOT NULL UNIQUE COLLATE NOCASE,
    senha_hash TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS sessoes (
    token TEXT PRIMARY KEY,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    criado_em TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS clientes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL UNIQUE COLLATE NOCASE,
    criado_em TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS produtos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    categoria TEXT NOT NULL,
    sku TEXT,
    preco INTEGER NOT NULL,
    custo INTEGER,
    estoque INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS vendas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cliente_id INTEGER NOT NULL REFERENCES clientes(id),
    produto_id INTEGER REFERENCES produtos(id) ON DELETE SET NULL,
    produto_nome TEXT NOT NULL,
    pagamento TEXT NOT NULL,
    qtd INTEGER NOT NULL DEFAULT 1,
    valor INTEGER NOT NULL,
    data TEXT NOT NULL,
    detalhes TEXT
  );

  CREATE TABLE IF NOT EXISTS despesas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    tipo TEXT NOT NULL,
    valor INTEGER NOT NULL,
    data TEXT NOT NULL DEFAULT (date('now', 'localtime'))
  );

  CREATE TABLE IF NOT EXISTS servicos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cliente_id INTEGER NOT NULL REFERENCES clientes(id),
    tipo TEXT NOT NULL,
    valor INTEGER NOT NULL,
    data TEXT NOT NULL,
    descricao TEXT NOT NULL DEFAULT ''
  );
`);

/** Busca o cliente pelo nome (sem diferenciar maiúsculas) ou cadastra um novo. */
export function findOrCreateCliente(nome: string): number {
  const found = db.prepare('SELECT id FROM clientes WHERE nome = ?').get(nome) as { id: number } | undefined;
  if (found) return found.id;
  return Number(db.prepare('INSERT INTO clientes (nome) VALUES (?)').run(nome).lastInsertRowid);
}

function isoDaysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function seed() {
  const hasUser = db.prepare('SELECT COUNT(*) AS n FROM usuarios').get() as { n: number };
  if (hasUser.n > 0) return;

  db.prepare('INSERT INTO usuarios (nome, usuario, senha_hash) VALUES (?, ?, ?)').run('Silas', 'silas', hashPassword('rk123'));

  // Dados de exemplo baseados nas telas do Figma.
  const produtos: [string, string, string, number, number, number][] = [
    ['Placa de Video RTX 4060', 'Componentes', 'RTX4060', 232090, 200000, 12],
    ['God of War Ragnarok PS5', 'Jogos', 'GOWR-PS5', 34990, 22000, 9],
    ['PlayStation 5', 'Consoles', 'PS5-STD', 389990, 300000, 7],
    ['Mouse Gamer Logitech G502', 'Periféricos', 'LOG-G502', 29990, 18000, 5],
    ['Headset HyperX Cloud II', 'Acessórios', 'HX-CLOUD2', 49990, 32000, 4],
    ['Processador AMD Ryzen 5 5700X', 'Componentes', 'R5-5700X', 109990, 80000, 4],
  ];
  const insProduto = db.prepare('INSERT INTO produtos (nome, categoria, sku, preco, custo, estoque) VALUES (?, ?, ?, ?, ?, ?)');
  for (const p of produtos) insProduto.run(...p);

  const clientes = ['João Pereira', 'Maria Souza', 'Carlos Lima', 'Ana Oliveira', 'Pedro Santos', 'Juliana Costa'];
  const clienteIds = clientes.map(findOrCreateCliente);

  const pagamentos = ['Pix', 'Cartão de Crédito', 'Cartão de Débito', 'Dinheiro'];
  const insVenda = db.prepare(
    'INSERT INTO vendas (cliente_id, produto_id, produto_nome, pagamento, qtd, valor, data, detalhes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
  );
  // Vendas do mês atual e dos três anteriores, para alimentar o Faturamento Mensal.
  const vendas: [produto: number, qtd: number, diasAtras: number][] = [
    [0, 2, 0], [1, 3, 0], [2, 1, 1], [3, 2, 1], [4, 1, 2], [5, 1, 2], [1, 2, 3], [3, 1, 4],
    [0, 1, 34], [2, 1, 40], [3, 1, 47], [1, 2, 66], [4, 1, 72], [5, 1, 80], [2, 1, 101],
  ];
  vendas.forEach(([pi, qtd, dias], i) => {
    const [nome, , , preco] = produtos[pi];
    insVenda.run(clienteIds[i % clienteIds.length], pi + 1, nome, pagamentos[i % pagamentos.length], qtd, preco * qtd, isoDaysAgo(dias), null);
  });

  const insDespesa = db.prepare('INSERT INTO despesas (nome, tipo, valor, data) VALUES (?, ?, ?, ?)');
  insDespesa.run('Reposição de placas de vídeo', 'Produtos', 400000, isoDaysAgo(1));
  insDespesa.run('Reposição de jogos PS5', 'Produtos', 120000, isoDaysAgo(2));
  insDespesa.run('Conta de energia', 'Contas', 45000, isoDaysAgo(3));
  insDespesa.run('Aluguel da loja', 'Contas', 250000, isoDaysAgo(0));
  insDespesa.run('Manutenção do ar-condicionado', 'Manutenção', 38000, isoDaysAgo(4));

  const insServico = db.prepare('INSERT INTO servicos (cliente_id, tipo, valor, data, descricao) VALUES (?, ?, ?, ?, ?)');
  insServico.run(clienteIds[0], 'Informática', 15000, isoDaysAgo(1), 'Formatação e instalação do Windows');
  insServico.run(clienteIds[1], 'Manutenção', 18000, isoDaysAgo(3), 'Manutenção preventiva em computador');
  insServico.run(clienteIds[2], 'Escritório', 8000, isoDaysAgo(5), 'Instalação de impressora');
  insServico.run(clienteIds[3], 'Design', 45000, isoDaysAgo(6), 'Criação de identidade visual');
  insServico.run(clienteIds[4], 'Informática', 12000, isoDaysAgo(14), 'Configuração de rede');
  insServico.run(clienteIds[5], 'Visita técnica', 9000, isoDaysAgo(18), 'Visita técnica para diagnóstico');
  insServico.run(clienteIds[0], 'Manutenção', 22000, isoDaysAgo(37), 'Manutenção em notebook');
}

seed();
