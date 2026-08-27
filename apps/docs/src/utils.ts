function toKebabCase(str: string) {
  return str.replace(
    /[A-Z]+(?![a-z])|[A-Z]/g,
    ($, ofs) => (ofs ? "-" : "") + $.toLowerCase(),
  );
}

export function getDataAttributes(input: Record<string, unknown>) {
  return Object.entries(input).reduce(
    (memo, [key, value]) => ({ ...memo, [`data-${toKebabCase(key)}`]: value }),
    {},
  );
}
