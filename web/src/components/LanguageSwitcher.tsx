import type { MouseEvent } from 'react';
import { LANGS, dictionaries, type Lang } from '../i18n';
import { Flag } from './LanguageBadges';
import type { FlagCountry } from '../content/languages';
import { useI18n } from '../i18n/context';
import { Link, useLocation } from '../router';
import { switchLangPath } from '../routes';

/** Bandeira de cada idioma do site (decorativa; o nome do idioma já está no aria-label). */
const FLAGS: Record<Lang, FlagCountry> = { pt: 'br', en: 'us', es: 'es' };

/** PT / EN / ES sempre visíveis, cada um com a sua bandeira. São links reais (/pt/..., /en/..., /es/...) para a mesma página. */
export function LanguageSwitcher() {
  const { lang, t } = useI18n();
  const location = useLocation();
  return (
    <div className="lang-switch" role="group" aria-label={t.common.language}>
      {LANGS.map((l) => {
        const current = l === lang;
        return (
          <Link
            key={l}
            to={switchLangPath(location, l)}
            className="lang-switch__item"
            lang={l}
            hrefLang={l}
            title={dictionaries[l].langName}
            aria-label={dictionaries[l].langName}
            aria-current={current ? 'true' : undefined}
            onClick={(e: MouseEvent<HTMLAnchorElement>) => {
              if (current) e.preventDefault();
            }}
          >
            <Flag country={FLAGS[l]} className="lang-switch__flag" />
            <span className="lang-switch__code">{l.toUpperCase()}</span>
          </Link>
        );
      })}
    </div>
  );
}
