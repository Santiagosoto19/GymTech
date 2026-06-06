export interface ClientPreferences {
  emailAlerts: boolean;
  classReminders: boolean;
  membershipAlerts: boolean;
  phone: string;
  emergencyContact: string;
}

const KEY = 'gymtech_client_prefs';

const DEFAULTS: ClientPreferences = {
  emailAlerts: true,
  classReminders: true,
  membershipAlerts: true,
  phone: '',
  emergencyContact: '',
};

export function getClientPrefs(userId: string): ClientPreferences {
  const raw = localStorage.getItem(`${KEY}_${userId}`);
  if (!raw) return { ...DEFAULTS };
  try {
    return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULTS };
  }
}

export type SaveClientPrefsInput = Partial<ClientPreferences>;

export function saveClientPrefs(userId: string, prefs: SaveClientPrefsInput): ClientPreferences {
  const current = getClientPrefs(userId);
  const merged = { ...current, ...prefs };
  localStorage.setItem(`${KEY}_${userId}`, JSON.stringify(merged));
  return merged;
}
