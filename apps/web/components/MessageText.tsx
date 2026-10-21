import React, { useState } from 'react';
import type { Locale } from '../i18n.ts';

// Deliberate text-only Markdown subset: paragraphs, inline code and fenced
// blocks. No HTML interpretation, remote images or executable link schemes.
export function messageBlocks(text: string): { kind: 'text' | 'code'; text: string; language?: string }[] {
  const blocks: { kind: 'text' | 'code'; text: string; language?: string }[] = [];
  const lines = text.split('\n'); let plain: string[] = [];
  const flush = () => { if (plain.length) blocks.push({ kind: 'text', text: plain.join('\n') }); plain = []; };
  for (let index = 0; index < lines.length; index++) {
    const fence = /^```([^`]*)$/.exec(lines[index]!);
    if (!fence) { plain.push(lines[index]!); continue; }
    flush(); const code: string[] = [];
    while (++index < lines.length && !/^```\s*$/.test(lines[index]!)) code.push(lines[index]!);
    blocks.push({ kind: 'code', text: code.join('\n'), language: fence[1]!.trim() });
  }
  flush(); return blocks;
}
function CodeBlock({ text, language, locale }: { text: string; language?: string; locale: Locale }) {
  const [copy, setCopy] = useState<'idle' | 'copied' | 'failed'>('idle'); const zh = locale === 'zh-CN';
  return <section className="message-code">
    <div className="message-code-heading"><span>{language || (zh ? '代码' : 'Code')}</span><button type="button"
      disabled={!navigator.clipboard?.writeText} onClick={async () => {
        try { await navigator.clipboard.writeText(text); setCopy('copied'); } catch { setCopy('failed'); }
      }}>{copy === 'copied' ? (zh ? '已复制' : 'Copied') : copy === 'failed' ? (zh ? '复制失败' : 'Copy failed') : (zh ? '复制代码' : 'Copy code')}</button></div>
    <pre tabIndex={0}><code>{text}</code></pre>
  </section>;
}
export function MessageText({ text, locale = 'en-US' }: { text: string; locale?: Locale }) {
  return <div className="message-text message-rich">{messageBlocks(text).map((block, index) => block.kind === 'code'
    ? <CodeBlock key={index} text={block.text} language={block.language} locale={locale} />
    : <div className="message-prose" key={index}>{block.text.split(/(`[^`\n]+`)/g).map((part, partIndex) => part.startsWith('`') && part.endsWith('`')
      ? <code key={partIndex}>{part.slice(1, -1)}</code> : <React.Fragment key={partIndex}>{part}</React.Fragment>)}</div>)}</div>;
}
