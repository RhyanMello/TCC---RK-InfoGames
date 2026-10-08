const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

/** Centavos -> "R$ 1.234,56". */
export function formatBRL(centavos: number): string {
  return brl.format(centavos / 100).replace(/ /g, ' ');
}

/** Texto digitado -> centavos. Considera apenas os dígitos (máscara da direita para a esquerda). */
export function parseBRLDigits(texto: string): number | null {
  const digitos = texto.replace(/\D/g, '').replace(/^0+(?=\d)/, '');
  return digitos ? Number(digitos) : null;
}

/** "2026-04-03" -> "03/04/2026". */
export function formatDateBR(iso: string): string {
  const [a, m, d] = iso.split('-');
  return a && m && d ? `${d}/${m}/${a}` : iso;
}

/** "03/04/2026" -> "2026-04-03" (ou null se a data não existir). */
export function parseDateBR(texto: string): string | null {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(texto);
  if (!m) return null;
  const [, d, mes, a] = m;
  const iso = `${a}-${mes}-${d}`;
  const data = new Date(`${iso}T00:00:00`);
  return !Number.isNaN(data.getTime()) && data.toISOString().slice(0, 10) === iso ? iso : null;
}

/** Aplica a máscara DD/MM/AAAA enquanto o usuário digita. */
export function maskDateBR(texto: string): string {
  const d = texto.replace(/\D/g, '').slice(0, 8);
  if (d.length <= 2) return d;
  if (d.length <= 4) return `${d.slice(0, 2)}/${d.slice(2)}`;
  return `${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4)}`;
}

export function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

/** "2026-04" -> "Abril". */
export function monthName(anoMes: string): string {
  return meses[Number(anoMes.slice(5, 7)) - 1] ?? anoMes;
}

/** "2026-04" -> "abr." (rótulo do gráfico). */
export function monthShort(anoMes: string): string {
  return `${monthName(anoMes).slice(0, 3).toLowerCase()}.`;
}
