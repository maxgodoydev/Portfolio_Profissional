import { LanguageBadges } from '../components/LanguageBadges';
import { WorkStyle } from '../components/WorkStyle';
import { useI18n } from '../i18n/context';
import { buildPath } from '../routes';
import { PageHeader, Section, TextLink } from './shared';

export function AboutPage() {
  const { lang, t } = useI18n();
  const a = t.about;
  return (
    <div className="page">
      <PageHeader title={a.title} lead={a.lead} />
      <div className="prose">
        {a.paragraphs.map((p) => (
          <p key={p}>{p}</p>
        ))}
      </div>

      <Section title={a.strengthsTitle}>
        <ul className="card-grid">
          {a.strengths.map((s) => (
            <li key={s.title} className="info-card">
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </li>
          ))}
        </ul>
      </Section>

      <WorkStyle />

      <Section title={a.educationTitle}>
        <div className="info-card info-card--wide">
          <h3>{a.educationName}</h3>
          <p>{a.educationPlace}</p>
          <p className="info-card__meta">{a.educationPeriod}</p>
        </div>
      </Section>

      <Section title={t.common.spokenLanguages}>
        <LanguageBadges />
      </Section>

      <Section title={a.interestsTitle}>
        <ul className="check-list">
          {a.interests.map((i) => (
            <li key={i}>{i}</li>
          ))}
        </ul>
      </Section>

      <p>
        <TextLink to={buildPath(lang, 'journey')}>{a.cta}</TextLink>
      </p>
    </div>
  );
}
