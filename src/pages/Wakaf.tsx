import { Link } from 'react-router-dom';
import { ArrowUpRight, HandHeart, MessageCircle, ShieldCheck, Sparkles, Users } from 'lucide-react';
import { CONTACT } from '../data';
import { usePageMeta } from '../utils/page';
import { DonationForm } from '../components/DonationForm';
import { PageHero } from '../components/PageHero';
import { PaymentMethods } from '../components/PaymentMethods';

const ASSURANCES = [
  { icon: ShieldCheck, title: 'Legalitas resmi, berbadan hukum dan terpercaya', body: 'Keputusan Kemenkumham RI NO. AHU-0010248.AH.01.04. Tahun 2025.' },
  { icon: Sparkles, title: 'Namamu tertulis di dalam mushaf', body: 'Bagi Muwakif dan donatur yang berdonasi di Yayasan SBS, Namanya akan tertulis di dalam mushaf.' },
  { icon: Users, title: 'Didoakan anak yatim dan santri penghafal Qur\'an', body: 'Muwakif yang berdonasi melalui Yayasan SBS akan didoakan oleh Anak Yatim dan para santri penghafal Al-Quran.' },
];

export default function Wakaf() {
  usePageMeta('Wakaf Sekarang — Sedekah Mushaf Al-Qur\'an | AmalQu', 'Isi nama dan niat sedekah Anda, pilih nominal mulai Rp 99.000 per mushaf, lalu bayar lewat QRIS atau transfer rekening resmi Yayasan.');

  return (
    <>
      <PageHero
        index="05"
        crumb="Wakaf"
        kicker="Formulir wakaf"
        title="Sedekahkan Al-Qur'an dan saksikanlah betapa besar kebaikan yang akan tercipta."
        lead="Berwakaf mushaf Al-Qur’an atas nama orang tua adalah cara indah untuk melengkapi amalan mereka."
        tone="brand"
        aside={
          <div className="aside-panel">
            <p className="aside-panel-label">Tiga langkah</p>
            <ol className="aside-panel-list">
              <li>Data diri & niat</li>
              <li>Metode pembayaran</li>
              <li>Nama Anda tertera</li>
            </ol>
          </div>
        }
      />

      <div className="mt-8">
        <DonationForm />
      </div>

      <section aria-label="Rekening donasi" className="paper-card mt-8 p-5 sm:p-6">
        <PaymentMethods />
      </section>

      <section aria-labelledby="jaminan-judul" className="mt-8 grid gap-3 sm:grid-cols-3">
        {ASSURANCES.map((item) => (
          <article key={item.title} className="assurance-card">
            <span className="icon-tile"><item.icon size={17} /></span>
            <h3 id={item.title === ASSURANCES[0].title ? 'jaminan-judul' : undefined} className="mt-3 font-body text-[11px] font-extrabold leading-[1.6] text-ink">{item.title}</h3>
            <p className="mt-2 font-display text-[11.5px] leading-[1.85] text-[#4c534f]">{item.body}</p>
          </article>
        ))}
      </section>

      <section aria-label="Bantuan" className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-xl bg-[#fff8f2] p-6">
        <div className="min-w-0 flex-1">
          <h2 className="font-body text-[13px] font-extrabold text-[#7a4a12]">Butuh bantuan mengisi formulir?</h2>
          <p className="mt-1.5 font-display text-[12px] leading-relaxed text-[#6b5334]">Mendapatkan layanan customer service yang ramah, informatif, dan fast respon.</p>
        </div>
        <div className="cta-group">
          <a href={`https://wa.me/${CONTACT.whatsapp}`} target="_blank" rel="noopener noreferrer" className="cta-button !rounded-lg"><MessageCircle size={18} />{CONTACT.phone}</a>
          <Link to="/papan-donasi" className="ghost-button"><HandHeart size={15} />Papan donasi<ArrowUpRight size={14} /></Link>
        </div>
      </section>
    </>
  );
}
