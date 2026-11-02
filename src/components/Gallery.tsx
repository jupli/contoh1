import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Expand } from 'lucide-react';
import { Dialog } from './Dialog';
import { SourceImage } from './SourceImage';

type GalleryProps = { images: string[]; variant?: 'photos' | 'proofs'; label: string };

export function Gallery({ images, variant = 'photos', label }: GalleryProps) {
  const track = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const isProof = variant === 'proofs';
  const goTo = (index: number) => {
    const next = Math.max(0, Math.min(images.length - 1, index));
    const element = track.current;
    const item = element?.children[0] as HTMLElement | undefined;
    if (element && item) {
      const gap = parseFloat(getComputedStyle(element).columnGap) || 12;
      element.scrollTo({ left: next * (item.getBoundingClientRect().width + gap), behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
      setActive(next);
    }
  };
  const onScroll = () => {
    const element = track.current;
    const item = element?.children[0] as HTMLElement | undefined;
    if (element && item) {
      const gap = parseFloat(getComputedStyle(element).columnGap) || 12;
      setActive(Math.max(0, Math.min(images.length - 1, Math.round(element.scrollLeft / (item.getBoundingClientRect().width + gap)))));
    }
  };
  const moveLightbox = (direction: number) => setSelected((value) => value === null ? null : (value + direction + images.length) % images.length);

  useEffect(() => {
    if (selected === null) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') { event.preventDefault(); setSelected((value) => value === null ? null : (value - 1 + images.length) % images.length); }
      if (event.key === 'ArrowRight') { event.preventDefault(); setSelected((value) => value === null ? null : (value + 1) % images.length); }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [selected, images.length]);

  return (
    <div className={`gallery ${isProof ? 'gallery-proofs' : ''}`}>
      <div ref={track} className="gallery-track flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2" role="region" aria-roledescription="karusel" aria-label={label} tabIndex={0} onScroll={onScroll} onKeyDown={(event) => {
        if (event.key === 'ArrowRight') { event.preventDefault(); goTo(active + 1); }
        if (event.key === 'ArrowLeft') { event.preventDefault(); goTo(active - 1); }
      }}>
        {images.map((src, index) => (
          <button key={src} type="button" className={`gallery-item group relative shrink-0 snap-start overflow-hidden rounded-lg text-left ${isProof ? 'bg-white' : 'bg-[#dce6df]'}`} onClick={() => setSelected(index)} aria-label={`Perbesar ${label.toLowerCase()} ${index + 1} dari ${images.length}`}>
            <SourceImage src={src} alt={`${label} ${index + 1}`} loading="lazy" decoding="async" className={`h-full w-full transition duration-500 group-hover:scale-[1.025] ${isProof ? 'object-contain object-top' : 'object-cover'}`} />
            <span className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-ink shadow-sm transition group-hover:bg-brand group-hover:text-white"><Expand size={15} /></span>
            {!isProof && <span className="absolute bottom-3 left-3 rounded-full bg-black/45 px-2.5 py-1 font-body text-[10px] font-semibold tracking-wider text-white">{String(index + 1).padStart(2, '0')} / {images.length}</span>}
          </button>
        ))}
      </div>
      <div className="mt-4 flex items-center justify-between gap-4 font-body">
        <button type="button" onClick={() => goTo(active - 1)} disabled={active === 0} className="gallery-control" aria-label="Gambar sebelumnya"><ArrowLeft size={16} /><span>Sebelumnya</span></button>
        <span className="text-xs tabular-nums text-muted" aria-live="polite">{String(active + 1).padStart(2, '0')} <span className="mx-1 text-slate-300">/</span> {images.length}</span>
        <button type="button" onClick={() => goTo(active + 1)} disabled={active === images.length - 1} className="gallery-control" aria-label="Gambar berikutnya"><span>Berikutnya</span><ArrowRight size={16} /></button>
      </div>
      <Dialog open={selected !== null} onClose={() => setSelected(null)} title={`${label} · ${selected === null ? '' : selected + 1} / ${images.length}`} className="max-w-4xl">
        <div>
          {selected !== null && <SourceImage key={selected} src={images[selected]} alt={`${label} ${selected + 1}`} className="mx-auto h-[65dvh] w-full bg-[#f4f6f5] object-contain p-3" />}
          <div className="flex items-center justify-between p-4 font-body">
            <button type="button" className="gallery-control" onClick={() => moveLightbox(-1)}><ArrowLeft size={17} />Sebelumnya</button>
            <span className="text-xs text-muted">{selected === null ? 0 : selected + 1} / {images.length}</span>
            <button type="button" className="gallery-control" onClick={() => moveLightbox(1)}>Berikutnya<ArrowRight size={17} /></button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
