/**
 * Dedicated Somniel Supabase Edge gateway. The publishable key is safe for browser use;
 * the service-role key must NEVER be available in this source or any VITE_ variable.
 * Until a separate Somniel project and authenticated gateway are provisioned,
 * the app stays on its current backend; this module never targets ProSeU.
 */
import { auth } from '../firebase';

const baseUrl = String(import.meta.env.VITE_SOMNIEL_SUPABASE_URL || '').replace(/\/$/, '');
const publicKey = String(import.meta.env.VITE_SOMNIEL_SUPABASE_PUBLISHABLE_KEY || '');
const endpoint = baseUrl ? baseUrl + '/functions/v1/somniel-data' : '';

export const isSomnielSupabaseReady = () =>
  /^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(baseUrl) &&
  /^(sb_publishable_|eyJ)/.test(publicKey) && publicKey.length > 24;

export type SomnielEntity = 'workers' | 'projects';
export type SomnielRecord = Record<string, unknown> & {
  id: string; _revision?: number; _source?: string; _updated_at?: string
};

async function call<T>(entity: SomnielEntity, method: 'GET' | 'POST', operation?: Record<string, unknown>): Promise<T> {
  if (!isSomnielSupabaseReady()) {
    throw Error('Somniel has not yet been connected to its own Supabase project. Nothing has been deleted or migrated.');
  }
  const user = auth.currentUser;
  if (!user) throw Error('Sign in with your Somniel administrator account first.');
  const jwt = await user.getIdToken();
  const response = await fetch(endpoint + (method === 'GET' ? '?entity=' + entity : ''), {
    method,
    cache: 'no-store',
    headers: {
      'apikey': publicKey,
      'Authorization': 'Bearer ' + jwt,
      ...(method === 'POST' ? { 'Content-Type': 'application/json' } : {})
    },
    ...(method === 'POST' ? { body: JSON.stringify({ entity, ...operation }) } : {})
  });
  let body: Record<string, unknown>;
  try { body = await response.json(); } catch { throw Error('Supabase returned an unreadable response.'); }
  if (!response.ok) {
    if (response.status === 401) throw Error('Your Firebase session expired. Sign out and sign in again.');
    if (response.status === 403) throw Error('You are signed in, but are not authorized for Somniel records.');
    throw Error(String(body.error || 'Supabase request failed') + ' (' + response.status + ')');
  }
  return body as T;
}

export const listSomnielRecords = async (entity: SomnielEntity): Promise<SomnielRecord[]> =>
  (await call<{records: SomnielRecord[]}>(entity, 'GET')).records;

export const saveSomnielRecord = (
  entity: SomnielEntity, record: Record<string, unknown>,
  id?: string, expectedRevision?: number
) => call<{id: string; revision: number}>(entity, 'POST', {
  action: 'save', record, ...(id ? { id } : {}),
  ...(expectedRevision ? { expected_revision: expectedRevision } : {})
});

export const importLegacyRecords = (entity: SomnielEntity, records: SomnielRecord[]) =>
  call<{imported_batch: number}>(entity, 'POST', { action: 'import_legacy', records });
