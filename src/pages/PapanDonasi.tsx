import { Link } from 'react-router-dom';
import { ArrowRight, HandHeart } from 'lucide-react';
import { PROOFS } from '../data';
import { usePageMeta } from '../utils/page';
import { DonationWall } from '../components/DonationWall';
import { Gallery } from '../components/Gallery';
import { PageHero } from '../components/PageHero';

export default function PapanDonasi() {
  usePageMeta('Papan Donasi — Ribuan #SahabatAmal Sudah Berdonasi | AmalQu', 'Daftar donatur sedekah mushaf Al-Qur\'an beserta ucapan Jazakumullah Khairan Katsiran, bukti transfer, dan total yang tercatat.');

  return (
    <>
      <PageHero
        index="06"
        crumb="Papan Donasi"
        kicker="Papan donasi langsung"
        title="Ribuan #SahabatAmal Sudah Berdonasi"
        lead="Setiap donasi yang tercatat langsung menampilkan nama donatur beserta doa: Jazakumullah Khairan Katsiran atas donasi yang diberikan."
        aside={
          <div className="aside-panel">
            <p className="aside-panel-label">Bukti transfer</p>
            <p className="aside-panel-value">{PROOFS.length}</p>
            <p className="aside-panel-note">Konfirmasi dicatat Admin AmalQu</p>
          </div>
        }
      />

      <div className="mt-8">
        <DonationWall />
      </div>

      <section aria-labelledby="bukti-judul" className="mt-11">
        <h2 id="bukti-judul" className="font-body text-[13px] font-extrabold uppercase tracking-[0.16em] text-teal">Bukti transfer #SahabatAmal</h2>
        <p className="mt-2 font-display text-[12.5px] leading-relaxed text-muted">Setiap donasi yang masuk dikonfirmasi dan dicatat oleh Admin AmalQu.</p>
        <div className="mt-5">
          <Gallery images={PROOFS} variant="proofs" label="Bukti donasi SahabatAmal" />
        </div>
      </section>

      <section aria-label="Ajakan" className="mt-11 flex flex-wrap items-center justify-between gap-4 rounded-xl bg-brand p-6 text-white sm:p-7">
        <div className="min-w-0 flex-1">
          <h2 className="font-display text-[18px] font-bold leading-snug sm:text-[20px]">Mari sedekah mushaf Al-Qur'an hari ini untuk mereka yang kita cintai.</h2>
          <p className="mt-2 font-display text-[12px] leading-[1.9] text-white/85">Nama Anda akan langsung tertera di papan donasi ini setelah pembayaran terverifikasi.</p>
        </div>
        <div className="cta-group">
          <Link to="/wakaf" className="cta-button !rounded-lg !bg-white !text-brand hover:!bg-[#fff3e8]"><HandHeart size={18} className="!text-brand" />Wakaf sekarang</Link>
          <Link to="/penyaluran" className="ghost-button !border-white/40 !text-white hover:!bg-white/10">Laporan penyaluran<ArrowRight size={15} /></Link>
        </div>
      </section>
    </>
  );
}
