/**
 * Site/presentation configuration boundary.
 *
 * Owns store, company, contact, and social env vars so that UI code
 * (features, components, layouts) never reads `import.meta.env` directly.
 * Infrastructure selection env vars do NOT live here — see
 * `src/app/composition.ts` (data backend) and `src/config/firebase.ts`,
 * `src/config/imagekit.ts`, `src/config/storage.ts`.
 */

function getEnvVar(key: string, defaultValue = ''): string {
  return (import.meta.env as Record<string, string | undefined>)[key] ?? defaultValue;
}

export interface SiteContact {
  name: string;
  number: string;
}

/** `https://wa.me/...` link for a raw phone number. */
export function formatWaLink(num: string): string {
  const clean = num.replace(/\D/g, '');
  if (!clean) return '#';
  return clean.startsWith('0')
    ? `https://wa.me/62${clean.substring(1)}`
    : `https://wa.me/${clean}`;
}

export const siteConfig = {
  storeName: getEnvVar('VITE_STORE_NAME', 'Elvan Electronic'),
  companyName: getEnvVar('VITE_COMPANY_NAME', 'Kinarya Adika Askari'),
  contacts: (
    [
      { name: 'Admin', number: getEnvVar('VITE_ADMIN_NUMBER') },
      { name: 'CS 1', number: getEnvVar('VITE_CS1_NUMBER') },
      { name: 'CS 2', number: getEnvVar('VITE_CS2_NUMBER') },
    ] as SiteContact[]
  ).filter((c) => c.number),
  social: {
    wa: getEnvVar('VITE_SOCIAL_WA'),
    ig: getEnvVar('VITE_SOCIAL_IG'),
    fb: getEnvVar('VITE_SOCIAL_FB'),
  },
};
