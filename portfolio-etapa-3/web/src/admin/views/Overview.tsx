import { format } from '../../i18n';
import { useI18n } from '../../i18n/context';
import { Link } from '../../router';
import { eventTotals, formatNumber, hasAnyData, withShare } from '../../lib/adminData';
import { TrendChart } from '../charts';
import type { StatsBundle } from '../data';
import { pageLabel, projectLabel } from '../labels';
import type { Resource } from '../useResource';
import { BarList, EmptyState, ErrorState, Kpi, LoadingBlock, Panel, SectionEmpty } from '../ui';
import { CompareNote, StorageNote } from './shared';

export function OverviewView({ res, days }: { res: Resource<StatsBundle>; days: number }) {
  const { lang, t } = useI18n();
  const a = t.admin;
  if (res.loading) return <LoadingBlock rows={5} />;
  if (!res.data) return res.error ? <ErrorState error={res.error} onRetry={res.reload} /> : null;
  const { stats, comparison } = res.data;
  if (!hasAnyData(stats)) {
    return (
      <>
        <EmptyState title={a.empty.title} text={format(a.empty.text, { from: stats.from, to: stats.to })} />
        <StorageNote persistent={stats.persistent} store={stats.store} />
      </>
    );
  }
  const totals = eventTotals(stats);
  const pages = withShare(stats.topPages).slice(0, 5);
  const projects = withShare(stats.topProjects).slice(0, 5);
  return (
    <>
      <dl className="adm-kpis">
        <Kpi label={a.kpi.pageViews.label} value={formatNumber(lang, stats.totalPageViews)} help={a.kpi.pageViews.help} extra={<CompareNote comparison={comparison} days={days} />} />
        <Kpi label={a.kpi.sessions.label} value={formatNumber(lang, stats.totalSessions)} help={a.kpi.sessions.help} />
        <Kpi label={a.kpi.projectViews.label} value={formatNumber(lang, stats.projectViews)} help={a.kpi.projectViews.help} />
        <Kpi label={a.kpi.resumeDownloads.label} value={formatNumber(lang, stats.resumeDownloads)} help={a.kpi.resumeDownloads.help} />
        <Kpi label={a.kpi.events.label} value={formatNumber(lang, totals.total)} help={a.kpi.events.help} />
      </dl>

      <Panel title={a.analytics.trend.title} wide>
        <TrendChart daily={stats.daily} />
      </Panel>

      <div className="adm-grid-2">
        <Panel title={a.analytics.pages.title}>
          {pages.length === 0 ? (
            <SectionEmpty />
          ) : (
            <BarList items={pages} valueHeader={a.analytics.pages.title} label={(c) => pageLabel(c.label, t)} />
          )}
        </Panel>
        <Panel title={a.analytics.projects.title} note={projects.length ? a.analytics.projects.note : undefined}>
          {projects.length === 0 ? (
            <SectionEmpty />
          ) : (
            <BarList items={projects} valueHeader={a.analytics.projects.title} label={(c) => projectLabel(c.label)} />
          )}
        </Panel>
      </div>

      <p className="adm-more">
        <Link to={`/${lang}/admin?view=analytics`}>{a.overview.details} →</Link>
      </p>
      <StorageNote persistent={stats.persistent} store={stats.store} />
    </>
  );
}
