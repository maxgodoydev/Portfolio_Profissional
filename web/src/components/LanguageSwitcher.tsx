import type { MouseEvent } from 'react';
import { LANGS, dictionaries } from '../i18n';
import { useI18n } from '../i18n/context';
import { Link, useLocation } from '../router';
import { switchLangPath } from '../routes';

/** PT / EN / ES sempre visíveis. São links reais (/pt/..., /en/..., /es/...) para a mesma página. */
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
            {l.toUpperCase()}
          </Link>
        );
      })}
    </div>
  );
}
