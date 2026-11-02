import { useEffect, useState, type ImgHTMLAttributes } from 'react';
import { BookOpen } from 'lucide-react';

export function SourceImage({ src, alt, className = '', ...props }: ImgHTMLAttributes<HTMLImageElement>) {
  const [attempt, setAttempt] = useState(0);
  useEffect(() => setAttempt(0), [src]);
  if (attempt > 1) {
    return <div role="img" aria-label={alt} className={`image-fallback flex flex-col items-center justify-center gap-3 bg-[#edf3f0] p-5 text-center text-teal ${className}`}><BookOpen size={34} strokeWidth={1.4} /><span className="font-body text-xs leading-relaxed">{alt}</span></div>;
  }
  return <img {...props} src={attempt === 1 && src?.includes('https://brdsg.com') ? src.replace('https://brdsg.com', 'https://img.brdsg.com') : src} alt={alt ?? ''} className={className} onError={() => setAttempt((value) => value + 1)} />;
}
