import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { AlertTriangle, BadgeCheck, BellRing, Info, X } from 'lucide-react';

export type ToastVariant = 'success' | 'info' | 'warning';
type Toast = { id: number; title: string; description?: string; variant: ToastVariant; duration: number };

const ToastContext = createContext<{ toast: (input: Omit<Toast, 'id' | 'duration'> & { duration?: number }) => void } | null>(null);

const ICONS = { success: BadgeCheck, info: Info, warning: AlertTriangle };

export function Toaster({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Toast[]>([]);
  const seq = useRef(0);
  const timers = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

  const dismiss = useCallback((id: number) => {
    setItems((old) => old.filter((item) => item.id !== id));
    const timer = timers.current.get(id);
    if (timer) { clearTimeout(timer); timers.current.delete(id); }
  }, []);

  const toast = useCallback((input: Omit<Toast, 'id' | 'duration'> & { duration?: number }) => {
    const id = ++seq.current;
    const duration = input.duration ?? 5200;
    setItems((old) => [...old.slice(-2), { ...input, id, duration }]);
    timers.current.set(id, setTimeout(() => dismiss(id), duration));
  }, [dismiss]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="toast-viewport" role="region" aria-label="Notifikasi">
        <div aria-live="polite" aria-atomic="false" className="flex flex-col gap-2.5">
          {items.map((item) => {
            const Icon = ICONS[item.variant];
            return (
              <div key={item.id} className={`toast-card toast-${item.variant}`} role="status">
                <span className="toast-icon"><Icon size={19} /></span>
                <div className="min-w-0 flex-1">
                  <p className="font-body text-[13px] font-bold leading-snug">{item.title}</p>
                  {item.description && <p className="mt-1 font-body text-[11px] leading-relaxed opacity-85">{item.description}</p>}
                </div>
                <button type="button" onClick={() => dismiss(item.id)} aria-label="Tutup notifikasi" className="toast-close"><X size={15} /></button>
                <span className="toast-progress" style={{ animationDuration: `${item.duration}ms` }} />
              </div>
            );
          })}
        </div>
      </div>
      <span className="sr-only" aria-live="polite">{items.length ? `${items[items.length - 1].title}. ${items[items.length - 1].description ?? ''}` : ''}</span>
      <span className="sr-only"><BellRing aria-hidden="true" /></span>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast harus dipakai di dalam Toaster');
  return context.toast;
}
