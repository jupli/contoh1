import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, HandHeart, Images, ReceiptText } from 'lucide-react';
import { GALLERY, PROOFS } from '../data';
import { usePageMeta } from '../utils/page';
import { Gallery } from '../components/Gallery';
import { PageHero } from '../components/PageHero';

const TABS = [
  { id: 'dokumentasi', label: 'Dokumentasi penyaluran', icon: Images, count: GALLERY.length, note: 'Mushaf yang disalurkan merupakan Mushaf quran yang akan di distribusikan kepada lembaga pendidikan islam. Seperti Rumah Tahfidz, TPQ dan TPA.' },
  { id: 'bukti', label: 'Bukti transfer #SahabatAmal', icon: ReceiptText, count: PROOFS.length, note: 'Pengelolaan dan penyaluran transparan dan terjamin — para muwakif atau donatur akan melihat laporan penyaluran melalui spreadsheet ataupun link yang dibagikan oleh Yayasan.' },
] as const;

export default function Penyaluran() {
  usePageMeta('Laporan Penyaluran — AmalQu', 'Dokumentasi penyaluran mushaf Al-Qur\'an ke Rumah Tahfidz, TPQ, dan TPA serta bukti transfer para SahabatAmal.');
  const [tab, setTab] = useState<'dokumentasi' | 'bukti'>('dokumentasi');
  const active = TABS.find((item) => item.id === tab)!;

  return (
    <>
      <PageHero
        index="04"
        crumb="Penyaluran"
        kicker="Laporan Penyaluran"
        title="Transparan dari niat hingga tiba di tangan santri"
        lead="Kami Memiliki tim yang berprofesional dan ber pengalaman, serta para muwakif atau donatur akan melihat laporan penyaluran melalui spreadsheet ataupun link yang dibagikan oleh Yayasan."
        aside={
          <div className="aside-panel">
            <p className="aside-panel-label">Dokumentasi</p>
            <p className="aside-panel-value">{GALLERY.length + PROOFS.length}</p>
            <p className="aside-panel-note">{GALLERY.length} foto penyaluran · {PROOFS.length} bukti transfer</p>
          </div>
        }
      />

      <div className="tab-bar mt-8" role="tablist" aria-label="Jenis laporan">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            id={`tab-${item.id}`}
            aria-selected={tab === item.id}
            aria-controls={`panel-${item.id}`}
            onClick={() => setTab(item.id)}
            className={`tab-button ${tab === item.id ? 'tab-button-active' : ''}`}
          >
            <item.icon size={15} />
            <span className="flex-1 text-left">{item.label}</span>
            <span className="tab-count">{item.count}</span>
          </button>
        ))}
      </div>

      <section role="tabpanel" id={`panel-${active.id}`} aria-labelledby={`tab-${active.id}`} className="mt-6">
        <p className="font-display text-[12.5px] leading-[1.95] text-[#4c534f]">{active.note}</p>
        <div className="mt-5">
          {tab === 'dokumentasi'
            ? <Gallery images={GALLERY} label="Dokumentasi penyaluran AmalQu" />
            : <Gallery images={PROOFS} variant="proofs" label="Bukti donasi SahabatAmal" />}
        </div>
      </section>

      <section aria-label="Ajakan" className="mt-11 flex flex-wrap items-center justify-between gap-4 rounded-xl bg-[#04364a] p-6 text-white sm:p-7">
        <div className="min-w-0 flex-1">
          <h2 className="font-display text-[18px] font-bold leading-snug sm:text-[20px]">Sedekahkan Al-Qur'an dan saksikanlah betapa besar kebaikan yang akan tercipta.</h2>
          <p className="mt-2 font-display text-[12px] leading-[1.9] text-white/80">Muwakif yang berdonasi melalui Yayasan SBS akan didoakan oleh Anak Yatim dan para santri penghafal Al-Quran.</p>
        </div>
        <div className="cta-group">
          <Link to="/wakaf" className="cta-button !rounded-lg"><HandHeart size={18} />Mulai berwakaf</Link>
          <Link to="/papan-donasi" className="ghost-button !border-white/35 !text-white hover:!bg-white/10">Papan donasi<ArrowRight size={15} /></Link>
        </div>
      </section>
    </>
  );
}
