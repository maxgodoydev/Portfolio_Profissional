import { format } from '../../i18n';
import { useI18n } from '../../i18n/context';
import { MAX_DAYS, formatNumber, formatPercent, type Comparison } from '../../lib/adminData';

/** Aviso permanente sobre onde os dados vivem: memória (volátil) ou banco persistente. */
export function StorageNote({ persistent, store }: { persistent: boolean; store: string }) {
  const { t } = useI18n();
  return persistent ? (
    <p className="adm-note adm-storage">{format(t.admin.storage.persistent, { store })}</p>
  ) : (
    <p className="adm-callout adm-storage" role="note">
      {t.admin.storage.memory}
    </p>
  );
}

/** Variação em relação ao período anterior, somente quando a comparação é justa. */
export function CompareNote({ comparison, days }: { comparison: Comparison | null; days: number }) {
  const { lang, t } = useI18n();
  const c = t.admin.compare;
  if (!comparison) return <span className="adm-compare">{days * 2 > MAX_DAYS ? c.tooLong : c.insufficient}</span>;
  const previous = format(c.previous, { n: comparison.days, value: formatNumber(lang, comparison.previousViews) });
  if (comparison.viewsPct === null) {
    return (
      <span className="adm-compare">
        {c.noBase} {previous}
      </span>
    );
  }
  const pct = comparison.viewsPct;
  const words = pct === 0 ? c.flat : pct > 0 ? format(c.up, { pct: formatPercent(lang, pct) }) : format(c.down, { pct: formatPercent(lang, Math.abs(pct)) });
  const arrow = pct === 0 ? '→' : pct > 0 ? '↑' : '↓';
  return (
    <span className="adm-compare">
      <span aria-hidden="true">{arrow} </span>
      {words} · {previous}
    </span>
  );
}
