import { Link } from 'react-router-dom';
import { Compass, HandHeart, Home } from 'lucide-react';
import { NAV } from '../data';
import { usePageMeta } from '../utils/page';

export default function NotFound() {
  usePageMeta('Halaman tidak ditemukan — AmalQu');
  return (
    <section aria-label="Halaman tidak ditemukan" className="notfound py-14 text-center">
      <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#fff3e8] text-brand"><Compass size={30} /></span>
      <p className="mt-6 font-display text-[54px] font-bold leading-none text-brand sm:text-[68px]">404</p>
      <h1 className="mt-4 font-display text-[21px] font-bold leading-snug text-[#12322a] sm:text-[24px]">Halaman yang Anda cari tidak ditemukan</h1>
      <p className="mx-auto mt-3 max-w-[420px] font-display text-[13px] leading-[1.95] text-muted">Mungkin alamatnya berubah. Silakan lanjutkan ke halaman berikut — pahala jariyahnya tetap mengalir.</p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link to="/" className="cta-button !rounded-lg"><Home size={18} />Kembali ke beranda</Link>
        <Link to="/wakaf" className="ghost-button"><HandHeart size={16} />Wakaf sekarang</Link>
      </div>
      <nav aria-label="Semua halaman" className="mt-9 flex flex-wrap justify-center gap-2">
        {NAV.filter((item) => !item.end).map((item) => (
          <Link key={item.to} to={item.to} className="notfound-chip">{item.index} · {item.label}</Link>
        ))}
      </nav>
    </section>
  );
}
