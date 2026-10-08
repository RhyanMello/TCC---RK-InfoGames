// Listas de opções usadas tanto pela API (validação) quanto pelas telas (selects).

export const CATEGORIAS_PRODUTO = ['Componentes', 'Jogos', 'Consoles', 'Periféricos', 'Acessórios'] as const;

export const METODOS_PAGAMENTO = ['Pix', 'Cartão de Crédito', 'Cartão de Débito', 'Dinheiro'] as const;

export const TIPOS_DESPESA = ['Produtos', 'Contas', 'Manutenção'] as const;

export const TIPOS_SERVICO = ['Informática', 'Escritório', 'Design', 'Manutenção', 'Visita técnica', 'Outro'] as const;

export type CategoriaProduto = (typeof CATEGORIAS_PRODUTO)[number];
export type MetodoPagamento = (typeof METODOS_PAGAMENTO)[number];
export type TipoDespesa = (typeof TIPOS_DESPESA)[number];
export type TipoServico = (typeof TIPOS_SERVICO)[number];
