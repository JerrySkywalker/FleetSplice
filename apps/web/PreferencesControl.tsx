import React, { useRef, useState } from 'react';
import { Settings } from 'lucide-react';
import { translate, type Locale } from './i18n.ts';
import type { Appearance } from './preferences.ts';
import { useBreakpoint } from './components/AppShell.tsx';

export function PreferencesControl({ locale, appearance, saved, onLocale, onAppearance }: {
  locale: Locale; appearance: Appearance; saved: boolean;
  onLocale: (value: Locale) => void; onAppearance: (value: Appearance) => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const breakpoint = useBreakpoint();
  const mobile = breakpoint === 'mobile';
  const t = (key: Parameters<typeof translate>[1]) => translate(locale, key);
  const label = t('preferences');
  return <>
    <button ref={trigger} type="button"
      className={`preferences-trigger${mobile ? ' preferences-trigger-icon' : ' icon-text-button'}`}
      data-testid="preferences"
      aria-label={label}
      title={label}
      aria-haspopup="dialog" aria-controls="preferences-dialog" aria-expanded={open}
      onClick={() => { dialog.current?.showModal(); setOpen(true); }}>
      <Settings size={16} aria-hidden="true" />
      {!mobile ? <span className="preferences-label">{label}</span> : null}
    </button>
    <dialog id="preferences-dialog" ref={dialog} aria-labelledby="preferences-title"
      onKeyDown={event => {
        if (event.key !== 'Tab') return;
        const controls = [...event.currentTarget.querySelectorAll<HTMLButtonElement | HTMLSelectElement>('button,select')];
        const first = controls[0], last = controls.at(-1);
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }}
      onClose={() => { setOpen(false); trigger.current?.focus(); }}>
      <div className="preferences-heading"><h2 id="preferences-title">{t('preferences')}</h2>
        <button type="button" onClick={() => dialog.current?.close()}>{t('close')}</button></div>
      <label htmlFor="locale">{t('language')}</label>
      <select id="locale" data-testid="locale-select" value={locale} onChange={e => onLocale(e.target.value as Locale)}>
        <option value="zh-CN" lang="zh-CN">{t('localeChinese')}</option><option value="en-US" lang="en-US">{t('localeEnglish')}</option>
      </select>
      <label htmlFor="appearance">{t('appearance')}</label>
      <select id="appearance" data-testid="appearance-select" value={appearance} onChange={e => onAppearance(e.target.value as Appearance)}>
        <option value="system">{t('system')}</option>
        <option value="light">{t('light')}</option>
        <option value="dark">{t('dark')}</option>
        <option value="oled-black">{t('oledBlack')}</option>
        <option value="midnight">{t('midnight')}</option>
        <option value="graphite">{t('graphite')}</option>
        <option value="warm">{t('warm')}</option>
      </select>
      <p role="status">{t(saved ? 'preferencesLocal' : 'preferencesUnavailable')}</p>
    </dialog>
  </>;
}
