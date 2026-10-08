import { useSyncExternalStore } from 'react';
import { getSessao, subscribe } from './session';

let cache = getSessao();
let cacheKey = JSON.stringify(cache);

function snapshot() {
  const atual = getSessao();
  const key = JSON.stringify(atual);
  if (key !== cacheKey) {
    cache = atual;
    cacheKey = key;
  }
  return cache;
}

export function useSessao() {
  return useSyncExternalStore(subscribe, snapshot);
}
