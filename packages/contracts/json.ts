import { canonicalize } from 'json-canonicalize';

export class Fault extends Error {
  constructor(public code: string) { super(code); }
}
export function requireThat(condition: unknown, code: string): asserts condition {
  if (!condition) throw new Fault(code);
}

// Parse before JSON.parse can erase duplicate keys or round a lossy number.
// Contract numbers are bounded integers; all counters are canonical strings.
export function parseJson(text: string): unknown {
  requireThat(text.length <= 262144, 'MESSAGE_TOO_LARGE');
  let i = 0;
  const ws = () => { while (/\s/.test(text[i] ?? '') && i < text.length) {
    requireThat(/[\x20\t\r\n]/.test(text[i]!), 'INVALID_JSON'); i++;
  } };
  const string = (): string => {
    const start = i++;
    while (i < text.length) {
      const c = text[i++];
      if (c === '\\') i++;
      else if (c === '"') {
        const value: string = JSON.parse(text.slice(start, i));
        requireThat(!/[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/u.test(value), 'INVALID_UNICODE');
        return value;
      }
    }
    throw new Fault('INVALID_JSON');
  };
  const value = (depth: number): void => {
    requireThat(depth < 40, 'JSON_TOO_DEEP'); ws();
    if (text[i] === '"') { string(); return; }
    if (text[i] === '{') {
      i++; ws(); const keys = new Set<string>();
      if (text[i] === '}') { i++; return; }
      while (true) {
        ws(); requireThat(text[i] === '"', 'INVALID_JSON'); const key = string();
        requireThat(!keys.has(key), 'DUPLICATE_KEY'); keys.add(key); ws();
        requireThat(text[i++] === ':', 'INVALID_JSON'); value(depth + 1); ws();
        if (text[i] === '}') { i++; return; }
        requireThat(text[i++] === ',', 'INVALID_JSON');
      }
    }
    if (text[i] === '[') {
      i++; ws(); if (text[i] === ']') { i++; return; }
      while (true) { value(depth + 1); ws(); if (text[i] === ']') { i++; return; }
        requireThat(text[i++] === ',', 'INVALID_JSON'); }
    }
    const literal = /^(?:true|false|null|-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?)/.exec(text.slice(i))?.[0];
    requireThat(literal, 'INVALID_JSON'); i += literal.length;
    if (/^-?\d/.test(literal)) requireThat(/^-?(?:0|[1-9]\d*)$/.test(literal) && literal !== '-0' && Number.isSafeInteger(Number(literal)), 'LOSSY_NUMBER');
  };
  value(0); ws(); requireThat(i === text.length, 'INVALID_JSON');
  return JSON.parse(text);
}
export function canonical(value: unknown): string {
  const result = canonicalize(value);
  parseJson(result); return result;
}
export async function digest(kind: 'intent' | 'plan' | 'step' | 'identity', value: unknown): Promise<string> {
  const data = new TextEncoder().encode(`FleetSplice.v1.${kind}\0${canonical(value)}`);
  return [...new Uint8Array(await crypto.subtle.digest('SHA-256', data))].map(b => b.toString(16).padStart(2, '0')).join('');
}
export const next = (revision: string) => (BigInt(revision) + 1n).toString();
export class ClockFence {
  private broken = false;
  constructor(private wall: number, private monotonic: number) {}
  check(wall: number, monotonic: number): void {
    if (monotonic < this.monotonic || Math.abs((wall - this.wall) - (monotonic - this.monotonic)) > 2000) this.broken = true;
    requireThat(!this.broken, 'CLOCK_CONTINUITY_UNKNOWN');
  }
}
