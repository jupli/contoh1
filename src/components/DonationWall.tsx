import { useEffect, useRef, useState } from 'react';
import { BellRing, BellOff, ChevronDown, CloudOff, HandHeart, Layers, Quote, Users } from 'lucide-react';
import { formatRupiah } from '../data';
import { gratitude, relativeTime, useDonations } from '../store/donations';

const TARGET_MUSHAF = 40;

function Counter({ value, prefix = '' }: { value: number; prefix?: string }) {
  const [display, setDisplay] = useState(value);
  const from = useRef(value);
  useEffect(() => {
    const start = performance.now();
    const origin = from.current;
    const delta = value - origin;
    if (delta === 0) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) { setDisplay(value); from.current = value; return; }
    let frame = 0;
    const step = (time: number) => {
      const progress = Math.min(1, (time - start) / 850);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(origin + delta * eased));
      if (progress < 1) frame = requestAnimationFrame(step);
      else from.current = value;
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [value]);
  return <span className="tabular-nums">{prefix}{formatRupiah(display)}</span>;
}

const initials = (name: string) => name.replace(/[^A-Za-z\s]/g, '').trim().split(/\s+/).filter(Boolean).slice(0, 2).map((word) => word[0]?.toUpperCase()).join('') || 'HA';

export function DonationWall() {
  const { entries, totals, notifyEnabled, toggleNotify, remoteNotice } = useDonations();
  const [expanded, setExpanded] = useState(false);
  const listRef = useRef<HTMLUListElement>(null);
  const newest = entries[0];
  const visible = expanded ? entries : entries.slice(0, 5);
  const progress = Math.min(100, (totals.mushaf / TARGET_MUSHAF) * 100);

  useEffect(() => {
    if (!newest || !listRef.current) return;
    const card = listRef.current.querySelector<HTMLElement>('[data-newest="true"]');
    if (card && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      card.classList.remove('entry-flash');
      void card.offsetWidth;
      card.classList.add('entry-flash');
    }
  }, [newest?.id]);

  return (
    <section id="papan-donasi" aria-labelledby="wall-title" className="wall-shell scroll-mt-24 overflow-hidden rounded-xl" data-reveal>
      <div className="wall-head px-6 py-7 text-white sm:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/12 px-3 py-1.5 font-body text-[10px] font-bold uppercase tracking-[0.15em]"><span className="live-dot" />Papan donasi langsung</span>
            <h2 id="wall-title" className="mt-3 font-display text-[24px] font-bold leading-tight sm:text-[27px]">Ribuan #SahabatAmal Sudah Berdonasi</h2>
          </div>
          <button type="button" onClick={toggleNotify} aria-pressed={notifyEnabled} className={`inline-flex items-center gap-2 rounded-full px-3.5 py-2 font-body text-[11px] font-bold transition ${notifyEnabled ? 'bg-white text-teal-dark' : 'bg-white/12 text-white hover:bg-white/20'}`}>
            {notifyEnabled ? <BellRing size={15} /> : <BellOff size={15} />}{notifyEnabled ? 'Notifikasi aktif' : 'Aktifkan notifikasi'}
          </button>
        </div>

        <dl className="mt-6 grid gap-3 sm:grid-cols-3">
          {[
            { icon: HandHeart, label: 'Total nominal tercatat', value: <Counter value={totals.amount} prefix="Rp " />, tone: 'text-[#ffd9a8]' },
            { icon: Users, label: 'Donatur', value: <Counter value={totals.count} />, tone: 'text-white' },
            { icon: Layers, label: 'Mushaf Al-Qur\'an', value: <><Counter value={totals.mushaf} /> mushaf</>, tone: 'text-white' },
          ].map((stat) => (
            <div key={stat.label} className="rounded-lg bg-white/10 px-4 py-3.5 ring-1 ring-white/15 transition hover:bg-white/15">
              <dt className="flex items-center gap-2 font-body text-[10px] font-semibold uppercase tracking-[0.12em] text-white/75"><stat.icon size={14} />{stat.label}</dt>
              <dd className={`mt-2 font-display text-[19px] font-bold ${stat.tone}`}>{stat.value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-5">
          <div className="flex items-center justify-between font-body text-[10px] font-semibold text-white/80">
            <span>Progres mushaf tercatat</span>
            <span className="tabular-nums">{totals.mushaf} / {TARGET_MUSHAF} mushaf</span>
          </div>
          <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-white/15">
            <div className="wall-progress h-full rounded-full" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>

      <div className="ticker" aria-hidden="true">
        <div className="ticker-track">
          {[0, 1].map((copy) => (
            <div key={copy} className="ticker-group">
              {entries.slice(0, 8).map((entry) => (
                <span key={`${copy}-${entry.id}`} className="ticker-item">{gratitude(entry.name, entry.amount)}</span>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-[#fbfcfb] px-5 py-6 sm:px-7">
        <p className="sr-only" role="status" aria-live="polite">{newest ? `Donasi terbaru: ${gratitude(newest.name, newest.amount)}` : ''}</p>
        <ul ref={listRef} className="space-y-2.5">
          {visible.map((entry, index) => (
            <li key={entry.id} data-newest={index === 0} className={`entry-card ${index === 0 ? 'entry-card-new' : ''}`}>
              <span className="entry-avatar" aria-hidden="true">{initials(entry.name)}</span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
                  <h3 className="font-body text-[13px] font-bold text-ink">{entry.name}</h3>
                  <span className="font-body text-[10px] text-muted">{relativeTime(entry.createdAt)}</span>
                  {index === 0 && <span className="rounded-full bg-brand/12 px-2 py-0.5 font-body text-[9px] font-bold uppercase tracking-[0.12em] text-brand">Terbaru</span>}
                </div>
                <p className="mt-1.5 flex items-start gap-1.5 font-display text-[11px] italic leading-[1.85] text-[#4c534f] sm:text-[11.5px]">
                  <Quote size={12} className="mt-1 shrink-0 text-teal/60" />
                  <span>{gratitude(entry.name, entry.amount)}</span>
                </p>
                {entry.dedication && <p className="mt-1.5 truncate font-body text-[10px] text-muted">Atas nama & doa: {entry.dedication}</p>}
              </div>
              <div className="shrink-0 text-right">
                <p className="font-body text-[13px] font-extrabold tabular-nums text-teal">Rp {formatRupiah(entry.amount)}</p>
                <p className="font-body text-[9px] uppercase tracking-[0.1em] text-muted">{entry.mushaf} mushaf</p>
              </div>
            </li>
          ))}
        </ul>
        {entries.length > 5 && (
          <button type="button" onClick={() => setExpanded((value) => !value)} aria-expanded={expanded} className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-[#dfe6e2] px-4 py-2.5 font-body text-[11px] font-bold text-teal transition hover:border-teal hover:bg-[#f2faf7]">
            {expanded ? 'Tampilkan lebih sedikit' : `Lihat ${entries.length - 5} donatur lainnya`}<ChevronDown size={15} className={`transition ${expanded ? 'rotate-180' : ''}`} />
          </button>
        )}
        {remoteNotice && <p className="mt-4 flex items-start gap-2 rounded-md bg-[#fff6e9] px-3.5 py-2.5 font-body text-[10px] leading-relaxed text-[#7a4a12]"><CloudOff size={13} className="mt-1 shrink-0" />{remoteNotice}</p>}
        <p className="mt-3 text-center font-body text-[10px] leading-relaxed text-muted">
          {remoteNotice
            ? 'Catatan donasi diteruskan ke Admin AmalQu melalui WhatsApp untuk verifikasi penyaluran.'
            : 'Donasi tersimpan di server dan tampil untuk semua pengunjung, serta diteruskan ke Admin AmalQu melalui WhatsApp untuk verifikasi penyaluran.'}
        </p>
      </div>
    </section>
  );
}
