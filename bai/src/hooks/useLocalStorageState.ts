import { newId } from '../tools/object';

export type StateManager<T> = [getter: () => T, setter: (value: T) => void];

// I would not use this in production due to JSON conversions (will be slow on scale!)
// Some object-based state management would work better
export const useLocalStorageState = () =>
  function <T>(initWithDefault?: T | null): StateManager<T> {
    const key = newId();
    const getter = () => {
      const item = localStorage.getItem(key);

      return item ? JSON.parse(item) : null;
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
