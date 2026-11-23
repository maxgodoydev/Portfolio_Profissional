import { FeatureList, ProjectLinks, TeamPhotoLink } from '../components/ProjectParts';
import { TagList } from '../components/Tag';
import { findProject } from '../content/projects';
import { PROJECT_DETAILS } from '../content/projectDetails';
import { useI18n } from '../i18n/context';
import { formatDate } from '../lib/period';
import { Link } from '../router';
import { buildPath } from '../routes';
import { Section, TextLink } from './shared';

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
        <p className="project-card__category">{[t.projects.groups[project.group], ...project.categories.map((c) => t.projects.filters[c])].join(' · ')}</p>
        <h1>{project.title}</h1>
        <p className="lead">{project.summary[lang]}</p>
        <dl className="facts">
          {project.kind && (
            <div>
              <dt>{p.kindLabel}</dt>
              <dd>{p.kinds[project.kind]}</dd>
            </div>
          )}
          {project.status && (
            <div>
              <dt>{p.statusLabel}</dt>
              <dd>{p.statuses[project.status]}</dd>
            </div>
          )}
          {project.created && (
            <div>
              <dt>{p.created}</dt>
              <dd>{formatDate(lang, project.created)}</dd>
            </div>
          )}
          {d?.team && !project.image && (
            <div>
              <dt>{p.team}</dt>
              <dd>{d.team}</dd>
            </div>
          )}
        </dl>
        <ProjectLinks project={project} />
      </header>

      {project.cover && (
        <figure className="project-cover">
          <img src={project.cover.src} width={project.cover.width} height={project.cover.height} alt={project.cover.alt[lang]} decoding="async" />
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
          <FeatureList slug={slug} items={features} />
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
      {project.image && (
        <Section title={p.team}>
          <TeamPhotoLink project={project} detail={d} />
        </Section>
      )}
    </div>
  );
}
