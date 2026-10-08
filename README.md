# RK Informática e Games — Sistema de Gerenciamento

Sistema de gerenciamento da loja (TCC), implementado a partir das telas do Figma.

## Tecnologias

- **Front-end:** React 19 + TypeScript + Vite, React Router
- **Back-end:** Node.js (≥ 23.6, executa TypeScript nativamente) + Express
- **Banco de dados:** SQLite (módulo nativo `node:sqlite`), arquivo em `data/rk.db`
- **Fontes:** Inter e Press Start 2P (tela de login), via `@fontsource`

## Como rodar

```bash
npm install
npm run dev
```

- Front-end: http://localhost:5173
- API: http://localhost:3001 (o Vite redireciona `/api` para ela)

Na primeira execução o banco é criado e preenchido com dados de exemplo.
Usuário de teste: **silas** / senha **rk123**.

Para recomeçar com o banco limpo, pare o servidor e apague `data/rk.db`.

### Produção

```bash
npm run build
npm start
```

A API passa a servir o front-end compilado em http://localhost:3001.

## Estrutura

```
server/            API Express + SQLite
  db.ts            criação das tabelas e dados de exemplo
  auth.ts          login/logout e proteção das rotas
  routes/          clientes, produtos, vendas, despesas, serviços, dashboard
shared/            listas de opções usadas pela API e pelas telas
src/
  components/      componentes do Figma (Sidebar, PageHeader, SearchField, Button,
                   DataTable, Modal, StatCard, Card, campos de formulário...)
  pages/           Login, Faturamento Mensal, Estoque, Gastos Mensais,
                   Produtos Vendidos e Serviços Prestados
  assets/          logo, arte do login e ícones extraídos do Figma
```

## Clientes

Existe uma única tabela `clientes`, usada tanto pelas vendas quanto pelos serviços.
Nos formulários, o campo **Cliente** sugere os clientes já cadastrados; se for digitado
um nome novo, o cliente é cadastrado automaticamente ao salvar.
