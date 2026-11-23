import { format } from '../i18n';
import { useI18n } from '../i18n/context';
import { Link } from '../router';
import { buildPath } from '../routes';
import { LINKS } from '../content/profile';
import { BrandIcon } from './BrandIcon';
import { MENU_ROUTES } from './Header';
import { Icon } from './icons';

export function Footer() {
  const { lang, t } = useI18n();
  return (
    <footer className="site-footer">
      <div className="container site-footer__inner">
        <div className="site-footer__id">
          <p className="site-footer__name">Max Godoy</p>
          <p className="site-footer__built">{t.footer.built}</p>
        </div>
        <ul className="site-footer__social" aria-label={t.contact.channels}>
          <li>
            <a href={LINKS.github} target="_blank" rel="noopener noreferrer">
              <BrandIcon name="GitHub" size={18} /> {t.common.github}
              <span className="visually-hidden"> {t.common.newTab}</span>
            </a>
          </li>
          {LINKS.linkedin && (
            <li>
              <a href={LINKS.linkedin} target="_blank" rel="noopener noreferrer">
                <BrandIcon name="LinkedIn" size={18} /> {t.common.linkedin}
                <span className="visually-hidden"> {t.common.newTab}</span>
              </a>
            </li>
          )}
          {LINKS.whatsapp && (
            <li>
              <a href={`https://wa.me/${LINKS.whatsapp}`} target="_blank" rel="noopener noreferrer">
                {t.common.whatsapp}
                <span className="visually-hidden"> {t.common.newTab}</span>
              </a>
            </li>
          )}
          {LINKS.email && (
            <li>
              <a href={`mailto:${LINKS.email}`}>
                <Icon name="mail" size={18} /> {t.common.email}
              </a>
            </li>
          )}
        </ul>
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
        </div>
      </div>
    </footer>
  );
}
