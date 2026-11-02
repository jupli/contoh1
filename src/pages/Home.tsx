import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, ExternalLink, HandHeart, Layers, Play, Sparkles, Users, Wallet } from 'lucide-react';
import { IMAGES, PROGRAM, STEPS, STORY } from '../data';
import { formatRupiah } from '../data';
import { useDonations } from '../store/donations';
import { usePageMeta } from '../utils/page';
import { SourceImage } from '../components/SourceImage';
import { useState } from 'react';
import { Dialog } from '../components/Dialog';
import { CONTACT, GALLERY } from '../data';

export default function Home() {
  usePageMeta("AmalQu — Mari Datangkan Pahala Jariyah Berlipat untuk Orang Tua", "Berwakaf mushaf Al-Qur'an atas nama orang tua adalah cara indah untuk melengkapi amalan mereka. Sedekah mulai Rp 99.000 per mushaf.");
  const { entries, totals } = useDonations();
  const [videoOpen, setVideoOpen] = useState(false);

  return (
    <>
      <section aria-labelledby="beranda-judul" className="pt-6">
        <Link to="/wakaf" className="group relative block overflow-hidden rounded-xl shadow-[0_10px_34px_rgba(4,54,74,0.18)]" aria-label="Amal Jariyah Hidup Abadi Melalui Wakaf Al-Qur'an — mulai berwakaf">
          <SourceImage src={IMAGES.hero} alt="Amal Jariyah Hidup Abadi, Melalui Wakaf Al-Qur'an. Tiap Al-Qur'an yang dibaca menjadi saksi amal kebaikan yang akan terus mengalir meski pewakaf telah tiada!" width={2000} height={999} fetchPriority="high" className="aspect-[2000/999] w-full object-cover transition duration-700 group-hover:scale-[1.02]" />
          <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/72 via-black/18 to-transparent px-5 pb-4 pt-14 text-left">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/92 px-3 py-1.5 font-body text-[10px] font-extrabold uppercase tracking-[0.14em] text-brand transition group-hover:bg-brand group-hover:text-white">
              <HandHeart size={13} />Mulai berwakaf
            </span>
          </span>
        </Link>

        <div className="mt-9 grid gap-7 lg:grid-cols-[1.35fr_1fr]">
          <div>
            <p className="kicker">{PROGRAM.name} · {PROGRAM.org}</p>
            <h1 id="beranda-judul" className="mt-3 font-display text-[27px] font-bold leading-[1.5] text-brand sm:text-[33px]">Mari Datangkan Pahala Jariyah Berlipat untuk Orang Tua!</h1>
            <div className="mt-5 space-y-4 font-display text-[15px] leading-[1.9] text-[#303632] sm:text-[17px]">
              <p>Berwakaf mushaf Al-Qur’an atas nama orang tua adalah cara indah untuk melengkapi amalan mereka.</p>
              <p>Amal Jariyah yang didapat tidak akan pernah putus ketika Al Quran terus di baca dan dihafal.</p>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/wakaf" className="cta-button !rounded-lg"><HandHeart size={19} />Klik untuk sedekahkan sekarang</Link>
              <Link to="/penyaluran" className="ghost-button">Lihat laporan penyaluran<ArrowRight size={16} /></Link>
            </div>
          </div>

          <aside className="stat-panel">
            <svg className="stat-motif" viewBox="0 0 200 160" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
              <g fill="none" stroke="currentColor" strokeWidth="0.8">
                {Array.from({ length: 7 }, (_, i) => <circle key={i} cx={100} cy={80} r={18 + i * 15} />)}
              </g>
            </svg>
            <p className="relative flex items-center gap-2 font-body text-[10px] font-bold uppercase tracking-[0.16em] text-white/70"><span className="live-dot" />Tercatat langsung</p>
            <dl className="relative mt-4 space-y-4">
              <div className="flex items-baseline justify-between gap-3 border-b border-white/12 pb-4">
                <dt className="font-body text-[11px] text-white/75">Target program</dt>
                <dd className="font-display text-[22px] font-bold text-[#ffd9a8]">{PROGRAM.target}</dd>
              </div>
              <div className="flex items-baseline justify-between gap-3 border-b border-white/12 pb-4">
                <dt className="flex items-center gap-1.5 font-body text-[11px] text-white/75"><Users size={13} />Donatur tercatat</dt>
                <dd className="font-display text-[22px] font-bold tabular-nums text-white">{totals.count}</dd>
              </div>
              <div className="flex items-baseline justify-between gap-3 border-b border-white/12 pb-4">
                <dt className="flex items-center gap-1.5 font-body text-[11px] text-white/75"><Layers size={13} />Mushaf</dt>
                <dd className="font-display text-[22px] font-bold tabular-nums text-white">{totals.mushaf}</dd>
              </div>
              <div className="flex items-baseline justify-between gap-3">
                <dt className="flex items-center gap-1.5 font-body text-[11px] text-white/75"><Wallet size={13} />Per mushaf</dt>
                <dd className="font-display text-[18px] font-bold tabular-nums text-white">Rp {formatRupiah(PROGRAM.perMushaf)}</dd>
              </div>
            </dl>
            <Link to="/papan-donasi" className="relative mt-5 inline-flex items-center gap-1.5 font-body text-[11px] font-bold text-[#ffd9a8] underline-offset-4 transition hover:underline">Lihat papan donasi<ArrowUpRight size={13} /></Link>
          </aside>
        </div>
      </section>

      <section aria-labelledby="langkah-judul" className="mt-14">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 id="langkah-judul" className="font-display text-[22px] font-bold leading-tight text-[#12322a] sm:text-[25px]">Cara berwakaf dalam tiga langkah</h2>
          <Link to="/wakaf" className="font-body text-[11px] font-bold text-teal underline-offset-4 transition hover:underline">Langsung ke formulir</Link>
        </div>
        <ol className="step-path mt-6">
          {STEPS.map((step, position) => (
            <li key={step.title} className="step-item">
              <span className="step-numeral" aria-hidden="true">{String(position + 1).padStart(2, '0')}</span>
              <div className="min-w-0 flex-1">
                <h3 className="font-body text-[13px] font-extrabold leading-snug text-ink sm:text-[14px]">{step.title}</h3>
                <p className="mt-2 font-display text-[12px] leading-[1.95] text-[#4c534f] sm:text-[13px]">{step.body}</p>
                <Link to={step.to} className="mt-3 inline-flex items-center gap-1.5 font-body text-[11px] font-bold text-brand underline-offset-4 transition hover:underline">{step.cta}<ArrowRight size={13} /></Link>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="terbaru-judul" className="mt-14">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 id="terbaru-judul" className="font-display text-[22px] font-bold leading-tight text-[#12322a] sm:text-[25px]">Donasi terbaru</h2>
          <Link to="/papan-donasi" className="font-body text-[11px] font-bold text-teal underline-offset-4 transition hover:underline">Papan donasi lengkap</Link>
        </div>
        <ul className="mt-5 space-y-2">
          {entries.slice(0, 3).map((entry) => (
            <li key={entry.id} className="mini-entry">
              <span className="mini-entry-name">{entry.name}</span>
              <span className="mini-entry-meta">{entry.mushaf} mushaf</span>
              <span className="mini-entry-amount">Rp {formatRupiah(entry.amount)}</span>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="mushaf-teaser" className="mt-14">
        <div className="paper-card grid overflow-hidden sm:grid-cols-[42%_1fr]">
          <SourceImage src={IMAGES.product} alt="Mushaf Al-Qur'an ukuran A5 dengan Rasm Usmani" loading="lazy" className="h-64 w-full object-cover sm:h-full" />
          <div className="p-6 sm:p-7">
            <h2 id="mushaf-teaser" className="font-display text-[22px] font-bold text-brand">Al-Qur'an yang disalurkan</h2>
            <ul className="mt-4 space-y-2.5 font-display text-[13px] leading-relaxed text-[#303632]">
              {['Ukuran A5', 'Rasm Usmani Mudah di Baca', '604 Video Syaikh Sudais', 'Nama Wakif dan Doa dicantumkan di Mushaf'].map((item) => (
                <li key={item} className="flex items-start gap-2"><Sparkles size={14} className="mt-1 shrink-0 text-teal" />{item}</li>
              ))}
            </ul>
            <Link to="/mushaf" className="ghost-button mt-5">Detail mushaf & pilihan nominal<ArrowRight size={15} /></Link>
          </div>
        </div>
      </section>

      <section aria-labelledby="galeri-teaser" className="mt-14">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 id="galeri-teaser" className="font-display text-[22px] font-bold leading-tight text-[#12322a] sm:text-[25px]">Laporan Penyaluran</h2>
          <Link to="/penyaluran" className="font-body text-[11px] font-bold text-teal underline-offset-4 transition hover:underline">Lihat semua dokumentasi</Link>
        </div>
        <div className="mt-5 flex gap-3 overflow-x-auto pb-2 strip-scroll">
          {GALLERY.slice(0, 7).map((src, position) => (
            <Link key={src} to="/penyaluran" className="strip-item group" aria-label={`Dokumentasi penyaluran ${position + 1} — buka halaman penyaluran`}>
              <SourceImage src={src} alt={`Dokumentasi penyaluran mushaf ${position + 1}`} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
            </Link>
          ))}
        </div>
      </section>

      <section aria-label="Ajakan sedekah" className="mt-14 text-center">
        <p className="font-display text-[16px] leading-[1.95] text-[#303632] sm:text-[18px]">Dengan bersedekah mushaf Al-Qur’an, kita memberikan hadiah yang terus bernilai bagi orang tua hingga akhir zaman. Ini adalah langkah kecil yang membawa kebahagiaan besar dan abadi.</p>
        <p className="mt-5 font-display text-[16px] leading-[1.95] sm:text-[18px]"><mark className="box-decoration-clone bg-brand px-1.5 py-1 font-bold leading-[2] text-white">Mari sedekah mushaf Al-Qur'an hari ini untuk mereka yang kita cintai.</mark></p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link to="/wakaf" className="cta-button !rounded-lg"><HandHeart size={19} />Saya Mau Wakaf untuk Orang Tua</Link>
          <button type="button" onClick={() => setVideoOpen(true)} className="ghost-button"><Play size={15} />Tonton video penyaluran</button>
        </div>
        <p className="mt-5 font-display text-[12px] leading-[1.95] text-muted">{STORY[1]}</p>
      </section>

      <Dialog open={videoOpen} onClose={() => setVideoOpen(false)} title="Video penyaluran AmalQu" className="max-w-[400px]">
        <iframe src="https://www.youtube-nocookie.com/embed/rprmBubao1I?autoplay=1&playsinline=1&rel=0" title="Video penyaluran mushaf AmalQu" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen className="aspect-[9/16] w-full bg-black" />
        <a href={CONTACT.youtube} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 p-4 font-body text-xs font-semibold text-teal">Lihat di YouTube<ExternalLink size={13} /></a>
      </Dialog>
    </>
  );
}
