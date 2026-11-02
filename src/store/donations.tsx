import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { formatRupiah } from '../data';
import { useToast } from '../components/Toaster';

export type PaymentMethodId = 'qris' | 'transfer';
export type DonationStatus = 'menunggu' | 'verifikasi' | 'berhasil' | 'kadaluarsa';

export type DonorInput = { name: string; phone: string; dedication: string; amount: number };

export type Invoice = DonorInput & {
  id: string;
  method: PaymentMethodId;
  uniqueCode: number;
  totalTransfer: number;
  checkoutUrl: string;
  createdAt: number;
  expiresAt: number;
};

export type DonationRecord = Invoice & { status: DonationStatus; paidAt?: number };

export type WallEntry = { id: string; name: string; amount: number; mushaf: number; createdAt: number; dedication?: string; method?: string };

const STORAGE_KEY = 'amalqu-donations-v2';
const FORM_KEY = 'amalqu-donor-form-v2';
const PER_MUSHAF = 99000;
const EXPIRY_MINUTES = 15;

export const mushafOf = (amount: number) => Math.max(1, Math.round(amount / PER_MUSHAF));

export const gratitude = (name: string, amount: number) =>
  `Jazakumullah Khairan Katsiran atas donasi dari : ${name} sebesar : Rp ${formatRupiah(amount)} semoga ALLAH melipat gandakan amal sholeh saudara/saudari...`;

const now = Date.now();
const SEEDS: WallEntry[] = [
  { id: 'seed-1', name: 'Hamba Allah', amount: 99000, mushaf: 1, createdAt: now - 3 * 60_000 },
  { id: 'seed-2', name: 'Hamba Allah — Arcamanik', amount: 297000, mushaf: 3, createdAt: now - 11 * 60_000 },
  { id: 'seed-3', name: 'Keluarga Alm. Ayahanda', amount: 497000, mushaf: 5, createdAt: now - 26 * 60_000 },
  { id: 'seed-4', name: 'Hamba Allah — Cimahi', amount: 198000, mushaf: 2, createdAt: now - 44 * 60_000 },
  { id: 'seed-5', name: 'Sahabat Amalqu', amount: 990000, mushaf: 10, createdAt: now - 72 * 60_000 },
  { id: 'seed-6', name: 'Hamba Allah — Jakarta', amount: 99000, mushaf: 1, createdAt: now - 118 * 60_000 },
];

export const relativeTime = (timestamp: number) => {
  const diff = Math.max(0, Date.now() - timestamp);
  const minute = 60_000;
  if (diff < minute) return 'baru saja';
  if (diff < 60 * minute) return `${Math.floor(diff / minute)} menit lalu`;
  if (diff < 24 * 60 * minute) return `${Math.floor(diff / (60 * minute))} jam lalu`;
  return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short' }).format(timestamp);
};

const invoiceId = () => `AMQ-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

const readRecords = (): DonationRecord[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((item) => item && typeof item.id === 'string') : [];
  } catch { return []; }
};

export const readSavedForm = (): DonorInput => {
  try {
    const raw = localStorage.getItem(FORM_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { name: String(parsed.name ?? ''), phone: String(parsed.phone ?? ''), dedication: String(parsed.dedication ?? ''), amount: Number(parsed.amount) || PER_MUSHAF };
    }
  } catch { /* storage unavailable */ }
  return { name: '', phone: '', dedication: '', amount: PER_MUSHAF };
};

type DonationsValue = {
  entries: WallEntry[];
  totals: { amount: number; count: number; mushaf: number };
  remoteNotice: string | null;
  records: DonationRecord[];
  pending: DonationRecord | null;
  celebration: DonationRecord | null;
  notifyEnabled: boolean;
  startPayment: (input: DonorInput, method: PaymentMethodId) => void;
  confirmPayment: () => void;
  cancelPayment: () => void;
  expirePayment: () => void;
  closeCelebration: () => void;
  saveForm: (input: DonorInput) => void;
  toggleNotify: () => void;
};

const DonationsContext = createContext<DonationsValue | null>(null);

export function DonationProvider({ children }: { children: ReactNode }) {
  const toast = useToast();
  const [remote, setRemote] = useState<WallEntry[]>([]);
  const [remoteNotice, setRemoteNotice] = useState<string | null>(null);
  const [records, setRecords] = useState<DonationRecord[]>([]);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [celebration, setCelebration] = useState<DonationRecord | null>(null);
  const [notifyEnabled, setNotifyEnabled] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const stamp = Date.now();
    const expired: string[] = [];
    let restored: string | null = null;
    const stored = readRecords().map((record) => {
      if (record.status !== 'menunggu' && record.status !== 'verifikasi') return record;
      if (record.expiresAt > stamp) {
        restored = record.id;
        return { ...record, status: 'menunggu' as const };
      }
      expired.push(record.id);
      return { ...record, status: 'kadaluarsa' as const };
    });
    setRecords(stored);
    if (restored) setPendingId(restored);
    expired.forEach((id) => toast({
      title: `Invoice ${id} kedaluwarsa`,
      description: 'Batas pembayaran sudah lewat. Silakan buat invoice baru untuk melanjutkan sedekah mushaf Anda.',
      variant: 'warning',
      duration: 7000,
    }));
    const canNotify = typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted';
    setNotifyEnabled(canNotify);
  }, [toast]);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(records)); } catch { /* storage unavailable */ }
  }, [records]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const systemNotify = useCallback((record: DonationRecord) => {
    try {
      if (!('Notification' in window) || Notification.permission !== 'granted') return;
      new Notification('Donasi Anda tercatat — AmalQu', { body: gratitude(record.name, record.amount) });
    } catch { /* notification unsupported */ }
  }, []);

  // Varian A: papan donasi bersama lewat /api/donations (Vercel KV).
  useEffect(() => {
    let alive = true;
    fetch('/api/donations')
      .then(async (res) => {
        const data = await res.json().catch(() => null);
        if (!alive) return;
        if (res.ok && Array.isArray(data?.entries)) {
          setRemote(data.entries);
          setRemoteNotice(data.remote ? null : 'Mode lokal — Vercel KV belum dikonfigurasi, sehingga donasi hanya tercatat di perangkat ini.');
        } else {
          setRemoteNotice('Mode lokal — server papan donasi tidak menjawab permintaan.');
        }
      })
      .catch(() => { if (alive) setRemoteNotice('Mode lokal — /api/donations tidak terjangkau. Jalankan `vercel dev`, atau deploy ke Vercel agar papan donasi tersimpan terpusat.'); });
    return () => { alive = false; };
  }, []);

  const publishDonation = useCallback(async (record: DonationRecord) => {
    try {
      const res = await fetch('/api/donations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: record.id, name: record.name, amount: record.amount, dedication: record.dedication, method: record.method, createdAt: record.paidAt ?? Date.now() }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.entry) throw new Error(data?.error ?? 'gagal');
      const entry = data.entry as WallEntry;
      setRemote((old) => [entry, ...old.filter((item) => item.id !== entry.id)]);
      setRemoteNotice(null);
    } catch {
      toast({ title: 'Donasi tercatat di perangkat ini', description: 'Server papan donasi belum aktif, sehingga nama Anda belum tampil untuk pengunjung lain.', variant: 'warning', duration: 7000 });
    }
  }, [toast]);

  const startPayment = useCallback((input: DonorInput, method: PaymentMethodId) => {
    const uniqueCode = Math.floor(100 + Math.random() * 900);
    const id = invoiceId();
    const record: DonationRecord = {
      ...input,
      id,
      method,
      uniqueCode,
      totalTransfer: input.amount + uniqueCode,
      checkoutUrl: `https://www.amalqu.com/checkout/-/start?inv=${id}&amount=${input.amount}`,
      createdAt: Date.now(),
      expiresAt: Date.now() + EXPIRY_MINUTES * 60_000,
      status: 'menunggu',
    };
    setRecords((old) => [record, ...old.filter((item) => item.status !== 'menunggu' && item.status !== 'verifikasi')]);
    setPendingId(record.id);
    toast({
      title: `Invoice ${record.id} dibuat`,
      description: method === 'qris'
        ? `Selesaikan pembayaran Rp ${formatRupiah(record.totalTransfer)} melalui QRIS dalam ${EXPIRY_MINUTES} menit.`
        : `Transfer Rp ${formatRupiah(record.totalTransfer)} (termasuk kode unik ${uniqueCode}) dalam ${EXPIRY_MINUTES} menit.`,
      variant: 'info',
    });
  }, [toast]);

  const confirmPayment = useCallback(() => {
    const current = records.find((item) => item.id === pendingId);
    if (!current || current.status !== 'menunggu') return;
    setRecords((old) => old.map((item) => item.id === current.id ? { ...item, status: 'verifikasi' } : item));
    const timer = setTimeout(() => {
      const paidAt = Date.now();
      setRecords((old) => old.map((item) => item.id === current.id ? { ...item, status: 'berhasil', paidAt } : item));
      const paid: DonationRecord = { ...current, status: 'berhasil', paidAt };
      setPendingId(null);
      setCelebration(paid);
      systemNotify(paid);
      void publishDonation(paid);
      toast({
        title: 'Pembayaran berhasil diverifikasi',
        description: gratitude(paid.name, paid.amount),
        variant: 'success',
        duration: 9000,
      });
    }, 1600);
    timers.current.push(timer);
  }, [pendingId, records, publishDonation, systemNotify, toast]);

  const cancelPayment = useCallback(() => {
    setRecords((old) => old.filter((item) => item.id !== pendingId));
    setPendingId(null);
  }, [pendingId]);

  const expirePayment = useCallback(() => {
    const current = records.find((item) => item.id === pendingId);
    if (!current) return;
    setRecords((old) => old.map((item) => item.id === current.id ? { ...item, status: 'kadaluarsa' } : item));
    setPendingId(null);
    toast({ title: `Invoice ${current.id} kedaluwarsa`, description: 'Silakan buat invoice baru untuk melanjutkan sedekah mushaf Anda.', variant: 'warning', duration: 7000 });
  }, [pendingId, records, toast]);

  const saveForm = useCallback((input: DonorInput) => {
    try { localStorage.setItem(FORM_KEY, JSON.stringify(input)); } catch { /* storage unavailable */ }
  }, []);

  const toggleNotify = useCallback(() => {
    if (!('Notification' in window)) {
      toast({ title: 'Notifikasi sistem tidak tersedia', description: 'Notifikasi tetap muncul di dalam halaman ini.', variant: 'info' });
      return;
    }
    if (Notification.permission === 'granted') { setNotifyEnabled(false); return; }
    Notification.requestPermission().then((permission) => {
      const granted = permission === 'granted';
      setNotifyEnabled(granted);
      toast({
        title: granted ? 'Notifikasi sistem diaktifkan' : 'Izin notifikasi ditolak',
        description: granted ? 'Setiap donasi yang terverifikasi akan memunculkan notifikasi.' : 'Anda tetap mendapat notifikasi di dalam halaman ini.',
        variant: granted ? 'success' : 'warning',
      });
    }).catch(() => setNotifyEnabled(false));
  }, [toast]);

  const entries = useMemo<WallEntry[]>(() => {
    const paid = records.filter((item) => item.status === 'berhasil').map((item) => ({
      id: item.id, name: item.name, amount: item.amount, mushaf: mushafOf(item.amount), createdAt: item.paidAt ?? item.createdAt, dedication: item.dedication, method: item.method,
    }));
    const merged = new Map<string, WallEntry>();
    [...paid, ...remote, ...SEEDS].forEach((entry) => { if (!merged.has(entry.id)) merged.set(entry.id, entry); });
    return [...merged.values()].sort((a, b) => b.createdAt - a.createdAt);
  }, [records, remote]);

  const totals = useMemo(() => {
    const amount = entries.reduce((sum, entry) => sum + entry.amount, 0);
    return { amount, count: entries.length, mushaf: entries.reduce((sum, entry) => sum + entry.mushaf, 0) };
  }, [entries]);

  const pending = useMemo(() => records.find((item) => item.id === pendingId && (item.status === 'menunggu' || item.status === 'verifikasi')) ?? null, [records, pendingId]);

  const value: DonationsValue = {
    entries, totals, remoteNotice, records, pending, celebration, notifyEnabled,
    startPayment, confirmPayment, cancelPayment, expirePayment, closeCelebration: () => setCelebration(null), saveForm, toggleNotify,
  };
  return <DonationsContext.Provider value={value}>{children}</DonationsContext.Provider>;
}

export function useDonations() {
  const context = useContext(DonationsContext);
  if (!context) throw new Error('useDonations harus dipakai di dalam DonationProvider');
  return context;
}
