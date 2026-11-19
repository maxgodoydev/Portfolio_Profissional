// Carregamento de dados protegidos: primeiro carregamento (skeleton), atualização com os dados
// anteriores ainda visíveis e erro sem perder o último resultado bom. 401 → sessão expirada.
import { useCallback, useEffect, useRef, useState } from 'react';
import { ApiError } from '../services/api';

export interface Resource<T> {
  data: T | null;
  error: ApiError | null;
  /** Primeiro carregamento (ou mudança de parâmetros): não há dados para mostrar. */
  loading: boolean;
  /** Atualização manual: os dados anteriores continuam na tela. */
  refreshing: boolean;
  updatedAt: Date | null;
  reload: () => void;
}

interface State<T> {
  data: T | null;
  error: ApiError | null;
  loading: boolean;
  refreshing: boolean;
  updatedAt: Date | null;
}

export function asApiError(err: unknown): ApiError {
  return err instanceof ApiError ? err : new ApiError({ status: 0, code: 'network_error', message: 'Falha inesperada.' });
}

export function useResource<T>(load: (signal: AbortSignal) => Promise<T>, deps: readonly unknown[], onUnauthorized: () => void, enabled = true): Resource<T> {
  const [state, setState] = useState<State<T>>({ data: null, error: null, loading: true, refreshing: false, updatedAt: null });
  const [tick, setTick] = useState(0);
  const loadRef = useRef(load);
  const unauthorizedRef = useRef(onUnauthorized);
  const lastTick = useRef(0);
  loadRef.current = load;
  unauthorizedRef.current = onUnauthorized;

  useEffect(() => {
    if (!enabled) return;
    const controller = new AbortController();
    const isReload = tick !== lastTick.current;
    lastTick.current = tick;
    setState((s) => (isReload && s.data !== null ? { ...s, error: null, refreshing: true } : { data: null, error: null, loading: true, refreshing: false, updatedAt: null }));
    loadRef.current(controller.signal).then(
      (data) => {
        if (!controller.signal.aborted) setState({ data, error: null, loading: false, refreshing: false, updatedAt: new Date() });
      },
      (err: unknown) => {
        if (controller.signal.aborted) return;
        const apiErr = asApiError(err);
        if (apiErr.status === 401) {
          unauthorizedRef.current();
          return;
        }
        setState((s) => ({ ...s, error: apiErr, loading: false, refreshing: false }));
      },
    );
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, tick, ...deps]);

  const reload = useCallback(() => setTick((n) => n + 1), []);
  return { ...state, reload };
}
