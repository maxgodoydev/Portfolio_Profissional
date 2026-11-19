// Gráfico de linhas em SVG puro (sem bibliotecas). Leitura por teclado (← → Home End),
// ponteiro, tabela equivalente e resumo textual para leitores de tela.
import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent, type RefObject } from 'react';
import { format } from '../i18n';
import { useI18n } from '../i18n/context';
import { areaPath, formatDay, formatNumber, linePath, niceScale, seriesPoints } from '../lib/adminData';
import type { DayPoint } from '../services/api';
import { DataTable } from './ui';

const HEIGHT = 250;
const M = { l: 46, r: 14, t: 12, b: 30 };

function useWidth(ref: RefObject<HTMLElement | null>): number {
  const [width, setWidth] = useState(640);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => setWidth(Math.max(260, Math.round(el.getBoundingClientRect().width)));
    update();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref]);
  return width;
}

export function TrendChart({ daily }: { daily: readonly DayPoint[] }) {
  const { lang, t } = useI18n();
  const a = t.admin.analytics.trend;
  const box = useRef<HTMLDivElement>(null);
  const width = useWidth(box);
  const [show, setShow] = useState({ views: true, sessions: true });
  const [cursor, setCursor] = useState<number | null>(null);
  const [announce, setAnnounce] = useState('');

  const n = daily.length;
  const innerW = Math.max(60, width - M.l - M.r);
  const innerH = HEIGHT - M.t - M.b;
  const views = daily.map((d) => d.pageViews);
  const sessions = daily.map((d) => d.sessions);
  const maxValue = Math.max(0, ...(show.views ? views : []), ...(show.sessions ? sessions : []));
  const scale = niceScale(maxValue);
  const viewPts = seriesPoints(views, innerW, innerH, scale.max);
  const sessPts = seriesPoints(sessions, innerW, innerH, scale.max);

  let peak: DayPoint | null = null;
  for (const d of daily) if (d.pageViews > 0 && (peak === null || d.pageViews > peak.pageViews)) peak = d;

  const labelCount = width < 480 ? 3 : 6;
  const tickIdx = n <= labelCount ? daily.map((_, i) => i) : Array.from({ length: labelCount }, (_, i) => Math.round((i * (n - 1)) / (labelCount - 1)));

  const describe = (i: number) => format(a.point, { date: formatDay(lang, daily[i].date, true), views: formatNumber(lang, daily[i].pageViews), sessions: formatNumber(lang, daily[i].sessions) });

  const move = (i: number, speak: boolean) => {
    const next = Math.min(n - 1, Math.max(0, i));
    setCursor(next);
    if (speak) setAnnounce(describe(next));
  };

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const at = cursor ?? n - 1;
    if (e.key === 'ArrowLeft') move(at - 1, true);
    else if (e.key === 'ArrowRight') move(at + 1, true);
    else if (e.key === 'Home') move(0, true);
    else if (e.key === 'End') move(n - 1, true);
    else if (e.key === 'Escape') setCursor(null);
    else return;
    e.preventDefault();
  };

  const onPointer = (e: PointerEvent<SVGRectElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = rect.width > 0 ? (e.clientX - rect.left) / rect.width : 0;
    move(Math.round(ratio * (n - 1)), false);
  };

  const toggle = (key: 'views' | 'sessions') => {
    const other = key === 'views' ? 'sessions' : 'views';
    if (show[key] && !show[other]) return; // ao menos uma série fica visível
    setShow({ ...show, [key]: !show[key] });
  };

  const summary = peak ? `${a.desc} ${format(a.peak, { value: formatNumber(lang, peak.pageViews), date: formatDay(lang, peak.date, true) })}` : a.desc;

  return (
    <div className="adm-trend">
      <fieldset className="adm-series">
        <legend className="visually-hidden">{a.legend}</legend>
        <label>
          <input type="checkbox" checked={show.views} onChange={() => toggle('views')} />
          <span className="adm-series__key adm-series__key--views" aria-hidden="true" />
          {t.admin.kpi.pageViews.label}
        </label>
        <label>
          <input type="checkbox" checked={show.sessions} onChange={() => toggle('sessions')} />
          <span className="adm-series__key adm-series__key--sessions" aria-hidden="true" />
          {t.admin.kpi.sessions.label}
        </label>
      </fieldset>

      <div ref={box} className="adm-trend__plot" tabIndex={0} role="group" aria-label={a.title} aria-describedby="adm-trend-hint" onKeyDown={onKey} onBlur={() => setCursor(null)}>
        <svg width={width} height={HEIGHT} viewBox={`0 0 ${width} ${HEIGHT}`} role="img" aria-label={summary}>
          <title>{summary}</title>
          <g transform={`translate(${M.l} ${M.t})`}>
            {scale.ticks.map((tick) => {
              const y = innerH - (tick / scale.max) * innerH;
              return (
                <g key={tick}>
                  <line className="adm-grid" x1={0} x2={innerW} y1={y} y2={y} />
                  <text className="adm-axis" x={-8} y={y} textAnchor="end" dominantBaseline="middle">
                    {formatNumber(lang, tick)}
                  </text>
                </g>
              );
            })}
            {tickIdx.map((i, k) => (
              <text key={i} className="adm-axis" x={viewPts[i].x} y={innerH + 20} textAnchor={k === 0 ? 'start' : k === tickIdx.length - 1 ? 'end' : 'middle'}>
                {formatDay(lang, daily[i].date)}
              </text>
            ))}
            {show.views && <path className="adm-area" d={areaPath(viewPts, innerH)} />}
            {show.sessions && <path className="adm-line adm-line--sessions" d={linePath(sessPts)} />}
            {show.views && <path className="adm-line adm-line--views" d={linePath(viewPts)} />}
            {n <= 31 && show.views && viewPts.map((p, i) => <circle key={i} className="adm-dot" cx={p.x} cy={p.y} r={2.5} />)}
            {cursor !== null && (
              <g aria-hidden="true">
                <line className="adm-cursor" x1={viewPts[cursor].x} x2={viewPts[cursor].x} y1={0} y2={innerH} />
                {show.views && <circle className="adm-dot adm-dot--on" cx={viewPts[cursor].x} cy={viewPts[cursor].y} r={5} />}
                {show.sessions && <circle className="adm-dot adm-dot--sessions" cx={sessPts[cursor].x} cy={sessPts[cursor].y} r={4} />}
              </g>
            )}
            <rect x={0} y={0} width={innerW} height={innerH} fill="transparent" onPointerMove={onPointer} onPointerDown={onPointer} onPointerLeave={() => setCursor(null)} />
          </g>
        </svg>
      </div>

      <p className="adm-trend__readout" aria-hidden="true">
        {cursor !== null ? describe(cursor) : peak ? format(a.peak, { value: formatNumber(lang, peak.pageViews), date: formatDay(lang, peak.date, true) }) : ''}
      </p>
      <p id="adm-trend-hint" className="adm-note">
        {a.hint}
      </p>
      <p className="visually-hidden" aria-live="polite">
        {announce}
      </p>

      <details className="adm-details">
        <summary>{a.table}</summary>
        <DataTable
          caption={a.title}
          rows={daily}
          rowKey={(d) => d.date}
          columns={[
            { key: 'd', header: a.day, render: (d) => formatDay(lang, d.date, true) },
            { key: 'v', header: t.admin.kpi.pageViews.label, numeric: true, render: (d) => formatNumber(lang, d.pageViews) },
            { key: 's', header: t.admin.kpi.sessions.label, numeric: true, render: (d) => formatNumber(lang, d.sessions) },
          ]}
        />
      </details>
    </div>
  );
}
