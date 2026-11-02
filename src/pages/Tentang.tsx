import { Link } from 'react-router-dom';
import { ArrowRight, Building2, FileText, HandHeart, ShieldCheck } from 'lucide-react';
import { LEGAL, PROGRAM, REASONS, STORY } from '../data';
import { usePageMeta } from '../utils/page';
import { PageHero } from '../components/PageHero';

export default function Tentang() {
  usePageMeta('Tentang AmalQu — Wakaf Mushaf untuk Orang Tua', 'Wakaf Mushaf untuk orang tua adalah salah satu amalan yang paling mulia dan mengalirkan pahala secara deras tiada henti.');

  return (
    <>
      <PageHero
        index="01"
        crumb="Tentang"
        kicker="Tentang program"
        title="Hadiah apa yang bisa kita berikan untuk orang tua yang sudah meninggal?"
        lead="Satu-satunya jalan untuk tetap berbakti pada orang tua adalah dengan mengalirkan pahala padanya. Salah satu jalannya adalah dengan mewakafkan Alquran atas nama mereka."
      />

      <section aria-label="Cerita program" className="mt-9 space-y-6">
        <p className="font-display text-[14px] leading-[2] text-[#303632] sm:text-[15px]">{STORY[0]}</p>
        <blockquote className="pull-quote">
          <p>{STORY[1]}</p>
        </blockquote>
        <p className="font-display text-[13px] leading-[2] text-[#303632] sm:text-[14px]">{STORY[2]}</p>
      </section>

      <section aria-labelledby="yayasan-judul" className="paper-card mt-11 p-6 sm:p-8">
        <div className="flex items-start gap-3">
          <span className="icon-tile"><Building2 size={19} /></span>
          <div>
            <h2 id="yayasan-judul" className="font-display text-[20px] font-bold leading-snug text-brand sm:text-[22px]">{PROGRAM.org}</h2>
            <p className="mt-3 font-display text-[13px] leading-[1.95] text-[#303632]">{PROGRAM.mission}</p>
            <p className="mt-3 font-display text-[13px] leading-relaxed text-[#303632]">Semoga Allah wujudkan mimpi kita.</p>
          </div>
        </div>
        <dl className="mt-6 grid gap-3 sm:grid-cols-3">
          {[['Program', PROGRAM.name], ['Target', `Sedekah ${PROGRAM.target}`], ['Per mushaf', `Rp ${new Intl.NumberFormat('id-ID').format(PROGRAM.perMushaf)}`]].map(([label, value]) => (
            <div key={label} className="rounded-lg bg-[#f4f7f5] px-4 py-3">
              <dt className="font-body text-[9.5px] font-bold uppercase tracking-[0.13em] text-muted">{label}</dt>
              <dd className="mt-1 font-body text-[12px] font-bold text-ink">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section aria-labelledby="alasan-judul" className="mt-11">
        <h2 id="alasan-judul" className="font-display text-[22px] font-bold leading-tight text-[#12322a] sm:text-[25px]">Mengapa Harus di {PROGRAM.org}?</h2>
        <p className="mt-3 font-display text-[13px] leading-[1.95] text-[#4c534f]">Enam alasan yang membuat sedekah mushaf Anda terjaga sejak niat hingga penyaluran.</p>
        <div className="mt-6 space-y-2.5">
          {REASONS.map((reason, position) => (
            <details key={reason.title} className="reason-item" {...(position === 0 ? { open: true } : {})}>
              <summary className="reason-summary">
                <span className="reason-index">{String(position + 1).padStart(2, '0')}</span>
                <span className="flex-1 font-body text-[11px] font-extrabold leading-[1.7] text-ink sm:text-[12px]">{reason.title}</span>
                <span className="reason-chevron" aria-hidden="true" />
              </summary>
              <p className="whitespace-pre-line px-4 pb-4 pl-[52px] font-display text-[12px] leading-[1.95] text-[#4c534f] sm:text-[13px]">{reason.body}</p>
            </details>
          ))}
        </div>
      </section>

      <section aria-labelledby="legalitas-judul" className="mt-11 rounded-xl bg-[#04364a] p-6 text-white sm:p-8">
        <div className="flex items-center gap-2.5">
          <ShieldCheck size={20} className="text-[#ffd9a8]" />
          <h2 id="legalitas-judul" className="font-display text-[19px] font-bold sm:text-[21px]">Legalitas</h2>
        </div>
        <ul className="mt-5 space-y-3.5">
          {LEGAL.map((item) => (
            <li key={item} className="flex items-start gap-2.5 border-b border-white/12 pb-3.5 last:border-0 last:pb-0">
              <FileText size={14} className="mt-1 shrink-0 text-white/60" />
              <span className="font-body text-[11.5px] leading-[1.85] text-white/90">{item}</span>
            </li>
          ))}
        </ul>
      </section>

      <section aria-label="Ajakan" className="mt-11 flex flex-wrap items-center justify-between gap-4 rounded-xl bg-[#fff8f2] p-6">
        <p className="min-w-0 flex-1 font-display text-[13px] leading-[1.9] text-[#4a3520]">Wakaf Mushaf untuk orang tua adalah salah satu amalan yang paling mulia dan salah satu amalan yang mengalirkan pahala secara deras tiada henti.</p>
        <Link to="/wakaf" className="cta-button !rounded-lg shrink-0"><HandHeart size={18} />Saya Mau Wakaf<ArrowRight size={16} /></Link>
      </section>
    </>
  );
}
