import { hasBrandIcon } from '../components/BrandIcon';
import { Icon, type IconName } from '../components/icons';
import { ProjectCard } from '../components/ProjectCard';
import { Tag } from '../components/Tag';
import { TechChip } from '../components/TechChip';
import { PROJECTS, findProject } from '../content/projects';
import { TECHNOLOGIES } from '../content/technologies';
import { useI18n } from '../i18n/context';
import { Link } from '../router';
import { buildPath } from '../routes';
import { Section, TextLink } from './shared';

const HERO_ICONS: readonly IconName[] = ['cap', 'briefcase', 'target'];
/** Um ícone por área de atuação (mesma ordem de t.home.focus). */
const FOCUS_ICONS: readonly IconName[] = ['chart', 'layers', 'code', 'route'];

export function HomePage() {
  const { lang, t } = useI18n();
  const featured = PROJECTS.filter((p) => p.featured);
  const example = findProject('entrelacos');
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
          {t.home.focus.map((f, i) => (
            <li key={f.title} className="info-card info-card--icon">
              <span className="info-card__icon" aria-hidden="true">
                <Icon name={FOCUS_ICONS[i] ?? 'target'} size={22} />
              </span>
              <h3>{f.title}</h3>
              <p>{f.text}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section title={t.home.presence.title}>
        <div className="presence">
          <div className="presence__text">
            <p className="lead">{t.home.presence.lead}</p>
            <ul className="presence__list">
              {t.home.presence.benefits.map((b) => (
                <li key={b.title}>
                  <span className="presence__check" aria-hidden="true">
                    <Icon name="check" size={16} />
                  </span>
                  <span>
                    <strong>{b.title}.</strong> {b.text}
                  </span>
                </li>
              ))}
            </ul>
            <p>
              <Link className="button button--ghost" to={buildPath(lang, 'projects')}>
                {t.home.presence.all} <Icon name="arrowRight" size={18} />
              </Link>
            </p>
          </div>
          {example?.cover && (
            <figure className="presence__figure">
              <img src={example.cover.src} width={example.cover.width} height={example.cover.height} alt={example.cover.alt[lang]} loading="lazy" decoding="async" />
              <figcaption>
                {t.home.presence.caption}{' '}
                <Link to={buildPath(lang, 'project', example.slug)}>{t.home.presence.cta}</Link>
              </figcaption>
            </figure>
          )}
        </div>
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
                category={t.projects.groups[p.group]}
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
            <TechChip key={x.name} name={x.name} hint={t.technologies.categories[x.category]} />
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
