import { useI18n } from '../i18n/context';
import { Link } from '../router';
import { buildPath } from '../routes';

export function NotFoundPage() {
  const { lang, t } = useI18n();
  return (
    <div className="page">
      <h1>{t.notFound.title}</h1>
      <p className="lead">{t.notFound.text}</p>
      <p>
        <Link className="button" to={buildPath(lang, 'home')}>
          {t.notFound.cta}
        </Link>
      </p>
    </div>
  );
}
