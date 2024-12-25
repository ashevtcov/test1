export const newId = () => `ID${new Date().getTime()}${Math.random()}`;
export const toMap = <T>(
  array: T[],
  key: (obj: T) => any,
  value: (obj: T) => any
) =>
  array.reduce((result: any, current: T) => {
    result[key(current)] = value(current);

    return result;
  }, {});
