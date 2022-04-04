

export const stall = <T>(fn: (v: string) => Promise<T>) => {
  const store = new Map<string, T>();
  
  return async (k: string) => {
    const ret = store.get(k);
    if (ret) { 
      return ret;
    }
    const value = await fn(k);
    store.set(k, value);

    return value;
  };
}