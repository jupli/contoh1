import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ExternalLink, HandHeart, Play } from 'lucide-react';
import { BENEFITS, CONTACT, IMAGES, STORY } from '../data';
import { usePageMeta } from '../utils/page';
import { Dialog } from '../components/Dialog';
import { PageHero } from '../components/PageHero';
import { SourceImage } from '../components/SourceImage';

export default function Keutamaan() {
  usePageMeta("Keutamaan Wakaf Al Qur'an — AmalQu", 'Wakaf Mushaf adalah salah satu amalan terbaik karena menjadi investasi bagi kita di akhirat kelak.');
  const [videoOpen, setVideoOpen] = useState(false);

  return (
    <>
      <PageHero
        index="02"
        crumb="Keutamaan"
        kicker="Keutamaan Wakaf Al Qur'an"
        title="Investasi bagi kita di akhirat kelak"
        lead="Berikut beberapa keutamaan yang didapat bagi siapa saja yang wakaf mushaf untuk orang tua."
        tone="brand"
        aside={
          <div className="aside-quote">
            <p>{STORY[1]}</p>
          </div>
        }
      />

      <ol className="benefit-list mt-9">
        {BENEFITS.map((benefit, position) => (
          <li key={benefit} className="benefit-row">
            <span className="benefit-numeral" aria-hidden="true">{String(position + 1).padStart(2, '0')}</span>
            <p className="font-display text-[13px] leading-[1.95] text-[#303632] sm:text-[14.5px]">{benefit}</p>
            <span className="benefit-rule" aria-hidden="true" />
          </li>
        ))}
      </ol>

      <section aria-label="Video penyaluran" className="mt-12 grid gap-6 sm:grid-cols-[300px_1fr] sm:items-center">
        <div className="paper-card !rounded-xl p-2.5">
          <button type="button" onClick={() => setVideoOpen(true)} className="group relative block aspect-[9/16] w-full overflow-hidden rounded-lg bg-[#dce6df]" aria-label="Putar video penyaluran AmalQu">
            <SourceImage src={IMAGES.video} alt="Video penyaluran mushaf AmalQu" loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
            <span className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/5" />
            <span className="absolute left-1/2 top-1/2 flex h-12 w-[68px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-xl bg-[#f00] text-white shadow-lg transition group-hover:scale-110"><Play size={25} fill="currentColor" className="ml-1" /></span>
            <span className="absolute bottom-5 left-0 right-0 font-body text-sm font-bold text-white">DKM masjid</span>
          </button>
        </div>
        <div>
          <h2 className="font-display text-[20px] font-bold leading-snug text-[#12322a] sm:text-[23px]">Saksikan penyalurannya</h2>
          <p className="mt-3 font-display text-[13px] leading-[1.95] text-[#4c534f]">Selain membahagiakan orang tua dengan pahala jariyah, kita juga membahagiakan para santri penghafal Al-Qur’an, karena dengan kita mewakafkan mushaf untuk mereka sama saja kita memberikan fasilitas bagi mereka untuk membaca dan mempelajari secara dalam Al-Qur’an.</p>
          <p className="mt-3 font-display text-[13px] leading-[1.95] text-[#4c534f]">Karena setiap huruf yang dibaca atau dihafal oleh para santri, akan mendatangkan terus menerus pahala.</p>
          <a href={CONTACT.youtube} target="_blank" rel="noopener noreferrer" className="ghost-button mt-5">Tonton di YouTube<ExternalLink size={14} /></a>
        </div>
      </section>

      <section aria-label="Ajakan sedekah" className="mt-12 rounded-xl bg-brand p-7 text-center text-white sm:p-9">
        <p className="font-display text-[15px] leading-[1.95] sm:text-[17px]">Dengan bersedekah mushaf Al-Qur’an, kita memberikan hadiah yang terus bernilai bagi orang tua hingga akhir zaman.</p>
        <p className="mt-4 font-display text-[15px] font-bold leading-[1.9] sm:text-[17px]">Mari sedekah mushaf Al-Qur'an hari ini untuk mereka yang kita cintai.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link to="/wakaf" className="cta-button !rounded-lg !bg-white !text-brand hover:!bg-[#fff3e8]"><HandHeart size={19} className="!text-brand" />Sedekahkan sekarang</Link>
          <Link to="/keutamaan" className="ghost-button !border-white/40 !text-white hover:!bg-white/10">Delapan keutamaan di atas<ArrowRight size={15} /></Link>
        </div>
      </section>

      <Dialog open={videoOpen} onClose={() => setVideoOpen(false)} title="Video penyaluran AmalQu" className="max-w-[400px]">
        <iframe src="https://www.youtube-nocookie.com/embed/rprmBubao1I?autoplay=1&playsinline=1&rel=0" title="Video penyaluran mushaf AmalQu" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen className="aspect-[9/16] w-full bg-black" />
        <a href={CONTACT.youtube} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 p-4 font-body text-xs font-semibold text-teal">Lihat di YouTube<ExternalLink size={13} /></a>
      </Dialog>
    </>
  );
}
