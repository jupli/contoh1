import { useEffect, useId, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

type DialogProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  className?: string;
};

export function Dialog({ open, onClose, title, children, className = 'max-w-3xl' }: DialogProps) {
  const panel = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const timer = window.setTimeout(() => panel.current?.querySelector<HTMLButtonElement>('button')?.focus(), 30);
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeRef.current();
      if (event.key !== 'Tab' || !panel.current) return;
      const nodes = [...panel.current.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], input, select, textarea, iframe, [tabindex="0"]')].filter((node) => node.getClientRects().length > 0);
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (!first) { event.preventDefault(); return; }
      if (event.shiftKey && (document.activeElement === first || !panel.current.contains(document.activeElement))) {
        event.preventDefault(); last.focus();
      } else if (!event.shiftKey && (document.activeElement === last || !panel.current.contains(document.activeElement))) {
        event.preventDefault(); first.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      window.clearTimeout(timer);
      document.body.style.overflow = overflow;
      document.removeEventListener('keydown', onKey);
      if (previous?.isConnected) previous.focus({ preventScroll: true });
    };
  }, [open]);

  if (!open) return null;
  return createPortal(
    <div className="dialog-backdrop fixed inset-0 z-[100] flex items-center justify-center bg-[#122b27]/75 p-4 backdrop-blur-sm" onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <div ref={panel} role="dialog" aria-modal="true" aria-labelledby={titleId} className={`dialog-panel relative max-h-[92dvh] w-full overflow-y-auto rounded-xl bg-white shadow-2xl ${className}`}>
        <div className="flex items-center justify-between gap-4 border-b border-slate-100 px-5 py-3">
          <h2 id={titleId} className="font-body text-sm font-bold text-ink">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Tutup jendela" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-ink transition hover:bg-brand hover:text-white"><X size={19} /></button>
        </div>
        {children}
      </div>
    </div>,
    document.body,
  );
}
