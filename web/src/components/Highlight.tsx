import { splitMatches } from '../lib/search';

/** Destaca no texto os termos da busca (<mark>). Sem termos, renderiza o texto puro. */
export function Highlight({ text, tokens }: { text: string; tokens: readonly string[] }) {
  if (tokens.length === 0) return <>{text}</>;
  const pieces = splitMatches(text, tokens);
  if (!pieces.some((p) => p.hit)) return <>{text}</>;
  return (
    <>
      {pieces.map((p, i) =>
        p.hit ? (
          <mark key={i} className="hl">
            {p.text}
          </mark>
        ) : (
          <span key={i}>{p.text}</span>
        ),
      )}
    </>
  );
}
