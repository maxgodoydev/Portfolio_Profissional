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

      {d?.context && (
        <Section title={p.context}>
          <p>{d.context}</p>
        </Section>
      )}
      {d?.problem && (
        <Section title={p.problem}>
          <p>{d.problem}</p>
        </Section>
      )}
      {d?.solution && (
        <Section title={p.solution}>
          <p>{d.solution}</p>
        </Section>
      )}
      {d?.features && d.features.length > 0 && (
        <Section title={p.features}>
          <ul className="check-list">
            {d.features.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </Section>
      )}
      {d?.participation && (
        <Section title={p.participation}>
          {d.participation.map((item) => (
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
