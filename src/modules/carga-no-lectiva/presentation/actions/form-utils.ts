export function normalizeFormAccessor(input?: unknown) {
  if (!input) return null;
  if (typeof (input as any).get === 'function') {
    return {
      get: (k: string) => (input as FormData).get(k),
      getAll: (k: string) => ((input as FormData).getAll ? (input as FormData).getAll(k) : []),
    } as const;
  }

  if (typeof input === 'object' && input !== null) {
    const map = new Map<string, any[]>();
    for (const [rawKey, val] of Object.entries(input as Record<string, any>)) {
      const key = rawKey.replace(/^.*?_/, '');
      const values = Array.isArray(val) ? val : [val];
      map.set(key, (map.get(key) || []).concat(values));
    }
    return {
      get: (k: string) => {
        const arr = map.get(k);
        return arr ? arr[0] : undefined;
      },
      getAll: (k: string) => (map.get(k) || []),
    } as const;
  }

  return null;
}
