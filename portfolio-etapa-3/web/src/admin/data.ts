// Carregadores usados pelas telas: combinam os endpoints reais e devolvem dados já tipados.
import { comparePeriods, MAX_DAYS, type Comparison, type Probe, type ProbeSet } from '../lib/adminData';
import { ApiError, adminOps, adminStats, getHealth, getInfo, getReady, type StatsData } from '../services/api';

export interface StatsBundle {
  stats: StatsData;
  /** Comparação com o período anterior; null quando não há histórico suficiente. */
  comparison: Comparison | null;
}

function isUnauthorized(err: unknown): boolean {
  return err instanceof ApiError && err.status === 401;
}

/** GET /admin/stats?days=N (+ ?days=2N em paralelo, só para a série diária da comparação). */
export async function loadStats(days: number, signal: AbortSignal): Promise<StatsBundle> {
  const wide = days * 2 <= MAX_DAYS ? adminStats(days * 2, signal).then((s) => ({ s }), (e: unknown) => ({ e })) : null;
  const stats = await adminStats(days, signal);
  let comparison: Comparison | null = null;
  if (wide) {
    const res = await wide;
    if ('e' in res) {
      if (isUnauthorized(res.e)) throw res.e;
    } else {
      comparison = comparePeriods(res.s.daily, days);
    }
  }
  return { stats, comparison };
}

async function probe<T>(run: () => Promise<T>): Promise<Probe<T>> {
  try {
    return { ok: true, data: await run() };
  } catch (err) {
    if (isUnauthorized(err)) throw err; // sessão expirada: vale para a tela inteira
    return { ok: false, code: err instanceof ApiError ? err.code : 'unknown' };
  }
}

export interface OpsBundle {
  probes: ProbeSet;
  checkedAt: Date;
}

/** /health, /ready, /info (públicos) e /admin/ops (protegido). Cada falha vira um Probe, não derruba o resto. */
export async function loadOps(signal: AbortSignal): Promise<OpsBundle> {
  const [health, ready, info, ops] = await Promise.all([
    probe(() => getHealth(signal)),
    probe(() => getReady(signal)),
    probe(() => getInfo(signal)),
    probe(() => adminOps(signal)),
  ]);
  return { probes: { health, ready, info, ops }, checkedAt: new Date() };
}
