import React, { useState, useEffect } from 'react';
import { BioPage, LinkItem, Testimonial } from '../types';
import { BioPage as BioPageComponent } from './BioPage';
import { generateSmartBio, suggestLinkTitle } from '../services/gemini';
import { getAllPages, savePage, createNewPage, deletePage, createId, getTestimonials } from '../services/storage';
import { Sparkles, Plus, Trash2, GripVertical, Layout, ExternalLink, Settings, ArrowLeft, Image as ImageIcon, X, AlertCircle, MessageSquare, ArrowUp, ArrowDown, FolderPlus, Type, Clock, Folder } from 'lucide-react';

interface DashboardProps {
  initialPageId?: string;
  onNavigate: (path: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ initialPageId, onNavigate }) => {
  const [pages, setPages] = useState<BioPage[]>(getAllPages());
  const [editingPageId, setEditingPageId] = useState<string | null>(initialPageId || null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectSlug, setNewProjectSlug] = useState('');
  const [createError, setCreateError] = useState<string | null>(null);

  useEffect(() => { setPages(getAllPages()); }, [editingPageId]); 
  useEffect(() => { setEditingPageId(initialPageId || null); }, [initialPageId]);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);
    if (!newProjectName.trim() || !newProjectSlug.trim()) {
      setCreateError("Name and URL slug are required.");
      return;
    }
    const cleanSlug = newProjectSlug.toLowerCase().replace(/[^a-z0-9-]/g, '-');
    if (pages.some(p => p.slug === cleanSlug)) {
        setCreateError("This URL slug is already taken by another project.");
        return;
    }
    const newPage = createNewPage(cleanSlug, newProjectName);
    setPages(getAllPages());
    setIsModalOpen(false);
    onNavigate(`#/dashboard/${newPage.id}`);
  };

  const handleDeletePage = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this entire project?")) {
      deletePage(id);
      setPages(getAllPages());
      if (editingPageId === id) onNavigate('#/dashboard');
    }
  };

  if (editingPageId) {
    const pageToEdit = pages.find(p => p.id === editingPageId);
    if (!pageToEdit) return <div>Page not found</div>;
    return <PageEditor page={pageToEdit} onBack={() => onNavigate('#/dashboard')} />;
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6 md:p-12 font-sans">
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400 mb-2">GeminiLink</h1>
            <p className="text-gray-400">Manage your Link-in-Bio projects</p>
          </div>
          <button onClick={() => setIsModalOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2 transition-all shadow-lg shadow-indigo-900/20">
            <Plus className="w-5 h-5" /> Create New Project
          </button>
        </header>

        {pages.length === 0 ? (
          <div className="text-center py-24 bg-gray-900/50 rounded-3xl border border-gray-800 border-dashed animate-fade-in"><p className="text-gray-400">No projects. Click create to start.</p></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
            {pages.map(page => (
              <div key={page.id} onClick={() => onNavigate(`#/dashboard/${page.id}`)} className="group bg-gray-900 rounded-2xl p-6 border border-gray-800 hover:border-indigo-500/50 transition-all cursor-pointer hover:shadow-xl hover:shadow-indigo-900/10 relative overflow-hidden">
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                   <button onClick={(e) => handleDeletePage(e, page.id)} className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-900/20 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                </div>
                <div className="flex items-center gap-4 mb-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold bg-[#111827] text-white shadow-inner overflow-hidden border border-gray-700`}>{page.displayName.slice(0, 1)}</div>
                  <div>
                    <h3 className="font-bold text-lg text-white group-hover:text-indigo-400 transition-colors truncate max-w-[150px]">{page.displayName}</h3>
                    <div className="flex items-center gap-1 text-xs text-gray-500 font-mono"><span>/{page.slug}</span></div>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-800"><span className="text-sm text-gray-500">{page.links.length} Items</span></div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-gray-900 rounded-2xl border border-gray-800 w-full max-w-md shadow-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-6">New Project</h2>
            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <input type="text" placeholder="Project Name" className="w-full bg-gray-950 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none" value={newProjectName} onChange={(e) => { setNewProjectName(e.target.value); if (!newProjectSlug) setNewProjectSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-')); }} autoFocus />
              <input type="text" placeholder="slug" className="w-full bg-gray-950 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none" value={newProjectSlug} onChange={(e) => setNewProjectSlug(e.target.value)} />
              {createError && <div className="text-red-400 text-sm">{createError}</div>}
              <div className="flex gap-3 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2 bg-gray-800 rounded-lg">Cancel</button>
                <button type="submit" className="flex-1 py-2 bg-indigo-600 rounded-lg">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// --- CONTENT EDITOR (Recursive for Folders) ---

interface ContentListProps {
  items: LinkItem[];
  onChange: (items: LinkItem[]) => void;
  depth?: number;
}

const ContentList: React.FC<ContentListProps> = ({ items, onChange, depth = 0 }) => {
  // State for the "Add New" form
  const [isAdding, setIsAdding] = useState<'link' | 'header' | 'folder' | 'text' | null>(null);
  
  // Form Inputs
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [expiresAtDate, setExpiresAtDate] = useState('');

  // Editing logic (State to track which item is being edited would go here, 
  // but for brevity we allow inline text edits and direct deletion)
  
  const handleAdd = () => {
    if (!title) return;
    
    const expiresAt = expiresAtDate ? new Date(expiresAtDate).getTime() : undefined;

    const newItem: LinkItem = {
      id: createId(),
      type: isAdding === 'text' ? 'text_block' : isAdding === 'header' ? 'header' : isAdding === 'folder' ? 'folder' : 'link',
      title,
      url: isAdding === 'link' ? (url.startsWith('http') ? url : `https://${url}`) : '',
      description: isAdding === 'text' ? description : '',
      children: isAdding === 'folder' ? [] : undefined,
      isActive: true,
      expiresAt
    };
    
    onChange([...items, newItem]);
    resetForm();
  };

  const resetForm = () => {
    setIsAdding(null);
    setTitle('');
    setUrl('');
    setDescription('');
    setExpiresAtDate('');
  };

  const updateItem = (id: string, updates: Partial<LinkItem>) => {
    onChange(items.map(i => i.id === id ? { ...i, ...updates } : i));
  };

  const deleteItem = (id: string) => {
    if(confirm("Remove this item?")) onChange(items.filter(i => i.id !== id));
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const newItems = [...items];
    if (direction === 'up' && index > 0) {
      [newItems[index], newItems[index - 1]] = [newItems[index - 1], newItems[index]];
    } else if (direction === 'down' && index < newItems.length - 1) {
      [newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]];
    }
    onChange(newItems);
  };

  // State for which folder is currently being "drilled into" in the editor
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);

  if (editingFolderId) {
    const folder = items.find(i => i.id === editingFolderId);
    if (!folder) { setEditingFolderId(null); return null; }

    return (
      <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-800">
        <div className="flex items-center gap-2 mb-4 text-sm text-gray-400">
           <button onClick={() => setEditingFolderId(null)} className="hover:text-white flex items-center gap-1"><ArrowLeft className="w-4 h-4"/> Back</button>
           <span>/ {folder.title}</span>
        </div>
        <h3 className="font-bold text-white mb-4">Editing Folder Contents</h3>
        <ContentList 
          items={folder.children || []} 
          onChange={(newChildren) => updateItem(folder.id, { children: newChildren })}
          depth={depth + 1}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-2">
         <button onClick={() => setIsAdding('link')} className={`py-2 text-xs font-bold rounded border ${isAdding === 'link' ? 'bg-indigo-600 border-indigo-600' : 'border-gray-700 hover:bg-gray-800'}`}>Link</button>
         <button onClick={() => setIsAdding('folder')} className={`py-2 text-xs font-bold rounded border ${isAdding === 'folder' ? 'bg-indigo-600 border-indigo-600' : 'border-gray-700 hover:bg-gray-800'}`}>Folder</button>
         <button onClick={() => setIsAdding('header')} className={`py-2 text-xs font-bold rounded border ${isAdding === 'header' ? 'bg-indigo-600 border-indigo-600' : 'border-gray-700 hover:bg-gray-800'}`}>Header</button>
         <button onClick={() => setIsAdding('text')} className={`py-2 text-xs font-bold rounded border ${isAdding === 'text' ? 'bg-indigo-600 border-indigo-600' : 'border-gray-700 hover:bg-gray-800'}`}>Text</button>
      </div>

      {isAdding && (
         <div className="bg-gray-900 p-4 rounded-xl border border-gray-700 animate-fade-in">
            <h4 className="text-xs font-bold uppercase text-gray-500 mb-3">New {isAdding}</h4>
            <div className="space-y-3">
               <input className="w-full bg-gray-950 border border-gray-700 rounded px-3 py-2 text-sm" placeholder="Title / Label" value={title} onChange={e => setTitle(e.target.value)} autoFocus />
               
               {isAdding === 'link' && (
                 <input className="w-full bg-gray-950 border border-gray-700 rounded px-3 py-2 text-sm" placeholder="https://..." value={url} onChange={e => setUrl(e.target.value)} />
               )}
               
               {isAdding === 'text' && (
                 <textarea className="w-full bg-gray-950 border border-gray-700 rounded px-3 py-2 text-sm" rows={3} placeholder="Description text..." value={description} onChange={e => setDescription(e.target.value)} />
               )}

               {(isAdding === 'link' || isAdding === 'folder') && (
                 <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <input type="datetime-local" className="bg-gray-950 border border-gray-700 rounded px-2 py-1 text-xs text-white" value={expiresAtDate} onChange={e => setExpiresAtDate(e.target.value)} />
                    <span className="text-xs text-gray-500">Auto-delete (optional)</span>
                 </div>
               )}

               <div className="flex gap-2 pt-2">
                  <button onClick={resetForm} className="px-3 py-1.5 bg-gray-800 text-xs rounded">Cancel</button>
                  <button onClick={handleAdd} className="flex-1 py-1.5 bg-indigo-600 text-xs rounded font-bold">Add Item</button>
               </div>
            </div>
         </div>
      )}

      <div className="space-y-2">
         {items.map((item, idx) => (
           <div key={item.id} className="bg-gray-900 border border-gray-800 p-3 rounded-xl flex items-center gap-3 group hover:border-indigo-500/30">
              <div className="flex flex-col gap-1">
                  <button onClick={() => moveItem(idx, 'up')} disabled={idx===0} className="text-gray-600 hover:text-white disabled:opacity-10"><ArrowUp className="w-3 h-3"/></button>
                  <button onClick={() => moveItem(idx, 'down')} disabled={idx===items.length-1} className="text-gray-600 hover:text-white disabled:opacity-10"><ArrowDown className="w-3 h-3"/></button>
              </div>
              
              <div className="flex-1 min-w-0">
                 <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${item.type === 'folder' ? 'bg-yellow-500/20 text-yellow-500' : item.type === 'header' ? 'bg-purple-500/20 text-purple-500' : item.type === 'text_block' ? 'bg-green-500/20 text-green-500' : 'bg-blue-500/20 text-blue-500'}`}>
                      {item.type === 'text_block' ? 'Text' : item.type}
                    </span>
                    {item.expiresAt && (
                      <span className="flex items-center gap-1 text-[10px] text-red-400 bg-red-900/20 px-1.5 py-0.5 rounded">
                        <Clock className="w-3 h-3" /> {new Date(item.expiresAt).toLocaleDateString()}
                      </span>
                    )}
                 </div>
                 <input className="bg-transparent font-medium text-white w-full focus:outline-none text-sm" value={item.title} onChange={e => updateItem(item.id, { title: e.target.value })} />
                 
                 {item.type === 'text_block' && (
                    <input className="bg-transparent text-xs text-gray-500 w-full focus:outline-none" value={item.description || ''} onChange={e => updateItem(item.id, { description: e.target.value })} placeholder="Description..." />
                 )}
                 {item.type === 'link' && (
                    <input className="bg-transparent text-xs text-gray-500 w-full focus:outline-none" value={item.url} onChange={e => updateItem(item.id, { url: e.target.value })} />
                 )}
              </div>

              {item.type === 'folder' && (
                 <button onClick={() => setEditingFolderId(item.id)} className="p-2 bg-gray-800 hover:bg-gray-700 rounded text-xs font-bold text-gray-300">
                    Edit Content ({item.children?.length || 0})
                 </button>
              )}

              <button onClick={() => deleteItem(item.id)} className="p-2 text-gray-600 hover:text-red-400 hover:bg-red-400/10 rounded"><Trash2 className="w-4 h-4" /></button>
           </div>
         ))}
         {items.length === 0 && !isAdding && <div className="text-center text-gray-600 text-sm py-4">No items yet.</div>}
      </div>
    </div>
  );
};

// --- PAGE EDITOR SUB-COMPONENT ---

const PageEditor: React.FC<{ page: BioPage, onBack: () => void }> = ({ page: initialPage, onBack }) => {
  const [page, setPage] = useState<BioPage>(initialPage);
  const [activeTab, setActiveTab] = useState<'content' | 'design' | 'testimonials' | 'settings'>('content');
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);

  useEffect(() => { savePage(page); }, [page]);
  useEffect(() => { if (activeTab === 'testimonials') setTestimonials(getTestimonials(page.id)); }, [activeTab, page.id]);

  return (
    <div className="flex h-screen bg-gray-950 text-white overflow-hidden font-sans">
      {/* LEFT PANEL */}
      <div className="w-full md:w-1/2 lg:w-5/12 flex flex-col border-r border-gray-800 bg-gray-950 relative z-20 shadow-2xl">
        <div className="p-4 border-b border-gray-800 flex items-center justify-between">
          <button onClick={onBack} className="flex items-center gap-2 text-gray-400 hover:text-white text-sm font-medium"><ArrowLeft className="w-4 h-4" /> Back</button>
          <div className="flex items-center gap-3">
             <span className="text-xs text-gray-500 border border-gray-800 px-2 py-1 rounded">/{page.slug}</span>
             <button onClick={() => window.open(`${window.location.origin}${window.location.pathname}#/p/${page.slug}`, '_blank')} className="flex items-center gap-1 px-3 py-1.5 bg-indigo-500/10 text-indigo-400 rounded-lg text-xs font-bold"><ExternalLink className="w-3 h-3" /> Live</button>
          </div>
        </div>

        <div className="flex p-3 gap-1 border-b border-gray-800 bg-gray-900/30">
          {['content', 'design', 'testimonials', 'settings'].map(tab => (
             <button key={tab} onClick={() => setActiveTab(tab as any)} className={`flex-1 py-2.5 rounded-lg text-sm font-medium capitalize ${activeTab === tab ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-white'}`}>{tab}</button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
          {activeTab === 'content' && (
             <ContentList items={page.links} onChange={(newLinks) => setPage({ ...page, links: newLinks })} />
          )}

          {activeTab === 'design' && (
            <div className="space-y-6">
               <div className="space-y-3">
                  <label className="text-xs font-bold text-gray-500 uppercase">Hero Section</label>
                  <input className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm" placeholder="Hero Image URL" value={page.heroImage || ''} onChange={e => setPage({...page, heroImage: e.target.value})} />
                  <input className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm font-bold" placeholder="Hero Text (e.g. Download Now)" value={page.heroText || ''} onChange={e => setPage({...page, heroText: e.target.value})} />
               </div>
               <div className="space-y-3 pt-4 border-t border-gray-800">
                  <label className="text-xs font-bold text-gray-500 uppercase">Consultation Footer</label>
                  <textarea className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm" rows={2} placeholder="Consultation Text..." value={page.consultationText || ''} onChange={e => setPage({...page, consultationText: e.target.value})} />
                  <input className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm" placeholder="WhatsApp Number (e.g. 62812...)" value={page.whatsappNumber || ''} onChange={e => setPage({...page, whatsappNumber: e.target.value})} />
               </div>
               <div className="space-y-3 pt-4 border-t border-gray-800">
                   <label className="text-xs font-bold text-gray-500 uppercase">Profile Info</label>
                   <input className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm" placeholder="Display Name" value={page.displayName} onChange={e => setPage({...page, displayName: e.target.value})} />
                   <textarea className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm" rows={2} placeholder="Bio" value={page.bio} onChange={e => setPage({...page, bio: e.target.value})} />
               </div>
            </div>
          )}

          {activeTab === 'testimonials' && (
             <div className="space-y-4">
                <h3 className="text-sm font-bold text-white mb-2">{testimonials.length} Testimonials</h3>
                {testimonials.map(t => (
                  <div key={t.id} className="bg-gray-900 p-4 rounded-xl border border-gray-800">
                    <div className="flex justify-between text-xs text-gray-500 mb-2"><span>{t.visitorName}</span><span>{new Date(t.timestamp).toLocaleDateString()}</span></div>
                    <p className="text-gray-300 text-sm italic">"{t.content}"</p>
                    <div className="text-xs text-indigo-400 mt-2">Source: {t.targetLinkTitle}</div>
                  </div>
                ))}
             </div>
          )}

          {activeTab === 'settings' && (
             <div className="bg-gray-900 p-5 rounded-xl border border-gray-800">
                <label className="block text-xs font-medium text-gray-400 mb-2">URL Slug</label>
                <div className="flex items-center gap-2 bg-gray-950 p-3 rounded-lg border border-gray-700">
                   <span className="text-gray-500 text-sm">/p/</span>
                   <input className="bg-transparent flex-1 text-white focus:outline-none text-sm" value={page.slug} onChange={e => setPage({...page, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-')})} />
                </div>
             </div>
          )}
        </div>
      </div>

      {/* RIGHT PREVIEW */}
      <div className="hidden md:flex flex-1 bg-gray-900 items-center justify-center p-8 relative overflow-hidden">
         <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#4b5563 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
         <div className="relative w-[360px] h-[720px] border-[10px] border-gray-950 rounded-[3rem] bg-gray-950 shadow-2xl overflow-hidden ring-1 ring-gray-800 flex flex-col">
            <div className="w-full h-full bg-black overflow-hidden relative z-10"><BioPageComponent page={page} previewMode={true} /></div>
         </div>
      </div>
    </div>
  );
};
