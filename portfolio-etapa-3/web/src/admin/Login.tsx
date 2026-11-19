// Tela de acesso. A senha só existe no campo e na requisição; nunca em estado global, storage ou URL.
import { useEffect, useId, useRef, useState, type FormEvent } from 'react';
import { useI18n } from '../i18n/context';
import type { AuthState, LoginFailure } from './useAuth';
import { LoadingBlock } from './ui';

export function LoginScreen({ notice, onLogin }: { notice?: 'expired' | 'loggedOut'; onLogin: (password: string) => Promise<LoginFailure | null> }) {
  const { t } = useI18n();
  const a = t.admin.login;
  const [failure, setFailure] = useState<LoginFailure | null>(null);
  const [busy, setBusy] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const fieldId = useId();
  const errorId = `${fieldId}-error`;

  // O campo fica desabilitado durante o envio; o foco só pode voltar depois que ele for reabilitado
  // (chamar focus() no mesmo instante em que busy muda não funciona em um campo ainda desabilitado).
  useEffect(() => {
    if (failure && !busy) input.current?.focus();
  }, [failure, busy]);

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setFailure(null);
    const result = await onLogin(input.current?.value ?? '');
    if (result) {
      setFailure(result);
      setBusy(false);
    }
  };

  const text = failure ? a[failure === 'required' ? 'required' : failure] : null;

  return (
    <div className="adm-login">
      <h1>{a.title}</h1>
      <p className="adm-login__intro">{a.intro}</p>
      {notice ? (
        <p className="adm-callout" role="status">
          {notice === 'expired' ? a.expired : a.loggedOut}
        </p>
      ) : null}
      <form onSubmit={submit} noValidate>
        <div className="adm-field">
          <label htmlFor={fieldId}>{a.password}</label>
          <input ref={input} id={fieldId} name="password" type="password" autoComplete="current-password" required aria-required="true" aria-invalid={failure ? true : undefined} aria-describedby={failure ? errorId : undefined} disabled={busy} />
        </div>
        <p id={errorId} className="adm-field__error" role="alert">
          {text}
        </p>
        <button type="submit" className="adm-btn adm-btn--primary" disabled={busy} aria-disabled={busy}>
          {busy ? a.submitting : a.submit}
        </button>
      </form>
    </div>
  );
}

/** Estados de sessão que não são o formulário: verificando, desativado e API fora do ar. */
export function AuthStatus({ state, onRetry }: { state: AuthState; onRetry: () => void }) {
  const { t } = useI18n();
  const a = t.admin.login;
  if (state.status === 'checking') {
    return (
      <div className="adm-login">
        <LoadingBlock rows={2} />
        <p className="adm-note">{a.checking}</p>
      </div>
    );
  }
  if (state.status === 'disabled') {
    return (
      <div className="adm-login">
        <h1>{a.title}</h1>
        <p className="adm-callout" role="status">
          {a.disabled}
        </p>
        <p className="adm-note">{a.disabledHelp}</p>
      </div>
    );
  }
  return (
    <div className="adm-login">
      <h1>{a.title}</h1>
      <p className="adm-callout adm-callout--error" role="alert">
        {a.network}
      </p>
      <button type="button" className="adm-btn" onClick={onRetry}>
        {a.retry}
      </button>
    </div>
  );
}
