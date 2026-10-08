import { useEffect } from 'react';

// Tamanho do quadro das telas no Figma.
const FIGMA_W = 1350;
const FIGMA_H = 887;
/** Abaixo desta largura vale o layout responsivo (sidebar só de ícones, tabelas com rolagem). */
const DESKTOP_MIN = 1024;
/** Quanto do espaço da tela o layout ocupa (1 = encosta nas bordas). Menor = elementos menores. */
const DENSIDADE = 0.6;
/** Limites do fator de escala: nunca maior que o tamanho original do Figma. */
const ZOOM_MIN = 0.7;
const ZOOM_MAX = 1;

/**
 * Em telas de computador, amplia ou reduz todo o sistema na mesma proporção do Figma,
 * para que sidebar, títulos, tabelas e botões mantenham a mesma harmonia em qualquer monitor.
 * O fator fica em --rk-zoom para que as alturas em vh possam ser compensadas no CSS.
 */
export function useFigmaScale() {
  useEffect(() => {
    const root = document.documentElement;

    function aplicar() {
      const { innerWidth: w, innerHeight: h } = window;
      const ideal = Math.min(w / FIGMA_W, h / FIGMA_H) * DENSIDADE;
      const zoom = w < DESKTOP_MIN ? 1 : Math.min(Math.max(ideal, ZOOM_MIN), ZOOM_MAX);
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
