import { useId, useState, type ReactNode } from 'react';
import { AreaTiles, CertCard, CompactRole, CurrentRole, EarlyRoles, ExpandBlock, Glyph, TalkList, TransitionMarker } from '../components/CareerParts';
import { CERT_CATEGORY_ORDER, CERTIFICATES, EARLY_ROLES, FATEC_AREAS, PREVIOUS_COURSES, ROLES, TALKS, type CertCategory } from '../content/career';
import { useI18n } from '../i18n/context';
import { formatPeriod } from '../lib/period';
import { PageHeader } from './shared';

const CATEGORY_EMOJI: Record<CertCategory, string> = { data: '📊', ai: '🤖', programming: '💻', career: '📈' };

function CareerSection({ id, className, title, emoji, intro, action, children }: { id: string; className: string; title: string; emoji: string; intro?: string; action?: ReactNode; children: ReactNode }) {
  const headingId = useId();
  return (
    <section id={id} className={`section career ${className}`} aria-labelledby={headingId} data-reveal>
      <div className="section__head">
        <h2 id={headingId}>
          <Glyph className="career__emoji">{emoji}</Glyph> {title}
        </h2>
        {action}
      </div>
      {intro && <p className="career__intro">{intro}</p>}
      {children}
    </section>
  );
}

export function JourneyPage() {
  const { lang, t } = useI18n();
  const j = t.journey;
  const [openRoles, setOpenRoles] = useState<ReadonlySet<string>>(new Set());

  const current = ROLES.filter((r) => r.ongoing);
  const past = ROLES.filter((r) => !r.ongoing);
  const allOpen = past.every((r) => openRoles.has(r.id));
  const toggle = (id: string) =>
    setOpenRoles((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const route = [
    { href: '#profissional', glyph: '💼', ...j.route.work },
    { href: '#transicao', glyph: '⌁', ...j.route.transition },
    { href: '#formacao', glyph: '🎓', ...j.route.education },
    { href: '#certificacoes', glyph: '✦', ...j.route.certs },
  ];

  return (
    <div className="page">
      <PageHeader title={j.title} lead={j.intro} />

      {/* Resumo da trajetória: também funciona como atalho para cada seção. */}
      <nav className="route" aria-labelledby="route-title" data-reveal>
        <h2 id="route-title" className="route__title">
          <Glyph>✦</Glyph> {j.routeTitle}
        </h2>
        <ul className="route__list" aria-label={j.routeLabel}>
          {route.map((r) => (
            <li key={r.href}>
              <a className="route__item" href={r.href}>
                <Glyph className="route__glyph">{r.glyph}</Glyph>
                <span className="route__text">
                  <span className="route__label">{r.label}</span>
                  <span className="route__hint">{r.hint}</span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* ---------- Trajetória profissional ---------- */}
      <CareerSection
        id="profissional"
        className="career--work"
        emoji="💼"
        title={j.work.title}
        intro={j.work.intro}
        action={
          <button type="button" className="button button--ghost button--small" onClick={() => setOpenRoles(allOpen ? new Set() : new Set(past.map((r) => r.id)))}>
            {allOpen ? j.work.collapseAll : j.work.expandAll}
          </button>
        }
      >
        <ol className="vt vt--work">
          {current.map((r) => (
            <li key={r.id} className="vt-item vt-item--current">
              <span className="vt-dot" aria-hidden="true" />
              <CurrentRole role={r} />
            </li>
          ))}
          <li id="transicao" className="vt-item vt-item--bridge">
            <span className="vt-dot" aria-hidden="true" />
            <TransitionMarker />
          </li>
          {past.map((r) => (
            <li key={r.id} className="vt-item">
              <span className="vt-dot" aria-hidden="true" />
              <CompactRole role={r} open={openRoles.has(r.id)} onToggle={() => toggle(r.id)} />
            </li>
          ))}
          <li className="vt-item vt-item--early">
            <span className="vt-dot" aria-hidden="true" />
            <EarlyRoles roles={EARLY_ROLES} />
          </li>
        </ol>
      </CareerSection>

      {/* ---------- Formação acadêmica ---------- */}
      <CareerSection id="formacao" className="career--edu" emoji="🎓" title={j.education.title} intro={j.education.intro}>
        <ol className="vt vt--edu">
          <li className="vt-item vt-item--current">
            <span className="vt-dot" aria-hidden="true" />
            <article className="vt-card vt-card--current">
              <p className="vt-meta">
                <span className="vt-badge">{j.education.current}</span>
                <time>{formatPeriod(lang, '2025-02', '2028-12')}</time>
              </p>
              <h3 className="vt-title">{j.education.fatec.course}</h3>
              <p className="vt-org">{j.education.fatec.school}</p>
              <p className="vt-summary">{j.education.fatec.text}</p>
              <h4 className="vt-sub">{j.education.areasTitle}</h4>
              <AreaTiles areas={FATEC_AREAS} />
            </article>
          </li>
          <li className="vt-item vt-item--past">
            <span className="vt-dot" aria-hidden="true" />
            <article className="vt-card vt-card--quiet">
              <p className="vt-meta">
                <span className="vt-quiet-label">{j.education.previousLabel}</span>
                <time>{formatPeriod(lang, '2019-08', '2021-12')}</time>
              </p>
              <h3 className="vt-title">{j.education.previous.course}</h3>
              <p className="vt-org">{j.education.previous.school}</p>
              <p className="vt-summary">{j.education.previous.text}</p>
            </article>
          </li>
        </ol>
      </CareerSection>

      {/* ---------- Cursos e certificações ---------- */}
      <CareerSection id="certificacoes" className="career--certs" emoji="✦" title={j.certs.title} intro={j.certs.intro}>
        {[CERT_CATEGORY_ORDER.slice(0, 1), CERT_CATEGORY_ORDER.slice(1)].map((cats, row) => (
          <div key={row} className={row === 0 ? undefined : 'cert-row'}>
            {cats.map((cat) => (
              <div key={cat} className="cert-group">
                <h3 className="cert-group__title">
                  <Glyph>{CATEGORY_EMOJI[cat]}</Glyph> {j.certs.categories[cat]}
                </h3>
                <ul className="cert-grid">
                  {CERTIFICATES.filter((c) => c.category === cat).map((c) => (
                    <li key={c.id}>
                      <CertCard cert={c} />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ))}
        <div className="xb-stack">
          <ExpandBlock glyph="✦" title={j.certs.eventsTitle} subtitle={j.certs.eventsSubtitle} count={TALKS.length}>
            <TalkList talks={TALKS} />
          </ExpandBlock>
          <ExpandBlock glyph="📚" title={j.certs.previousTitle} count={PREVIOUS_COURSES.length}>
            <ul className="cert-grid cert-grid--inner">
              {PREVIOUS_COURSES.map((c) => (
                <li key={c.id}>
                  <CertCard cert={c} />
                </li>
              ))}
            </ul>
          </ExpandBlock>
        </div>
      </CareerSection>

    </div>
  );
}
