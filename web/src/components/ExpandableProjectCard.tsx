import { useEffect, useId, useRef, useState, type MouseEvent } from 'react';
import type { Project } from '../content/projects';
import { PROJECT_DETAILS } from '../content/projectDetails';
import { format } from '../i18n';
import { useI18n } from '../i18n/context';
import { formatDate } from '../lib/period';
import { matchesAll } from '../lib/search';
import { Highlight } from './Highlight';
import { Icon, type IconName } from './icons';
import { FeatureList, ProjectLinks, TeamPhotoLink } from './ProjectParts';
import { Tag, TagList } from './Tag';

/** Tecnologias visíveis no cartão compacto (o restante vira "+N"; a lista completa está no pop-up). */
const PREVIEW_TAGS = 3;

export interface ExpandableProjectCardProps {
  project: Project;
  category: string;
  /** Termos da busca a destacar (já normalizados). */
  tokens?: readonly string[];
}

/** Cabeçalho de seção do pop-up: ícone + título. */
function SectionTitle({ icon, children }: { icon: IconName; children: string }) {
  return (
    <h3 className="pd-section__title">
      <span className="pd-section__icon" aria-hidden="true">
        <Icon name={icon} size={16} />
      </span>
      {children}
    </h3>
  );
}

/**
 * Cartão de projeto compacto. Clicar (ou Enter/Espaço no título) abre um pop-up (<dialog> modal nativo:
 * foco preso, Esc fecha, fundo inerte) com seções curtas e os links de código/site logo no começo.
 * Só usa dados já existentes em content/ — seções sem dado não aparecem.
 */
export function ExpandableProjectCard({ project, category, tokens = [] }: ExpandableProjectCardProps) {
  const { lang, t } = useI18n();
  const [open, setOpen] = useState(false);
  const titleId = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  const d = PROJECT_DETAILS[project.slug]?.[lang];
  const p = t.project;
  const summary = project.summary[lang];

  // Abre o <dialog> como modal assim que ele existe no DOM; trava a rolagem da página atrás.
  useEffect(() => {
    if (!open) return;
    const dlg = dialogRef.current;
    if (dlg && !dlg.open) dlg.showModal();
    document.documentElement.classList.add('modal-open');
    return () => document.documentElement.classList.remove('modal-open');
  }, [open]);

  const close = () => {
    setOpen(false);
    toggleRef.current?.focus();
  };

  // Clique no fundo escurecido (fora da caixa) fecha.
  const onBackdrop = (e: MouseEvent<HTMLDialogElement>) => {
    if (e.target === e.currentTarget) close();
  };

  // Prévia: se a busca casa com tecnologias, elas vêm primeiro (para o destaque ficar visível).
  const ordered = tokens.length === 0 ? project.tags : [...project.tags].sort((a, b) => Number(matchesAll(tokens, [b])) - Number(matchesAll(tokens, [a])));
  const preview = ordered.slice(0, PREVIEW_TAGS);
  const hidden = project.tags.length - preview.length;
  const hasDeploy = !!(project.demo || project.site);
  // Seções só existem com conteúdo real (texto vazio ou só espaços não conta).
  const audience = d?.audience?.trim();
  const problem = d?.problem?.trim();
  const context = d?.context?.trim();
  const solution = d?.solution?.trim();
  const features = (d?.features ?? []).filter((f) => f.trim() !== '');
  const participation = (d?.participation ?? []).filter((f) => f.trim() !== '');

  return (
    <article className="project-card project-card--expandable project-card--compact" data-open={open ? 'true' : 'false'}>
      <div className="project-card__cover" aria-hidden={project.cover ? undefined : true} data-empty={project.cover ? undefined : 'true'}>
        {project.cover ? (
          <img src={project.cover.src} width={project.cover.width} height={project.cover.height} alt={project.cover.alt[lang]} loading="lazy" decoding="async" />
        ) : (
          <Icon name="chart" size={30} />
        )}
      </div>
      <p className="project-card__category">
        <Icon name="tag" size={13} /> {category}
        {project.status && <Tag tone="accent">{p.statuses[project.status]}</Tag>}
        {project.created && (
          <span className="project-card__year">
            <Icon name="calendar" size={13} /> {project.created.slice(0, 4)}
          </span>
        )}
      </p>
      <h2 className="project-card__title">
        <button ref={toggleRef} type="button" className="project-card__toggle" aria-haspopup="dialog" aria-expanded={open} onClick={() => setOpen(true)}>
          <Highlight text={project.title} tokens={tokens} />
          <span className="visually-hidden">. {t.projects.dialogHint}</span>
        </button>
      </h2>
      <p className="project-card__summary">
        <Highlight text={summary} tokens={tokens} />
      </p>

      {preview.length > 0 && (
        <ul className="tag-list tag-list--compact" aria-label={p.technologies}>
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
      )}

      <p className="project-card__cta" aria-hidden="true">
        {t.projects.viewDetails} <Icon name="expand" size={16} className="project-card__chevron" />
      </p>

      {open && (
        <dialog ref={dialogRef} className="project-dialog" aria-labelledby={titleId} onClose={() => setOpen(false)} onClick={onBackdrop}>
          <div className="project-dialog__box">
            <div className="pd-top">
              {project.cover && (
                <figure className="pd-cover">
                  <img src={project.cover.src} width={project.cover.width} height={project.cover.height} alt={project.cover.alt[lang]} decoding="async" />
                </figure>
              )}
              <button type="button" className="icon-button pd-close" onClick={close} aria-label={t.projects.close}>
                <Icon name="close" size={20} />
              </button>
            </div>

            <header className="pd-head">
              <p className="pd-head__category">
                <Icon name="tag" size={13} /> {category}
              </p>
              <h2 id={titleId} className="pd-head__title">
                {project.title}
              </h2>
              {(project.kind || project.created || project.status || d?.team) && (
                <ul className="pd-meta">
                  {project.kind && (
                    <li>
                      <Icon name="briefcase" size={14} /> {p.kinds[project.kind]}
                    </li>
                  )}
                  {project.status && (
                    <li>
                      <Icon name="wrench" size={14} /> {p.statuses[project.status]}
                    </li>
                  )}
                  {project.created && (
                    <li>
                      <Icon name="calendar" size={14} /> {formatDate(lang, project.created)}
                    </li>
                  )}
                  {d?.team && !project.image && (
                    <li>
                      <Icon name="users" size={14} /> {d.team}
                    </li>
                  )}
                </ul>
              )}
              {/* Acesso rápido: links pequenos com símbolo */}
              <ProjectLinks project={project} withPage />
              {!hasDeploy && <p className="pd-note">{t.projects.noDeploy}</p>}
            </header>

            <div className="pd-body" tabIndex={0} role="region" aria-labelledby={titleId}>
              {problem && (
                <section className="pd-section">
                  <SectionTitle icon="info">{p.problem}</SectionTitle>
                  <p>{problem}</p>
                </section>
              )}

              {audience && (
                <section className="pd-section">
                  <SectionTitle icon="users">{p.audience}</SectionTitle>
                  <p>{audience}</p>
                </section>
              )}

              {context && (
                <section className="pd-section">
                  <SectionTitle icon="info">{p.context}</SectionTitle>
                  <p>{context}</p>
                </section>
              )}

              {(solution || features.length > 0) && (
                <section className="pd-section">
                  <SectionTitle icon="wrench">{p.how}</SectionTitle>
                  {solution && <p>{solution}</p>}
                  {features.length > 0 && <FeatureList slug={project.slug} items={features} className="pd-features" />}
                </section>
              )}

              {participation.length > 0 && (
                <section className="pd-section">
                  <SectionTitle icon="user">{p.participation}</SectionTitle>
                  <ul className="check-list pd-features">
                    {participation.map((f) => (
                      <li key={f}>{f}</li>
                    ))}
                  </ul>
                </section>
              )}

              {project.tags.length > 0 && (
                <section className="pd-section">
                  <SectionTitle icon="layers">{p.technologies}</SectionTitle>
                  <TagList items={project.tags} label={p.technologies} tokens={tokens} />
                </section>
              )}

              {project.image && (
                <section className="pd-section">
                  <SectionTitle icon="users">{p.team}</SectionTitle>
                  <TeamPhotoLink project={project} detail={d} />
                </section>
              )}
            </div>
          </div>
        </dialog>
      )}
    </article>
  );
}
