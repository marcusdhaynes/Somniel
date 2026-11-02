import { useEffect, useState } from 'react';
import { addDoc, collection, doc, onSnapshot, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db, logActivity } from '../firebase';
import { Bid, ContractorProject, requiredStageFields } from './projectDocuments';
import { engagementKind, isWorkerIncomplete } from './workforce';
import { useAuth } from '../context/AuthContext';
export type Contractor = { id: string; name: string; position: string; email?: string; terminated?: boolean; customFields?: Record<string, string> };
export const today = () => new Date().toISOString().slice(0,10);
export const money = (amount: number | string, code = 'USD') => {
  const n = Number(amount);
  if (!Number.isFinite(n)) return String(amount);
  try { return new Intl.NumberFormat('en-US', { style: 'currency', currency: code, maximumFractionDigits: 2 }).format(n); }
  catch { return code + ' ' + n.toFixed(2); }
};
export function useProjectStore() {
  const { user, loading: authLoading, isAdmin } = useAuth();
  const [retryIndex, setRetryIndex] = useState(0);
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [otherWorkers, setOtherWorkers] = useState<Contractor[]>([]);
  const [peopleReady, setPeopleReady] = useState(false);
  const [projects, setProjects] = useState<ContractorProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    // A permission-denied listener does not recover by itself. Do not subscribe before Firebase
    // has an established admin identity; refresh the ID token and reattach once if denied.
    if (authLoading) return;
    if (!user || !isAdmin) {
      setError('Sign in with an authorized Somniel administrator account to access contractor projects.');
      setLoading(false);
      setPeopleReady(true);
      return;
    }
    let active = true;
    setError('');
    const onDenied = (area: string, error: { code?: string; message?: string }) => {
      if (!active) return;
      const code = String(error?.code || '');
      if (code.includes('permission-denied') && retryIndex === 0) {
        void user.getIdToken(true).then(() => {
          if (active) setRetryIndex(1);
        }).catch(() => {
          if (active) {
            setError(area + ': Your login was accepted, but the database denied access. The Firebase security rules must be checked for the Somniel admin account.');
            setPeopleReady(true);
            setLoading(false);
          }
        });
        return;
      }
      setError(code.includes('permission-denied')
        ? area + ': Access denied by the database even after refreshing your admin session. No records were deleted. Check the configured database and security policies.'
        : area + ': ' + (error.message || 'Unavailable'));
      setPeopleReady(true);
      setLoading(false);
    };
    const people = onSnapshot(collection(db, 'employees'), { includeMetadataChanges: true }, snapshot => {
      if (!active || (snapshot.metadata.fromCache && snapshot.empty)) return;
      const all = snapshot.docs.map(d => ({ id:d.id, ...d.data() } as Contractor));
      setContractors(all.filter(x => engagementKind(x) === 'contractor'));
      setOtherWorkers(all.filter(x => engagementKind(x) !== 'contractor'));
      setPeopleReady(true);
    }, err => onDenied('Contractor directory', err));
    const work = onSnapshot(collection(db, 'tasks'), snapshot => {
      if (!active) return;
      setProjects(snapshot.docs.map(d => ({ id:d.id, ...d.data() } as ContractorProject))
        .filter(x => x.kind === 'contractor_project').sort((a,b) => a.title.localeCompare(b.title)));
      setLoading(false);
    }, err => onDenied('Projects', err));
    return () => { active = false; people(); work(); };
  }, [authLoading, user?.uid, isAdmin, retryIndex]);
  const completeProjectTitle = async (project: ContractorProject, titleInput: string) => {
    const title = titleInput.trim();
    if (!title) throw Error('Enter a project name to complete this required field.');
    await updateDoc(doc(db, 'tasks', project.id), { title, titleMissing: false, updatedAt: serverTimestamp() });
    void logActivity('Project Details Updated', project.id + ' · Name completed');
  };
    const markAsContractor = async (personId: string) => {
    const person = otherWorkers.find(x => x.id === personId);
    if (!person) throw Error('This team record is no longer available.');
    await updateDoc(doc(db, 'employees', person.id), { 'customFields.engagementType': 'contractor' });
    void logActivity('Contractor Classification Updated', person.name + ' was designated as Contractor in the directory.');
  };
    const create = async (form: FormData) => {
    const titleInput = String(form.get('title') || '').trim();
    const title = titleInput || 'Draft Project ' + new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);
    const budget = Number(form.get('budget') || 0);
    if (!Number.isFinite(budget) || budget < 0) throw Error('Enter a valid nonnegative budget.');
    const result = await addDoc(collection(db, 'tasks'), {
      title, titleMissing: !titleInput, kind: 'contractor_project', description: String(form.get('description') || ''),
      mode: String(form.get('mode') || 'bid'), budget,
      currency: String(form.get('currency') || 'USD').toUpperCase(), dueDate: String(form.get('dueDate') || ''),
      status: 'planned', record: {}, bids: [], completedStages: [], createdAt: serverTimestamp(), updatedAt: serverTimestamp()
    });
    void logActivity('Project Created', title);
    return result.id;
  };
  const assign = async (project: ContractorProject, personId: string, awardedBidId?: string) => {
    const person = contractors.find(x => x.id === personId);
    if (!person) throw Error('Select an existing contractor.');
    if (person.terminated) throw Error('Reactivate this contractor in Employees before assigning new work.');
    if ((project.completedStages || []).length &&
      !window.confirm('Reassigning resets all recorded approvals and payment records. Continue?')) return false;
    await updateDoc(doc(db, 'tasks', project.id), {
      contractorId: person.id, contractorName: person.name, status: 'planned',
      record: !project.contractorId && !(project.completedStages || []).length ? (project.record || {}) : {},
      completedStages: [], bids: (project.bids || []).map(b => ({
        ...b, state: b.id === awardedBidId ? 'awarded' : b.state === 'awarded' ? 'declined' : b.state
      })), updatedAt: serverTimestamp()
    });
    void logActivity('Project Assigned', project.title + ' · ' + person.name);
    return true;
  };
  const bid = async (project: ContractorProject, personId: string, amount: string, note: string) => {
    const person = contractors.find(x => x.id === personId);
    if (!person) throw Error('Choose a contractor.');
    if (project.contractorId) throw Error('Project already assigned.');
    if (!amount || !Number.isFinite(Number(amount)) || Number(amount) < 0) throw Error('Invalid bid amount.');
    const entry: Bid = { id:crypto.randomUUID(), contractorId:person.id, contractorName:person.name,
      amount, currency:project.currency, note, placedAt:today(), state:'submitted' };
    await updateDoc(doc(db,'tasks',project.id),{ bids:[...(project.bids || []),entry], updatedAt:serverTimestamp() });
    void logActivity('Project Bid Recorded', project.title + ' · ' + person.name);
  };
  const save = async (project: ContractorProject, index: number, record: Record<string,string>, approve: boolean) => {
    if (!project.contractorId && approve) throw Error('Assign a contractor before approving a stage. Drafts may be saved without an assignment.');
    const current = project.completedStages || [];
    const next = [0,1,2,3,4].find(i => !current.includes(i)) ?? 5;
    if (index > next) throw Error('Prior stages are incomplete.');
    if (approve) {
      const missing = requiredStageFields(index).filter(field => !String(record[field.key] || '').trim() ||
        (field.type === 'checkbox' && record[field.key] !== 'yes'));
      if (missing.length) throw Error('Required: ' + missing.map(x => x.label).join(', '));
      if (index === 3 && Number(record.invoiceAmount) <= 0) throw Error('Invoice amount must be positive.');
      if (index === 4 && (Number(record.paidAmount) <= 0 ||
        Number(record.paidAmount) !== Number(record.invoiceAmount) ||
        String(record.paidCurrency).toUpperCase() !== String(record.invoiceCurrency).toUpperCase()))
        throw Error('Final receipt must reconcile to the full approved invoice, in the same currency. This form does not support partial payments.');
    }
    // Editing an earlier document invalidates later approvals.
    const completedStages = current.filter(i => i < index);
    if (approve) completedStages.push(index);
    const status = completedStages.includes(4) ? 'completed' : completedStages.includes(1) ? 'in-progress' : 'planned';
    await updateDoc(doc(db,'tasks',project.id),{ record:{ ...record }, completedStages, status, updatedAt:serverTimestamp() });
    void logActivity(approve ? 'Project Stage Approved' : 'Project Draft Saved', project.title + ' · Stage ' + (index+1));
  };
  return { contractors, otherWorkers, peopleReady, projects, loading, error, create, assign, bid, save, markAsContractor, completeProjectTitle, isWorkerIncomplete };
}