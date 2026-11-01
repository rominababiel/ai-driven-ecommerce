export interface PersistentStore<T> {
  read(): T;
  write(value: T): void;
}

export function createPersistentStore<T>(key: string, fallback: T): PersistentStore<T> {
  return {
    read() {
      try {
        const raw = localStorage.getItem(key);
        return raw === null ? fallback : (JSON.parse(raw) as T);
      } catch {
        return fallback;
      }
    },
    write(value) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch {
        return;
      }
    },
  };
}
