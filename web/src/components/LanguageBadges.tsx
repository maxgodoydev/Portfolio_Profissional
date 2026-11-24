import { SPOKEN_LANGUAGES, type FlagCountry } from '../content/languages';
import { useI18n } from '../i18n/context';

/** Bandeiras circulares em SVG inline: o emoji de bandeira não é desenhado no Windows (aparece só "BR"/"US"). Decorativas. */
const FLAG_VIEWBOX: Record<FlagCountry, string> = { br: '3 0 14 14', us: '0 0 14 14', es: '3 0 14 14' };
export function Flag({ country, className = 'lang-chip__flag' }: { country: FlagCountry; className?: string }) {
  return (
    <svg className={className} viewBox={FLAG_VIEWBOX[country]} width="16" height="16" aria-hidden="true" focusable="false">
      {country === 'br' && (
        <>
          <rect width="20" height="14" fill="#009C3B" />
          <path d="M10 1.6 18.4 7 10 12.4 1.6 7z" fill="#FFDF00" />
          <circle cx="10" cy="7" r="3.3" fill="#002776" />
          <path d="M6.8 6.2q3.2-1 6.4 1.4" stroke="#fff" strokeWidth=".6" fill="none" />
        </>
      )}
      {country === 'us' && (
        <>
          <rect width="20" height="14" fill="#fff" />
          {[0, 2, 4, 6, 8, 10, 12].map((i) => (
            <rect key={i} y={(i * 14) / 13} width="20" height={14 / 13} fill="#B22234" />
          ))}
          <rect width="8.6" height={(7 * 14) / 13} fill="#3C3B6E" />
          {[0, 1, 2].flatMap((r) => [0, 1, 2].map((c) => <circle key={`${r}${c}`} cx={1.9 + c * 2.4} cy={1.6 + r * 2.1} r=".5" fill="#fff" />))}
        </>
      )}
      {country === 'es' && (
        <>
          <rect width="20" height="14" fill="#C60B1E" />
          <rect y="3.5" width="20" height="7" fill="#FFC400" />
        </>
      )}
    </svg>
  );
}

/** Etiquetas compactas de idioma: bandeira + código + nome (+ nível). */
export function LanguageBadges() {
  const { lang, t } = useI18n();
  return (
    <ul className="lang-list" aria-label={t.common.spokenLanguages}>
      {SPOKEN_LANGUAGES.map((l) => (
        <li key={l.id} className="lang-chip">
          <Flag country={l.flag} />
          <span className="lang-chip__code">{l.code}</span>
          <span className="lang-chip__name">{l.name[lang]}</span>
          <span className="lang-chip__level">
            {l.level.label[lang]}
            {l.level.cefr && <strong> {l.level.cefr}</strong>}
          </span>
        </li>
      ))}
    </ul>
  );
}
