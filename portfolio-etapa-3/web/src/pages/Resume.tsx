import { useEffect, useState } from 'react';
import { Icon } from '../components/icons';
import { LANGS, type Lang } from '../i18n';
import { useI18n } from '../i18n/context';
import { track } from '../services/analytics';
import { PageHeader, Section } from './shared';

type Manifest = Partial<Record<Lang, { url: string; bytes: number } | null>>;

/** Lê /resume/manifest.json (gerado no build). Só oferece download de PDFs que realmente existem. */
function useResumeManifest(): { manifest: Manifest; loading: boolean } {
  const [state, setState] = useState<{ manifest: Manifest; loading: boolean }>({ manifest: {}, loading: true });
  useEffect(() => {
    const controller = new AbortController();
    fetch('/resume/manifest.json', { signal: controller.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('manifest'))))
      .then((data: { resumes?: Manifest }) => setState({ manifest: data.resumes ?? {}, loading: false }))
      .catch((err: unknown) => {
        if (!(err instanceof DOMException && err.name === 'AbortError')) setState({ manifest: {}, loading: false });
      });
    return () => controller.abort();
  }, []);
  return state;
}

export function ResumePage() {
  const { lang, t } = useI18n();
  const { manifest, loading } = useResumeManifest();
  const order = [lang, ...LANGS.filter((l) => l !== lang)];
  return (
    <div className="page">
      <PageHeader title={t.resume.title} lead={t.resume.intro} />

      <ul className="card-grid">
        {order.map((l) => {
          const entry = manifest[l];
          return (
            <li key={l} className="info-card">
              <h3>{t.resume.languages[l]}</h3>
              {loading ? (
                <p>{t.common.loading}</p>
              ) : entry ? (
                <p>
                  <a className="button" href={entry.url} download onClick={() => track('resume_download', { target: l })}>
                    <Icon name="download" size={18} /> {t.resume.download}
                  </a>
                </p>
              ) : (
                <>
                  <p>
                    <span className="tag tag--outline">{t.resume.soon}</span>
                  </p>
                  <p className="info-card__meta">{t.resume.soonText}</p>
                </>
              )}
            </li>
          );
        })}
      </ul>

      <Section title={t.resume.summaryTitle}>
        <dl className="snapshot">
          {t.resume.summary.map((item) => (
            <div key={item.label} className="snapshot__item">
              <dt>{item.label}</dt>
              <dd>{item.value}</dd>
            </div>
          ))}
        </dl>
      </Section>
    </div>
  );
}
