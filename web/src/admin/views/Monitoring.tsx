import { format } from '../../i18n';
import { useI18n } from '../../i18n/context';
import { deriveServices, formatClock, formatDuration, formatNumber, overallState } from '../../lib/adminData';
import type { OpsBundle } from '../data';
import type { Resource } from '../useResource';
import { DataTable, ErrorState, Kpi, LoadingBlock, Panel, StatusBadge } from '../ui';

/** Rotas da API aparecem como "/health"; o agrupamento "(desconhecida)" fica como veio. */
function routeText(route: string): string {
  return route.startsWith('(') ? route : `/${route}`;
}

export function MonitoringView({ res }: { res: Resource<OpsBundle> }) {
  const { lang, t } = useI18n();
  const m = t.admin.monitoring;
  if (res.loading) return <LoadingBlock rows={5} />;
  if (!res.data) return res.error ? <ErrorState error={res.error} onRetry={res.reload} /> : null;
  const { probes, checkedAt } = res.data;
  const services = deriveServices(probes);
  const overall = overallState(services);
  const ops = probes.ops?.ok ? probes.ops.data : null;
  const info = probes.info?.ok ? probes.info.data : null;

  return (
    <>
      <div className={`adm-overall adm-overall--${overall}`}>
        <StatusBadge state={overall} />
        <p>{m.overall[overall]}</p>
        <p className="adm-note">{format(m.checkedAt, { time: formatClock(lang, checkedAt) })}</p>
      </div>

      <Panel title={m.title} wide>
        <ul className="adm-services">
          {services.map((s) => (
            <li key={s.id} className="adm-service">
              <div className="adm-service__head">
                <h3>{m.services[s.id]}</h3>
                <StatusBadge state={s.state} />
              </div>
              <p>{format(m.detail[s.detail], Object.fromEntries(Object.entries(s.params ?? {}).map(([k, v]) => [k, String(v)])))}</p>
            </li>
          ))}
        </ul>
      </Panel>

      <div className="adm-grid-2">
        <Panel title={m.info.title}>
          {info ? (
            <dl className="adm-facts">
              <div>
                <dt>{m.info.environment}</dt>
                <dd>{info.environment}</dd>
              </div>
              <div>
                <dt>{m.info.commit}</dt>
                <dd>{info.commit || m.info.none}</dd>
              </div>
              <div>
                <dt>{m.info.uptime}</dt>
                <dd>{formatDuration(info.uptimeSeconds)}</dd>
              </div>
            </dl>
          ) : (
            <p className="adm-empty__text">{m.probeFailed}</p>
          )}
        </Panel>
        <Panel title={m.counters.title} note={m.scope}>
          {ops ? (
            <dl className="adm-kpis adm-kpis--compact">
              <Kpi label={m.counters.requests} value={formatNumber(lang, ops.requests)} help={m.info.uptime + ': ' + formatDuration(ops.uptimeSeconds)} />
              <Kpi label={m.counters.errors} value={formatNumber(lang, ops.errors)} help={m.counters.errorsHelp} />
            </dl>
          ) : (
            <p className="adm-empty__text">{m.probeFailed}</p>
          )}
        </Panel>
      </div>

      {ops ? (
        <>
          <Panel title={m.routes.title} wide>
            {ops.routes.length === 0 ? (
              <p className="adm-empty__text">{m.routes.empty}</p>
            ) : (
              <DataTable
                caption={m.routes.title}
                rows={ops.routes}
                rowKey={(r) => r.route}
                columns={[
                  { key: 'r', header: m.routes.route, render: (r) => <code>{routeText(r.route)}</code> },
                  { key: 'c', header: m.routes.count, numeric: true, render: (r) => formatNumber(lang, r.count) },
                  { key: 'e', header: m.routes.errors, numeric: true, render: (r) => formatNumber(lang, r.errors) },
                  { key: 'a', header: m.routes.avg, numeric: true, render: (r) => formatNumber(lang, r.avgMs, 1) },
                  { key: 'm', header: m.routes.max, numeric: true, render: (r) => formatNumber(lang, r.maxMs, 1) },
                ]}
              />
            )}
          </Panel>
          <Panel title={m.recent.title} wide>
            {ops.recentErrors.length === 0 ? (
              <p className="adm-empty__text">{m.recent.none}</p>
            ) : (
              <DataTable
                caption={m.recent.title}
                rows={[...ops.recentErrors].reverse()}
                rowKey={(r, i) => `${r.requestId}-${i}`}
                columns={[
                  { key: 't', header: m.recent.time, render: (r) => formatClock(lang, new Date(r.time)) },
                  { key: 'r', header: m.recent.route, render: (r) => <code>{routeText(r.route)}</code> },
                  { key: 's', header: m.recent.status, numeric: true, render: (r) => r.status },
                  { key: 'i', header: m.recent.id, render: (r) => <code>{r.requestId}</code> },
                ]}
              />
            )}
          </Panel>
        </>
      ) : null}
    </>
  );
}
