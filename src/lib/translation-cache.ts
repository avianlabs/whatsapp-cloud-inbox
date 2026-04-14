export interface TranslationEntry {
  translation: string;
  detectedLanguage: string;
  translatedAt: string;
}

export interface TranslationCache {
  get(messageId: string): TranslationEntry | null;
  set(messageId: string, entry: TranslationEntry): void;
}

const CACHE_PREFIX = "tx_";

export const translationCache: TranslationCache = {
  get(messageId: string): TranslationEntry | null {
    if (typeof window === "undefined") return null;
    try {
      const raw = localStorage.getItem(`${CACHE_PREFIX}${messageId}`);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  set(messageId: string, entry: TranslationEntry): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(`${CACHE_PREFIX}${messageId}`, JSON.stringify(entry));
    } catch {
      // localStorage full or unavailable — silently skip
    }
  },
};
