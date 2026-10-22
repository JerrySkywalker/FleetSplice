import React, { useRef, useState } from 'react';
import { Button } from './components/button.tsx';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from './components/dialog.tsx';
import { NativeSelect, NativeSelectOption } from './components/native-select.tsx';
import { Settings } from 'lucide-react';
import { translate, type Locale } from './i18n.ts';
import type { Appearance } from './preferences.ts';

export function PreferencesControl({ locale, appearance, saved, onLocale, onAppearance, sessionAction }: {
  locale: Locale; appearance: Appearance; saved: boolean;
  onLocale: (value: Locale) => void; onAppearance: (value: Appearance) => void;
  sessionAction?: React.ReactNode;
}) {
  const trigger = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const t = (key: Parameters<typeof translate>[1]) => translate(locale, key);
  const fieldClass = 'w-full [&_select]:h-10 [&_select]:text-sm max-sm:[&_select]:h-11';
  return <Dialog open={open} onOpenChange={setOpen}>
    <DialogTrigger render={<Button ref={trigger} type="button" variant="ghost" className="preferences-trigger icon-text-button max-md:min-h-11 max-md:min-w-11" data-testid="preferences" aria-label={t('preferences')} title={t('preferences')}/> }>
      <Settings size={16} aria-hidden="true"/><span className="max-md:hidden">{t('preferences')}</span>
    </DialogTrigger>
    <DialogContent id="preferences-dialog" showCloseButton={false} finalFocus={trigger} className="gap-5">
      <DialogHeader><DialogTitle>{t('preferences')}</DialogTitle><DialogDescription>{locale === 'zh-CN' ? '当前浏览器的显示设置。' : 'Display settings for this browser.'}</DialogDescription></DialogHeader>
      <div className="grid gap-5">
        <label className="grid gap-2 text-sm" htmlFor="locale">{t('language')}
          <NativeSelect id="locale" className={fieldClass} data-testid="locale-select" value={locale} onChange={event => onLocale(event.target.value as Locale)}>
            <NativeSelectOption value="zh-CN" lang="zh-CN">{t('localeChinese')}</NativeSelectOption><NativeSelectOption value="en-US" lang="en-US">{t('localeEnglish')}</NativeSelectOption>
          </NativeSelect>
        </label>
        <label className="grid gap-2 text-sm" htmlFor="appearance">{t('appearance')}
          <NativeSelect id="appearance" className={fieldClass} data-testid="appearance-select" value={appearance} onChange={event => onAppearance(event.target.value as Appearance)}>
            <NativeSelectOption value="system">{t('system')}</NativeSelectOption><NativeSelectOption value="light">{t('light')}</NativeSelectOption><NativeSelectOption value="dark">{t('dark')}</NativeSelectOption>
          </NativeSelect>
        </label>
      </div>
      <p role="status" className="text-sm text-muted-foreground">{t(saved ? 'preferencesLocal' : 'preferencesUnavailable')}</p>
      <DialogFooter>{sessionAction}<DialogClose render={<Button variant="outline"/>}>{t('close')}</DialogClose></DialogFooter>
    </DialogContent>
  </Dialog>;
}
