// Development-only sample; no client session, discovery, network or native runtime.
import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Moon, Sun, LoaderCircle, MoreHorizontal } from 'lucide-react';
import { Button } from '../../packages/ui/components/button.tsx';
import { Input } from '../../packages/ui/components/input.tsx';
import { Textarea } from '../../packages/ui/components/textarea.tsx';
import { Badge } from '../../packages/ui/components/badge.tsx';
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription } from '../../packages/ui/components/dialog.tsx';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '../../packages/ui/components/dropdown-menu.tsx';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '../../packages/ui/components/tooltip.tsx';
import './style.css';

function Sample() {
  const [dark, setDark] = useState(false);
  const [status, setStatus] = useState('No action selected');
  return <TooltipProvider><main className="mx-auto max-w-3xl space-y-8 p-8">
    <header className="flex items-center justify-between"><div><h1 className="text-xl font-medium">FleetSplice · UI sample</h1><p className="mt-2 text-muted-foreground">Mira / Base UI / Zinc / Inter · synthetic only</p></div>
      <Button variant="outline" aria-label="Toggle theme" onClick={() => { const next = !dark; setDark(next); document.documentElement.dataset.theme = next ? 'dark' : 'light'; }}>{dark ? <Sun/> : <Moon/>}</Button></header>
    <section className="space-y-4 rounded-xl border p-5"><h2 className="font-medium">Controls and state</h2><div className="flex flex-wrap gap-3">
      <Button onClick={() => setStatus('Primary selected')}>Primary</Button><Button variant="outline">Secondary</Button><Button disabled>Disabled</Button><Button disabled><LoaderCircle className="animate-spin"/> Pending</Button><Badge variant="secondary">Viewer</Badge>
      <button className="primary" type="button" data-testid="legacy-primary-seam">Migrating action</button>
      <Tooltip><TooltipTrigger render={<Button variant="ghost"/>}>Details</TooltipTrigger><TooltipContent>Session information</TooltipContent></Tooltip>
      <DropdownMenu><DropdownMenuTrigger render={<Button aria-label="More actions" variant="outline"/>}><MoreHorizontal/></DropdownMenuTrigger><DropdownMenuContent><DropdownMenuItem onClick={() => setStatus('Menu selected')}>Select sample</DropdownMenuItem></DropdownMenuContent></DropdownMenu>
    </div><label htmlFor="sample-title" className="block text-sm">Session title</label><Input id="sample-title" placeholder="Review a workspace"/><label htmlFor="sample-prompt" className="block text-sm">Draft</label><Textarea id="sample-prompt" placeholder="Write a local draft…"/><p role="status" className="text-muted-foreground">{status}</p></section>
    <Dialog><DialogTrigger render={<Button variant="outline"/>}>Open dialog</DialogTrigger><DialogContent><DialogTitle>Session details</DialogTitle><DialogDescription>This portal uses the same theme and font as the page.</DialogDescription><Input aria-label="Dialog draft" placeholder="Keyboard focus stays here"/></DialogContent></Dialog>
    <p className="text-muted-foreground">中文排版检查：会话、工作区与控制状态。No native connection or effect.</p>
  </main></TooltipProvider>;
}
createRoot(document.getElementById('root')!).render(<Sample/>);
