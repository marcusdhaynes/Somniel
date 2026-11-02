/**
 * Explicit, non-destructive migration of Somniel's existing Firestore records.
 * Never treats a denied read as an empty dataset, never deletes source records,
 * and never overwrites an existing Supabase record on import.
 */
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { importLegacyRecords, isSomnielSupabaseReady, listSomnielRecords, SomnielRecord } from './somnielSupabase';

export type SomnielImportReport = {
  employeesRead: number;
  projectRecordsRead: number;
  employeesVerified: number;
  projectRecordsVerified: number;
  sourceUntouched: true;
};

const asPlainRecord = (record: Record<string,unknown>) =>
  JSON.parse(JSON.stringify(record)) as Record<string,unknown>;

const importAndVerify = async (entity: 'workers' | 'projects', rows: SomnielRecord[]) => {
  for (let offset = 0; offset < rows.length; offset += 25) {
    await importLegacyRecords(entity, rows.slice(offset, offset + 25));
  }
  const after = await listSomnielRecords(entity);
  const knownIds = new Set(after.map(row => row.id));
  const missing = rows.map(row => row.id).filter(id => !knownIds.has(id));
  if (missing.length) throw Error(entity + ' import incomplete; ' + missing.length +
    ' source IDs were not verified in Supabase. Firestore is unchanged.');
  return rows.length;
};

export async function importSomnielLegacyData(): Promise<SomnielImportReport> {
  if (!isSomnielSupabaseReady()) throw Error('Connect a dedicated Somniel Supabase backend first.');
  let employeeSnapshot, taskSnapshot;
  try {
    // Both restricted reads must succeed before even beginning migration.
    [employeeSnapshot, taskSnapshot] = await Promise.all([
      getDocs(collection(db, 'employees')),
      getDocs(collection(db, 'tasks'))
    ]);
  } catch (error) {
    throw Error('The source Firebase database denied access. Migration did not start, and ' +
      'no records were deleted or replaced. Resolve the existing source permissions or supply a verified backup.');
  }
  const workers = employeeSnapshot.docs.map(doc => ({
    ...asPlainRecord(doc.data()), id: doc.id
  })) as SomnielRecord[];
  const projects = taskSnapshot.docs.filter(doc => doc.data().kind === 'contractor_project').map(doc => ({
    ...asPlainRecord(doc.data()), id: doc.id
  })) as SomnielRecord[];
  // Do not equate an empty source with success when previously archived records are expected.
  if (workers.length === 0 && projects.length === 0) {
    throw Error('Source returned no workforce or project records. Migration was stopped to avoid false success.');
  }
  const employeesVerified = await importAndVerify('workers', workers);
  const projectRecordsVerified = await importAndVerify('projects', projects);
  return {
    employeesRead: workers.length,
    projectRecordsRead: projects.length,
    employeesVerified, projectRecordsVerified,
    sourceUntouched: true
  };
}
