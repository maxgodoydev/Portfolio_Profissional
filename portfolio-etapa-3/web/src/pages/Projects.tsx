import { useMemo, useState } from 'react';
import { ProjectCard } from '../components/ProjectCard';
import { format } from '../i18n';
import { useI18n } from '../i18n/context';
import { PROJECTS, type ProjectCategory } from '../content/projects';
import { buildPath } from '../routes';
import { PageHeader } from './shared';

type Filter = 'all' | ProjectCategory;
const FILTERS: readonly Filter[] = ['all', 'development', 'data', 'bi', 'automation', 'academic'];

export function ProjectsPage() {
  const { lang, t } = useI18n();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return PROJECTS.filter((p) => {
      if (filter !== 'all' && !p.categories.includes(filter)) return false;
      if (!q) return true;
      return [p.title, p.summary[lang], ...p.tags].some((s) => s.toLowerCase().includes(q));
    });
  }, [query, filter, lang]);

  const count = visible.length === 1 ? t.projects.countOne : format(t.projects.countMany, { n: visible.length });
  const filtered = query.trim() !== '' || filter !== 'all';

  return (
    <div className="page">
      <PageHeader title={t.projects.title} lead={t.projects.intro} />

      <div className="toolbar">
        <div className="field">
          <label htmlFor="project-search">{t.projects.searchLabel}</label>
          <input
            id="project-search"
            type="search"
            value={query}
            placeholder={t.projects.searchPlaceholder}
            onChange={(e) => setQuery(e.target.value)}
            autoComplete="off"
          />
        </div>
        <div role="group" aria-label={t.projects.filtersLabel} className="chips">
          {FILTERS.map((f) => (
            <button key={f} type="button" className="chip" aria-pressed={filter === f} onClick={() => setFilter(f)}>
              {t.projects.filters[f]}
            </button>
          ))}
        </div>
      </div>

      <p className="result-count" role="status">
        {count}
      </p>

      {visible.length > 0 ? (
        <ul className="card-grid">
          {visible.map((p) => (
            <li key={p.slug}>
              <ProjectCard
                title={p.title}
                summary={p.summary[lang]}
                href={buildPath(lang, 'project', p.slug)}
                tags={p.tags}
                category={t.projects.filters[p.categories[0]]}
                cta={t.projects.details}
                tagsLabel={t.project.technologies}
                headingLevel={2}
              />
            </li>
          ))}
        </ul>
      ) : (
        <div className="empty">
          <p>{t.projects.empty}</p>
          {filtered && (
            <button
              type="button"
              className="button button--ghost"
              onClick={() => {
                setQuery('');
                setFilter('all');
              }}
            >
              {t.projects.clear}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
