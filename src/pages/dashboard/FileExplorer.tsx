import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { db, handleFirestoreError, OperationType, logActivity } from '../../firebase';
import { collection, query, where, onSnapshot, addDoc, deleteDoc, doc, Timestamp } from 'firebase/firestore';
import { 
  Files, 
  FolderPlus, 
  FilePlus, 
  Search, 
  Download, 
  Trash2, 
  File, 
  Folder,
  ChevronRight,
  LayoutGrid,
  List,
  Loader2,
  ExternalLink,
  ArrowLeft,
  AlertCircle
} from 'lucide-react';
import { cn, formatDate } from '../../lib/utils';
import Modal from '../../components/ui/Modal';

interface FileMetadata {
  id: string;
  name: string;
  type: 'file' | 'folder';
  size?: number;
  parentId: string | null;
  ownerId: string;
  url?: string;
  createdAt: any;
}

const FileExplorer: React.FC = () => {
  const { profile } = useAuth();
  const [files, setFiles] = useState<FileMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [folderHistory, setFolderHistory] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Modal states
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    if (!profile) return;

    const q = query(
      collection(db, 'files'),
      where('ownerId', '==', profile.uid),
      where('parentId', '==', currentFolder)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FileMetadata));
      setFiles(docs);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'files');
    });

    return () => unsubscribe();
  }, [profile, currentFolder]);

  const handleCreateFolder = async () => {
    if (!newFolderName || !profile) return;

    try {
      await addDoc(collection(db, 'files'), {
        name: newFolderName,
        type: 'folder',
        parentId: currentFolder,
        ownerId: profile.uid,
        createdAt: Timestamp.now()
      });
      await logActivity('Folder Created', `Created folder "${newFolderName}" in ${currentFolder || 'Root'}.`);
      setNewFolderName('');
      setIsFolderModalOpen(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'files');
    }
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleUploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('https://file.io', {
        method: 'POST',
        body: formData
      });
      
      const result = await response.json();
      
      if (result.success) {
        await addDoc(collection(db, 'files'), {
          name: file.name,
          type: 'file',
          size: file.size,
          parentId: currentFolder,
          ownerId: profile.uid,
          url: result.link,
          createdAt: Timestamp.now()
        });
        await logActivity('File Uploaded', `Uploaded file "${file.name}" to ${currentFolder || 'Root'}.`);
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const confirmDelete = async () => {
    if (!fileToDelete) return;
    try {
      await deleteDoc(doc(db, 'files', fileToDelete.id));
      await logActivity('File Deleted', `Deleted "${fileToDelete.name}" from file explorer.`);
      setFileToDelete(null);
      setIsDeleteModalOpen(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'files');
    }
  };

  const navigateToFolder = (folderId: string | null) => {
    if (folderId !== currentFolder) {
      if (currentFolder) setFolderHistory([...folderHistory, currentFolder]);
      setCurrentFolder(folderId);
    }
  };

  const goBack = () => {
    const prev = [...folderHistory];
    const last = prev.pop();
    setFolderHistory(prev);
    setCurrentFolder(last || null);
  };

  const filteredFiles = files.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <section className="relative min-h-screen">
      <div className="relative z-10 space-y-2 pt-6 pb-3">
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-2 mb-3">
          <div className="space-y-2">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-2 text-[8px] font-bold uppercase tracking-[0.4em] text-accent/60"
            >
              <Files className="w-3 h-3" />
              <span>Digital Assets</span>
            </motion.div>
            <div className="space-y-0.5">
              <h1 className="text-lg md:text-xl font-serif font-bold tracking-[-0.04em] text-fg italic leading-tight">
                File <span className="text-accent not-italic font-light">Explorer</span>
              </h1>
              <div className="flex items-center space-x-2 text-[8px] uppercase tracking-[0.3em] font-bold text-muted/40">
                <button 
                  onClick={() => navigateToFolder(null)} 
                  className={cn("hover:text-accent transition-colors", !currentFolder && "text-accent/80")}
                >
                  Root
                </button>
                {currentFolder && (
                  <>
                    <ChevronRight className="w-2 h-2" />
                    <span className="text-accent/60">Subdirectory</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-1.5 w-full lg:w-auto">
            {currentFolder && (
              <button
                onClick={goBack}
                className="p-1.5 bg-white/[0.02] border border-white/5 rounded-lg text-muted/60 hover:text-fg transition-all hover:border-accent/30 backdrop-blur-xl group"
              >
                <ArrowLeft className="w-3 h-3 group-hover:-translate-x-0.5 transition-transform" />
              </button>
            )}
            <button
              onClick={() => setIsFolderModalOpen(true)}
              className="flex-1 lg:flex-none flex items-center justify-center space-x-1.5 bg-white/[0.02] hover:bg-white/[0.05] text-fg px-2 py-1 rounded-lg text-[7px] font-bold border border-white/5 transition-all hover:border-accent/30 tracking-[0.1em] uppercase backdrop-blur-xl"
            >
              <FolderPlus className="w-2.5 h-2.5 text-accent" />
              <span>New Folder</span>
            </button>
            <button
              onClick={handleFileSelect}
              disabled={uploading}
              className="flex-1 lg:flex-none flex items-center justify-center space-x-1.5 bg-accent hover:opacity-90 text-bg px-3 py-1 rounded-lg text-[7px] font-bold tracking-[0.1em] uppercase shadow-2xl shadow-accent/20 transition-all disabled:opacity-50 active:scale-95"
            >
              {uploading ? <Loader2 className="w-2.5 h-2.5 animate-spin" /> : <FilePlus className="w-2.5 h-2.5" />}
              <span>{uploading ? 'Processing...' : 'Upload'}</span>
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleUploadFile} 
              className="hidden" 
            />
          </div>
        </header>

        {/* Toolbar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-2 bg-white/[0.02] p-2 rounded-xl border border-white/5 backdrop-blur-3xl shadow-2xl shadow-black/20 mb-3">
          <div className="relative w-full md:w-[18rem]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-2.5 h-2.5 text-muted/40" />
            <input
              type="text"
              placeholder="Search archives..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/[0.02] border border-white/10 rounded-lg py-1 pl-8 pr-3 text-[7px] text-fg focus:outline-none focus:border-accent/40 transition-all font-medium placeholder:text-muted/20"
            />
          </div>
          <div className="flex items-center space-x-1 bg-white/[0.02] p-0.5 rounded-lg border border-white/10">
            <button
              onClick={() => setView('grid')}
              className={cn("p-1.5 rounded-md transition-all duration-500", view === 'grid' ? "bg-accent text-bg shadow-xl shadow-accent/30" : "text-muted/40 hover:text-fg")}
            >
              <LayoutGrid className="w-3 h-3" />
            </button>
            <button
              onClick={() => setView('list')}
              className={cn("p-1.5 rounded-md transition-all duration-500", view === 'list' ? "bg-accent text-bg shadow-xl shadow-accent/30" : "text-muted/40 hover:text-fg")}
            >
              <List className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Files Grid/List */}
        {loading ? (
          <div className="h-64 flex flex-col items-center justify-center space-y-2">
            <Loader2 className="w-8 h-8 animate-spin text-accent/40" />
            <span className="text-[8px] font-bold uppercase tracking-[0.5em] text-muted/20">Accessing Archives</span>
          </div>
        ) : filteredFiles.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-muted/40 space-y-4">
            <div className="w-20 h-20 bg-white/[0.02] rounded-full flex items-center justify-center border border-white/5 shadow-inner relative">
              <div className="absolute inset-0 bg-accent/5 blur-xl rounded-full" />
              <Files className="w-8 h-8 opacity-10 relative z-10" />
            </div>
            <div className="text-center space-y-1">
              <p className="text-[9px] font-bold uppercase tracking-[0.4em]">No archives found</p>
              <p className="text-[10px] font-medium opacity-40 italic">Your digital vault is currently empty.</p>
            </div>
          </div>
        ) : view === 'grid' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            <AnimatePresence mode="popLayout">
              {filteredFiles.map((file) => (
                <motion.div
                  key={file.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  className="group relative p-2.5 rounded-xl bg-white/[0.02] border border-white/5 hover:border-accent/40 transition-all duration-700 cursor-pointer text-center backdrop-blur-2xl hover:shadow-2xl hover:shadow-accent/5 hover:-translate-y-0.5"
                  onClick={() => file.type === 'folder' && navigateToFolder(file.id)}
                >
                  <div className="absolute top-2 right-2 flex space-x-0.5 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-[-2px] group-hover:translate-y-0 z-20">
                    {file.url && (
                      <a 
                        href={file.url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        onClick={(e) => e.stopPropagation()}
                        className="p-1 text-muted/60 hover:text-accent transition-all rounded-md hover:bg-white/10 border border-white/5"
                      >
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                    <button 
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        setFileToDelete({ id: file.id, name: file.name });
                        setIsDeleteModalOpen(true);
                      }} 
                      className="p-1 text-muted/60 hover:text-red-500 transition-all rounded-md hover:bg-white/10 border border-white/5"
                    >
                      <Trash2 className="w-2.5 h-2.5" />
                    </button>
                  </div>
                  
                  <div className="w-8 h-8 mx-auto mb-2 flex items-center justify-center relative">
                    <div className="absolute inset-0 bg-accent/5 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                    {file.type === 'folder' ? (
                      <Folder className="w-5 h-5 text-accent/20 group-hover:text-accent transition-all duration-700 transform group-hover:scale-110 relative z-10" />
                    ) : (
                      <File className="w-5 h-5 text-accent/10 group-hover:text-accent/40 transition-all duration-700 transform group-hover:scale-110 relative z-10" />
                    )}
                  </div>
                  
                  <p className="text-xs font-serif font-bold text-fg truncate px-0.5 mb-0.5 tracking-tight group-hover:text-accent transition-colors duration-500 italic">{file.name}</p>
                  <p className="text-[6px] text-muted/40 uppercase tracking-[0.3em] font-bold">
                    {file.type === 'folder' ? 'Directory' : `${Math.round((file.size || 0) / 1024)} KB`}
                  </p>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="bg-white/[0.02] rounded-xl border border-white/5 overflow-hidden overflow-x-auto backdrop-blur-3xl shadow-2xl shadow-black/20">
            <table className="w-full text-left min-w-[600px]">
              <thead>
                <tr className="border-b border-white/5 text-[7px] font-bold uppercase tracking-[0.4em] text-muted/30">
                  <th className="px-3 py-2">Asset Name</th>
                  <th className="px-3 py-2">Classification</th>
                  <th className="px-3 py-2">Volume</th>
                  <th className="px-3 py-2">Archived Date</th>
                  <th className="px-3 py-2 text-right">Operations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredFiles.map((file) => (
                  <tr key={file.id} className="group hover:bg-white/[0.03] transition-all duration-500">
                    <td className="px-3 py-2">
                      <div className="flex items-center space-x-2 cursor-pointer" onClick={() => file.type === 'folder' && navigateToFolder(file.id)}>
                        <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-accent/40 transition-all duration-500 shadow-inner relative">
                          <div className="absolute inset-0 bg-accent/5 blur-lg rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                          {file.type === 'folder' ? <Folder className="w-3.5 h-3.5 text-accent/60 relative z-10" /> : <File className="w-3.5 h-3.5 text-accent/30 relative z-10" />}
                        </div>
                        <span className="text-sm font-serif font-bold text-fg tracking-tight group-hover:text-accent transition-colors duration-500 italic">{file.name}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-[7px] text-muted/40 uppercase tracking-[0.2em] font-bold">{file.type}</td>
                    <td className="px-3 py-2 text-[7px] text-muted/40 font-bold tracking-widest">{file.type === 'file' ? `${Math.round((file.size || 0) / 1024)} KB` : '--'}</td>
                    <td className="px-3 py-2 text-[7px] text-muted/40 font-bold tracking-widest">{formatDate(file.createdAt)}</td>
                    <td className="px-3 py-2 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        {file.url && (
                          <a 
                            href={file.url} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="p-1.5 text-muted/40 hover:text-accent transition-all rounded-lg hover:bg-white/10 border border-white/5 hover:border-accent/20"
                          >
                            <Download className="w-3 h-3" />
                          </a>
                        )}
                        <button 
                          onClick={() => {
                            setFileToDelete({ id: file.id, name: file.name });
                            setIsDeleteModalOpen(true);
                          }} 
                          className="p-1.5 text-muted/40 hover:text-red-500 transition-all rounded-lg hover:bg-white/10 border border-white/5 hover:border-red-500/20"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Modals */}
        <Modal
          isOpen={isFolderModalOpen}
          onClose={() => setIsFolderModalOpen(false)}
          title="Create New Directory"
        >
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[8px] uppercase tracking-[0.3em] font-bold text-muted/40">Directory Name</label>
              <input
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="e.g. Archive 2026"
                className="w-full bg-white/[0.02] border border-white/10 rounded-xl py-2.5 px-4 text-fg focus:outline-none focus:border-accent/40 transition-all font-serif italic text-sm"
                autoFocus
              />
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setIsFolderModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl text-[8px] font-bold uppercase tracking-[0.2em] text-muted/60 hover:text-fg transition-colors border border-white/5"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateFolder}
                className="flex-1 py-2.5 bg-accent text-bg rounded-xl text-[8px] font-bold uppercase tracking-[0.2em] shadow-xl shadow-accent/20 hover:opacity-90 transition-all active:scale-95"
              >
                Create Folder
              </button>
            </div>
          </div>
        </Modal>

        <Modal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          title="Confirm Deletion"
          className="max-w-xs"
        >
          <div className="space-y-4 text-center">
            <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mx-auto border border-red-500/20">
              <AlertCircle className="w-6 h-6 text-red-500" />
            </div>
            <div className="space-y-1.5">
              <p className="text-sm font-serif font-bold text-fg tracking-tight italic">Permanently delete archive?</p>
              <p className="text-[10px] text-muted/60 leading-relaxed">
                You are about to remove <span className="text-fg font-bold">"{fileToDelete?.name}"</span>. This action is irreversible.
              </p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl text-[8px] font-bold uppercase tracking-[0.2em] text-muted/60 hover:text-fg transition-colors border border-white/5"
              >
                Retain
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 py-2.5 bg-red-500 text-white rounded-xl text-[8px] font-bold uppercase tracking-[0.2em] shadow-xl shadow-red-500/20 hover:opacity-90 transition-all active:scale-95"
              >
                Delete Asset
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </section>
  );
};

export default FileExplorer;
