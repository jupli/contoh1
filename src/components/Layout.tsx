import { useCallback, useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { Camera as Instagram, ExternalLink, HandHeart, Mail, MapPin, Menu, MessageCircle, Music2, Quote, X } from 'lucide-react';
import { CONTACT, LEGAL, NAV, PROGRAM } from '../data';
import { formatRupiah } from '../data';
import { relativeTime, useDonations } from '../store/donations';
import { SourceImage } from './SourceImage';
import { IMAGES } from '../data';

export function LiveRibbon() {
  const { entries, totals } = useDonations();
  const [index, setIndex] = useState(0);
  useEffect(() => {
    if (entries.length < 2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const interval = setInterval(() => setIndex((value) => (value + 1) % Math.min(entries.length, 8)), 4200);
    return () => clearInterval(interval);
  }, [entries.length]);
  const entry = entries[index];
  if (!entry) return null;
  return (
    <div className="ribbon">
      <div className="shell-width flex flex-wrap items-center justify-center gap-x-3 gap-y-1 py-2 font-body text-[10.5px] text-white/85">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/12 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.14em]"><span className="live-dot" />Langsung</span>
        <span key={entry.id} className="ribbon-line flex min-w-0 items-center gap-1.5">
          <Quote size={11} className="shrink-0 text-[#ffd9a8]" />
          <span className="truncate"><b className="text-white">{entry.name}</b> · {relativeTime(entry.createdAt)} · <b className="text-[#ffd9a8]">Rp {formatRupiah(entry.amount)}</b></span>
        </span>
        <Link to="/papan-donasi" className="hidden items-center gap-1 font-bold text-[#ffd9a8] underline-offset-4 transition hover:underline min-[560px]:inline-flex">
          {totals.count} donatur · {totals.mushaf} mushaf<ExternalLink size={10} />
        </Link>
      </div>
    </div>
  );
}

function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const location = useLocation();
  useEffect(() => onClose(), [location.pathname, onClose]);
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = previous; };
  }, [open, onClose]);

  return (
    <div className={`mobile-menu ${open ? 'mobile-menu-open' : ''}`} id="menu-mobile" aria-hidden={!open}>
      <nav aria-label="Navigasi halaman" className="shell-width grid gap-1 px-5 pb-5 pt-3">
        {NAV.map((item, position) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            tabIndex={open ? 0 : -1}
            style={{ transitionDelay: open ? `${position * 28}ms` : '0ms' }}
            className={({ isActive }) => `mobile-menu-link ${isActive ? 'mobile-menu-link-active' : ''}`}
            onClick={onClose}
          >
            <span className="mobile-menu-index">{item.index ?? '00'}</span>
            <span className="flex-1">{item.label}</span>
            {item.to === '/wakaf' ? <HandHeart size={15} /> : null}
          </NavLink>
        ))}
        <a href={`https://wa.me/${CONTACT.whatsapp}`} target="_blank" rel="noopener noreferrer" tabIndex={open ? 0 : -1} className="mobile-menu-link !text-teal" onClick={onClose}>
          <span className="mobile-menu-index"><MessageCircle size={13} /></span>
          <span className="flex-1">WhatsApp {CONTACT.phone}</span>
          <ExternalLink size={13} />
        </a>
      </nav>
    </div>
  );
}

function StickyCta() {
  const location = useLocation();
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 420 && location.pathname !== '/wakaf');
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); };
  }, [location.pathname]);
  return (
    <div className={`fixed bottom-3 left-1/2 z-40 w-[calc(100%-24px)] max-w-[960px] -translate-x-1/2 transition duration-300 ${show ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-24 opacity-0'}`} aria-hidden={!show}>
      <Link to="/wakaf" tabIndex={show ? 0 : -1} className="cta-button w-full !rounded-lg !py-3.5 !text-[11px] shadow-[0_4px_20px_rgba(0,80,65,0.25)] sm:!text-sm">
        <HandHeart size={18} />Bismillah Saya Mau Sedekah Mushaf Sekarang
      </Link>
    </div>
  );
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const closeMenu = useCallback(() => setOpen(false), []);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`site-header ${scrolled ? 'site-header-scrolled' : ''}`}>
      <div className="shell-width flex h-[70px] items-center justify-between gap-4 px-5">
        <Link to="/" aria-label="AmalQu — kembali ke beranda" className="shrink-0 transition hover:opacity-80">
          <SourceImage src={IMAGES.logo} alt="AmalQu — Amal Qur'an" width={125} height={36} className="h-9 w-auto object-contain" />
        </Link>

        <nav aria-label="Navigasi utama" className="hidden items-center gap-1 font-body text-[11px] font-bold lg:flex">
          {NAV.filter((item) => item.to !== '/wakaf').map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link to="/wakaf" className="cta-button hidden !rounded-full !px-4 !py-2.5 !text-[11px] sm:inline-flex"><HandHeart size={16} />Wakaf Sekarang</Link>
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls="menu-mobile"
            aria-label={open ? 'Tutup menu navigasi' : 'Buka menu navigasi'}
            className="menu-toggle lg:hidden"
          >
            {open ? <X size={19} /> : <Menu size={19} />}
          </button>
        </div>
      </div>
      <MobileMenu open={open} onClose={closeMenu} />
    </header>
  );
}

export function SiteLayout() {
  const location = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [location.pathname]);
  return (
    <>
      <a href="#konten" className="skip-link">Langsung ke konten utama</a>
      <SiteHeader />
      <LiveRibbon />
      <main id="konten" className="site-pattern" tabIndex={-1}>
        <div key={location.pathname} className="page-shell page-enter">
          <Outlet />
        </div>
      </main>
      <SiteFooter />
      <StickyCta />
    </>
  );
}

export function SiteFooter() {
  return (
    <footer id="kontak-footer" className="site-footer">
      <div className="shell-width grid gap-9 px-5 sm:grid-cols-2 lg:grid-cols-[1.1fr_1fr_1fr_.9fr]">
        <section>
          <h2 className="footer-title">Kontak</h2>
          <ul className="space-y-3 font-body text-xs leading-relaxed">
            <li><a href={`https://wa.me/${CONTACT.whatsapp}`} target="_blank" rel="noopener noreferrer" className="footer-link"><MessageCircle size={15} />{CONTACT.phone}</a></li>
            <li><a href={`mailto:${CONTACT.email}`} className="footer-link"><Mail size={15} />{CONTACT.email}</a></li>
            <li><a href={CONTACT.maps} target="_blank" rel="noopener noreferrer" className="footer-link"><MapPin size={15} />{CONTACT.address}</a></li>
          </ul>
        </section>
        <section>
          <h2 className="footer-title">Tentang</h2>
          <p className="font-body text-xs leading-[1.9]">{PROGRAM.mission}</p>
          <p className="mt-4 font-body text-xs leading-relaxed">Semoga Allah wujudkan mimpi kita.</p>
        </section>
        <section>
          <h2 className="footer-title">Legalitas</h2>
          <ul className="space-y-3 font-body text-xs leading-[1.9]">{LEGAL.map((item) => <li key={item}>{item}</li>)}</ul>
        </section>
        <section>
          <h2 className="footer-title">Halaman</h2>
          <nav aria-label="Navigasi footer" className="grid gap-2 font-body text-xs">
            {NAV.filter((item) => !item.end).map((item) => <Link key={item.to} to={item.to} className="footer-link !gap-1.5">{item.label}</Link>)}
          </nav>
          <h2 className="footer-title mt-6">Laporan Penyaluran</h2>
          <div className="flex gap-3 font-body text-xs">
            <a href={CONTACT.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram AmalQu" className="social-chip"><Instagram size={15} /></a>
            <a href={CONTACT.tiktok} target="_blank" rel="noopener noreferrer" aria-label="TikTok AmalQu" className="social-chip"><Music2 size={15} /></a>
            <Link to="/penyaluran" className="footer-link !gap-1.5 self-center">Dokumentasi<ExternalLink size={11} /></Link>
          </div>
        </section>
      </div>
      <div className="shell-width mt-10 border-t border-black/5 px-5 pt-5 text-center font-body text-[11px] text-muted">
        © {new Date().getFullYear()} {PROGRAM.org} · {PROGRAM.name}
      </div>
    </footer>
  );
}
