import {useEffect, useState} from 'react';

export const useDebouncedValue = <T,>(value: T, delayMs = 350) => {
  const [debounced, setDebounced] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [delayMs, value]);

  return debounced;
};
