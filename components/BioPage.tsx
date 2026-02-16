import React, { useState } from 'react';
import { BioPage as BioPageType, LinkItem } from '../types';
import { Camera, MapPin, Mail, Phone, Instagram, Youtube, Linkedin, ChevronDown, FolderOpen, Folder } from 'lucide-react';
import { saveTestimonial } from '../services/storage';

interface BioPageProps {
  page: BioPageType;
  previewMode?: boolean;
}

export const BioPage: React.FC<BioPageProps> = ({ page, previewMode = false }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [pendingLink, setPendingLink] = useState<LinkItem | null>(null);
  const [formData, setFormData] = useState({ name: '', content: '' });
  
  // State for folders (which folders are expanded)
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});

  const toggleFolder = (id: string) => {
    setExpandedFolders(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleLinkClick = (e: React.MouseEvent, link: LinkItem) => {
    e.preventDefault();
    if (previewMode) return; 

    setPendingLink(link);
    setModalOpen(true);
  };

  const handleTestimonialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingLink) return;

    if (formData.name && formData.content) {
      saveTestimonial({
        pageId: page.id,
        visitorName: formData.name,
        content: formData.content,
        targetLinkTitle: pendingLink.title
      });
    }

    window.open(pendingLink.url, '_blank');
    setModalOpen(false);
    setPendingLink(null);
    setFormData({ name: '', content: '' });
  };

  const handleWhatsappClick = () => {
      if (page.whatsappNumber) {
          window.open(`https://wa.me/${page.whatsappNumber.replace(/[^0-9]/g, '')}`, '_blank');
      }
  };

  // Helper to check if item is expired
  const isExpired = (item: LinkItem) => {
    if (!item.expiresAt) return false;
    return Date.now() > item.expiresAt;
  };

  // Render a single item (recursive for folders)
  const renderItem = (item: LinkItem) => {
    if (!item.isActive || isExpired(item)) return null;

    switch (item.type) {
        case 'header':
            return (
               <div key={item.id} className="mt-8 mb-4 text-center px-4">
                  <h3 className="font-bold text-xl text-[#111827] leading-tight">
                     {item.title}
                  </h3>
                  <div className="flex justify-center gap-1 mt-3">
                     <div className="w-6 h-1 bg-[#111827] rounded-full"></div>
                     <div className="w-12 h-1 bg-[#111827] rounded-full"></div>
                  </div>
               </div>
            );
        
        case 'text_block':
            return (
                <div key={item.id} className="flex gap-4 items-start mb-6 px-2">
                    <div className="w-10 h-10 bg-[#111827] rotate-45 flex items-center justify-center shrink-0 mt-1 rounded-lg shadow-md">
                      <div className="w-2 h-2 bg-white rounded-full -rotate-45"></div>
                    </div>
                    <div>
                      <h3 className="font-bold text-lg mb-1">{item.title}</h3>
                      <p className="text-sm text-gray-600 leading-relaxed">
                          {item.description}
                      </p>
                    </div>
                </div>
            );

        case 'folder':
            const isExpanded = expandedFolders[item.id];
            return (
               <div key={item.id} className="mb-3">
                  <button 
                    onClick={() => toggleFolder(item.id)}
                    className="w-full bg-[#111827] text-white p-4 rounded-xl flex items-center justify-between shadow-lg hover:bg-[#1f2937] transition-all"
                  >
                     <div className="flex items-center gap-3">
                        <Folder className="w-5 h-5 text-white" />
                        <span className="font-bold text-base">{item.title}</span>
                     </div>
                     <ChevronDown className={`w-5 h-5 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {isExpanded && item.children && (
                      <div className="mt-2 ml-4 pl-4 border-l-2 border-gray-200 space-y-2 animate-fade-in">
                          {item.children.map(child => renderItem(child))}
                          {(!item.children || item.children.length === 0) && (
                              <div className="text-gray-400 text-xs italic py-2">Empty folder</div>
                          )}
                      </div>
                  )}
               </div>
            );

        case 'link':
        default:
            return (
                <button
                  key={item.id}
                  onClick={(e) => handleLinkClick(e, item)}
                  className="w-full bg-[#1e293b] text-white p-4 rounded-xl flex items-center justify-between shadow-md hover:bg-[#2d3a52] active:scale-[0.98] transition-all mb-3"
                >
                  <div className="flex items-center gap-4">
                      <Camera className="w-5 h-5 text-white/80" />
                      <span className="font-semibold text-sm text-left">{item.title}</span>
                  </div>
                </button>
            );
    }
  };

  return (
    <div className={`min-h-screen w-full flex flex-col font-sans text-white bg-[#0f172a] overflow-x-hidden ${previewMode ? 'absolute inset-0 overflow-y-auto scrollbar-hide rounded-3xl' : ''}`}>
      
      {/* Fixed Header */}
      <div className="sticky top-0 z-30 bg-white text-[#111827] px-6 py-4 flex justify-center items-center shadow-md">
          <div className="flex items-center gap-2 font-bold text-xl">
            <div className="w-8 h-8 bg-[#111827] rounded-full flex items-center justify-center text-white">
                {/* One Dream Logo Mockup */}
                <div className="flex -space-x-1">
                  <div className="w-3 h-3 rounded-full border-2 border-white"></div>
                  <div className="w-3 h-3 rounded-full bg-white"></div>
                </div>
            </div>
            <span>One Dream</span>
          </div>
          {/* Menu button removed as requested */}
      </div>

      {/* Hero Section */}
      <div className="relative bg-[#111827] pb-12 pt-8 px-6 text-center overflow-hidden">
          <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(#ffffff 2px, transparent 2px)', backgroundSize: '30px 30px' }}></div>
          
          <div className="relative z-10 animate-fade-in-up">
            <h1 className="text-3xl font-extrabold uppercase tracking-wider mb-2">{page.displayName}</h1>
            <h2 className="text-xl font-bold mb-6 text-white">{page.bio.split('\n')[0]}</h2>
            
            <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-gray-400 mb-8 uppercase tracking-widest">
                <span>BERANDA</span>
                <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
                <span>PROJECT</span>
            </div>
          </div>
      </div>

      {/* Content Curve Divider */}
      <div className="w-full h-8 bg-[#f8fafc] rounded-t-[2rem] -mt-6 relative z-10"></div>

      {/* Main Content Area */}
      <div className="bg-[#f8fafc] text-[#1e293b] px-6 pb-20 flex-1">
          
          {/* HERO IMAGE SECTION */}
          <div className="mb-8 flex flex-col items-center animate-fade-in">
            {page.heroImage && (
              <div className="rounded-3xl overflow-hidden shadow-lg mb-6 w-full max-w-sm bg-[#111827] border-4 border-[#111827]">
                <img src={page.heroImage} alt="Hero" className="w-full h-auto object-cover" />
              </div>
            )}

            {/* Hero Text */}
            {page.heroText && (
                <div className="flex items-start gap-4 max-w-sm w-full">
                   <div className="w-10 h-10 bg-[#111827] rotate-45 flex items-center justify-center shrink-0 mt-1 rounded-lg shadow-lg">
                      <div className="w-2 h-2 bg-white rounded-full -rotate-45"></div>
                   </div>
                   <div className="flex-1">
                     <h3 className="font-bold text-lg mb-1 leading-tight">{page.heroText}</h3>
                     <div className="w-0.5 h-8 border-l border-dashed border-gray-300 ml-5 mt-1"></div>
                   </div>
                </div>
            )}
          </div>

          {/* DYNAMIC LIST (Links, Headers, Folders, Text Blocks) */}
          <div className="space-y-2 mb-12 max-w-md mx-auto">
            {page.links.map(item => renderItem(item))}
            
            {page.links.length === 0 && (
              <div className="text-center opacity-50 text-sm py-4">
                No content added yet.
              </div>
            )}
          </div>

          {/* CONSULTATION FOOTER CTA */}
          <div className="bg-blue-50/50 rounded-2xl p-6 text-center max-w-md mx-auto mb-8 border border-blue-100">
             <p className="font-bold text-[#111827] mb-4 leading-relaxed">
               {page.consultationText || "Konsultasi gratis dengan tim kami untuk menemukan jawaban permasalahan Anda!"}
             </p>
             <button 
                onClick={handleWhatsappClick}
                className="bg-[#111827] text-white px-8 py-3 rounded-full font-bold shadow-lg hover:bg-gray-800 transition-colors flex items-center gap-2 mx-auto"
             >
                <Phone className="w-4 h-4" />
                Hubungi Kami
             </button>
          </div>
      </div>

      {/* Footer */}
      <div className="bg-[#111827] text-white px-6 py-10">
          <div className="mb-8">
            <h4 className="font-bold mb-4">Kantor Kami</h4>
            <div className="flex gap-3 items-start mb-4">
                <MapPin className="w-5 h-5 shrink-0 mt-1" />
                <div>
                  <p className="text-sm text-gray-300 font-bold">Ruko Sukses 2 Sumur Pecung</p>
                  <p className="text-sm text-gray-400">(Snap Fun Studio)</p>
                </div>
            </div>
          </div>

          <div className="mb-8">
            <h4 className="font-bold mb-4">Kontak Kami</h4>
            <div className="flex gap-3 items-center mb-3">
                <Mail className="w-5 h-5" />
                <p className="text-sm text-gray-300">onedreamcreativeindonesia@gmail.com</p>
            </div>
            <div className="flex gap-3 items-center">
                <Phone className="w-5 h-5" />
                <p className="text-sm text-gray-300">+628 12 1336 9843</p>
            </div>
          </div>

          <div className="mb-12">
            <h4 className="font-bold mb-4">Ikuti Kami</h4>
            <div className="flex gap-4">
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-[#111827]"><Instagram className="w-4 h-4"/></div>
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-[#111827]"><Youtube className="w-4 h-4"/></div>
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-[#111827]"><Linkedin className="w-4 h-4"/></div>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-6 text-center text-xs text-gray-500">
            © PT One Dream Creative
          </div>
      </div>

      {/* Testimonial Modal */}
      {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-xl w-full max-w-sm p-6 relative shadow-2xl">
                <h2 className="text-center font-bold text-xl text-[#111827] mb-1">Ceritakan Momen Kamu</h2>
                <h3 className="text-center font-bold text-xl text-[#111827] mb-6">Bersama Kami</h3>

                <form onSubmit={handleTestimonialSubmit} className="space-y-4">
                  <div>
                      <label className="block text-sm text-gray-600 mb-1">Nama kamu:</label>
                      <input 
                        required
                        type="text"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-[#111827] focus:outline-none focus:border-[#111827]"
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                      />
                  </div>
                  <div>
                      <label className="block text-sm text-gray-600 mb-1">Apa yang ingin kamu ceritakan:</label>
                      <textarea 
                        required
                        rows={4}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-[#111827] focus:outline-none focus:border-[#111827] resize-none"
                        value={formData.content}
                        onChange={e => setFormData({...formData, content: e.target.value})}
                      />
                  </div>
                  
                  <p className="text-xs text-center text-gray-500 leading-tight">
                      Post foto terbaik kamu dan jangan lupa tag instagram kami @onedreamcreative
                  </p>

                  <div className="flex gap-3 pt-2">
                      <button 
                        type="submit"
                        className="flex-1 bg-[#0f172a] text-white py-2.5 rounded-lg font-bold hover:bg-[#1e293b]"
                      >
                        Kirim
                      </button>
                      <button 
                        type="button"
                        onClick={() => setModalOpen(false)}
                        className="flex-1 bg-gray-200 text-gray-700 py-2.5 rounded-lg font-bold hover:bg-gray-300"
                      >
                        Tutup
                      </button>
                  </div>
                </form>
            </div>
          </div>
      )}

    </div>
  );
};
