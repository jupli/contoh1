import { useCallback, useEffect, useRef, useState } from 'react';
import { Activity, Check, Copy, Database, RefreshCw, Server, Timer, WifiOff } from 'lucide-react';
import { useDonations } from '../store/donations';

type Probe = {
  at: number;
  latency: number;
  ok: boolean;
  remote: boolean;
  entries: number;
  notice?: string;
  error?: string;
};

const FIX_COMMAND = 'vercel kv create';
const PROBE_INTERVAL = 20_000;

export function ServerStatus() {
  const { entries, totals } = useDonations();
  const [probe, setProbe] = useState<Probe | null>(null);
  const [probing, setProbing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [, setTick] = useState(0);
  const alive = useRef(true);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const run = useCallback(async () => {
    setProbing(true);
    const started = performance.now();
    const latency = () => Math.round(performance.now() - started);
    try {
      const res = await fetch('/api/donations', { headers: { Accept: 'application/json' } });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data) {
        setProbe({ at: Date.now(), latency: latency(), ok: false, remote: false, entries: 0, error: `HTTP ${res.status} · endpoint tidak menjawab JSON` });
      } else {
        setProbe({
          at: Date.now(),
          latency: latency(),
          ok: true,
          remote: !!data.remote,
          entries: Array.isArray(data.entries) ? data.entries.length : 0,
          notice: typeof data.notice === 'string' ? data.notice : undefined,
        });
      }
    } catch (error) {
      setProbe({ at: Date.now(), latency: latency(), ok: false, remote: false, entries: 0, error: error instanceof Error ? error.message : 'jaringan gagal' });
    } finally {
      if (alive.current) setProbing(false);
    }
  }, []);

  useEffect(() => {
    alive.current = true;
    void run();
    const probeTimer = setInterval(() => { void run(); }, PROBE_INTERVAL);
    const secondTimer = setInterval(() => setTick((value) => value + 1), 1000);
    return () => {
      alive.current = false;
      clearInterval(probeTimer);
      clearInterval(secondTimer);
      if (copyTimer.current) clearTimeout(copyTimer.current);
    };
  }, [run]);

  const copyFix = async () => {
    try {
      if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(FIX_COMMAND);
      else {
        const field = document.createElement('textarea');
        field.value = FIX_COMMAND; field.style.position = 'fixed'; field.style.opacity = '0';
        document.body.appendChild(field); field.select();
        const ok = document.execCommand('copy'); field.remove();
        if (!ok) throw new Error('copy unavailable');
      }
      setCopied(true);
    } catch { setCopied(false); }
    if (copyTimer.current) clearTimeout(copyTimer.current);
    copyTimer.current = setTimeout(() => setCopied(false), 2600);
  };

  const remote = !!probe?.remote;
  const secondsAgo = probe ? Math.max(0, Math.round((Date.now() - probe.at) / 1000)) : 0;
  const latencyTone = !probe ? 'idle' : probe.latency < 220 ? 'good' : probe.latency < 600 ? 'warn' : 'bad';

  return (
    <section className="console-panel" aria-labelledby="console-title">
      <span className="console-scan" aria-hidden="true" />
      <header className="console-head">
        <div className="min-w-0">
          <p className="console-eyebrow"><Server size={12} />Varian A · papan donasi bersama</p>
          <h2 id="console-title" className="console-title">Status sumber data</h2>
        </div>
        <div className="console-state">
          <span className={`console-badge ${remote ? 'console-badge-live' : probe ? 'console-badge-local' : 'console-badge-idle'}`}>
            <span className={`console-dot ${remote ? 'console-dot-live' : probe ? 'console-dot-local' : ''}`} />
            {remote ? 'Terhubung ke server' : probe ? 'Mode lokal' : probing ? 'Memeriksa…' : 'Menunggu'}
          </span>
          <button type="button" onClick={() => void run()} disabled={probing} className="console-refresh" aria-label="Periksa ulang koneksi papan donasi">
            <RefreshCw size={14} className={probing ? 'animate-spin' : ''} />{probing ? 'Memeriksa' : 'Periksa ulang'}
          </button>
        </div>
      </header>

      <dl className="console-grid">
        <div className="console-row">
          <dt><Database size={13} />Sumber entri</dt>
          <dd className={remote ? 'console-good' : 'console-warn'}>{remote ? 'Vercel KV (server)' : 'Perangkat pengunjung'}</dd>
        </div>
        <div className="console-row">
          <dt><Activity size={13} />Entri di server</dt>
          <dd className="console-num">{probe?.ok ? probe.entries : '—'}</dd>
        </div>
        <div className="console-row">
          <dt><Timer size={13} />Latensi</dt>
          <dd>
            <span className={`console-num console-${latencyTone}`}>{probe ? `${probe.latency} ms` : '—'}</span>
            <span className="console-bar" aria-hidden="true">
              <span className={`console-bar-fill console-bar-${latencyTone}`} style={{ width: probe ? `${Math.max(4, Math.min(100, probe.latency / 6))}%` : '4%' }} />
            </span>
          </dd>
        </div>
        <div className="console-row">
          <dt><RefreshCw size={13} />Diperiksa</dt>
          <dd className="console-num">{probe ? `${secondsAgo} dtk lalu` : '—'}</dd>
        </div>
      </dl>

      {probe && !remote && (
        <div className="console-fix">
          <p className="console-fix-head"><WifiOff size={14} />{probe.error ? 'Endpoint tidak tersedia' : 'Penyimpanan server belum aktif'}</p>
          <p className="console-fix-body">
            {probe.error ?? probe.notice ?? 'Vercel KV belum dikonfigurasi.'} Selama belum aktif, donasi hanya tercatat di perangkat masing-masing pengunjung.
          </p>
          <div className="console-cmd">
            <code>$ {FIX_COMMAND}</code>
            <button type="button" onClick={copyFix} className="console-copy" aria-label="Salin perintah vercel kv create">
              {copied ? <Check size={13} /> : <Copy size={13} />}{copied ? 'Tersalin' : 'Salin'}
            </button>
          </div>
          <p className="console-fix-note">Jalankan di folder proyek, lalu deploy ulang. Panel ini berubah hijau sendiri setelah <code>KV_REST_API_URL</code> tersedia.</p>
        </div>
      )}

      <footer className="console-foot">
        <span>Tercatat di halaman ini: <b className="console-num">{totals.count}</b> donatur · <b className="console-num">{totals.mushaf}</b> mushaf · Rp <b className="console-num">{new Intl.NumberFormat('id-ID').format(totals.amount)}</b></span>
        <span className="console-foot-sep" aria-hidden="true" />
        <span>{remote ? `Gabungan server + lokal: ${entries.length} entri` : 'Semua entri berasal dari perangkat ini'}</span>
      </footer>
      <span className="sr-only" role="status" aria-live="polite">
        {probe ? (remote ? `Papan donasi terhubung ke server, ${probe.entries} entri, latensi ${probe.latency} milidetik.` : 'Papan donasi dalam mode lokal, penyimpanan server belum aktif.') : ''}
      </span>
    </section>
  );
}
