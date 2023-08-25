const omit = <T extends Record<string, unknown>, K extends keyof T>(obj: T, key: K) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { [key]: omitted, ...rest } = obj;
  return rest;
}

export default omit
