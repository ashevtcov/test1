import { newId } from '../tools/object';

export const useLocalStorageState = () =>
  function <T>(initWithDefault?: T): [() => T, (value: T) => void] {
    const key = newId();
    const getter = () => {
      const item = localStorage.getItem(key);

      return item ? JSON.parse(item) : undefined;
    };
    const setter = (value: T | null | undefined) =>
      value
        ? localStorage.setItem(key, JSON.stringify(value))
        : localStorage.removeItem(key);

    if (initWithDefault) {
      setter(initWithDefault);
    }

    return [getter, setter];
  };
