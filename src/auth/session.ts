import type { Usuario } from '../api/types';

// "Lembrar de mim" guarda a sessão no localStorage; caso contrário, só na aba atual (sessionStorage).
const KEY = 'rk.sessao';

interface Sessao {
  token: string;
  usuario: Usuario;
}

let listeners: (() => void)[] = [];

function read(): Sessao | null {
  try {
    const raw = localStorage.getItem(KEY) ?? sessionStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Sessao) : null;
  } catch {
    return null;
  }
}

export function getSessao(): Sessao | null {
  return read();
}

export function getToken(): string | null {
  return read()?.token ?? null;
}

export function saveSessao(sessao: Sessao, lembrar: boolean) {
  clearSessao(false);
  (lembrar ? localStorage : sessionStorage).setItem(KEY, JSON.stringify(sessao));
  listeners.forEach((l) => l());
}

export function clearSessao(notify = true) {
  localStorage.removeItem(KEY);
  sessionStorage.removeItem(KEY);
  if (notify) listeners.forEach((l) => l());
}

export function onUnauthorized() {
  clearSessao();
}

export function subscribe(listener: () => void) {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}
