// Vercel Edge Function: papan donasi bersama (Vercel KV / Upstash Redis REST).
// GET  /api/donations  -> daftar donatur terbaru (newest first)
// POST /api/donations  -> catat satu donasi yang sudah terverifikasi
export const config = { runtime: 'edge' };

const DONATIONS = [99000, 200000, 198000, 400000, 297000, 600000, 497000, 1000000, 990000, 2000000, 4950000, 10000000];
const KEY = 'amalqu:wall';
const LIMIT = 200;
const PER_MUSHAF = 99000;

const kvUrl = () => process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || '';
const kvToken = () => process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || '';

async function redis<T>(command: unknown[]): Promise<T | null> {
  const url = kvUrl();
  const token = kvToken();
  if (!url || !token) return null;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(command),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { result: T };
    return data.result ?? null;
  } catch {
    return null;
  }
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });

export default async function handler(req: Request) {
  if (req.method === 'GET') {
    const raw = await redis<string[]>(['lrange', KEY, 0, LIMIT - 1]);
    if (raw === null) {
      return json({ remote: false, entries: [], notice: 'Vercel KV belum dikonfigurasi. Tambahkan KV_REST_API_URL dan KV_REST_API_TOKEN.' });
    }
    const entries = raw
      .map((item) => { try { return JSON.parse(item); } catch { return null; } })
      .filter((item) => item && typeof item.id === 'string' && typeof item.amount === 'number');
    return json({ remote: true, entries });
  }

  if (req.method === 'POST') {
    const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
    const name = String(body?.name ?? '').trim().slice(0, 80);
    const amount = Number(body?.amount);
    if (name.length < 2) return json({ error: 'Nama minimal 2 karakter.' }, 400);
    if (!DONATIONS.includes(amount)) return json({ error: 'Nominal tidak dikenal.' }, 400);

    const entry = {
      id: String(body?.id ?? crypto.randomUUID()),
      name,
      amount,
      mushaf: Math.max(1, Math.round(amount / PER_MUSHAF)),
      createdAt: Number(body?.createdAt) || Date.now(),
      dedication: String(body?.dedication ?? '').trim().slice(0, 200),
      method: body?.method === 'transfer' ? 'transfer' : 'qris',
    };

    const pushed = await redis<number>(['lpush', KEY, JSON.stringify(entry)]);
    if (pushed === null) return json({ error: 'Penyimpanan donasi belum dikonfigurasi.' }, 501);
    await redis(['ltrim', KEY, 0, LIMIT - 1]);
    return json({ remote: true, entry }, 201);
  }

  return json({ error: 'Metode tidak diizinkan.' }, 405);
}
