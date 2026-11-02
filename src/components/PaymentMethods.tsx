import { useEffect, useRef, useState } from 'react';
import { Check, Copy, Expand } from 'lucide-react';
import { BANKS, IMAGES } from '../data';
import { Dialog } from './Dialog';
import { SourceImage } from './SourceImage';

export function PaymentMethods() {
  const [copied, setCopied] = useState<string | null>(null);
  const [failed, setFailed] = useState<string | null>(null);
  const [qrisOpen, setQrisOpen] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const copy = async (account: string) => {
    try {
      if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(account);
      else {
        const field = document.createElement('textarea');
        field.value = account; field.style.position = 'fixed'; field.style.opacity = '0';
        document.body.appendChild(field); field.select();
        const success = document.execCommand('copy'); field.remove();
        if (!success) throw new Error('Copy unavailable');
      }
      setCopied(account); setFailed(null);
    } catch { setFailed(account); setCopied(null); }
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => { setCopied(null); setFailed(null); }, 3000);
  };

  return (
    <div className="font-body">
      <div className="grid grid-cols-1 gap-3 min-[440px]:grid-cols-2">
        {BANKS.map((bank) => <div key={bank.name} className="flex items-center gap-3 rounded-md border border-[#edf0ee] p-3 transition hover:border-teal/25 hover:bg-[#fcfefd]">
          <div className="w-[65px] shrink-0"><SourceImage src={bank.logo} alt={bank.name} loading="lazy" className="h-10 w-full object-contain" /></div>
          <div className="min-w-0 flex-1"><p className="text-[11px] font-bold text-ink">{bank.name}</p><p className="mt-0.5 text-[13px] font-semibold tracking-wide text-ink">{bank.account}</p><p className="mt-0.5 text-[9px] leading-relaxed text-muted">AmalQu Indonesia Peduli</p>{failed === bank.account && <p role="alert" className="mt-1 text-[10px] text-red-700">Silakan salin nomor secara manual.</p>}</div>
          <button type="button" onClick={() => copy(bank.account)} aria-label={`Salin nomor rekening ${bank.name}`} className="flex shrink-0 flex-col items-center gap-1 rounded-md p-2 text-[9px] font-semibold text-teal transition hover:bg-teal/5">{copied === bank.account ? <Check size={16} /> : <Copy size={16} />}{copied === bank.account ? 'Tersalin' : 'Salin'}</button>
        </div>)}
      </div>
      <button type="button" onClick={() => setQrisOpen(true)} className="mt-3 flex w-full items-center gap-5 rounded-md border border-[#edf0ee] p-3 text-left transition hover:border-teal/30 hover:bg-[#fcfefd]" aria-label="Perbesar QRIS AmalQu Indonesia Peduli">
        <SourceImage src={IMAGES.qris} alt="QRIS AmalQu Indonesia Peduli" loading="lazy" className="h-28 w-24 shrink-0 object-contain" />
        <span className="flex-1"><span className="block text-sm font-bold text-ink">QRIS</span><span className="mt-1 block text-xs text-muted">Scan QR Code Ini</span><span className="mt-1 block text-[10px] text-muted">AmalQu Indonesia Peduli</span><span className="mt-3 inline-flex items-center gap-1.5 text-[10px] font-semibold text-teal"><Expand size={12} />Perbesar QRIS</span></span>
      </button>
      <p className="sr-only" role="status">{copied ? 'Nomor rekening berhasil disalin.' : ''}</p>
      <Dialog open={qrisOpen} onClose={() => setQrisOpen(false)} title="QRIS AmalQu Indonesia Peduli" className="max-w-md">
        <SourceImage src={IMAGES.qris} alt="Kode QRIS resmi AmalQu Indonesia Peduli" className="mx-auto max-h-[70dvh] w-full object-contain p-5" />
        <p className="pb-5 text-center text-xs text-muted">AmalQu Indonesia Peduli</p>
      </Dialog>
    </div>
  );
}
