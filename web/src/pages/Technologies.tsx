import { Tag } from '../components/Tag';
import { findProject } from '../content/projects';
import { TECHNOLOGIES, TECH_CATEGORIES, type Tech, type TechStatus } from '../content/technologies';
import { useI18n } from '../i18n/context';
import { Link } from '../router';
import { buildPath } from '../routes';
import { PageHeader, Section } from './shared';

const TONE: Record<TechStatus, 'default' | 'accent' | 'outline'> = { project: 'default', studied: 'outline', building: 'accent' };

function TechItem({ tech }: { tech: Tech }) {
  const { lang, t } = useI18n();
  const projects = (tech.projects ?? []).map((slug) => findProject(slug)).filter((p) => p !== undefined);
  return (
    <li className="tech-item">
      <div className="tech-item__head">
        <span className="tech-item__name">{tech.name}</span>
        <Tag tone={TONE[tech.status]}>{t.technologies.status[tech.status]}</Tag>
      </div>
      {projects.length > 0 && (
        <p className="tech-item__projects">
          {t.technologies.usedIn}{' '}
          {projects.map((p, i) => (
            <span key={p.slug}>
              {i > 0 && ', '}
              <Link to={buildPath(lang, 'project', p.slug)}>{p.title}</Link>
            </span>
          ))}
        </p>
      )}
    </li>
  );
}

export function TechnologiesPage() {
  const { t } = useI18n();
  const building = TECHNOLOGIES.filter((x) => x.status === 'building');
  return (
    <div className="page">
      <PageHeader title={t.technologies.title} lead={t.technologies.intro} />

      <section className="legend" aria-label={t.technologies.legend}>
        <h2 className="legend__title">{t.technologies.legend}</h2>
        <ul className="tag-list">
          {(['project', 'studied', 'building'] as const).map((s) => (
            <li key={s}>
              <Tag tone={TONE[s]}>{t.technologies.status[s]}</Tag>
            </li>
          ))}
        </ul>
      </section>

      {TECH_CATEGORIES.map((cat) => {
        const items = TECHNOLOGIES.filter((x) => x.category === cat && x.status !== 'building');
        if (items.length === 0) return null;
        return (
          <Section key={cat} title={t.technologies.categories[cat]}>
            <ul className="tech-grid">
              {items.map((x) => (
                <TechItem key={x.name} tech={x} />
              ))}
            </ul>
          </Section>
        );
      })}

      <Section title={t.technologies.status.building}>
        <ul className="tech-grid">
          {building.map((x) => (
            <TechItem key={x.name} tech={x} />
          ))}
        </ul>
      </Section>
    </div>
  );
}
