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
/** Áreas visíveis no cartão (as demais viram "+N" e continuam no pop-up e nos filtros). */
const MAX_AREAS = 2;

export interface ExpandableProjectCardProps {
  project: Project;
  category: string;
  /** Termos da busca a destacar (já normalizados). */
  tokens?: readonly string[];
}

/** Título de bloco do pop-up: ícone + título (o id liga o bloco ao título para leitores de tela). */
function BlockTitle({ id, icon, children }: { id: string; icon: IconName; children: string }) {
  return (
    <h3 id={id} className="pd-block__title">
      <span className="pd-block__icon" aria-hidden="true">
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
  const linksRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  const d = PROJECT_DETAILS[project.slug]?.[lang];
  const p = t.project;
  const m = t.projects.modal;
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
  // Áreas do projeto (o tipo "acadêmico" já aparece no título da seção); sem áreas, usa o nome do tipo.
  const areas = project.categories.filter((c): c is Exclude<typeof c, 'academic'> => c !== 'academic');
  const hasDeploy = !!(project.demo || project.site);
  // Seções só existem com conteúdo real (texto vazio ou só espaços não conta).
  const audience = d?.audience?.trim();
  const problem = d?.problem?.trim();
  const context = d?.context?.trim();
  const solution = d?.solution?.trim();
  const features = (d?.features ?? []).filter((f) => f.trim() !== '');
  const participation = (d?.participation ?? []).filter((f) => f.trim() !== '');
  // Resultados: só os comprovados nos dados; uma demonstração publicada também conta.
  const results = [...(d?.results ?? []).filter((r) => r.trim() !== ''), ...(project.demo ? [m.demoPublished] : [])];

  // Rola o pop-up (única área com rolagem) até o bloco de links; sem animação se houver preferência por menos movimento.
  const goToLinks = () => {
    const smooth = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    linksRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'start' });
    linksRef.current?.focus({ preventScroll: true });
  };

  return (
    <article className="project-card project-card--expandable project-card--compact" data-open={open ? 'true' : 'false'}>
      <div className="project-card__cover" aria-hidden={project.cover ? undefined : true} data-empty={project.cover ? undefined : 'true'}>
        {project.cover ? (
          <img src={project.cover.src} width={project.cover.width} height={project.cover.height} alt={project.cover.alt[lang]} loading="lazy" decoding="async" />
        ) : (
          <Icon name="chart" size={30} />
        )}
      </div>
      {project.status && (
        <span className="project-card__status">
          <Icon name="wrench" size={13} /> {p.statuses[project.status]}
        </span>
      )}
      <ul className="project-card__areas" aria-label={t.projects.areaLabel}>
        {areas.length > 0 ? (
          <>
            {areas.slice(0, MAX_AREAS).map((a) => (
              <li key={a}>{t.projects.filters[a]}</li>
            ))}
            {areas.length > MAX_AREAS && (
              <li>
                <span aria-hidden="true">{format(t.projects.moreTags, { n: areas.length - MAX_AREAS })}</span>
                <span className="visually-hidden">{areas.slice(MAX_AREAS).map((a) => t.projects.filters[a]).join(', ')}</span>
              </li>
            )}
          </>
        ) : (
          <li>{category}</li>
        )}
      </ul>
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

      <div className="project-card__foot" aria-hidden="true">
        {project.created ? (
          <span className="project-card__year">
            <Icon name="calendar" size={14} /> {project.created.slice(0, 4)}
          </span>
        ) : (
          <span />
        )}
        <span className="project-card__cta">
          {t.projects.viewDetails} <Icon name="expand" size={16} className="project-card__chevron" />
        </span>
      </div>

      {open && (
        <dialog ref={dialogRef} className="project-dialog" aria-labelledby={titleId} onClose={() => setOpen(false)} onClick={onBackdrop}>
          <div className="project-dialog__box">
            {/* Botão fechar fixo no topo: acompanha a rolagem única do pop-up */}
            <div className="pd-bar">
              <button type="button" className="icon-button pd-close" onClick={close} aria-label={t.projects.close}>
                <Icon name="close" size={20} />
              </button>
            </div>
            {project.cover && (
              <div className="pd-top">
                <figure className="pd-cover">
                  <img src={project.cover.src} width={project.cover.width} height={project.cover.height} alt={project.cover.alt[lang]} decoding="async" />
                </figure>
              </div>
            )}

            <header className="pd-head">
              <p className="pd-head__category">
                <Icon name="tag" size={13} /> {category}
              </p>
              <h2 id={titleId} className="pd-head__title">
                {project.title}
              </h2>
              <p className="pd-head__lead">{summary}</p>
              {(project.kind || project.created || project.status) && (
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
                </ul>
              )}
              <button type="button" className="pd-jump" onClick={goToLinks}>
                <Icon name="globe" size={15} /> {m.goToLinks}
              </button>
            </header>

            {/* História antes da stack: contexto/problema → público → solução → contribuição → funcionalidades → tecnologias → resultados → links */}
            <div className="pd-body">
              {(context || problem) && (
                <section className="pd-block pd-block--wide" aria-labelledby={`${titleId}-context`}>
                  <BlockTitle id={`${titleId}-context`} icon="info">
                    {m.context}
                  </BlockTitle>
                  {context && <p>{context}</p>}
                  {problem && (
                    <div className="pd-callout">
                      <strong>{m.problem}</strong>
                      <p>{problem}</p>
                    </div>
                  )}
                </section>
              )}

              {audience && (
                <section className="pd-block" aria-labelledby={`${titleId}-audience`}>
                  <BlockTitle id={`${titleId}-audience`} icon="users">
                    {m.audience}
                  </BlockTitle>
                  <p>{audience}</p>
                </section>
              )}

              {solution && (
                <section className="pd-block" aria-labelledby={`${titleId}-solution`}>
                  <BlockTitle id={`${titleId}-solution`} icon="wrench">
                    {m.solution}
                  </BlockTitle>
                  <p>{solution}</p>
                </section>
              )}

              {(participation.length > 0 || d?.team || project.image) && (
                <section className="pd-block" aria-labelledby={`${titleId}-contribution`}>
                  <BlockTitle id={`${titleId}-contribution`} icon="user">
                    {m.contribution}
                  </BlockTitle>
                  {participation.length > 0 && (
                    <ul className="check-list pd-features">
                      {participation.map((f) => (
                        <li key={f}>{f}</li>
                      ))}
                    </ul>
                  )}
                  {d?.team && (
                    <p className="pd-team">
                      <Icon name="users" size={14} /> <strong>{m.team}:</strong> {d.team}
                    </p>
                  )}
                  {project.image && <TeamPhotoLink project={project} detail={d} />}
                </section>
              )}

              {features.length > 0 && (
                <section className="pd-block" aria-labelledby={`${titleId}-features`}>
                  <BlockTitle id={`${titleId}-features`} icon="check">
                    {m.features}
                  </BlockTitle>
                  <FeatureList slug={project.slug} items={features} className="pd-features" />
                </section>
              )}

              {project.tags.length > 0 && (
                <section className="pd-block pd-block--wide" aria-labelledby={`${titleId}-tech`}>
                  <BlockTitle id={`${titleId}-tech`} icon="layers">
                    {m.technologies}
                  </BlockTitle>
                  <TagList items={project.tags} label={m.technologies} tokens={tokens} />
                </section>
              )}

              {results.length > 0 && (
                <section className="pd-block pd-block--wide" aria-labelledby={`${titleId}-results`}>
                  <BlockTitle id={`${titleId}-results`} icon="chart">
                    {m.results}
                  </BlockTitle>
                  <ul className="check-list pd-features">
                    {results.map((r) => (
                      <li key={r}>{r}</li>
                    ))}
                  </ul>
                </section>
              )}

              <section ref={linksRef} className="pd-block pd-block--wide pd-block--links" aria-labelledby={`${titleId}-links`} tabIndex={-1}>
                <BlockTitle id={`${titleId}-links`} icon="globe">
                  {m.links}
                </BlockTitle>
                <ProjectLinks project={project} withPage />
                {!hasDeploy && <p className="pd-note">{t.projects.noDeploy}</p>}
              </section>
            </div>
          </div>
        </dialog>
      )}
    </article>
  );
}
