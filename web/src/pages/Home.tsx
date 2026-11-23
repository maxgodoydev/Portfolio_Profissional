import { BrandIcon, hasBrandIcon } from '../components/BrandIcon';
import { Icon, type IconName } from '../components/icons';
import { ProjectCard } from '../components/ProjectCard';
import { Tag } from '../components/Tag';
import { PROJECTS } from '../content/projects';
import { TECHNOLOGIES } from '../content/technologies';
import { useI18n } from '../i18n/context';
import { Link } from '../router';
import { buildPath } from '../routes';
import { Section, TextLink } from './shared';

const HERO_ICONS: readonly IconName[] = ['cap', 'briefcase', 'target'];

export function HomePage() {
  const { lang, t } = useI18n();
  const featured = PROJECTS.filter((p) => p.featured);
  const stack = TECHNOLOGIES.filter((x) => x.status === 'project' && hasBrandIcon(x.name));
  return (
    <div className="page">
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero__text">
          <p className="hero__status">
            <Tag tone="accent">{t.home.status}</Tag>
          </p>
          <h1 id="hero-title" className="hero__title">
            {t.home.titleA} <span className="hero__title-b">{t.home.titleB}</span>
          </h1>
          <p className="lead">{t.home.intro}</p>
          <p className="hero__actions">
            <Link className="button" to={buildPath(lang, 'projects')}>
              {t.home.ctaProjects} <Icon name="arrowRight" size={18} />
            </Link>
            <Link className="button button--ghost" to={buildPath(lang, 'resume')}>
              {t.home.ctaResume}
            </Link>
          </p>
        </div>
        <aside className="hero__panel" aria-labelledby="hero-panel-title">
          <h2 id="hero-panel-title" className="hero__panel-title">
            {t.home.snapshotTitle}
          </h2>
          <dl className="hero__facts">
            {t.home.snapshot.map((item, i) => (
              <div key={item.label} className="hero__fact">
                <dt>
                  <span className="hero__fact-icon">
                    <Icon name={HERO_ICONS[i] ?? 'target'} size={18} />
                  </span>
                  {item.label}
                </dt>
                <dd>{item.value}</dd>
              </div>
            ))}
          </dl>
        </aside>
      </section>

      <Section title={t.home.focusTitle}>
        <ul className="card-grid card-grid--pairs">
          {t.home.focus.map((f) => (
            <li key={f.title} className="info-card">
              <h3>{f.title}</h3>
              <p>{f.text}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section title={t.home.featuredTitle} action={<TextLink to={buildPath(lang, 'projects')}>{t.home.featuredAll}</TextLink>}>
        <ul className="card-grid">
          {featured.map((p) => (
            <li key={p.slug}>
              <ProjectCard
                title={p.title}
                summary={p.summary[lang]}
                href={buildPath(lang, 'project', p.slug)}
                tags={p.tags}
                category={t.projects.filters[p.categories[0]]}
                cta={t.projects.details}
                tagsLabel={t.project.technologies}
              />
            </li>
          ))}
        </ul>
      </Section>

      <Section title={t.home.techTitle} action={<TextLink to={buildPath(lang, 'technologies')}>{t.home.techAll}</TextLink>}>
        <p>{t.home.techText}</p>
        <ul className="tech-strip">
          {stack.map((x) => (
            <li key={x.name}>
              <BrandIcon name={x.name} size={20} />
              <span>{x.name}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section title={t.home.exploreTitle}>
        <ul className="card-grid">
          {(['about', 'journey', 'contact'] as const).map((id) => (
            <li key={id} className="info-card">
              <h3>
                <Link to={buildPath(lang, id)} className="info-card__link">
                  {t.nav[id]}
                </Link>
              </h3>
              <p>{t.home.explore[id]}</p>
            </li>
          ))}
        </ul>
      </Section>
    </div>
  );
}
