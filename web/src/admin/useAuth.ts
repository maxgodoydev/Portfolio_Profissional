// Sessão administrativa. A fonte de verdade é o backend (cookie HttpOnly): nada de senha ou
// token é guardado no navegador, e "estar autenticado" é sempre confirmado por GET /admin/session.
import { useCallback, useEffect, useState } from 'react';
import { ApiError, adminLogin, adminLogout, adminSession } from '../services/api';

export type AuthState =
  | { status: 'checking' }
  | { status: 'anonymous'; notice?: 'expired' | 'loggedOut' }
  | { status: 'authenticated' }
  | { status: 'disabled' }
  | { status: 'unreachable' };

export type LoginFailure = 'required' | 'invalid' | 'tooMany' | 'disabled' | 'network' | 'generic';

/** Traduz a falha de GET /admin/session no estado da interface. */
export function stateFromSessionError(err: unknown): AuthState {
  if (err instanceof ApiError) {
    if (err.code === 'admin_disabled') return { status: 'disabled' };
    if (err.status === 401) return { status: 'anonymous' };
  }
  return { status: 'unreachable' };
}

/** Traduz a falha de POST /admin/login em uma mensagem do dicionário. */
export function loginFailureFrom(err: unknown): LoginFailure {
  if (!(err instanceof ApiError)) return 'generic';
  if (err.code === 'admin_disabled') return 'disabled';
  if (err.code === 'rate_limited' || err.status === 429) return 'tooMany';
  if (err.code === 'invalid_credentials' || err.status === 401) return 'invalid';
  if (err.isNetwork) return 'network';
  return 'generic';
}

export interface AdminAuth {
  state: AuthState;
  login: (password: string) => Promise<LoginFailure | null>;
  /** Devolve false se o servidor não confirmou a saída (a sessão pode continuar válida). */
  logout: () => Promise<boolean>;
  /** Chamado quando qualquer requisição protegida responde 401. */
  expire: () => void;
  recheck: () => void;
}

export function useAdminAuth(): AdminAuth {
  const [state, setState] = useState<AuthState>({ status: 'checking' });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setState({ status: 'checking' });
    adminSession(controller.signal).then(
      () => {
        if (!controller.signal.aborted) setState({ status: 'authenticated' });
      },
      (err: unknown) => {
        if (!controller.signal.aborted) setState(stateFromSessionError(err));
      },
    );
    return () => controller.abort();
  }, [attempt]);

  const login = useCallback(async (password: string): Promise<LoginFailure | null> => {
    if (password.trim() === '') return 'required';
    try {
      await adminLogin(password);
      setState({ status: 'authenticated' });
      return null;
    } catch (err) {
      return loginFailureFrom(err);
    }
  }, []);

  const logout = useCallback(async (): Promise<boolean> => {
    try {
      await adminLogout();
      setState({ status: 'anonymous', notice: 'loggedOut' });
      return true;
    } catch {
      return false;
    }
  }, []);

  const expire = useCallback(() => setState({ status: 'anonymous', notice: 'expired' }), []);
  const recheck = useCallback(() => setAttempt((n) => n + 1), []);

  return { state, login, logout, expire, recheck };
}
