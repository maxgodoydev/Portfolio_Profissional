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
 * Botão 🎨 que abre um painel compacto: as paletas em grade horizontal (cada amostra mostra as 5 cores
 * do tema) e os 3 modos (automático/claro/escuro) em uma linha. O nome da paleta aparece numa linha só,
 * ao passar o mouse/focar ou, em repouso, o da paleta ativa.
 * Usa <input type="radio"> nativos: setas do teclado, leitor de tela e foco funcionam sem código extra.
 * A seleção é indicada por anel + ícone de check (não depende só da cor).
 */
export function ThemeSwitcher() {
  const { t } = useI18n();
  const { theme, mode, themes, setTheme, setMode } = useTheme();
  const [open, setOpen] = useState(false);
  const [peek, setPeek] = useState<string | null>(null); // paleta sob o mouse/foco (só para exibir o nome)
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
  const shown = themes.find((p) => p.id === (peek ?? theme)) ?? current;

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
        <span className="theme-emoji" aria-hidden="true">
          🎨
        </span>
      </button>

      {open && (
        <div className="theme-panel" id={panelId} role="group" aria-labelledby={nameId}>
          <p className="theme-panel__title" id={nameId}>
            <span aria-hidden="true">🎨</span> {t.common.theme}
          </p>

          <fieldset className="theme-panel__group">
            <legend>{t.common.palette}</legend>
            <div className="palette-grid">
              {themes.map((p) => (
                <label key={p.id} className="palette-tile" title={p.name} onMouseEnter={() => setPeek(p.id)} onMouseLeave={() => setPeek(null)}>
                  <input
                    type="radio"
                    name="palette"
                    className="visually-hidden"
                    aria-label={p.name}
                    checked={theme === p.id}
                    onChange={() => setTheme(p.id)}
                    onFocus={() => setPeek(p.id)}
                    onBlur={() => setPeek(null)}
                  />
                  <span className="palette-tile__body">
                    <span className="palette-tile__colors" aria-hidden="true">
                      {p.colors.map((c) => (
                        <span key={c} style={{ background: c }} />
                      ))}
                    </span>
                    <span className="palette-tile__check" aria-hidden="true">
                      <Icon name="check" size={13} />
                    </span>
                  </span>
                </label>
              ))}
            </div>
            {/* Nome visível da paleta (os leitores de tela já recebem o nome pelo rádio) */}
            <p className="palette-name" aria-hidden="true">
              {shown?.name}
            </p>
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
