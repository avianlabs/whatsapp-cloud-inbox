export type LanguageInfo = {
  code: string;
  label: string;
  flag: string;
};

/**
 * Detect likely user language from phone number country code.
 *
 * The onboarding bot trigger webhook carries a `language` field (ES/EN/PT)
 * determined at signup. This utility provides a lightweight client-side
 * approximation based on the phone number prefix so the inbox can show a
 * language hint without an extra API call.
 */
export function detectLanguageFromPhone(phoneNumber: string): LanguageInfo | null {
  const cleaned = phoneNumber.replace(/\D/g, '');

  if (cleaned.startsWith('52')) return { code: 'ES', label: 'Spanish', flag: '🇲🇽' };
  if (cleaned.startsWith('55')) return { code: 'PT', label: 'Portuguese', flag: '🇧🇷' };
  if (cleaned.startsWith('1')) return { code: 'EN', label: 'English', flag: '🇺🇸' };

  return null;
}
