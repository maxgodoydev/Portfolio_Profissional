// Área administrativa: porta de entrada (sessão), estrutura (menu lateral + cabeçalho) e telas.
// Rota única /{lang}/admin; as telas são escolhidas por ?view= para não gerar páginas extras.
import { useEffect, useId, useMemo, useRef, useState, type FormEvent } from 'react';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { ThemeSwitcher } from '../components/ThemeSwitcher';
import { format } from '../i18n';
import { useI18n } from '../i18n/context';
import { DEFAULT_DAYS, MAX_DAYS, PRESETS, daysSince, formatClock, formatDay, startDateFor, utcToday } from '../lib/adminData';
import { Link, useLocation } from '../router';
import { loadOps, loadStats } from './data';
import { AuthStatus, LoginScreen } from './Login';
import { useAdminAuth } from './useAuth';
import { useResource, type Resource } from './useResource';
import { AnalyticsView } from './views/Analytics';
import { MonitoringView } from './views/Monitoring';
import { OverviewView } from './views/Overview';

export const VIEWS = ['overview', 'analytics', 'monitoring'] as const;
export type ViewId = (typeof VIEWS)[number];

export function parseView(value: string | null): ViewId {
  return VIEWS.find((v) => v === value) ?? 'overview';
}

interface Range {
  days: number;
  since?: string;
}

export function AdminApp() {
  const { lang, t } = useI18n();
  const auth = useAdminAuth();
  const { state } = auth;

  return (
    <div className="adm">
      <a className="skip-link" href="#conteudo">
        {t.nav.skip}
      </a>
      <header className="adm-top">
        <div className="adm-top__bar">
          <Link className="adm-brand" to={`/${lang}/admin`}>
            Max Godoy <span>· {t.admin.brand}</span>
          </Link>
          <div className="adm-top__tools">
            <LanguageSwitcher />
            <ThemeSwitcher />
            {state.status === 'authenticated' ? <LogoutButton onLogout={auth.logout} /> : null}
          </div>
        </div>
      </header>
      <div className={state.status === 'authenticated' ? 'adm-body' : 'adm-body adm-body--gate'}>
        {state.status === 'authenticated' ? (
          <Dashboard onExpire={auth.expire} />
        ) : (
          <main id="conteudo" tabIndex={-1} className="adm-main">
            {state.status === 'anonymous' ? <LoginScreen notice={state.notice} onLogin={auth.login} /> : <AuthStatus state={state} onRetry={auth.recheck} />}
          </main>
        )}
      </div>
    </div>
  );
}

function LogoutButton({ onLogout }: { onLogout: () => Promise<boolean> }) {
  const { t } = useI18n();
  const [failed, setFailed] = useState(false);
  const [busy, setBusy] = useState(false);
  return (
    <>
      <button
        type="button"
        className="adm-btn"
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          setFailed(false);
          const ok = await onLogout();
          if (!ok) {
            setFailed(true);
            setBusy(false);
          }
        }}
      >
        {t.admin.logout}
      </button>
      <span className="visually-hidden" role="alert">
        {failed ? t.admin.loadError.network : ''}
      </span>
    </>
  );
}

function Dashboard({ onExpire }: { onExpire: () => void }) {
  const { lang, t } = useI18n();
  const location = useLocation();
  const view = parseView(location.query.get('view'));
  const [range, setRange] = useState<Range>({ days: DEFAULT_DAYS });
  const days = range.since ? (daysSince(range.since, new Date()) ?? MAX_DAYS) : range.days;

  const stats = useResource((signal) => loadStats(days, signal), [days], onExpire);
  // O monitoramento só é consultado depois da primeira visita à tela (evita 4 requisições à toa).
  const [opsVisited, setOpsVisited] = useState(view === 'monitoring');
  useEffect(() => {
    if (view === 'monitoring') setOpsVisited(true);
  }, [view]);
  const ops = useResource((signal) => loadOps(signal), [], onExpire, opsVisited);

  // Ao trocar de tela, o foco vai ao conteúdo (como nas demais páginas do site).
  const previous = useRef(view);
  useEffect(() => {
    if (previous.current !== view) document.getElementById('conteudo')?.focus({ preventScroll: true });
    previous.current = view;
  }, [view]);

  const current: Resource<unknown> = view === 'monitoring' ? ops : stats;
  const title = t.admin.nav[view];
  const lead = view === 'overview' ? t.admin.overview.lead : view === 'analytics' ? t.admin.analytics.lead : t.admin.monitoring.lead;

  return (
    <>
      <nav className="adm-nav" aria-label={t.admin.nav.label}>
        <ul>
          {VIEWS.map((id) => (
            <li key={id}>
              <Link to={`/${lang}/admin${id === 'overview' ? '' : `?view=${id}`}`} className="adm-nav__link" aria-current={id === view ? 'page' : undefined}>
                {t.admin.nav[id]}
              </Link>
            </li>
          ))}
          <li className="adm-nav__site">
            <Link to={`/${lang}/`} className="adm-nav__link">
              ← {t.admin.nav.site}
            </Link>
          </li>
        </ul>
      </nav>
      <main id="conteudo" tabIndex={-1} className="adm-main">
        <header className="adm-head">
          <h1>{title}</h1>
          <p className="adm-lead">{lead}</p>
        </header>
        <Toolbar view={view} range={range} days={days} onRange={setRange} resource={current} />
        {view === 'overview' && <OverviewView res={stats} days={days} />}
        {view === 'analytics' && <AnalyticsView res={stats} days={days} />}
        {view === 'monitoring' && <MonitoringView res={ops} />}
      </main>
    </>
  );
}

function Toolbar({ view, range, days, onRange, resource }: { view: ViewId; range: Range; days: number; onRange: (r: Range) => void; resource: Resource<unknown> }) {
  const { lang, t } = useI18n();
  const r = t.admin.range;
  const now = new Date();
  const today = utcToday(now);
  const [sinceValue, setSinceValue] = useState(range.since ?? '');
  const [invalid, setInvalid] = useState(false);
  const errorId = useId();
  const dateId = useId();
  const showRange = view !== 'monitoring';
  const minDate = useMemo(() => startDateFor(MAX_DAYS, new Date()), []);

  const apply = (e: FormEvent) => {
    e.preventDefault();
    if (daysSince(sinceValue, new Date()) === null) {
      setInvalid(true);
      return;
    }
    setInvalid(false);
    onRange({ days: daysSince(sinceValue, new Date()) ?? DEFAULT_DAYS, since: sinceValue });
  };

  let status: string;
  if (resource.refreshing) status = t.admin.refreshing;
  else if (resource.updatedAt) status = format(t.admin.updatedAt, { time: formatClock(lang, resource.updatedAt) });
  else status = '';

  return (
    <div className="adm-toolbar">
      {showRange ? (
        <fieldset className="adm-range">
          <legend>{r.legend}</legend>
          <div className="adm-range__presets">
            {PRESETS.map((n) => (
              <button
                key={n}
                type="button"
                className="adm-chip"
                aria-pressed={!range.since && range.days === n}
                onClick={() => {
                  setInvalid(false);
                  setSinceValue('');
                  onRange({ days: n });
                }}
              >
                {format(r.preset, { n })}
              </button>
            ))}
          </div>
          <form className="adm-range__since" onSubmit={apply} noValidate>
            <label htmlFor={dateId}>{r.since}</label>
            <input id={dateId} type="date" value={sinceValue} min={minDate} max={today} aria-invalid={invalid ? true : undefined} aria-describedby={invalid ? errorId : undefined} onChange={(e) => setSinceValue(e.target.value)} />
            <button type="submit" className="adm-btn">
              {r.apply}
            </button>
          </form>
          <p className="adm-note">{r.sinceHelp}</p>
          <p id={errorId} className="adm-field__error" role="alert">
            {invalid ? r.invalid : ''}
          </p>
          <p className="adm-range__summary">{format(r.summary, { from: formatDay(lang, startDateFor(days, now), true), to: formatDay(lang, today, true), n: days })}</p>
        </fieldset>
      ) : (
        <span />
      )}
      <div className="adm-refresh">
        <button type="button" className="adm-btn" onClick={resource.reload} disabled={resource.refreshing || resource.loading}>
          {t.admin.refresh}
        </button>
        <p className="adm-note" role="status" aria-live="polite">
          {status}
        </p>
        {resource.error && resource.data ? (
          <p className="adm-callout adm-callout--error" role="alert">
            {t.admin.staleWarning}
          </p>
        ) : null}
      </div>
    </div>
  );
}
