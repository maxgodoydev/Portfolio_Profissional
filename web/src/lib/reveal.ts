// Entrada discreta de seções ao rolar a página. Só ativa se o navegador suporta
// IntersectionObserver e a pessoa NÃO pediu movimento reduzido; caso contrário o conteúdo
// fica sempre visível (sem JS ou sem suporte, nada fica escondido).
const ROOT_CLASS = 'motion-ok';

export function motionAllowed(): boolean {
  return typeof window !== 'undefined' && 'IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Observa os elementos [data-reveal] dentro de `root` e adiciona .is-in quando entram na tela. Retorna a limpeza. */
export function observeReveals(root: ParentNode): () => void {
  const doc = document.documentElement;
  const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  const sync = () => doc.classList.toggle(ROOT_CLASS, motionAllowed());
  sync();
  mq.addEventListener('change', sync);

  const items = Array.from(root.querySelectorAll<HTMLElement>('[data-reveal]'));
  let io: IntersectionObserver | undefined;
  let mo: MutationObserver | undefined;
  if (motionAllowed()) {
    io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            (e.target as HTMLElement).classList.add('is-in');
            io?.unobserve(e.target);
          }
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
    );
    items.forEach((el) => io?.observe(el));
    // Elementos [data-reveal] que aparecerem depois (estados assíncronos) também são observados.
    mo = new MutationObserver((records) => {
      for (const r of records) {
        r.addedNodes.forEach((n) => {
          if (!(n instanceof HTMLElement)) return;
          if (n.matches('[data-reveal]')) io?.observe(n);
          n.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el) => io?.observe(el));
        });
      }
    });
    mo.observe(root as Node, { childList: true, subtree: true });
  } else {
    items.forEach((el) => el.classList.add('is-in'));
  }
  return () => {
    io?.disconnect();
    mo?.disconnect();
    mq.removeEventListener('change', sync);
  };
}
