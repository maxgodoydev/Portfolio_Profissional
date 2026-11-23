import { useId, useState, type ReactNode } from 'react';
import { hasBrandIcon } from './BrandIcon';
import { Icon } from './icons';
import { Tag } from './Tag';
import { format, type Lang } from '../i18n';
import { useI18n } from '../i18n/context';
import { formatDate, formatPeriod } from '../lib/period';
import type { AreaTile, Certificate, EarlyRole, Role, TalkEvent } from '../content/career';

const locale = (lang: Lang) => (lang === 'pt' ? 'pt-BR' : lang);

/** Símbolo decorativo: o texto ao lado já descreve o conteúdo, por isso fica oculto para leitores de tela. */
export function Glyph({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <span className={`glyph ${className}`.trim()} aria-hidden="true">
      {children}
    </span>
  );
}

function ChipRow({ label, items, icons = false }: { label: string; items: readonly string[]; icons?: boolean }) {
  if (items.length === 0) return null;
  return (
    <div className="vt-chips">
      <h4 className="vt-sub">{label}</h4>
      <ul className="tag-row">
        {items.map((name) => (
          <li key={name}>
            <Tag icon={icons && hasBrandIcon(name) ? name : undefined}>{name}</Tag>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Duties({ label, items }: { label: string; items: readonly string[] }) {
  return (
    <div>
      <h4 className="vt-sub">{label}</h4>
      <ul className="vt-duties">
        {items.map((d) => (
          <li key={d}>{d}</li>
        ))}
      </ul>
    </div>
  );
}

/* ---------- Experiência atual: destaque ---------- */
export function CurrentRole({ role }: { role: Role }) {
  const { lang, t } = useI18n();
  const w = t.journey.work;
  return (
    <article className="vt-card vt-card--current">
      <p className="vt-meta">
        <span className="vt-badge">{w.current}</span>
        <time>{formatPeriod(lang, role.start, role.end, role.ongoing ? t.journey.present : undefined)}</time>
      </p>
      <h3 className="vt-title">{role.title[lang]}</h3>
      <p className="vt-org">{role.org}</p>
      <p className="vt-summary">{role.summary[lang]}</p>
      {role.note && <p className="vt-note">{role.note[lang]}</p>}
      <Duties label={w.duties} items={role.duties[lang]} />
      <ChipRow label={w.skills} items={role.skills[lang]} />
      {role.tools && <ChipRow label={w.tools} items={role.tools} icons />}
    </article>
  );
}

/* ---------- Experiências anteriores: compactas, com detalhes sob demanda ---------- */
export function CompactRole({ role, open, onToggle }: { role: Role; open: boolean; onToggle: () => void }) {
  const { lang, t } = useI18n();
  const w = t.journey.work;
  const regionId = useId();
  return (
    <article className="vt-card vt-card--compact">
      <div className="vt-head">
        <div>
          <h3 className="vt-title">{role.title[lang]}</h3>
          <p className="vt-org">{role.org}</p>
        </div>
        <p className="vt-period">
          <time>{formatPeriod(lang, role.start, role.end)}</time>
        </p>
      </div>
      <p className="vt-summary">{role.summary[lang]}</p>
      <button type="button" className="vt-toggle" aria-expanded={open} aria-controls={regionId} onClick={onToggle}>
        {open ? w.hideDetails : w.showDetails}
        <Icon name="chevronDown" size={16} className="vt-toggle__icon" />
      </button>
      <div id={regionId} className="vt-detail" hidden={!open}>
        <Duties label={w.duties} items={role.duties[lang]} />
        <ChipRow label={w.skills} items={role.skills[lang]} />
        {role.tools && <ChipRow label={w.tools} items={role.tools} icons />}
      </div>
    </article>
  );
}

/* ---------- Transição de carreira: marco próprio ---------- */
export function TransitionMarker() {
  const { lang, t } = useI18n();
  const tr = t.journey.transition;
  return (
    <article className="vt-bridge">
      <p className="vt-meta">
        <Glyph className="vt-bridge__glyph">⌁</Glyph>
        <time>{formatPeriod(lang, '2024-07', '2026-11')}</time>
      </p>
      <h3 className="vt-title">{tr.title}</h3>
      <p className="vt-bridge__subtitle">{tr.subtitle}</p>
      <p className="vt-summary">{tr.text}</p>
      <p className="vt-bridge__fatec">
        <Icon name="cap" size={18} />
        <span>{tr.fatec}</span>
      </p>
      <ul className="tag-row">
        {tr.chips.map((c) => (
          <li key={c}>
            <Tag tone="outline">{c}</Tag>
          </li>
        ))}
      </ul>
    </article>
  );
}

/* ---------- Bloco expansível genérico ---------- */
export function ExpandBlock({ glyph, title, subtitle, count, children }: { glyph: string; title: string; subtitle?: string; count?: number; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const regionId = useId();
  return (
    <div className="xb" data-open={open ? 'true' : 'false'}>
      <button type="button" className="xb__button" aria-expanded={open} aria-controls={regionId} onClick={() => setOpen((v) => !v)}>
        <Glyph className="xb__glyph">{glyph}</Glyph>
        <span className="xb__text">
          <span className="xb__title">{title}</span>
          {subtitle && <span className="xb__subtitle">{subtitle}</span>}
        </span>
        {count !== undefined && <span className="xb__count">{count}</span>}
        <Icon name="chevronDown" size={18} className="xb__chevron" />
      </button>
      <div id={regionId} className="xb__body" hidden={!open}>
        {children}
      </div>
    </div>
  );
}

export function EarlyRoles({ roles }: { roles: readonly EarlyRole[] }) {
  const { lang, t } = useI18n();
  return (
    <ExpandBlock glyph="⌁" title={t.journey.early.title} subtitle={t.journey.early.text} count={roles.length}>
      <ul className="early-list">
        {roles.map((r) => (
          <li key={r.id}>
            <span className="early-list__period">{formatPeriod(lang, r.start, r.end)}</span>
            <span className="early-list__title">{r.title[lang]}</span>
            <span className="early-list__org">{r.org}</span>
          </li>
        ))}
      </ul>
    </ExpandBlock>
  );
}

/* ---------- Formação: áreas de aprendizado ---------- */
export function AreaTiles({ areas }: { areas: readonly AreaTile[] }) {
  const { lang } = useI18n();
  return (
    <ul className="area-grid">
      {areas.map((a) => (
        <li key={a.id} className="area-tile">
          <p className="area-tile__head">
            <span className="area-tile__icon" aria-hidden="true">
              {a.icon ? <Icon name={a.icon} size={18} /> : a.glyph}
            </span>
            <span className="area-tile__title">{a.title[lang]}</span>
          </p>
          <ul className="tag-row tag-row--tight">
            {a.topics[lang].map((topic) => (
              <li key={topic}>
                <Tag>{topic}</Tag>
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ul>
  );
}

/* ---------- Certificações ---------- */
function initials(org: string): string {
  const words = org.split(/\s+/).filter(Boolean);
  return ((words[0]?.[0] ?? '') + (words[1]?.[0] ?? '')).toUpperCase();
}

const VISIBLE_TOPICS = 4;

export function CertCard({ cert }: { cert: Certificate }) {
  const { lang, t } = useI18n();
  const c = t.journey.certs;
  const [all, setAll] = useState(false);
  const topics = cert.topics?.[lang] ?? [];
  const shown = all ? topics : topics.slice(0, VISIBLE_TOPICS);
  const hidden = topics.length - VISIBLE_TOPICS;
  const hours = cert.hours !== undefined ? format(c.hours, { n: new Intl.NumberFormat(locale(lang)).format(cert.hours) }) : null;
  return (
    <article className="cert">
      <div className="cert__top">
        <span className="cert__logo" aria-hidden="true">
          {initials(cert.org)}
        </span>
        <div>
          <p className="cert__org">
            {cert.org}
            {cert.via && <span> · {cert.via}</span>}
          </p>
          <p className="cert__meta">
            <time>{formatDate(lang, cert.date)}</time>
            {hours && <span> · {hours}</span>}
          </p>
        </div>
      </div>
      <h4 className="cert__title">{cert.title}</h4>
      <p className="cert__summary">{cert.summary[lang]}</p>
      {topics.length > 0 && (
        <>
          <ul className="tag-row tag-row--tight">
            {shown.map((topic) => (
              <li key={topic}>
                <Tag>{topic}</Tag>
              </li>
            ))}
          </ul>
          {hidden > 0 && (
            <button type="button" className="vt-toggle" aria-expanded={all} onClick={() => setAll((v) => !v)}>
              {all ? c.lessTopics : format(c.moreTopics, { n: topics.length })}
              <Icon name="chevronDown" size={16} className="vt-toggle__icon" />
            </button>
          )}
        </>
      )}
      {(cert.credential || cert.link) && (
        <p className="cert__foot">
          {cert.credential && (
            <span>
              {c.credential}: <code>{cert.credential}</code>
            </span>
          )}
          {cert.link && (
            <a className="ext-link" href={cert.link.href} target="_blank" rel="noopener noreferrer">
              {cert.link.label[lang]} <Icon name="external" size={14} />
              <span className="visually-hidden"> {t.common.newTab}</span>
            </a>
          )}
        </p>
      )}
    </article>
  );
}

export function TalkList({ talks }: { talks: readonly TalkEvent[] }) {
  const { lang, t } = useI18n();
  const fmt = new Intl.DateTimeFormat(locale(lang), { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
  return (
    <ul className="talk-list">
      {talks.map((x) => (
        <li key={x.id}>
          <p className="talk-list__meta">
            <time dateTime={x.date}>{fmt.format(new Date(`${x.date}T00:00:00Z`))}</time>
            <span> · {format(t.journey.certs.hours, { n: x.hours })}</span>
          </p>
          <p className="talk-list__title">{x.title}</p>
          <p className="talk-list__text">{x.summary[lang]}</p>
        </li>
      ))}
    </ul>
  );
}

