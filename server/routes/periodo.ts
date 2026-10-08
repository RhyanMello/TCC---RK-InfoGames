/** Mês no formato AAAA-MM (horário local do servidor). */
export function mesAtual(base = new Date()): string {
  return `${base.getFullYear()}-${String(base.getMonth() + 1).padStart(2, '0')}`;
}

/** Os últimos `n` meses, do mais recente para o mais antigo. */
export function ultimosMeses(n: number): string[] {
  const hoje = new Date();
  return Array.from({ length: n }, (_, i) => mesAtual(new Date(hoje.getFullYear(), hoje.getMonth() - i, 1)));
}
