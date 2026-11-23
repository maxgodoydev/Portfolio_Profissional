import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import type { Project } from '../content/projects';
import { PROJECT_DETAILS } from '../content/projectDetails';
import { format } from '../i18n';
import { useI18n } from '../i18n/context';
import { formatDate } from '../lib/period';
import { matchesAll } from '../lib/search';
import { ExternalLink } from '../pages/shared';
import { Link } from '../router';
import { buildPath } from '../routes';
import { Highlight } from './Highlight';
import { Icon } from './icons';
import { Tag, TagList } from './Tag';

/** Quantas tecnologias aparecem no cartão recolhido (o restante vira "+N"). */
const PREVIEW_TAGS = 4;

export interface ExpandableProjectCardProps {
  project: Project;
  category: string;
  /** Termos da busca a destacar (já normalizados). */
  tokens?: readonly string[];
}

/**
 * Cartão de projeto expansível (padrão "disclosure" do WAI-ARIA: o título é um botão com aria-expanded).
 * Recolhido: categoria, título, resumo e prévia das tecnologias. Expandido: foto (se existir), fatos,
 * funcionalidades, todas as tecnologias e links. Só usa dados já existentes em content/.
 * O cartão inteiro alterna ao toque/clique (o ::after do botão cobre o cartão); links internos ficam acima dele.
 */
export function ExpandableProjectCard({ project, category, tokens = [] }: ExpandableProjectCardProps) {
  const { lang, t } = useI18n();
  const [open, setOpen] = useState(false);
  const uid = useId();
  const panelId = `${uid}-painel`;
  const cardRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const firstRender = useRef(true);

  const d = PROJECT_DETAILS[project.slug]?.[lang];
  const p = t.project;
  const summary = project.summary[lang];

  // Ao abrir, garante que o fim do cartão apareça (útil no celular); não faz nada se já está visível.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    if (!open) return;
    const id = window.setTimeout(() => {
      const el = cardRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      if (r.bottom > window.innerHeight) {
        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        el.scrollIntoView({ block: 'nearest', behavior: reduce ? 'auto' : 'smooth' });
      }
    }, 300);
    return () => window.clearTimeout(id);
  }, [open]);

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && open) {
      e.stopPropagation();
      setOpen(false);
      toggleRef.current?.focus();
    }
  };

  // Prévia: se a busca casa com tecnologias, elas vêm primeiro (para o destaque ficar visível).
  const ordered = tokens.length === 0 ? project.tags : [...project.tags].sort((a, b) => Number(matchesAll(tokens, [b])) - Number(matchesAll(tokens, [a])));
  const preview = ordered.slice(0, PREVIEW_TAGS);
  const hidden = project.tags.length - preview.length;

  return (
    <article ref={cardRef} className="project-card project-card--expandable" data-open={open ? 'true' : 'false'} onKeyDown={onKeyDown}>
      <div className="project-card__cover" aria-hidden={project.cover ? undefined : true} data-empty={project.cover ? undefined : 'true'}>
        {project.cover ? (
          <img src={project.cover.src} width={project.cover.width} height={project.cover.height} alt={project.cover.alt[lang]} loading="lazy" decoding="async" />
        ) : (
          <Icon name="chart" size={34} />
        )}
      </div>
      <p className="project-card__category">{category}</p>
      <h2 className="project-card__title">
        <button ref={toggleRef} type="button" className="project-card__toggle" aria-expanded={open} aria-controls={panelId} onClick={() => setOpen((v) => !v)}>
          <Highlight text={project.title} tokens={tokens} />
        </button>
      </h2>
      <p className="project-card__summary">
        <Highlight text={summary} tokens={tokens} />
      </p>

      {preview.length > 0 && (
        <div className="collapse collapse--preview" data-open={open ? 'false' : 'true'} inert={open}>
          <div className="collapse__inner">
            <ul className="tag-list" aria-label={p.technologies}>
              {preview.map((tag) => (
                <li key={tag}>
                  <Tag icon={tag}>
                    <Highlight text={tag} tokens={tokens} />
                  </Tag>
                </li>
              ))}
              {hidden > 0 && (
                <li>
                  <Tag tone="outline">
                    <span aria-hidden="true">{format(t.projects.moreTags, { n: hidden })}</span>
                    <span className="visually-hidden">{format(t.projects.moreTagsLabel, { n: hidden })}</span>
                  </Tag>
                </li>
              )}
            </ul>
          </div>
        </div>
      )}

      <div id={panelId} className="collapse collapse--panel" data-open={open ? 'true' : 'false'} inert={!open} role="region" aria-label={project.title}>
        <div className="collapse__inner">
          <div className="project-card__panel">
            {project.image && (
              <figure className="project-card__photo">
                <img src={project.image.src} width={project.image.width} height={project.image.height} alt={project.image.alt[lang]} loading="lazy" decoding="async" />
              </figure>
            )}

            {(project.kind || project.created || d?.team) && (
              <dl className="facts facts--compact">
                {project.kind && (
                  <div>
                    <dt>{p.kindLabel}</dt>
                    <dd>{p.kinds[project.kind]}</dd>
                  </div>
                )}
                {project.created && (
                  <div>
                    <dt>{p.created}</dt>
                    <dd>{formatDate(lang, project.created)}</dd>
                  </div>
                )}
                {d?.team && (
                  <div>
                    <dt>{p.team}</dt>
                    <dd>{d.team}</dd>
                  </div>
                )}
              </dl>
            )}

            {d?.features && d.features.length > 0 && (
              <div className="project-card__block">
                <h3 className="project-card__subtitle">{p.features}</h3>
                <ul className="check-list">
                  {d.features.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
              </div>
            )}

            {project.tags.length > 0 && (
              <div className="project-card__block">
                <h3 className="project-card__subtitle">{p.technologies}</h3>
                <TagList items={project.tags} label={p.technologies} tokens={tokens} />
              </div>
            )}

            <ul className="link-row project-card__links" aria-label={p.links}>
              <li>
                <Link className="button" to={buildPath(lang, 'project', project.slug)}>
                  {t.projects.openPage} <Icon name="arrowRight" size={18} />
                  <span className="visually-hidden">: {project.title}</span>
                </Link>
              </li>
              {project.demo && (
                <li>
                  <ExternalLink href={project.demo} variant="ghost">
                    {p.demo}
                  </ExternalLink>
                </li>
              )}
              {project.site && (
                <li>
                  <ExternalLink href={project.site} variant="ghost">
                    {p.site}
                  </ExternalLink>
                </li>
              )}
              <li>
                <ExternalLink href={project.repo} variant="ghost">
                  {p.repo}
                </ExternalLink>
              </li>
            </ul>
            {!project.demo && !project.site && <p className="project-card__note">{t.projects.noDeploy}</p>}
          </div>
        </div>
      </div>

      <p className="project-card__cta" aria-hidden="true">
        {open ? t.projects.collapse : t.projects.expand} <Icon name="chevronDown" size={18} className="project-card__chevron" />
      </p>
    </article>
  );
}
