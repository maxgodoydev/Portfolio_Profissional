// Idiomas, na ordem de exibição (informado pelo autor).
// PT-BR: nativo. EN: intermediário B1 (EF SET, ver career.ts). ES: básico (sem nível CEFR declarado: não inventar A1/A2).
import type { Localized } from '../i18n';

export type FlagCountry = 'br' | 'us' | 'es';

export interface SpokenLanguage {
  id: 'pt-br' | 'en' | 'es';
  /** Código curto exibido na etiqueta. */
  code: string;
  flag: FlagCountry;
  name: Localized<string>;
  /** `cefr` só quando há nível CEFR confirmado. */
  level: { cefr?: string; label: Localized<string> };
}

export const SPOKEN_LANGUAGES: readonly SpokenLanguage[] = [
  { id: 'pt-br', code: 'PT-BR', flag: 'br', name: { pt: 'Português', en: 'Portuguese', es: 'Portugués' }, level: { label: { pt: 'Nativo', en: 'Native', es: 'Nativo' } } },
  { id: 'en', code: 'EN', flag: 'us', name: { pt: 'Inglês', en: 'English', es: 'Inglés' }, level: { cefr: 'B1', label: { pt: 'Intermediário', en: 'Intermediate', es: 'Intermedio' } } },
  { id: 'es', code: 'ES', flag: 'es', name: { pt: 'Espanhol', en: 'Spanish', es: 'Español' }, level: { label: { pt: 'Básico', en: 'Basic', es: 'Básico' } } },
];
