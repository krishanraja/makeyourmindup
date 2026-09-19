export function fnv1a(input: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = (h + ((h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24))) >>> 0;
  }
  return h >>> 0;
}

export function pickVariant(id: string, key: string): 'A' | 'B' {
  return fnv1a(`${id}:${key}`) % 2 === 0 ? 'A' : 'B';
}
