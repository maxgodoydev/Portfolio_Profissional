import { useCallback, useId, useRef, useState, type KeyboardEvent } from 'react';
import { useI18n } from '../i18n/context';
import { useDismiss } from '../lib/useDismiss';
import { useTheme } from '../theme/context';
import type { ThemeMode } from '../theme/themes';
import { Icon, type IconName } from './icons';

const MODES: { id: ThemeMode; icon: IconName }[] = [
  { id: 'auto', icon: 'auto' },
  { id: 'light', icon: 'sun' },
  { id: 'dark', icon: 'moon' },
];

/**
 * Botão que abre um painel com as 5 paletas e os 3 modos (automático/claro/escuro).
 * Usa <input type="radio"> nativos: setas do teclado, leitor de tela e foco funcionam sem código extra.
 * A seleção é indicada por borda + ícone de check (não depende só da cor).
 */
export function ThemeSwitcher() {
  const { t } = useI18n();
  const { theme, mode, themes, setTheme, setMode } = useTheme();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();
  const nameId = useId();

  const close = useCallback(() => setOpen(false), []);
  useDismiss(open, wrapRef, close);

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape' && open) {
      e.stopPropagation();
      setOpen(false);
      buttonRef.current?.focus();
    }
  };

  const current = themes.find((p) => p.id === theme);

  return (
    <div className="theme-switch" ref={wrapRef} onKeyDown={onKeyDown}>
      <button
        ref={buttonRef}
        type="button"
        className="icon-button"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={`${t.common.theme}: ${current?.name ?? ''}`}
        title={t.common.theme}
        onClick={() => setOpen((v) => !v)}
      >
        <Icon name="palette" />
      </button>

      {open && (
        <div className="theme-panel" id={panelId} role="group" aria-labelledby={nameId}>
          <p className="theme-panel__title" id={nameId}>
            {t.common.theme}
          </p>

          <fieldset className="theme-panel__group">
            <legend>{t.common.palette}</legend>
            {themes.map((p) => (
              <label key={p.id} className="palette-option">
                <input type="radio" name="palette" className="visually-hidden" checked={theme === p.id} onChange={() => setTheme(p.id)} />
                <span className="palette-option__body">
                  <span className="palette-option__swatches" aria-hidden="true">
                    {p.colors.map((c) => (
                      <span key={c} style={{ background: c }} />
                    ))}
                  </span>
                  <span className="palette-option__name">{p.name}</span>
                  <Icon name="check" size={18} className="palette-option__check" />
                </span>
              </label>
            ))}
          </fieldset>

          <fieldset className="theme-panel__group">
            <legend>{t.common.mode}</legend>
            <div className="mode-options">
              {MODES.map((m) => (
                <label key={m.id} className="mode-option">
                  <input type="radio" name="mode" className="visually-hidden" checked={mode === m.id} onChange={() => setMode(m.id)} />
                  <span className="mode-option__body">
                    <Icon name={m.icon} size={18} />
                    {t.common[m.id]}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
        </div>
      )}
    </div>
  );
}
