import { TagList } from '../components/Tag';
import { findProject } from '../content/projects';
import { PROJECT_DETAILS } from '../content/projectDetails';
import { useI18n } from '../i18n/context';
import { formatDate } from '../lib/period';
import { Link } from '../router';
import { buildPath } from '../routes';
import { ExternalLink, Section, TextLink } from './shared';

export function ProjectNotFound() {
  const { lang, t } = useI18n();
  return (
    <div className="page">
      <h1>{t.project.notFound}</h1>
      <p className="lead">{t.project.notFoundText}</p>
      <p>
        <Link className="button" to={buildPath(lang, 'projects')}>
          {t.project.back}
        </Link>
      </p>
    </div>
  );
}

export function ProjectDetailPage({ slug }: { slug: string }) {
  const { lang, t } = useI18n();
  const project = findProject(slug);
  if (!project) return <ProjectNotFound />;
  const d = PROJECT_DETAILS[slug]?.[lang];
  const p = t.project;
  // Não renderiza seções ou listas vazias (inclusive conteúdo composto só por espaços).
  const context = d?.context?.trim();
  const problem = d?.problem?.trim();
  const audience = d?.audience?.trim();
  const solution = d?.solution?.trim();
  const features = (d?.features ?? []).filter((item) => item.trim().length > 0);
  const participation = (d?.participation ?? []).filter((item) => item.trim().length > 0);

  return (
    <div className="page project-detail">
      <p className="breadcrumb">
        <TextLink to={buildPath(lang, 'projects')}>{p.back}</TextLink>
      </p>
      <header className="page-header">
        <p className="project-card__category">{project.categories.map((c) => t.projects.filters[c]).join(' · ')}</p>
        <h1>{project.title}</h1>
        <p className="lead">{project.summary[lang]}</p>
        <dl className="facts">
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
        <ul className="link-row" aria-label={p.links}>
          {project.demo && (
            <li>
              <ExternalLink href={project.demo} variant="button">
                {p.demo}
              </ExternalLink>
            </li>
          )}
          {project.site && (
            <li>
              <ExternalLink href={project.site} variant="button">
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
      </header>

      {project.image && (
        <figure className="project-photo">
          <img
            src={project.image.src}
            width={project.image.width}
            height={project.image.height}
            alt={project.image.alt[lang]}
            loading="lazy"
            decoding="async"
          />
          <figcaption>{project.image.caption[lang]}</figcaption>
        </figure>
      )}

      {context && (
        <Section title={p.context}>
          <p>{context}</p>
        </Section>
      )}
      {problem && (
        <Section title={p.problem}>
          <p>{problem}</p>
        </Section>
      )}
      {audience && (
        <Section title={p.audience}>
          <p>{audience}</p>
        </Section>
      )}
      {solution && (
        <Section title={p.solution}>
          <p>{solution}</p>
        </Section>
      )}
      {features.length > 0 && (
        <Section title={p.features}>
          <ul className="check-list">
            {features.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </Section>
      )}
      {participation.length > 0 && (
        <Section title={p.participation}>
          {participation.map((item) => (
            <p key={item}>{item}</p>
          ))}
        </Section>
      )}
      {project.tags.length > 0 && (
        <Section title={p.technologies}>
          <TagList items={project.tags} label={p.technologies} />
        </Section>
      )}
    </div>
  );
}
