/** Workforce classification and draft-state helpers used by Employees and Projects. */
export type WorkforceRecord = {
  id?: string;
  name?: string;
  email?: string;
  position?: string;
  rank?: string;
  terminated?: boolean;
  customFields?: Record<string, string>;
  engagementType?: string;
  workerType?: string;
  employmentType?: string;
  isContractor?: boolean;
};

export const engagementKind = (worker: WorkforceRecord): 'employee' | 'contractor' => {
  const tagged = [worker.customFields?.engagementType, worker.customFields?.workerType,
    worker.engagementType, worker.workerType, worker.employmentType].find(Boolean)?.toLowerCase().trim();
  if (tagged === 'contractor' || tagged === 'independent contractor' || tagged === 'freelancer') return 'contractor';
  if (tagged === 'employee') return 'employee';
  if (worker.isContractor === true || worker.customFields?.isContractor === 'true') return 'contractor';
  if (/^(independent )?contractor$|^freelancer$/i.test(worker.position || '')) return 'contractor';
  return 'employee';
};

export const requiredWorkerFields = (kind: 'employee' | 'contractor') =>
  kind === 'contractor' ? ['name', 'contractorEmail', 'position'] : ['name', 'emailUsername', 'position', 'rank'];

export const workerMissingFields = (
  values: Record<string, string>,
  kind: 'employee' | 'contractor'
): string[] => requiredWorkerFields(kind).filter(key => {
  const value = (values[key] || '').trim();
  if (!value) return true;
  if (key === 'contractorEmail') return !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  return false;
});

export const isWorkerIncomplete = (worker: WorkforceRecord): boolean => {
  const fields = worker.customFields?.__missingRequired;
  if (fields) {
    try { const parsed = JSON.parse(fields); if (Array.isArray(parsed)) return parsed.length > 0; }
    catch { return true; }
  }
  return !worker.name?.trim() || worker.customFields?.__draftName === 'true';
};
