import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, HeartHandshake, Share2, Sparkles, X } from 'lucide-react';
import { formatRupiah } from '../data';
import { gratitude, mushafOf, useDonations } from '../store/donations';

const PARTICLES = Array.from({ length: 34 }, (_, index) => ({
  id: index,
  left: (index * 37) % 100,
  delay: (index % 9) * 0.22,
  duration: 2.6 + ((index * 13) % 18) / 10,
  size: 5 + ((index * 7) % 7),
  color: ['#e65100', '#009688', '#c99a2e', '#04364a', '#f0a94c'][index % 5],
  rotate: (index * 47) % 360,
}));

export function Celebration() {
  const { celebration, closeCelebration } = useDonations();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const goWall = () => { closeCelebration(); navigate('/papan-donasi'); };
  const phrase = useMemo(() => celebration ? gratitude(celebration.name, celebration.amount) : '', [celebration]);

  useEffect(() => {
    if (!celebration) return;
    setCopied(false);
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') closeCelebration(); };
    document.addEventListener('keydown', onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = overflow; };
  }, [celebration, closeCelebration]);

  if (!celebration) return null;

  const share = async () => {
    const text = `${phrase}\n\nWakaf mushaf Al-Qur'an atas nama orang tua — ${formatRupiah(celebration.amount)} (${mushafOf(celebration.amount)} mushaf).`;
    try {
      if (navigator.share) await navigator.share({ title: 'Sedekah Mushaf Al-Qur\'an — AmalQu', text, url: 'https://www.amalqu.com/' });
      else {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2600);
      }
    } catch { /* dibatalkan pengguna */ }
  };

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center overflow-hidden bg-[#0b2a24]/88 p-4 backdrop-blur-[3px]" role="dialog" aria-modal="true" aria-label="Donasi berhasil">
      <div className="confetti-layer" aria-hidden="true">
        {PARTICLES.map((particle) => (
          <span key={particle.id} className="confetti-piece" style={{ left: `${particle.left}%`, animationDelay: `${particle.delay}s`, animationDuration: `${particle.duration}s`, width: particle.size, height: particle.size * 1.7, background: particle.color, transform: `rotate(${particle.rotate}deg)` }} />
        ))}
      </div>

      <div className="celebration-card relative w-full max-w-md overflow-hidden rounded-xl bg-white shadow-2xl">
        <button type="button" onClick={closeCelebration} aria-label="Tutup notifikasi keberhasilan" className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/5 text-ink transition hover:bg-brand hover:text-white"><X size={18} /></button>

        <div className="celebration-head relative overflow-hidden px-6 pb-7 pt-8 text-center text-white">
          <svg className="arabesque absolute inset-0 h-full w-full opacity-[0.16]" viewBox="0 0 200 120" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
            <g fill="none" stroke="#fff" strokeWidth="0.9">
              {Array.from({ length: 9 }, (_, i) => <path key={i} d={`M${i * 25 - 20} 120 Q ${i * 25} 60 ${i * 25 + 20} 0`} />)}
              {Array.from({ length: 5 }, (_, i) => <circle key={`c${i}`} cx={i * 50} cy={60} r={26} />)}
            </g>
          </svg>
          <span className="celebration-badge relative mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/15 ring-4 ring-white/25"><Check size={32} strokeWidth={3} /></span>
          <h2 className="relative mt-4 font-display text-[22px] font-bold leading-tight">Alhamdulillah, donasi Anda tercatat</h2>
          <p className="relative mt-2 font-body text-[11px] uppercase tracking-[0.16em] text-white/80">Invoice {celebration.id} · {celebration.method === 'qris' ? 'QRIS' : 'Transfer Bank'}</p>
        </div>

        <div className="px-6 py-6">
          <div className="rounded-lg border border-brand/20 bg-[#fff8f2] p-4">
            <p className="font-body text-[10px] font-bold uppercase tracking-[0.14em] text-brand">Ucapan untuk Anda</p>
            <p className="mt-2 font-display text-[13px] italic leading-[1.95] text-[#4a3520]">{phrase}</p>
          </div>

          <dl className="mt-4 grid grid-cols-3 gap-2.5 font-body">
            {[['Nominal', formatRupiah(celebration.amount)], ['Mushaf', `${mushafOf(celebration.amount)} mushaf`], ['Metode', celebration.method === 'qris' ? 'QRIS' : 'Transfer']].map(([label, value]) => (
              <div key={label} className="rounded-md bg-[#f4f7f5] px-3 py-2.5 text-center">
                <dt className="text-[9px] font-bold uppercase tracking-[0.12em] text-muted">{label}</dt>
                <dd className="mt-1 text-[12px] font-bold text-ink">{value}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
            <button type="button" onClick={goWall} className="cta-button !rounded-lg !py-3 !text-[12px]"><HeartHandshake size={18} />Lihat Papan Donasi</button>
            <button type="button" onClick={share} className="inline-flex items-center justify-center gap-2 rounded-lg border border-teal/30 px-4 py-3 font-body text-[12px] font-bold text-teal transition hover:bg-[#f1faf7]">
              {copied ? <Check size={17} /> : <Share2 size={17} />}{copied ? 'Ucapan tersalin' : 'Bagikan'}
            </button>
          </div>
          <p className="mt-4 flex items-start gap-2 font-body text-[10px] leading-relaxed text-muted"><Sparkles size={13} className="mt-0.5 shrink-0 text-brand" />Nama Anda sudah tertera di papan donasi halaman ini dan rincian invoice siap diteruskan ke Admin AmalQu.</p>
        </div>
      </div>
    </div>
  );
}
