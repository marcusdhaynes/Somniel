// Somniel private data gateway. Keep verify_jwt=false for this function ONLY:
// Firebase ID tokens are independently verified here against Google's signed JWKS.
// Supabase service-role credentials never leave this server-side execution context.
import { createRemoteJWKSet, jwtVerify } from 'npm:jose@5.9.6';
import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

const firebaseProjectId = 'marmaladeplayer05-211181-259b2';
const ownerEmail = 'marcusdhaynes@gmail.com';
const issuer = 'https://securetoken.google.com/' + firebaseProjectId;
const jwks = createRemoteJWKSet(new URL(
  'https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com'
));
const allowedOrigins = new Set([
  'https://somniel.com', 'https://www.somniel.com',
  'https://marcusdhaynes.github.io', 'http://localhost:3000',
  'http://localhost:5173', 'http://127.0.0.1:3000', 'http://127.0.0.1:5173',
  'tauri://localhost', 'http://tauri.localhost', 'https://tauri.localhost'
]);
const tables = { workers: 'somniel_workers', projects: 'somniel_projects' } as const;
type Entity = keyof typeof tables;
const isEntity = (value: unknown): value is Entity => value === 'workers' || value === 'projects';
const short = (x: unknown, max: number) => typeof x === 'string' ? x.slice(0, max) : '';
const json = (body: unknown, status: number, origin = '') => new Response(JSON.stringify(body), {
  status, headers: { 'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store', 'Vary': 'Origin',
    ...(allowedOrigins.has(origin) ? { 'Access-Control-Allow-Origin': origin } : {}) }
});
const replyHeaders = (origin: string) => ({
  'Access-Control-Allow-Origin': allowedOrigins.has(origin) ? origin : 'null',
  'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Max-Age': '86400', 'Vary': 'Origin'
});

Deno.serve(async (request: Request) => {
  const origin = request.headers.get('origin') || '';
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: replyHeaders(origin) });
  }
  if (origin && !allowedOrigins.has(origin)) return json({ error: 'Origin not allowed' }, 403, origin);
  if (!['GET', 'POST'].includes(request.method)) return json({ error: 'Method not allowed' }, 405, origin);
  const bearer = request.headers.get('authorization')?.match(/^Bearer (.+)$/i)?.[1];
  if (!bearer || bearer.length > 8192) return json({ error: 'Firebase login required' }, 401, origin);

  let uid = '', email = '';
  try {
    const { payload } = await jwtVerify(bearer, jwks, {
      issuer, audience: firebaseProjectId, algorithms: ['RS256'], clockTolerance: 30
    });
    uid = short(payload.sub, 180);
    email = short(payload.email, 320).toLowerCase();
    if (!uid || payload.email_verified !== true || !email) throw Error('Verified identity required');
  } catch {
    return json({ error: 'Firebase authentication expired or invalid; sign in again' }, 401, origin);
  }

  const url = Deno.env.get('SUPABASE_URL');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!url || !serviceKey) return json({ error: 'Backend configuration unavailable' }, 503, origin);
  const supabase = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });

  // A verified Firebase user is NOT automatically entitled to company-wide records.
  // Only the owner or an explicitly provisioned administrator may read/write.
  if (email !== ownerEmail) {
    const { data, error } = await supabase.from('somniel_access').select('role')
      .eq('firebase_uid', uid).maybeSingle();
    if (error) return json({ error: 'Authorization verification unavailable' }, 503, origin);
    if (!data || !['owner', 'admin'].includes(data.role)) {
      return json({ error: 'Somniel administrator access required' }, 403, origin);
    }
  }

  const audit = async (action: string, entity: string, entityId: string, details: Record<string,unknown> = {}) => {
    const { error } = await supabase.from('somniel_audit').insert({
      firebase_uid: uid, email, action, entity, entity_id: entityId, details
    });
    if (error) console.error('Somniel audit write failed', error.code);
  };
  const address = new URL(request.url);
  if (request.method === 'GET') {
    const entity = address.searchParams.get('entity');
    if (!isEntity(entity)) return json({ error: 'Unknown collection' }, 400, origin);
    const { data, error } = await supabase.from(tables[entity])
      .select('id,record,revision,source,created_at,updated_at')
      .order('updated_at', { ascending: false }).limit(2000);
    if (error) return json({ error: 'Unable to read records', code: error.code }, 503, origin);
    return json({ records: (data || []).map(row => ({
      ...(row.record as Record<string,unknown>), id: row.id,
      _revision: row.revision, _source: row.source, _updated_at: row.updated_at
    })) }, 200, origin);
  }

  let body: Record<string,unknown>;
  try {
    if (Number(request.headers.get('content-length') || '0') > 200000) throw Error('too large');
    body = await request.json();
    if (!body || typeof body !== 'object' || Array.isArray(body)) throw Error('not object');
  } catch { return json({ error: 'Invalid or oversized JSON request' }, 400, origin); }
  const entity = body.entity;
  if (!isEntity(entity)) return json({ error: 'Unknown collection' }, 400, origin);

  if (body.action === 'import_legacy') {
    if (!Array.isArray(body.records) || body.records.length > 50) {
      return json({ error: 'Import must contain at most 50 original records' }, 400, origin);
    }
    // Preserve IDs, do not overwrite source records, and never infer deletion from missing rows.
    const importRows = body.records.map((item: unknown) => {
      if (!item || typeof item !== 'object' || Array.isArray(item)) throw Error('Invalid record');
      const obj = item as Record<string,unknown>, id = short(obj.id, 180);
      if (!id || !/^[a-zA-Z0-9_-]+$/.test(id)) throw Error('Invalid record ID');
      const { id: _omitted, ...rest } = obj;
      return { id, record: rest, source: 'firestore_import' };
    });
    try {
      if (importRows.length) {
        const { error } = await supabase.from(tables[entity])
          .upsert(importRows, { onConflict: 'id', ignoreDuplicates: true });
        if (error) throw error;
      }
      await audit('legacy_batch_imported', entity, '', { received: importRows.length });
      return json({ imported_batch: importRows.length, note: 'Existing records were never overwritten' }, 200, origin);
    } catch { return json({ error: 'Legacy import rejected; source data was not changed' }, 503, origin); }
  }

  if (body.action === 'save') {
    const id = short(body.id, 180) || crypto.randomUUID();
    const record = body.record;
    if (!/^[a-zA-Z0-9_-]+$/.test(id) || !record || typeof record !== 'object' || Array.isArray(record)) {
      return json({ error: 'Invalid record or ID' }, 400, origin);
    }
    const recordText = JSON.stringify(record);
    if (recordText.length > 150000) return json({ error: 'Record exceeds size limit' }, 413, origin);
    const revision = body.expected_revision;
    if (revision !== undefined && (!Number.isSafeInteger(revision) || Number(revision) < 1)) {
      return json({ error: 'Invalid revision' }, 400, origin);
    }
    if (revision) {
      const { data, error } = await supabase.from(tables[entity])
        .update({ record, revision: Number(revision) + 1, updated_at: new Date().toISOString() })
        .eq('id', id).eq('revision', revision).select('id,revision').maybeSingle();
      if (error) return json({ error: 'Update failed', code: error.code }, 503, origin);
      if (!data) return json({ error: 'Record was changed by another user; reload before saving' }, 409, origin);
      await audit('updated', entity, id, { revision: data.revision });
      return json({ id, revision: data.revision }, 200, origin);
    }
    const { data, error } = await supabase.from(tables[entity])
      .insert({ id, record, source: 'somniel' }).select('id,revision').single();
    if (error?.code === '23505') return json({ error: 'Record exists; load its revision to update' }, 409, origin);
    if (error) return json({ error: 'Unable to create record', code: error.code }, 503, origin);
    await audit('created', entity, id);
    return json({ id, revision: data.revision }, 201, origin);
  }
  return json({ error: 'Unsupported action' }, 400, origin);
});
