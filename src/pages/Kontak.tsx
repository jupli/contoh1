import { Camera as Instagram, ArrowUpRight, ChevronDown, FileText, HandHeart, Mail, MapPin, MessageCircle, Music2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CONTACT, FAQ, LEGAL, PROGRAM } from '../data';
import { usePageMeta } from '../utils/page';
import { PageHero } from '../components/PageHero';

const CHANNELS = [
  { icon: MessageCircle, label: 'WhatsApp', value: CONTACT.phone, href: `https://wa.me/${CONTACT.whatsapp}`, note: 'Layanan ramah, informatif, dan fast respon', external: true },
  { icon: Mail, label: 'Email', value: CONTACT.email, href: `mailto:${CONTACT.email}`, note: 'Konfirmasi donasi dan laporan penyaluran', external: false },
  { icon: MapPin, label: 'Alamat', value: CONTACT.address, href: CONTACT.maps, note: 'Arcamanik, Kota Bandung 40293', external: true },
];

export default function Kontak() {
  usePageMeta('Kontak AmalQu — WhatsApp, Email, dan Alamat Yayasan', 'Hubungi Admin AmalQu melalui WhatsApp 0855 2092 6594 atau email cs.amalqu@gmail.com untuk konfirmasi donasi dan laporan penyaluran.');

  return (
    <>
      <PageHero
        index="07"
        crumb="Kontak"
        kicker="Kontak & bantuan"
        title="Mendapatkan reminder amalan kebaikan setiap harinya dari Admin CS"
        lead="Mendapatkan layanan customer service yang ramah, informatif, dan fast respon."
        aside={
          <div className="aside-panel">
            <p className="aside-panel-label">WhatsApp</p>
            <p className="aside-panel-value">{CONTACT.phone}</p>
            <p className="aside-panel-note">cs.amalqu@gmail.com</p>
          </div>
        }
      />

      <section aria-label="Kanal kontak" className="mt-8 space-y-2.5">
        {CHANNELS.map((channel) => (
          <a key={channel.label} href={channel.href} {...(channel.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})} className="contact-row group">
            <span className="icon-tile group-hover:!bg-brand group-hover:!text-white"><channel.icon size={18} /></span>
            <span className="min-w-0 flex-1">
              <span className="block font-body text-[9.5px] font-bold uppercase tracking-[0.14em] text-muted">{channel.label}</span>
              <span className="mt-1 block break-words font-body text-[13px] font-bold leading-snug text-ink">{channel.value}</span>
              <span className="mt-1 block font-display text-[11px] leading-relaxed text-muted">{channel.note}</span>
            </span>
            <ArrowUpRight size={17} className="shrink-0 text-muted transition group-hover:text-brand" />
          </a>
        ))}
      </section>

      <section aria-label="Laporan penyaluran dan sosial media" className="mt-8 rounded-xl bg-[#04364a] p-6 text-white sm:p-7">
        <h2 className="font-display text-[18px] font-bold sm:text-[20px]">Laporan Penyaluran</h2>
        <p className="mt-2 font-display text-[12px] leading-[1.9] text-white/80">Ikuti pembaruan penyaluran mushaf ke Rumah Tahfidz, TPQ dan TPA di seluruh Indonesia.</p>
        <div className="mt-4 flex flex-wrap gap-2.5">
          <a href={CONTACT.instagram} target="_blank" rel="noopener noreferrer" className="social-pill"><Instagram size={15} />@amalqu.official</a>
          <a href={CONTACT.tiktok} target="_blank" rel="noopener noreferrer" className="social-pill"><Music2 size={15} />@amalqu.official</a>
          <Link to="/penyaluran" className="social-pill !bg-[#ffd9a8] !text-[#5a3a10] hover:!bg-white"><FileText size={15} />Dokumentasi</Link>
        </div>
      </section>

      <section aria-labelledby="faq-judul" className="mt-10">
        <h2 id="faq-judul" className="font-display text-[22px] font-bold leading-tight text-[#12322a] sm:text-[25px]">Pertanyaan yang sering diajukan</h2>
        <div className="mt-5 space-y-2.5">
          {FAQ.map((item, position) => (
            <details key={item.q} className="reason-item" {...(position === 0 ? { open: true } : {})}>
              <summary className="reason-summary">
                <span className="flex-1 font-body text-[12px] font-bold leading-[1.6] text-ink">{item.q}</span>
                <ChevronDown size={16} className="shrink-0 text-teal transition-transform duration-300" />
              </summary>
              <p className="px-4 pb-4 font-display text-[12.5px] leading-[1.95] text-[#4c534f]">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section aria-labelledby="legal-judul" className="mt-10">
        <h2 id="legal-judul" className="font-body text-[10px] font-extrabold uppercase tracking-[0.16em] text-brand">Legalitas {PROGRAM.org}</h2>
        <ul className="mt-4 space-y-2.5">
          {LEGAL.map((item) => (
            <li key={item} className="flex items-start gap-2.5 rounded-lg border border-[#edf0ee] bg-white px-4 py-3">
              <FileText size={14} className="mt-0.5 shrink-0 text-teal" />
              <span className="font-body text-[11.5px] leading-[1.85] text-[#4c534f]">{item}</span>
            </li>
          ))}
        </ul>
      </section>

      <section aria-label="Ajakan" className="mt-10 flex flex-wrap items-center justify-between gap-4 rounded-xl bg-[#fff8f2] p-6">
        <p className="min-w-0 flex-1 font-display text-[13px] leading-[1.9] text-[#4a3520]">Mari sedekah mushaf Al-Qur'an hari ini untuk mereka yang kita cintai.</p>
        <Link to="/wakaf" className="cta-button !rounded-lg shrink-0"><HandHeart size={18} />Saya Mau Wakaf</Link>
      </section>
    </>
  );
}
