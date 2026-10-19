import { useEffect } from 'react';

/** Largura (em px do Figma) que o sistema ocupa no computador: um pouco menor que o quadro de 1350 do Figma, para tudo aparecer maior. */
const LARGURA_BASE = 1250;
/** Abaixo desta largura vale o layout responsivo (sidebar só de ícones, tabelas com rolagem). */
const DESKTOP_MIN = 1024;
const CELULAR_MAX = 640;
/**
 * Os textos do Figma são pequenos (tabelas com 12px), então o sistema é ampliado conforme a tela:
 * no computador acompanha a largura (cerca de 1.1 num notebook 1366, 1.5 num monitor Full HD e até
 * 1.6 em 2K/4K), sem ficar abaixo de 1 para o cabeçalho e as tabelas caberem em 1024px.
 * Tablets e celulares têm um fator fixo, que deixa o layout responsivo legível e sem rolagem lateral.
 */
const ZOOM_MIN = 1;
const ZOOM_MAX = 1.6;
const ZOOM_TABLET = 1.15;
const ZOOM_CELULAR = 1.05;

/**
 * Em telas de computador, amplia ou reduz todo o sistema na mesma proporção do Figma,
 * para que sidebar, títulos, tabelas e botões mantenham a mesma harmonia em qualquer monitor.
 * O fator fica em --rk-zoom para que as alturas em vh possam ser compensadas no CSS.
 */
export function useFigmaScale() {
  useEffect(() => {
    const root = document.documentElement;

    function aplicar() {
      const w = window.innerWidth;
      const zoom =
        w < CELULAR_MAX
          ? ZOOM_CELULAR
          : w < DESKTOP_MIN
            ? ZOOM_TABLET
            : Math.min(Math.max(w / LARGURA_BASE, ZOOM_MIN), ZOOM_MAX);
      root.style.zoom = String(zoom);
      root.style.setProperty('--rk-zoom', String(zoom));
    }

    aplicar();
    window.addEventListener('resize', aplicar);
    return () => {
      window.removeEventListener('resize', aplicar);
      root.style.zoom = '';
      root.style.removeProperty('--rk-zoom');
    };
  }, []);
}
