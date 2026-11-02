import { useEffect, useMemo, useRef, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { ArrowRight, Check, Clock3, Copy, Loader2, MessageCircle, QrCode, ScanLine, ShieldCheck, ZoomIn } from 'lucide-react';
import { BANKS, CONTACT, IMAGES, formatRupiah } from '../data';
import { useDonations, type PaymentMethodId } from '../store/donations';
import { Dialog } from './Dialog';
import { SourceImage } from './SourceImage';

const pad = (value: number) => String(value).padStart(2, '0');

function useCountdown(expiresAt: number, onExpire: () => void) {
  const [remaining, setRemaining] = useState(() => Math.max(0, expiresAt - Date.now()));
  const expireRef = useRef(onExpire);
  expireRef.current = onExpire;
  useEffect(() => {
    const tick = () => setRemaining(Math.max(0, expiresAt - Date.now()));
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);
  useEffect(() => { if (remaining === 0) expireRef.current(); }, [remaining]);
  return remaining;
}

function CopyChip({ value, label }: { value: string; label: string }) {
  const [state, setState] = useState<'idle' | 'copied' | 'error'>('idle');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  const copy = async () => {
    try {
      if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(value);
      else {
        const field = document.createElement('textarea');
        field.value = value; field.style.position = 'fixed'; field.style.opacity = '0';
        document.body.appendChild(field); field.select();
        const ok = document.execCommand('copy'); field.remove();
        if (!ok) throw new Error('copy unavailable');
      }
      setState('copied');
    } catch { setState('error'); }
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setState('idle'), 2600);
  };
  return (
    <>
      <button type="button" onClick={copy} aria-label={`Salin ${label}`} className="copy-chip">
        {state === 'copied' ? <Check size={13} /> : <Copy size={13} className={state === 'error' ? 'text-red-700' : ''} />}
        {state === 'copied' ? 'Tersalin' : state === 'error' ? 'Salin manual' : 'Salin'}
      </button>
      <span className="sr-only" role="status">
        {state === 'copied' ? `${label} tersalin ke papan klip.` : state === 'error' ? `Penyalinan otomatis gagal, silakan salin ${label} secara manual.` : ''}
      </span>
    </>
  );
}

function QrisPanel({ total, checkoutUrl }: { total: number; checkoutUrl: string }) {
  const amountNote = `Bayar tepat Rp ${formatRupiah(total)}`;
  const [tab, setTab] = useState<'resmi' | 'invoice'>('resmi');
  const [zoom, setZoom] = useState(false);
  return (
    <div>
      <div className="flex gap-1 rounded-lg bg-[#eef2f0] p-1 font-body text-[11px] font-bold" role="tablist" aria-label="Jenis kode QR">
        {([['resmi', 'QRIS Resmi AmalQu', ScanLine], ['invoice', 'QR Invoice', QrCode]] as const).map(([id, label, Icon]) => (
          <button key={id} type="button" role="tab" aria-selected={tab === id} onClick={() => setTab(id)} className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-2 transition ${tab === id ? 'bg-white text-teal shadow-sm' : 'text-muted hover:text-ink'}`}>
            <Icon size={14} />{label}
          </button>
        ))}
      </div>
      {tab === 'resmi' ? (
        <div className="mt-5">
          <div className="relative overflow-hidden rounded-lg border border-[#e7ebe8] bg-white p-4">
            <SourceImage src={IMAGES.qris} alt="QRIS resmi atas nama AmalQu Indonesia Peduli" className="mx-auto max-h-[42dvh] w-auto object-contain" />
            <button type="button" onClick={() => setZoom(true)} aria-label="Perbesar QRIS" className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-[#eef2f0] text-ink transition hover:bg-brand hover:text-white"><ZoomIn size={16} /></button>
          </div>
          <p className="mt-3 text-center font-body text-[11px] leading-relaxed text-muted"><span className="font-bold text-ink">{amountNote}</span> · scan dengan mobile banking atau e-wallet Anda.<br />Penerima: <span className="font-bold text-ink">AmalQu Indonesia Peduli</span></p>
        </div>
      ) : (
        <div className="mt-5 rounded-lg border border-[#e7ebe8] bg-white p-5">
          <div className="flex justify-center rounded-md bg-white p-2">
            <QRCodeSVG value={checkoutUrl} size={188} level="M" marginSize={1} fgColor="#04364a" bgColor="#ffffff" />
          </div>
          <p className="mt-4 text-center font-body text-[11px] leading-relaxed text-muted">QR invoice ini membuka halaman checkout AmalQu dengan nominal <span className="font-bold text-ink">Rp {formatRupiah(total)}</span> dan menyimpan rincian donasi Anda.</p>
          <div className="mt-3 flex items-center gap-2 rounded-md bg-[#f4f7f5] px-3 py-2.5">
            <code className="min-w-0 flex-1 truncate font-body text-[10px] text-muted">{checkoutUrl}</code>
            <CopyChip value={checkoutUrl} label="tautan invoice" />
          </div>
        </div>
      )}
      {zoom && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-[#0d221d]/85 p-5 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="QRIS diperbesar" onClick={() => setZoom(false)}>
          <SourceImage src={IMAGES.qris} alt="QRIS resmi AmalQu Indonesia Peduli dalam ukuran besar" className="max-h-[85dvh] w-auto rounded-lg bg-white p-4 object-contain" />
        </div>
      )}
    </div>
  );
}

function TransferPanel({ total, uniqueCode }: { total: number; uniqueCode: number }) {
  return (
    <div className="mt-1 space-y-2.5">
      <div className="rounded-lg bg-[#04364a] px-4 py-3.5 text-white">
        <p className="font-body text-[10px] font-bold uppercase tracking-[0.14em] text-white/70">Transfer tepat sejumlah</p>
        <div className="mt-1.5 flex flex-wrap items-center justify-between gap-3">
          <p className="font-display text-[23px] font-bold tabular-nums text-[#ffd9a8]">Rp {formatRupiah(total)}</p>
          <span className="flex items-center gap-2 rounded-full bg-white/12 px-3 py-1.5 font-body text-[10px] font-bold">
            Kode unik <span className="tabular-nums text-[#ffd9a8]">{uniqueCode}</span>
            <span className="text-white/70">·</span>
            <CopyChip value={String(total)} label="nominal transfer" />
          </span>
        </div>
      </div>
      {BANKS.map((bank) => (
        <div key={bank.name} className="flex items-center gap-3 rounded-lg border border-[#edf0ee] bg-white p-3 transition hover:border-teal/30 hover:shadow-[0_3px_14px_rgba(31,45,38,0.07)]">
          <div className="w-[62px] shrink-0"><SourceImage src={bank.logo} alt={`Logo ${bank.name}`} loading="lazy" className="h-9 w-full object-contain" /></div>
          <div className="min-w-0 flex-1">
            <p className="font-body text-[10px] font-bold text-ink">{bank.name} · {bank.account}</p>
            <p className="font-body text-[9px] text-muted">a.n. AmalQu Indonesia Peduli</p>
            <p className="mt-1 font-body text-[12px] font-bold tabular-nums text-teal">Rp {formatRupiah(total)}</p>
          </div>
          <CopyChip value={bank.account} label={`nomor rekening ${bank.name}`} />
        </div>
      ))}
      <p className="rounded-md bg-[#fdf5ea] px-3.5 py-3 font-body text-[11px] leading-relaxed text-[#7a4a12]">
        Tiga digit <span className="font-bold">kode unik {uniqueCode}</span> membuat nominal Anda berbeda dari donatur lain sehingga pembayaran terdeteksi otomatis oleh sistem.
      </p>
    </div>
  );
}

export function PaymentModal() {
  const { pending, confirmPayment, cancelPayment, expirePayment } = useDonations();
  const remaining = useCountdown(pending?.expiresAt ?? Date.now(), expirePayment);
  const method: PaymentMethodId = pending?.method ?? 'qris';
  const whatsappUrl = useMemo(() => {
    if (!pending) return '#';
    const text = [
      "Assalamu'alaikum Admin AmalQu,",
      '',
      `Saya sudah melakukan pembayaran sedekah mushaf Al-Qur'an.`,
      '',
      `Invoice        : ${pending.id}`,
      `Nama Lengkap   : ${pending.name}`,
      `Nomor WhatsApp : ${pending.phone}`,
      `Metode         : ${pending.method === 'qris' ? 'QRIS' : 'Transfer Bank'}`,
      pending.method === 'qris'
        ? `Nominal        : Rp ${formatRupiah(pending.amount)}`
        : `Nominal        : Rp ${formatRupiah(pending.totalTransfer)} (termasuk kode unik ${pending.uniqueCode})`,
      '',
      `Sedekah Al Quran atas nama & doa: ${pending.dedication.trim() || '-'}`,
      '',
      'Mohon dibantu verifikasi dan penyalurannya. Terima kasih.',
    ].join('\n');
    return `https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(text)}`;
  }, [pending]);

  const total = pending ? (pending.method === 'transfer' ? pending.totalTransfer : pending.amount) : 0;
  const minutes = Math.floor(remaining / 60_000);
  const seconds = Math.floor((remaining % 60_000) / 1000);
  const urgent = remaining < 3 * 60_000;
  const verifying = pending?.status === 'verifikasi';

  return (
    <Dialog open={!!pending} onClose={verifying ? () => undefined : cancelPayment} title="Gerbang Pembayaran AmalQu" className="max-w-lg">
      {pending && (
        <div className="font-body">
          <div className="border-b border-[#eef1ef] bg-[#f7faf8] px-5 py-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">Invoice</p>
                <p className="mt-0.5 text-sm font-bold text-ink">{pending.id}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">{method === 'transfer' ? 'Transfer tepat' : 'Nominal dibayarkan'}</p>
                <p className="mt-0.5 text-lg font-extrabold tabular-nums text-brand">Rp {formatRupiah(total)}</p>
              </div>
            </div>
            <div className="mt-3.5 flex items-center gap-2.5">
              <span className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold tabular-nums ${urgent ? 'bg-[#fdecea] text-[#b42318]' : 'bg-white text-teal'}`}>
                <Clock3 size={13} className={urgent ? 'animate-pulse' : ''} />{pad(minutes)}:{pad(seconds)}
              </span>
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#e4eae6]">
                <div className={`h-full rounded-full transition-[width] duration-1000 ease-linear ${urgent ? 'bg-[#c62828]' : 'bg-teal'}`} style={{ width: `${Math.min(100, (remaining / (15 * 60_000)) * 100)}%` }} />
              </div>
              <span className="text-[10px] text-muted">atas nama</span>
              <span className="max-w-[130px] truncate text-[11px] font-bold text-ink">{pending.name}</span>
            </div>
          </div>

          <div className="px-5 py-5">
            {method === 'qris' ? <QrisPanel total={total} checkoutUrl={pending.checkoutUrl} /> : <TransferPanel total={total} uniqueCode={pending.uniqueCode} />}

            <div className="mt-5 flex items-start gap-2 rounded-md bg-[#eef7f4] px-3.5 py-3 text-[10px] leading-relaxed text-teal-dark">
              <ShieldCheck size={15} className="mt-0.5 shrink-0" />
              Pembayaran diverifikasi melalui gerbang AmalQu. Nama dan nominal Anda otomatis tercatat di papan donasi begitu status berhasil.
            </div>

            <div className="mt-5 grid gap-2.5">
              <button type="button" onClick={confirmPayment} disabled={verifying || remaining === 0} className="cta-button w-full !rounded-lg !py-3.5" aria-busy={verifying}>
                {verifying ? <><Loader2 size={19} className="animate-spin" />Memverifikasi pembayaran…</> : <><Check size={19} />Saya Sudah Bayar</>}
              </button>
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-[#d8e8e2] px-4 py-3 text-[12px] font-bold text-teal transition hover:border-teal hover:bg-[#f2faf7]">
                <MessageCircle size={17} />Konfirmasi ke Admin WhatsApp
              </a>
              {!verifying && <button type="button" onClick={cancelPayment} className="text-[11px] font-semibold text-muted transition hover:text-[#b42318]">Batalkan invoice ini</button>}
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 border-t border-[#eef1ef] bg-[#f7faf8] px-5 py-3 text-[10px] text-muted">
            Metode dipilih: <span className="font-bold text-ink">{method === 'qris' ? 'QRIS' : 'Transfer Bank'}</span>
            <ArrowRight size={12} /> Nominal sedekah <span className="font-bold text-ink">Rp {formatRupiah(pending.amount)}</span>
          </div>
        </div>
      )}
    </Dialog>
  );
}
