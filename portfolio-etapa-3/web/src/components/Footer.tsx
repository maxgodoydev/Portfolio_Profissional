import { format } from '../i18n';
import { useI18n } from '../i18n/context';
import { Link } from '../router';
import { buildPath } from '../routes';
import { LINKS } from '../content/profile';
import { MENU_ROUTES } from './Header';

export function Footer() {
  const { lang, t } = useI18n();
  return (
    <footer className="site-footer">
      <div className="container site-footer__inner">
        <div className="site-footer__id">
          <p className="site-footer__name">Max Godoy</p>
          <p className="site-footer__built">{t.footer.built}</p>
        </div>
        <nav aria-label={t.nav.primary} className="site-footer__nav">
          <ul>
            {MENU_ROUTES.map((id) => (
              <li key={id}>
                <Link to={buildPath(lang, id)}>{t.nav[id]}</Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="site-footer__legal">
          <span>{format(t.footer.rights, { year: new Date().getFullYear() })}</span>
          <Link to={buildPath(lang, 'privacy')}>{t.footer.privacy}</Link>
          <a href={LINKS.github} target="_blank" rel="noopener noreferrer">
            {t.common.github}
            <span className="visually-hidden"> {t.common.newTab}</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
