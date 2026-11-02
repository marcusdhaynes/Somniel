import { useEffect, useState } from 'react';
import { addDoc, collection, doc, onSnapshot, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db, logActivity } from '../firebase';
import { Bid, ContractorProject, requiredStageFields } from './projectDocuments';
export type Contractor = { id: string; name: string; position: string; email?: string; terminated?: boolean; customFields?: Record<string, string> };
export const today = () => new Date().toISOString().slice(0,10);
export const money = (amount: number | string, code = 'USD') => {
  const n = Number(amount);
  if (!Number.isFinite(n)) return String(amount);
  try { return new Intl.NumberFormat('en-US', { style: 'currency', currency: code, maximumFractionDigits: 2 }).format(n); }
  catch { return code + ' ' + n.toFixed(2); }
};
export function useProjectStore() {
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [projects, setProjects] = useState<ContractorProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    const people = onSnapshot(collection(db, 'employees'), snapshot => setContractors(snapshot.docs
      .map(d => ({ id:d.id, ...d.data() } as Contractor))
      .filter(x => x.customFields?.engagementType === 'contractor' && !x.terminated)),
      err => setError('Contractors: ' + err.message));
    // Project data is admin-private; existing tasks validation supports project metadata.
    const work = onSnapshot(collection(db, 'tasks'), snapshot => {
      setProjects(snapshot.docs.map(d => ({ id:d.id, ...d.data() } as ContractorProject))
        .filter(x => x.kind === 'contractor_project').sort((a,b) => a.title.localeCompare(b.title)));
      setLoading(false);
    }, err => { setError('Projects: ' + err.message); setLoading(false); });
    return () => { people(); work(); };
  }, []);
  const create = async (form: FormData) => {
    const title = String(form.get('title') || '').trim();
    const budget = Number(form.get('budget') || 0);
    if (!title || !Number.isFinite(budget) || budget < 0) throw Error('Enter a project title and valid budget.');
    const result = await addDoc(collection(db, 'tasks'), {
      title, kind: 'contractor_project', description: String(form.get('description') || ''),
      mode: String(form.get('mode') || 'bid'), budget,
      currency: String(form.get('currency') || 'USD').toUpperCase(), dueDate: String(form.get('dueDate') || ''),
      status: 'planned', record: {}, bids: [], completedStages: [], createdAt: serverTimestamp(), updatedAt: serverTimestamp()
    });
    void logActivity('Project Created', title);
    return result.id;
  };
  const assign = async (project: ContractorProject, personId: string, awardedBidId?: string) => {
    const person = contractors.find(x => x.id === personId);
    if (!person) throw Error('Select an active contractor.');
    if ((project.completedStages || []).length &&
      !window.confirm('Reassigning resets all recorded approvals and payment records. Continue?')) return false;
    await updateDoc(doc(db, 'tasks', project.id), {
      contractorId: person.id, contractorName: person.name, status: 'planned',
      record: {}, completedStages: [], bids: (project.bids || []).map(b => ({
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
    if (!project.contractorId) throw Error('Assign a contractor first.');
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
        throw Error('Final receipt must reconcile to the full approved invoice, in the same currency. Record partial payments separately before final approval.');
    }
    // Editing an earlier document invalidates later approvals.
    const completedStages = current.filter(i => i < index);
    if (approve) completedStages.push(index);
    const status = completedStages.includes(4) ? 'completed' : completedStages.includes(1) ? 'in-progress' : 'planned';
    await updateDoc(doc(db,'tasks',project.id),{ record:{ ...record }, completedStages, status, updatedAt:serverTimestamp() });
    void logActivity(approve ? 'Project Stage Approved' : 'Project Draft Saved', project.title + ' · Stage ' + (index+1));
  };
  return { contractors, projects, loading, error, create, assign, bid, save };
}