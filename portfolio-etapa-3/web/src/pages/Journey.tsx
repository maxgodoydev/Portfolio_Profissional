import { Timeline, type TimelineItem } from '../components/Timeline';
import { Tag } from '../components/Tag';
import { JOURNEY, type JourneyKind } from '../content/journey';
import { useI18n } from '../i18n/context';
import { formatPeriod } from '../lib/period';
import { PageHeader } from './shared';

const KINDS: readonly JourneyKind[] = ['work', 'education', 'course', 'milestone', 'project'];

export function JourneyPage() {
  const { lang, t } = useI18n();
  const j = t.journey;
  const items: TimelineItem[] = JOURNEY.map((e) => ({
    id: e.id,
    kind: e.kind,
    kindLabel: j.kinds[e.kind],
    period: formatPeriod(lang, e.start, e.end, e.ongoing ? j.present : undefined),
    title: e.title[lang],
    subtitle: e.org,
    description: e.text ? <p>{e.text[lang]}</p> : undefined,
    badge: e.ongoing ? j.ongoing : e.planned ? j.planned : undefined,
    current: e.ongoing,
  }));
  return (
    <div className="page">
      <PageHeader title={j.title} lead={j.intro} />
      <ul className="tag-list" aria-label={j.legend}>
        {KINDS.map((k) => (
          <li key={k}>
            <Tag tone="default">{j.kinds[k]}</Tag>
          </li>
        ))}
      </ul>
      <Timeline items={items} />
    </div>
  );
}
