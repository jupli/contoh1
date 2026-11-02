import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import type { ReactNode } from 'react';

type PageHeroProps = {
  index: string;
  kicker: string;
  title: string;
  lead: string;
  crumb: string;
  aside?: ReactNode;
  tone?: 'teal' | 'brand';
};

export function PageHero({ index, kicker, title, lead, crumb, aside, tone = 'teal' }: PageHeroProps) {
  return (
    <header className={`page-hero page-hero-${tone}`}>
      <svg className="page-hero-motif" viewBox="0 0 240 140" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <g fill="none" stroke="currentColor" strokeWidth="0.8">
          {Array.from({ length: 11 }, (_, i) => <path key={`p${i}`} d={`M${i * 24 - 20} 140 Q ${i * 24} 70 ${i * 24 + 22} 0`} />)}
          {Array.from({ length: 4 }, (_, i) => <circle key={`c${i}`} cx={40 + i * 60} cy={70} r={30} />)}
          <path d="M0 70h240" />
        </g>
      </svg>
      <nav aria-label="Breadcrumb" className="page-hero-crumb relative">
        <Link to="/"><Home size={12} />Beranda</Link>
        <ChevronRight size={12} aria-hidden="true" />
        <span aria-current="page">{crumb}</span>
      </nav>
      <div className="page-hero-grid relative">
        <div className="min-w-0">
          <p className="page-hero-kicker">{kicker}</p>
          <h1 className="page-hero-title">{title}</h1>
          <p className="page-hero-lead">{lead}</p>
        </div>
        {aside ? <div className="page-hero-aside">{aside}</div> : null}
      </div>
      <span className="page-hero-index" aria-hidden="true">{index}</span>
    </header>
  );
}
