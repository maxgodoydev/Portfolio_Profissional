import { ProjectCard } from '../components/ProjectCard';
import { Tag } from '../components/Tag';
import { PROJECTS } from '../content/projects';
import { useI18n } from '../i18n/context';
import { Link } from '../router';
import { buildPath } from '../routes';
import { Section, TextLink } from './shared';

export function HomePage() {
  const { lang, t } = useI18n();
  const featured = PROJECTS.filter((p) => p.featured);
  return (
    <div className="page">
      <section className="hero" aria-labelledby="hero-title">
        <p className="hero__status">
          <Tag tone="accent">{t.home.status}</Tag>
        </p>
        <h1 id="hero-title" className="hero__title">
          {t.home.titleA} <span className="hero__title-b">{t.home.titleB}</span>
        </h1>
        <p className="lead">{t.home.intro}</p>
        <p className="hero__actions">
          <Link className="button" to={buildPath(lang, 'projects')}>
            {t.home.ctaProjects}
          </Link>
          <Link className="button button--ghost" to={buildPath(lang, 'resume')}>
            {t.home.ctaResume}
          </Link>
        </p>
      </section>

      <Section title={t.home.snapshotTitle}>
        <dl className="snapshot">
          {t.home.snapshot.map((item) => (
            <div key={item.label} className="snapshot__item">
              <dt>{item.label}</dt>
              <dd>{item.value}</dd>
            </div>
          ))}
        </dl>
      </Section>

      <Section title={t.home.focusTitle}>
        <ul className="card-grid">
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
