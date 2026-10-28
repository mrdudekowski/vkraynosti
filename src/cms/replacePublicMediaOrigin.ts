function stripSlash(value: string): string {
  return value.replace(/\/+$/, '');
}

export function replacePublicMediaOrigin(
  value: unknown,
  fromPrefix: string,
  toPrefix: string,
): { value: unknown; replacements: number } {
  const from = stripSlash(fromPrefix);
  const to = stripSlash(toPrefix);
  if (typeof value === 'string') {
    if (!value.includes(from)) {
      return { value, replacements: 0 };
    }
    return { value: value.split(from).join(to), replacements: value.split(from).length - 1 };
  }
  if (Array.isArray(value)) {
    let replacements = 0;
    const next = value.map((item) => {
      const rewritten = replacePublicMediaOrigin(item, from, to);
      replacements += rewritten.replacements;
      return rewritten.value;
    });
    return { value: replacements === 0 ? value : next, replacements };
  }
  if (value != null && typeof value === 'object') {
    let replacements = 0;
    const next: Record<string, unknown> = {};
    for (const [key, item] of Object.entries(value)) {
      const rewritten = replacePublicMediaOrigin(item, from, to);
      replacements += rewritten.replacements;
      next[key] = rewritten.value;
    }
    return { value: replacements === 0 ? value : next, replacements };
  }
  return { value, replacements: 0 };
}
