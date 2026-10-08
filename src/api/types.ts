import type { CategoriaProduto, MetodoPagamento, TipoDespesa, TipoServico } from '../../shared/constants.ts';

// Valores monetários chegam da API em centavos; datas em ISO (AAAA-MM-DD).

export interface Usuario {
  id: number;
  nome: string;
}

export interface Cliente {
  id: number;
  nome: string;
}

export interface Produto {
  id: number;
  nome: string;
  categoria: CategoriaProduto;
  sku: string | null;
  preco: number;
  custo: number | null;
  estoque: number;
}

export interface Venda {
  id: number;
  cliente_id: number;
  cliente_nome: string;
  produto_id: number | null;
  produto_nome: string;
  pagamento: MetodoPagamento;
  qtd: number;
  valor: number;
  data: string;
  detalhes: string | null;
}

export interface Despesa {
  id: number;
  nome: string;
  tipo: TipoDespesa;
  valor: number;
  data: string;
}

export interface DespesasResumo {
  despesas: Despesa[];
  porTipo: Record<TipoDespesa, number>;
  total: number;
}

export interface Servico {
  id: number;
  cliente_id: number;
  cliente_nome: string;
  tipo: TipoServico;
  valor: number;
  data: string;
  descricao: string;
}

/** Corpo enviado para criar/editar um serviço. O cliente é identificado pelo nome. */
export interface ServicoInput {
  cliente: string;
  tipo: string;
  valor: number | null;
  data: string;
  descricao: string;
}

export interface Dashboard {
  mes: string;
  faturamento: number;
  totalVendas: number;
  lucro: number;
  lucroServicos: number;
  faturamentoPorMes: { mes: string; total: number }[];
  vendasPorCategoria: { categoria: string; total: number }[];
  topVendas: { produto: string; qtd: number; total: number }[];
}

export interface Relatorio {
  mes: string;
  vendas: { id: number; data: string; cliente: string; produto: string; pagamento: string; qtd: number; valor: number }[];
  servicos: { id: number; data: string; cliente: string; tipo: string; descricao: string; valor: number }[];
  despesas: { id: number; data: string; nome: string; tipo: string; valor: number }[];
  totais: {
    vendas: number;
    itensVendidos: number;
    servicos: number;
    faturamento: number;
    despesas: number;
    lucro: number;
  };
}
