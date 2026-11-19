// Acesso seguro ao localStorage. Em modo privado, com cookies/dados bloqueados ou em
// ambientes sem DOM, o acesso pode lançar exceção — nunca deixamos isso quebrar a página.

export const STORAGE_KEYS = {
  theme: 'mg:theme',
  mode: 'mg:mode',
  lang: 'mg:lang',
} as const;

function area(): Storage | null {
  try {
    return typeof window !== 'undefined' ? window.localStorage : null;
  } catch {
    return null;
  }
}

export const storage = {
  get(key: string): string | null {
    try {
      return area()?.getItem(key) ?? null;
    } catch {
      return null;
    }
  },
  set(key: string, value: string): boolean {
    try {
      area()?.setItem(key, value);
      return area() !== null;
    } catch {
      return false;
    }
  },
  remove(key: string): void {
    try {
      area()?.removeItem(key);
    } catch {
      /* ignorado */
    }
  },
  getJSON<T>(key: string): T | null {
    const raw = storage.get(key);
    if (raw === null) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  },
  setJSON(key: string, value: unknown): boolean {
    try {
      return storage.set(key, JSON.stringify(value));
    } catch {
      return false;
    }
  },
};
