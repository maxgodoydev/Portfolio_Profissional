import { format } from '../../i18n';
import { useI18n } from '../../i18n/context';
import { eventTotals, formatNumber, formatPercent, hasAnyData, withShare } from '../../lib/adminData';
import { TrendChart } from '../charts';
import type { StatsBundle } from '../data';
import { deviceLabel, langLabel, pageLabel, projectLabel, sourceLabel, themeLabel } from '../labels';
import type { Resource } from '../useResource';
import { BarList, DataTable, EmptyState, ErrorState, Kpi, LoadingBlock, Panel, SectionEmpty, StackedBar } from '../ui';
import { CompareNote, StorageNote } from './shared';

export function AnalyticsView({ res, days }: { res: Resource<StatsBundle>; days: number }) {
  const { lang, t } = useI18n();
  const a = t.admin.analytics;
  if (res.loading) return <LoadingBlock rows={6} />;
  if (!res.data) return res.error ? <ErrorState error={res.error} onRetry={res.reload} /> : null;
  const { stats, comparison } = res.data;
  if (!hasAnyData(stats)) {
    return (
      <>
        <EmptyState title={t.admin.empty.title} text={format(t.admin.empty.text, { from: stats.from, to: stats.to })} />
        <StorageNote persistent={stats.persistent} store={stats.store} />
      </>
    );
  }
  const totals = eventTotals(stats);
  const pages = withShare(stats.topPages);
  const projects = withShare(stats.topProjects);
  const languages = withShare(stats.languages);
  const sources = withShare(stats.sources);
  const devices = withShare(stats.devices);
  const themes = withShare(stats.themes);
  const resume = withShare(stats.resumeByLang);
  const eventRows = (['pageview', 'project_view', 'resume_download', 'theme_change'] as const).map((type) => ({ type, total: totals[type] }));

  return (
    <>
      <dl className="adm-kpis adm-kpis--compact">
        <Kpi label={t.admin.kpi.pageViews.label} value={formatNumber(lang, stats.totalPageViews)} help={t.admin.kpi.pageViews.help} extra={<CompareNote comparison={comparison} days={days} />} />
        <Kpi label={t.admin.kpi.sessions.label} value={formatNumber(lang, stats.totalSessions)} help={t.admin.kpi.sessions.help} />
      </dl>

      <Panel title={a.trend.title} wide>
        <TrendChart daily={stats.daily} />
      </Panel>

      <div className="adm-grid-2">
        <Panel title={a.pages.title}>
          {pages.length === 0 ? (
            <SectionEmpty />
          ) : (
            <DataTable
              caption={a.pages.title}
              rows={pages}
              rowKey={(r) => r.label}
              columns={[
                { key: 'p', header: a.pages.page, render: (r) => pageLabel(r.label, t) },
                { key: 'v', header: a.pages.views, numeric: true, render: (r) => formatNumber(lang, r.value) },
                { key: 's', header: a.pages.share, numeric: true, render: (r) => formatPercent(lang, r.pct) },
              ]}
            />
          )}
        </Panel>
        <Panel title={a.projects.title} note={projects.length ? a.projects.note : undefined}>
          {projects.length === 0 ? <SectionEmpty /> : <BarList items={projects} valueHeader={a.projects.title} label={(c) => projectLabel(c.label)} />}
        </Panel>
      </div>

      <div className="adm-grid-2">
        <Panel title={a.languages.title} note={a.languages.note}>
          {languages.length === 0 ? <SectionEmpty /> : <StackedBar items={languages} label={(c) => langLabel(c.label, t)} />}
        </Panel>
        <Panel title={a.sources.title} note={a.sources.note}>
          {sources.length === 0 ? <SectionEmpty /> : <StackedBar items={sources} label={(c) => sourceLabel(c.label, t)} />}
        </Panel>
      </div>

      <div className="adm-grid-2">
        <Panel title={a.events.title}>
          <DataTable
            caption={a.events.title}
            rows={eventRows}
            rowKey={(r) => r.type}
            columns={[
              { key: 'e', header: a.events.event, render: (r) => a.events[r.type] },
              { key: 't', header: a.events.total, numeric: true, render: (r) => formatNumber(lang, r.total) },
            ]}
          />
        </Panel>
        <Panel title={a.devices.title}>{devices.length === 0 ? <SectionEmpty /> : <StackedBar items={devices} label={(c) => deviceLabel(c.label, t)} />}</Panel>
      </div>

      <div className="adm-grid-2">
        <Panel title={a.resume.title}>{resume.length === 0 ? <SectionEmpty /> : <BarList items={resume} valueHeader={a.resume.title} label={(c) => langLabel(c.label, t)} />}</Panel>
        <Panel title={a.themes.title}>{themes.length === 0 ? <SectionEmpty /> : <BarList items={themes} valueHeader={a.themes.title} label={(c) => themeLabel(c.label)} />}</Panel>
      </div>
      <StorageNote persistent={stats.persistent} store={stats.store} />
    </>
  );
}
