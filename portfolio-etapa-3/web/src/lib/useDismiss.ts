import { useEffect, type RefObject } from 'react';

/**
 * Fecha um popover/menu aberto ao clicar fora ou quando o foco sai dele (Tab).
 * (Escape é tratado por cada componente, pois cada um devolve o foco ao seu botão.)
 */
export function useDismiss(open: boolean, containerRef: RefObject<HTMLElement | null>, onDismiss: () => void): void {
  useEffect(() => {
    if (!open) return;
    const outside = (target: EventTarget | null) => {
      const el = containerRef.current;
      return !!el && target instanceof Node && !el.contains(target);
    };
    const onPointer = (e: Event) => outside(e.target) && onDismiss();
    const onFocusIn = (e: Event) => outside(e.target) && onDismiss();
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('focusin', onFocusIn);
    return () => {
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('focusin', onFocusIn);
    };
  }, [open, containerRef, onDismiss]);
}
