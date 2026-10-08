import type { NextFunction, Request, Response } from 'express';

export class HttpError extends Error {
  status: number;
  fields?: Record<string, string>;

  constructor(status: number, message: string, fields?: Record<string, string>) {
    super(message);
    this.status = status;
    this.fields = fields;
  }
}

/** Acumula erros de validação por campo e lança um 400 se houver algum. */
export class Validator {
  private erros: Record<string, string> = {};
  private body: Record<string, unknown>;

  constructor(body: unknown) {
    this.body = (body && typeof body === 'object' ? body : {}) as Record<string, unknown>;
  }

  text(campo: string, opts: { required?: boolean; max?: number; label?: string } = {}): string {
    const raw = this.body[campo];
    const valor = typeof raw === 'string' ? raw.trim() : '';
    if (opts.required && !valor) this.erros[campo] = `Informe ${opts.label ?? campo}.`;
    else if (opts.max && valor.length > opts.max) this.erros[campo] = `Máximo de ${opts.max} caracteres.`;
    return valor;
  }

  oneOf<T extends string>(campo: string, opcoes: readonly T[], label: string): T {
    const valor = this.text(campo, { required: true, label });
    if (valor && !opcoes.includes(valor as T)) this.erros[campo] = `Selecione ${label}.`;
    return valor as T;
  }

  /** Inteiro não negativo (centavos, quantidades). */
  int(campo: string, opts: { required?: boolean; label?: string; min?: number } = {}): number | null {
    const raw = this.body[campo];
    if (raw === undefined || raw === null || raw === '') {
      if (opts.required) this.erros[campo] = `Informe ${opts.label ?? campo}.`;
      return null;
    }
    const n = Number(raw);
    if (!Number.isInteger(n) || n < (opts.min ?? 0)) {
      this.erros[campo] = `Valor inválido.`;
      return null;
    }
    return n;
  }

  date(campo: string, label: string): string {
    const valor = this.text(campo, { required: true, label });
    if (!valor) return valor;
    const ok = /^\d{4}-\d{2}-\d{2}$/.test(valor) && !Number.isNaN(Date.parse(`${valor}T00:00:00`));
    if (!ok || new Date(`${valor}T00:00:00`).toISOString().slice(0, 10) !== valor) this.erros[campo] = 'Data inválida.';
    return valor;
  }

  check() {
    if (Object.keys(this.erros).length) throw new HttpError(400, 'Verifique os campos destacados.', this.erros);
  }
}

export function parseId(param: string | string[] | undefined): number {
  const id = Number(param);
  if (!Number.isInteger(id) || id <= 0) throw new HttpError(400, 'Identificador inválido.');
  return id;
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof HttpError) {
    res.status(err.status).json({ error: err.message, fields: err.fields });
    return;
  }
  console.error(err);
  res.status(500).json({ error: 'Erro interno do servidor.' });
}
