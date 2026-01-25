export const USER_KEY = "user";
export const SUBJECTS_KEY = "user";

export type StorageKey = typeof USER_KEY | typeof SUBJECTS_KEY;

export abstract class Repository {
  protected static read<T>(key: StorageKey): T | undefined {
    const raw = localStorage.getItem(key);

    if (!raw) {
      return undefined;
    }

    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return undefined;
    }

    if (!parsed) {
      return undefined;
    }

    return parsed;
  }

  protected static write(key: StorageKey, value: object) {
    localStorage.setItem(key, JSON.stringify(value));
  }
}
