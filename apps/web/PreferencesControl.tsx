import React, { useRef, useState } from 'react';
import { Button } from '../../packages/ui/components/button.tsx';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '../../packages/ui/components/dialog.tsx';
import { NativeSelect, NativeSelectOption } from '../../packages/ui/components/native-select.tsx';
import { SemanticIcon } from './icons/semantic-icons.tsx';
import { translate, type Locale } from './i18n.ts';
import type { Appearance } from './preferences.ts';
import { useBreakpoint } from './components/AppShell.tsx';

export function PreferencesControl({ locale, appearance, saved, onLocale, onAppearance }: {
  locale: Locale; appearance: Appearance; saved: boolean;
  onLocale: (value: Locale) => void; onAppearance: (value: Appearance) => void;
}) {
  const trigger = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const mobile = useBreakpoint() === 'mobile';
  const t = (key: Parameters<typeof translate>[1]) => translate(locale, key);
  const fieldClass = 'w-full [&_select]:h-10 [&_select]:text-sm max-sm:[&_select]:h-11';
  return <Dialog open={open} onOpenChange={setOpen}>
    <DialogTrigger render={<Button ref={trigger} type="button" variant="ghost" className={`preferences-trigger${mobile ? ' preferences-trigger-icon' : ' icon-text-button'}`} data-testid="preferences" aria-label={t('preferences')} title={t('preferences')}/> }>
      <SemanticIcon intent="settings" size={16}/>{!mobile && <span>{t('preferences')}</span>}
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
            <NativeSelectOption value="oled-black">{t('oledBlack')}</NativeSelectOption><NativeSelectOption value="midnight">{t('midnight')}</NativeSelectOption><NativeSelectOption value="graphite">{t('graphite')}</NativeSelectOption><NativeSelectOption value="warm">{t('warm')}</NativeSelectOption>
          </NativeSelect>
        </label>
      </div>
      <p role="status" className="text-sm text-muted-foreground">{t(saved ? 'preferencesLocal' : 'preferencesUnavailable')}</p>
      <DialogFooter><DialogClose render={<Button variant="outline"/>}>{t('close')}</DialogClose></DialogFooter>
    </DialogContent>
  </Dialog>;
}
