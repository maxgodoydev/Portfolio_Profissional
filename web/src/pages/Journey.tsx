import { Icon, type IconName } from '../components/icons';
import { JourneyTrack, type TrackItem } from '../components/JourneyTrack';
import { EDUCATION_SUMMARY, JOURNEY, JOURNEY_SUMMARY, type JourneyKind, type SummaryBlock } from '../content/journey';
import { useI18n } from '../i18n/context';
import { formatPeriod } from '../lib/period';
import { PageHeader, Section } from './shared';

const KIND_ICON: Record<JourneyKind, IconName> = {
  work: 'briefcase',
  education: 'cap',
  course: 'code',
  event: 'users',
  milestone: 'target',
  project: 'folder',
};

export function JourneyPage() {
  const { lang, t } = useI18n();
  const j = t.journey;

  const items: TrackItem[] = JOURNEY.map((e) => ({
    id: e.id,
    kind: e.kind,
    kindLabel: j.kinds[e.kind],
    kindIcon: KIND_ICON[e.kind],
    period: formatPeriod(lang, e.start, e.end, e.ongoing ? j.present : undefined),
    title: e.title[lang],
    org: e.org,
    text: e.text ? <p>{e.text[lang]}</p> : undefined,
    badge: e.ongoing ? j.ongoing : e.planned ? j.planned : undefined,
    current: e.ongoing,
    techs: e.techs,
  }));

  const s = j.summary;
  const blocks = (list: readonly SummaryBlock[]) => (
    <ul className="js-blocks">
      {list.map((b) => (
        <li key={b.label.pt} className="js-block">
          <Icon name={b.icon} size={16} />
          <span>{b.label[lang]}</span>
        </li>
      ))}
    </ul>
  );

  return (
    <div className="page">
      <PageHeader title={j.title} lead={j.intro} />
      {/* Título de nível 2 só para leitores de tela: evita pular de h1 para h3 nos cartões da linha do tempo. */}
      <h2 className="visually-hidden">{j.timelineTitle}</h2>
      <JourneyTrack items={items} />

      <Section title={s.title}>
        <div className="js-grid">
          <article className="js-card" data-tone="0">
            <h3 className="js-card__title">
              <Icon name="briefcase" size={18} /> {s.work}
            </h3>
            <p className="js-card__lead">{s.workYears}</p>
            <p className="js-card__sub">{s.skills}</p>
            {blocks(JOURNEY_SUMMARY.work)}
          </article>
          <article className="js-card" data-tone="1">
            <h3 className="js-card__title">
              <Icon name="code" size={18} /> {s.courses}
            </h3>
            <p className="js-card__sub">{s.skills}</p>
            {blocks(JOURNEY_SUMMARY.courses)}
          </article>
          <article className="js-card" data-tone="2">
            <h3 className="js-card__title">
              <Icon name="cap" size={18} /> {s.education}
            </h3>
            <p className="js-card__lead">
              {EDUCATION_SUMMARY.name[lang]} · {EDUCATION_SUMMARY.place}
            </p>
            <p className="js-card__sub">{formatPeriod(lang, EDUCATION_SUMMARY.start, EDUCATION_SUMMARY.end)} ({j.planned.toLowerCase()})</p>
            {blocks(JOURNEY_SUMMARY.education)}
          </article>
        </div>
      </Section>
    </div>
  );
}
