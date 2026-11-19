import { useI18n } from '../i18n/context';
import { PageHeader } from './shared';

export function PrivacyPage() {
  const { t } = useI18n();
  return (
    <div className="page">
      <PageHeader title={t.privacy.title} lead={t.privacy.intro} />
      <div className="prose">
        {t.privacy.sections.map((s) => (
          <section key={s.title}>
            <h2>{s.title}</h2>
            <p>{s.text}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
