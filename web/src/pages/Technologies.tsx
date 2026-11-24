import { BrandIcon, hasBrandIcon } from '../components/BrandIcon';
import { Icon } from '../components/icons';
import { Tag } from '../components/Tag';
import { findProject } from '../content/projects';
import { TECHNOLOGIES, TECH_CATEGORIES, type Tech, type TechStatus } from '../content/technologies';
import { useI18n } from '../i18n/context';
import { Link } from '../router';
import { buildPath } from '../routes';
import { PageHeader, Section } from './shared';

const TONE: Record<TechStatus, 'default' | 'accent' | 'outline'> = { project: 'default', studied: 'outline', building: 'accent' };

function TechItem({ tech, showStatus = true }: { tech: Tech; showStatus?: boolean }) {
  const { lang, t } = useI18n();
  const projects = (tech.projects ?? []).map((slug) => findProject(slug)).filter((p) => p !== undefined);
  return (
    <li className="tech-item" data-status={tech.status}>
      <div className="tech-item__head">
        {/* Logo oficial quando existe; sem logo disponível, glifo neutro tracejado (nunca um logo inventado). */}
        <span className={hasBrandIcon(tech.name) ? 'tech-item__mark' : 'tech-item__mark tech-item__mark--generic'}>
          {hasBrandIcon(tech.name) ? <BrandIcon name={tech.name} size={22} /> : <Icon name={tech.category === 'data' ? 'chart' : 'code'} size={20} />}
        </span>
        <span className="tech-item__name">{tech.name}</span>
        {showStatus && <Tag tone={TONE[tech.status]}>{t.technologies.status[tech.status]}</Tag>}
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
        <p className="legend__note">{t.technologies.noLogoNote}</p>
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
            <TechItem key={x.name} tech={x} showStatus={false} />
          ))}
        </ul>
      </Section>

      <details className="credits">
        <summary>
          <Icon name="info" size={16} /> {t.technologies.creditsTitle}
        </summary>
        <p>{t.technologies.brandAttribution}</p>
      </details>
    </div>
  );
}
