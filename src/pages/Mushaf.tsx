import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Check, HandHeart, Layers, ZoomIn } from 'lucide-react';
import { useState } from 'react';
import { DONATIONS, IMAGES, formatRupiah } from '../data';
import { mushafOf, readSavedForm } from '../store/donations';
import { useDonations } from '../store/donations';
import { useToast } from '../components/Toaster';
import { usePageMeta } from '../utils/page';
import { Dialog } from '../components/Dialog';
import { PageHero } from '../components/PageHero';
import { SourceImage } from '../components/SourceImage';

const SPECS = ['Ukuran A5', 'Rasm Usmani Mudah di Baca', '604 Video Syaikh Sudais', 'Nama Wakif dan Doa dicantumkan di Mushaf'];

export default function Mushaf() {
  usePageMeta("Mushaf Al-Qur'an & Pilihan Nominal Sedekah — AmalQu", "Mushaf ukuran A5, Rasm Usmani mudah dibaca, dilengkapi 604 video Syaikh Sudais, dan nama wakif dicantumkan di dalam mushaf.");
  const [zoom, setZoom] = useState(false);
  const [chosen, setChosen] = useState(() => readSavedForm().amount);
  const { saveForm } = useDonations();
  const toast = useToast();
  const navigate = useNavigate();

  const choose = (amount: number) => {
    setChosen(amount);
    saveForm({ ...readSavedForm(), amount });
    toast({ title: `Nominal Rp ${formatRupiah(amount)} dipilih`, description: `Setara ± ${mushafOf(amount)} mushaf. Lanjutkan mengisi nama dan niat sedekah.`, variant: 'success' });
    navigate('/wakaf');
  };

  return (
    <>
      <PageHero
        index="03"
        crumb="Mushaf"
        kicker="Mushaf yang disalurkan"
        title="Al-Qur'an"
        lead="Mushaf quran yang akan di distribusikan kepada lembaga pendidikan islam. Seperti Rumah Tahfidz, TPQ dan TPA."
        aside={
          <div className="aside-panel">
            <p className="aside-panel-label">Per mushaf</p>
            <p className="aside-panel-value">Rp {formatRupiah(99000)}</p>
            <p className="aside-panel-note">Nama Anda tertulis di dalamnya</p>
          </div>
        }
      />

      <section aria-label="Detail mushaf" className="mt-9 grid gap-6 sm:grid-cols-[46%_1fr]">
        <div className="sm:sticky sm:top-24 sm:self-start">
          <button type="button" onClick={() => setZoom(true)} className="group relative block aspect-square w-full overflow-hidden rounded-xl bg-[#f2f1ec] shadow-[0_8px_26px_rgba(31,45,38,0.1)]" aria-label="Perbesar foto mushaf Al-Qur'an">
            <SourceImage src={IMAGES.product} alt="Mushaf Al-Qur'an Rasm Usmani yang disalurkan AmalQu" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
            <span className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/92 text-ink shadow transition group-hover:bg-brand group-hover:text-white"><ZoomIn size={17} /></span>
          </button>
        </div>
        <div>
          <h2 className="font-body text-[10px] font-extrabold uppercase tracking-[0.16em] text-brand">Spesifikasi</h2>
          <ul className="mt-4 space-y-3">
            {SPECS.map((spec) => (
              <li key={spec} className="flex items-start gap-2.5 border-b border-[#edf0ee] pb-3 font-display text-[13.5px] leading-relaxed text-[#303632] last:border-0">
                <Check size={16} className="mt-1 shrink-0 text-teal" />{spec}
              </li>
            ))}
          </ul>
          <div className="mt-6 rounded-lg bg-[#f4f7f5] p-4">
            <p className="flex items-center gap-2 font-body text-[11px] font-bold text-teal-dark"><Layers size={15} />Namamu tertulis di dalam mushaf</p>
            <p className="mt-2 font-display text-[12px] leading-[1.9] text-[#4c534f]">Bagi Muwakif dan donatur yang berdonasi di Yayasan SBS, Namanya akan tertulis di dalam mushaf.</p>
          </div>
        </div>
      </section>

      <section aria-labelledby="nominal-judul" className="mt-12">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id="nominal-judul" className="font-display text-[22px] font-bold leading-tight text-[#12322a] sm:text-[25px]">Jumlah Wakaf Mushaf Quran</h2>
            <p className="mt-2 font-display text-[12.5px] leading-relaxed text-muted">Pilih satu nominal — Anda langsung diarahkan ke formulir wakaf dengan nominal terisi.</p>
          </div>
          <Link to="/wakaf" className="ghost-button shrink-0">Ke formulir<ArrowRight size={15} /></Link>
        </div>

        <div className="mt-6 grid gap-2.5 min-[420px]:grid-cols-2 lg:grid-cols-3">
          {DONATIONS.map((amount) => {
            const active = chosen === amount;
            return (
              <button key={amount} type="button" onClick={() => choose(amount)} aria-pressed={active} className={`price-tile ${active ? 'price-tile-active' : ''}`}>
                <span className="price-tile-mushaf">{mushafOf(amount)} mushaf</span>
                <span className="price-tile-amount">Rp {formatRupiah(amount)}</span>
                <span className="price-tile-label">Sedekah Mushaf Al Qur'an</span>
                <span className="price-tile-cta"><HandHeart size={14} />Pilih & lanjut</span>
              </button>
            );
          })}
        </div>
      </section>

      <Dialog open={zoom} onClose={() => setZoom(false)} title="Mushaf Al-Qur'an AmalQu" className="max-w-2xl">
        <SourceImage src={IMAGES.product} alt="Mushaf Al-Qur'an Rasm Usmani AmalQu" className="max-h-[72dvh] w-full bg-[#f4f6f5] object-contain p-3" />
      </Dialog>
    </>
  );
}
