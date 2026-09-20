/** Compact configuration notation for Quiet Data Instrument density. */

export function abbreviateModel(label: string | null | undefined): string {
  const raw = (label ?? '').trim();
  if (!raw) return '—';
  const lower = raw.toLowerCase();
  const terra = lower.match(/gpt[- ]?5\.?6.*terra|5\.6t|terra/);
  if (terra || /gpt-5\.6-terra/i.test(raw)) return '5.6T';
  const composer = lower.match(/composer[- ]?2\.?5|c2\.5/);
  if (composer) return 'C2.5';
  const qwen = lower.match(/qwen[- ]?3\.?8|q3\.8/);
  if (qwen) return 'Q3.8';
  const gpt = raw.match(/gpt[- ]?(\d+(?:\.\d+)?)/i);
  if (gpt) {
    const ver = gpt[1]!;
    return ver.length <= 4 ? `G${ver}` : ver.slice(0, 6);
  }
  const compact = raw.replace(/\s+/g, '');
  return compact.length <= 10 ? compact : `${compact.slice(0, 8)}…`;
}

export function abbreviateReasoning(value: string | null | undefined): string {
  const raw = (value ?? '').trim();
  if (!raw) return '—';
  const lower = raw.toLowerCase().replace(/[_\s-]+/g, '');
  if (lower === 'low') return 'LOW';
  if (lower === 'medium' || lower === 'med') return 'MED';
  if (lower === 'high') return 'HIGH';
  if (lower === 'xhigh' || lower === 'extrahigh' || lower === 'extra') return 'XHIGH';
  return raw.length <= 6 ? raw.toUpperCase() : `${raw.slice(0, 5).toUpperCase()}…`;
}

export function abbreviatePermission(value: string | null | undefined): string {
  const raw = (value ?? '').trim();
  if (!raw) return '—';
  if (/approval\s*=\s*never|yolo|dangerfullaccess|full\s*access/i.test(raw)) return 'YOLO';
  if (/workspace[-_ ]?write|workspace\s*auto|wa\b/i.test(raw)) return 'WA';
  if (/read[-_ ]?only|readonly|\bro\b/i.test(raw)) return 'RO';
  return raw.length <= 8 ? raw : `${raw.slice(0, 6)}…`;
}

export function compactConfigSummary(input: {
  model?: string | null;
  reasoning?: string | null;
  permission?: string | null;
}): string {
  const parts = [abbreviateModel(input.model)];
  const reasoning = (input.reasoning ?? '').trim();
  if (reasoning) parts.push(abbreviateReasoning(reasoning));
  parts.push(abbreviatePermission(input.permission));
  return parts.join(' · ');
}
