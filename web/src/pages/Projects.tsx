import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { Icon } from '../components/icons';
import { ExpandableProjectCard } from '../components/ExpandableProjectCard';
import { format } from '../i18n';
import { useI18n } from '../i18n/context';
import { PROJECTS, PROJECT_GROUPS, type ProjectGroup } from '../content/projects';
import { matchesAll, tokenize } from '../lib/search';
import { buildPath } from '../routes';
import { navigate, useLocation } from '../router';
import { PageHeader } from './shared';

/** Projetos por página (a lista nunca carrega todos de uma vez). */
export const PAGE_SIZE = 3;

type Filter = 'all' | ProjectGroup;
const FILTERS: readonly Filter[] = ['all', ...PROJECT_GROUPS];

/** Rótulo de um filtro ("Todos" ou o nome do grupo). */
const filterLabel = (t: { projects: { filters: { all: string }; groups: Record<ProjectGroup, string> } }, f: Filter) => (f === 'all' ? t.projects.filters.all : t.projects.groups[f]);

function parseFilter(value: string | null): Filter {
  return FILTERS.find((f) => f === value) ?? 'all';
}

function parsePage(value: string | null): number {
  const n = Number(value);
  return Number.isInteger(n) && n >= 1 ? n : 1;
}

/** As tecnologias mais frequentes entre os projetos (sugestões do estado vazio; dados reais, não inventados). */
const POPULAR_TAGS: readonly string[] = (() => {
  const count = new Map<string, number>();
  for (const p of PROJECTS) for (const tag of p.tags) count.set(tag, (count.get(tag) ?? 0) + 1);
  return [...count.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([tag]) => tag);
})();

export function ProjectsPage() {
  const { lang, t } = useI18n();
  const location = useLocation();

  // A busca e o filtro ficam na URL (?q=sql&cat=bi): voltar do detalhe de um projeto mantém o que a pessoa escolheu.
  const urlQuery = location.query.get('q') ?? '';
  const urlFilter = parseFilter(location.query.get('cat'));
  const urlPage = parsePage(location.query.get('page'));
  const [query, setQuery] = useState(urlQuery);
  const [filter, setFilter] = useState<Filter>(urlFilter);
  // A página pertence a uma busca/filtro (sig). Se a busca ou o filtro mudam, a página volta à 1 sem efeito extra.
  const [pageState, setPageState] = useState({ page: urlPage, sig: `${urlQuery.trim()}|${urlFilter}` });
  const sig = `${query.trim()}|${filter}`;
  const requestedPage = pageState.sig === sig ? pageState.page : 1;
  const written = useRef(`${urlQuery}|${urlFilter}|${urlPage}`);
  const resultsRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Botão voltar/avançar: adota a URL quando ela mudou por fora.
  useEffect(() => {
    const key = `${urlQuery}|${urlFilter}|${urlPage}`;
    if (key !== written.current) {
      written.current = key;
      setQuery(urlQuery);
      setFilter(urlFilter);
      setPageState({ page: urlPage, sig: `${urlQuery.trim()}|${urlFilter}` });
    }
  }, [urlQuery, urlFilter, urlPage]);

  const tokens = useMemo(() => tokenize(query), [query]);

  const searchable = useMemo(
    () => PROJECTS.map((p) => ({ p, text: [p.title, p.summary[lang], ...p.tags] })),
    [lang],
  );

  // Projetos que correspondem à busca, sem considerar a categoria (base da contagem de cada chip).
  const matchingSearch = useMemo(() => searchable.filter((s) => matchesAll(tokens, s.text)), [searchable, tokens]);

  const visible = useMemo(
    () => matchingSearch.filter((s) => filter === 'all' || s.p.group === filter).map((s) => s.p),
    [matchingSearch, filter],
  );

  // Ordem de exibição: grupos na ordem do site; a paginação corta essa lista em páginas de PAGE_SIZE.
  const ordered = useMemo(() => PROJECT_GROUPS.flatMap((g) => visible.filter((p) => p.group === g)), [visible]);
  const totalPages = Math.max(1, Math.ceil(ordered.length / PAGE_SIZE));
  const page = Math.min(requestedPage, totalPages);
  const pageItems = ordered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const from = ordered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, ordered.length);

  // Escreve na URL com atraso (evita uma entrada de histórico por tecla digitada).
  useEffect(() => {
    const key = `${query.trim()}|${filter}|${page}`;
    if (key === written.current) return;
    const id = window.setTimeout(() => {
      written.current = key;
      const params = new URLSearchParams();
      if (query.trim()) params.set('q', query.trim());
      if (filter !== 'all') params.set('cat', filter);
      if (page > 1) params.set('page', String(page));
      const qs = params.toString();
      navigate(buildPath(lang, 'projects') + (qs ? `?${qs}` : ''), { replace: true, keepScroll: true });
    }, 300);
    return () => window.clearTimeout(id);
  }, [query, filter, page, lang]);

  const goToPage = (n: number) => {
    const next = Math.min(Math.max(1, n), totalPages);
    setPageState({ page: next, sig });
    // Leva a pessoa ao topo da lista e anuncia a mudança (foco no contêiner dos resultados).
    window.requestAnimationFrame(() => {
      const el = resultsRef.current;
      if (!el) return;
      el.focus({ preventScroll: true });
      el.scrollIntoView({ block: 'start', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    });
  };

  const countFor = (f: Filter) => (f === 'all' ? matchingSearch.length : matchingSearch.filter((s) => s.p.group === f).length);

  const hasQuery = tokens.length > 0;
  const filtered = hasQuery || filter !== 'all';
  const countText = !filtered
    ? visible.length === 1
      ? t.projects.countOne
      : format(t.projects.countMany, { n: visible.length })
    : format(t.projects.countFiltered, { n: visible.length, total: PROJECTS.length });

  const reset = () => {
    setQuery('');
    setFilter('all');
    inputRef.current?.focus();
  };
  const trySearch = (term: string) => {
    setQuery(term);
    setFilter('all');
    inputRef.current?.focus();
  };

  return (
    <div className="page">
      <PageHeader title={t.projects.title} lead={t.projects.intro} />

      <div className="toolbar">
        <div className="field">
          <label htmlFor="project-search">{t.projects.searchLabel}</label>
          <div className="search">
            <Icon name="search" size={18} className="search__icon" />
            <input
              ref={inputRef}
              id="project-search"
              type="search"
              value={query}
              placeholder={t.projects.searchPlaceholder}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape' && query !== '') {
                  e.preventDefault();
                  setQuery('');
                }
              }}
              autoComplete="off"
              enterKeyHint="search"
            />
            {query !== '' && (
              <button type="button" className="search__clear" aria-label={t.projects.clearSearch} onClick={() => { setQuery(''); inputRef.current?.focus(); }}>
                <Icon name="close" size={16} />
              </button>
            )}
          </div>
        </div>

        <div role="group" aria-label={t.projects.filtersLabel} className="chips">
          {FILTERS.map((f) => {
            const n = countFor(f);
            const pressed = filter === f;
            return (
              <button
                key={f}
                type="button"
                className="chip"
                aria-pressed={pressed}
                disabled={n === 0 && !pressed}
                onClick={() => setFilter(f)}
              >
                {filterLabel(t, f)}
                <span className="chip__count" aria-hidden="true">
                  {n}
                </span>
                <span className="visually-hidden"> ({n})</span>
              </button>
            );
          })}
        </div>

        {filtered && (
          <div className="active-filters" role="group" aria-label={t.projects.activeFilters}>
            <span className="active-filters__label" aria-hidden="true">
              {t.projects.activeFilters}:
            </span>
            {filter !== 'all' && (
              <button type="button" className="chip chip--removable" aria-label={format(t.projects.removeFilter, { name: filterLabel(t, filter) })} onClick={() => setFilter('all')}>
                {filterLabel(t, filter)}
                <Icon name="close" size={14} />
              </button>
            )}
            {hasQuery && (
              <button type="button" className="chip chip--removable" aria-label={format(t.projects.removeFilter, { name: query.trim() })} onClick={() => { setQuery(''); inputRef.current?.focus(); }}>
                {format(t.projects.searchTerm, { q: query.trim() })}
                <Icon name="close" size={14} />
              </button>
            )}
            <button type="button" className="active-filters__clear" onClick={reset}>
              {t.projects.clearAll}
            </button>
          </div>
        )}
      </div>

      <p className="result-count" role="status">
        <span key={`${countText}-${page}`} className="result-count__text">
          {countText}
          {totalPages > 1 && ` · ${format(t.projects.pagination.showing, { from, to, total: ordered.length })}`}
        </span>
      </p>

      {visible.length > 0 ? (
        <>
        {/* key: ao trocar de grupo ou de página a lista é remontada e as seções entram com transição suave. */}
        <div className="project-groups" key={`${filter}-${page}`} ref={resultsRef} tabIndex={-1} id="project-results">
          {PROJECT_GROUPS.map((g) => {
            const items = pageItems.filter((p) => p.group === g);
            if (items.length === 0) return null;
            const headingId = `group-${g}`;
            return (
              <section key={g} className="project-group" aria-labelledby={headingId} data-group={g}>
                <h2 id={headingId} className="project-group__title">
                  {t.projects.groups[g]}
                  <span className="project-group__count" aria-hidden="true">
                    {items.length}
                  </span>
                </h2>
                <ul className="card-grid card-grid--results">
                  {items.map((p, i) => (
                    <li key={p.slug} style={{ '--i': Math.min(i, 5) } as CSSProperties}>
                      <ExpandableProjectCard project={p} category={t.projects.groups[p.group]} tokens={tokens} />
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
        {totalPages > 1 && (
          <nav className="pagination" aria-label={t.projects.pagination.label}>
            <ul>
              <li>
                <button type="button" className="pagination__btn" onClick={() => goToPage(page - 1)} disabled={page === 1} aria-label={t.projects.pagination.prev}>
                  <Icon name="arrowRight" size={18} className="pagination__arrow pagination__arrow--prev" />
                </button>
              </li>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <li key={n}>
                  <button
                    type="button"
                    className="pagination__btn"
                    onClick={() => goToPage(n)}
                    aria-current={n === page ? 'page' : undefined}
                    aria-label={format(t.projects.pagination.page, { n })}
                  >
                    {n}
                  </button>
                </li>
              ))}
              <li>
                <button type="button" className="pagination__btn" onClick={() => goToPage(page + 1)} disabled={page === totalPages} aria-label={t.projects.pagination.next}>
                  <Icon name="arrowRight" size={18} className="pagination__arrow" />
                </button>
              </li>
            </ul>
          </nav>
        )}
        </>
      ) : (
        <div className="empty empty--search">
          <svg className="empty__art" viewBox="0 0 120 96" width="120" height="96" aria-hidden="true" focusable="false">
            <rect x="8" y="14" width="64" height="12" rx="6" className="empty__line" />
            <rect x="8" y="34" width="44" height="12" rx="6" className="empty__line" />
            <rect x="8" y="54" width="54" height="12" rx="6" className="empty__line" />
            <circle cx="82" cy="52" r="22" className="empty__lens" />
            <path d="M98 68l16 16" className="empty__handle" />
            <path d="M74 52h16" className="empty__dash" />
          </svg>
          <h2 className="empty__title">{t.projects.emptyTitle}</h2>
          <p>{hasQuery ? format(t.projects.emptyFor, { q: query.trim() }) : t.projects.empty}</p>
          {POPULAR_TAGS.length > 0 && (
            <>
              <p className="empty__try">{t.projects.emptyTry}</p>
              <ul className="chips empty__suggest">
                {POPULAR_TAGS.map((tag) => (
                  <li key={tag}>
                    <button type="button" className="chip" onClick={() => trySearch(tag)}>
                      {tag}
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
          {filtered && (
            <button type="button" className="button button--ghost" onClick={reset}>
              {t.projects.clear}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
