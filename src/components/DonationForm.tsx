import { useEffect, useRef, useState, type FormEvent } from 'react';
import { ArrowLeft, ArrowRight, ArrowUpRight, Check, ChevronDown, Copy, HandHeart, Landmark, ScanLine, ShieldCheck, Sparkles } from 'lucide-react';
import { CONTACT, DONATIONS, formatRupiah } from '../data';
import { mushafOf, readSavedForm, useDonations, type DonorInput, type PaymentMethodId } from '../store/donations';

type Errors = { name?: string; phone?: string };

const waMessage = (input: DonorInput) => [
  "Assalamu'alaikum Admin AmalQu,",
  '',
  "Bismillah, saya ingin sedekah mushaf Al-Qur'an.",
  '',
  `Nama Lengkap: ${input.name.trim()}`,
  `Nomor WhatsApp: ${input.phone.trim()}`,
  `Jumlah Wakaf Mushaf Quran: Rp. ${formatRupiah(input.amount)}`,
  '',
  `Sedekah Al Quran atas nama & doa: ${input.dedication.trim() || '-'}`,
  '',
  'Mohon informasi konfirmasi dan pembayaran. Terima kasih.',
].join('\n');

const METHODS: { id: PaymentMethodId; title: string; detail: string; icon: typeof ScanLine; badge: string }[] = [
  { id: 'qris', title: 'QRIS', detail: 'Semua e-wallet & mobile banking. Kode QR tampil di jendela pembayaran.', icon: ScanLine, badge: 'Paling cepat' },
  { id: 'transfer', title: 'Transfer Bank', detail: 'BRI · Mandiri · BNI · BSI · BCA Syariah dengan kode unik invoice.', icon: Landmark, badge: 'Rekening resmi' },
];

export function DonationForm() {
  const { startPayment, saveForm, pending, records } = useDonations();
  const succeeded = records.filter((record) => record.status === 'berhasil');
  const [step, setStep] = useState<1 | 2>(1);
  const [form, setForm] = useState<DonorInput>(() => readSavedForm());
  const [method, setMethod] = useState<PaymentMethodId>('qris');
  const [errors, setErrors] = useState<Errors>({});
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'error'>('idle');
  const stepRef = useRef<HTMLDivElement>(null);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => { if (copyTimer.current) clearTimeout(copyTimer.current); }, []);
  useEffect(() => {
    if (pending || step !== 2) return;
    stepRef.current?.scrollIntoView({ block: 'center', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  }, [pending, step]);

  const patch = (next: Partial<DonorInput>) => { setForm((old) => ({ ...old, ...next })); saveForm({ ...form, ...next }); };

  const goToPayment = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const next: Errors = {};
    if (form.name.trim().length < 2) next.name = 'Mohon isi nama lengkap Anda.';
    if (!/^(08|628)\d{7,12}$/.test(form.phone.replace(/\D/g, ''))) next.phone = 'Isi nomor WhatsApp yang valid, misalnya 081234567890.';
    setErrors(next);
    if (Object.keys(next).length) { document.getElementById(next.name ? 'donor-name' : 'donor-phone')?.focus(); return; }
    saveForm(form);
    setStep(2);
  };

  const pay = () => startPayment(form, method);

  const copySummary = async () => {
    try {
      if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(waMessage(form));
      else {
        const field = document.createElement('textarea');
        field.value = waMessage(form); field.style.position = 'fixed'; field.style.opacity = '0';
        document.body.appendChild(field); field.select();
        const ok = document.execCommand('copy'); field.remove();
        if (!ok) throw new Error('copy unavailable');
      }
      setCopyState('copied');
    } catch { setCopyState('error'); }
    if (copyTimer.current) clearTimeout(copyTimer.current);
    copyTimer.current = setTimeout(() => setCopyState('idle'), 2800);
  };

  return (
    <div className="paper-card overflow-hidden p-6 sm:p-8">
      <h2 className="text-center font-display text-[23px] font-bold leading-[1.6] text-brand sm:text-[26px]">Sedekahkan Al-Qur'an dan saksikanlah betapa besar kebaikan yang akan tercipta.</h2>

      <ol className="mt-6 flex items-center justify-center gap-2 font-body text-[10px] font-bold uppercase tracking-[0.12em]" aria-label="Tahapan donasi">
        {(['Data diri', 'Pembayaran', 'Tercatat'] as const).map((label, index) => {
          const position = index + 1;
          const done = step > position || pending?.status === 'berhasil';
          const current = step === position && !done;
          return (
            <li key={label} className="flex items-center gap-2">
              <span className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 transition ${done ? 'bg-teal text-white' : current ? 'bg-brand text-white' : 'bg-[#eef2f0] text-muted'}`}>
                <span className="tabular-nums">{done ? <Check size={11} strokeWidth={3.5} /> : position}</span>{label}
              </span>
              {position < 3 && <span className={`h-px w-5 transition ${done ? 'bg-teal' : 'bg-[#dde4e0]'}`} />}
            </li>
          );
        })}
      </ol>

      {step === 1 && (
        <form onSubmit={goToPayment} noValidate className="mt-6 space-y-5 font-body">
          <div>
            <label htmlFor="donor-name" className="field-label">Nama Lengkap <span aria-hidden="true">*</span></label>
            <input id="donor-name" name="name" autoComplete="name" placeholder="Nama Anda" required maxLength={100} value={form.name} onChange={(event) => { patch({ name: event.target.value }); setErrors((old) => ({ ...old, name: undefined })); }} aria-invalid={!!errors.name} aria-describedby={errors.name ? 'name-error' : undefined} className="form-input" />
            {errors.name ? <p id="name-error" role="alert" className="field-error">{errors.name}</p> : <p className="mt-1.5 text-[10px] text-muted">Nama ini yang akan tertera di papan donasi.</p>}
          </div>
          <div>
            <label htmlFor="donor-phone" className="field-label">Nomor HP / WhatsApp (WA) <span aria-hidden="true">*</span></label>
            <input id="donor-phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="Nomor WhatsApp Anda" required maxLength={22} value={form.phone} onChange={(event) => { patch({ phone: event.target.value }); setErrors((old) => ({ ...old, phone: undefined })); }} aria-invalid={!!errors.phone} aria-describedby={errors.phone ? 'phone-error' : undefined} className="form-input" />
            {errors.phone && <p id="phone-error" role="alert" className="field-error">{errors.phone}</p>}
          </div>
          <div>
            <label htmlFor="donor-amount" className="field-label">Jumlah Wakaf Mushaf Quran <span aria-hidden="true">*</span></label>
            <div className="relative">
              <select id="donor-amount" name="amount" className="form-input appearance-none pr-10" value={form.amount} onChange={(event) => patch({ amount: Number(event.target.value) })}>
                {DONATIONS.map((value) => <option key={value} value={value}>Sedekah Mushaf Al Qur'an Rp. {formatRupiah(value)}</option>)}
              </select>
              <ChevronDown size={17} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted" />
            </div>
            <div className="amount-row mt-3 flex items-center justify-between rounded-md bg-[#edf7f3] px-4 py-3" aria-live="polite">
              <span className="flex items-center gap-2 text-xs text-teal"><HandHeart size={17} />Niat baik Anda</span>
              <span className="text-right">
                <span className="block text-lg font-bold leading-none text-teal">Rp {formatRupiah(form.amount)}</span>
                <span className="mt-1 block text-[10px] text-muted">setara ± {mushafOf(form.amount)} mushaf</span>
              </span>
            </div>
          </div>
          <div>
            <label htmlFor="donor-dedication" className="field-label !leading-relaxed">Sedekah Al Quran atas nama & doa anda? <span className="font-normal text-muted">(Jika nama yang dicantumkan sudah alm/almh, silahkan diberikan ketrangan di depan nama. Contoh: Alm Fulan bin Fulan)</span></label>
            <textarea id="donor-dedication" name="dedication" rows={4} maxLength={1000} placeholder="Sedekah Al Quran atas nama ibu saya : alm Aminah binti Fulan. Semoga Allah jadikan Wakaf Mushaf Ini Pahala Jariyah yang tidak pernah putus untuk beliau." value={form.dedication} onChange={(event) => patch({ dedication: event.target.value })} className="form-input min-h-32 resize-y !text-[13px] !leading-relaxed" />
          </div>
          <button type="submit" className="cta-button w-full !rounded-lg !px-4 !text-[13px] sm:!text-sm"><HandHeart size={20} className="shrink-0" />Bismillah Saya Sedekah Mushaf Al Quran<ArrowRight size={18} className="ml-auto shrink-0" /></button>
          <p className="flex items-start justify-center gap-2 text-center text-[11px] leading-relaxed text-muted"><ShieldCheck size={15} className="mt-0.5 shrink-0 text-teal" />Lanjutkan ke gerbang pembayaran: QRIS atau transfer rekening resmi Yayasan.</p>
        </form>
      )}

      {step === 2 && (
        <div className="mt-6 space-y-4 font-body" ref={stepRef}>
          {succeeded.length > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-teal/25 bg-[#f1faf7] px-4 py-3">
              <p className="flex items-start gap-2 text-[11px] leading-relaxed text-teal-dark">
                <Check size={16} className="mt-0.5 shrink-0" />
                <span><b>{succeeded.length}</b> donasi Anda sudah tercatat di papan donasi, termasuk <b>{succeeded[0].name}</b> sebesar Rp {formatRupiah(succeeded[0].amount)}.</span>
              </p>
              <button type="button" onClick={() => { setForm((old) => ({ ...old, dedication: '' })); setStep(1); }} className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-teal/30 px-3 py-2 text-[11px] font-bold text-teal transition hover:bg-teal hover:text-white">
                <ArrowLeft size={14} />Sedekah atas nama lain
              </button>
            </div>
          )}
          <div className="summary-card rounded-lg p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-[0.13em] text-white/70">Rencana sedekah</p>
                <p className="mt-1 truncate font-display text-[17px] font-bold text-white">{form.name}</p>
                <p className="mt-0.5 text-[11px] text-white/75">{form.phone}</p>
              </div>
              <div className="shrink-0 text-right">
                <p className="font-display text-[19px] font-bold tabular-nums text-[#ffd9a8]">Rp {formatRupiah(form.amount)}</p>
                <p className="text-[10px] text-white/70">± {mushafOf(form.amount)} mushaf</p>
              </div>
            </div>
            {form.dedication.trim() && <p className="mt-3 border-t border-white/15 pt-3 text-[11px] italic leading-relaxed text-white/80">Atas nama & doa: {form.dedication.trim()}</p>}
            <button type="button" onClick={() => setStep(1)} className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-bold text-white/85 transition hover:text-white"><ArrowLeft size={14} />Ubah data sedekah</button>
          </div>

          <fieldset>
            <legend className="field-label">Metode pembayaran <span aria-hidden="true">*</span></legend>
            <div className="grid gap-2.5 sm:grid-cols-2">
              {METHODS.map((option) => {
                const selected = method === option.id;
                return (
                  <label key={option.id} className={`method-card ${selected ? 'method-card-selected' : ''}`}>
                    <input type="radio" name="method" value={option.id} checked={selected} onChange={() => setMethod(option.id)} className="sr-only" />
                    <span className="method-icon" aria-hidden="true"><option.icon size={19} /></span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2">
                        <span className="text-[13px] font-bold text-ink">{option.title}</span>
                        <span className="method-badge">{option.badge}</span>
                      </span>
                      <span className="mt-1 block text-[10.5px] leading-relaxed text-muted">{option.detail}</span>
                    </span>
                    <span className="method-dot" aria-hidden="true">{selected && <Check size={12} strokeWidth={3.5} />}</span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          <button type="button" onClick={pay} className="cta-button w-full !rounded-lg !px-4 !py-3.5 !text-[13px] sm:!text-sm">
            <HandHeart size={20} className="shrink-0" />
            Bayar Sekarang · Rp {formatRupiah(form.amount)}
            {method === 'qris' ? <ScanLine size={18} className="ml-auto shrink-0" /> : <Landmark size={18} className="ml-auto shrink-0" />}
          </button>

          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
            <a href={`https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(waMessage(form))}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-md border border-teal/25 px-3.5 py-2.5 text-[11px] font-bold text-teal transition hover:bg-teal/5">
              <ArrowUpRight size={15} />Konfirmasi manual via WhatsApp
            </a>
            <button type="button" onClick={copySummary} className="inline-flex items-center gap-2 rounded-md border border-[#dfe6e2] px-3.5 py-2.5 text-[11px] font-semibold text-muted transition hover:border-teal/30 hover:text-teal">
              {copyState === 'copied' ? <Check size={15} /> : <Copy size={15} />}{copyState === 'copied' ? 'Rincian tersalin' : copyState === 'error' ? 'Salin manual' : 'Salin rincian'}
            </button>
          </div>

          <p className="flex items-start justify-center gap-2 text-center text-[11px] leading-relaxed text-muted"><Sparkles size={15} className="mt-0.5 shrink-0 text-brand" />Begitu pembayaran berhasil, notifikasi muncul dan nama Anda langsung tertera di papan donasi beserta ucapan doa.</p>
        </div>
      )}
    </div>
  );
}
