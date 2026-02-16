import { BioPage, LinkItem, Testimonial } from '../types';

const PAGES_KEY = 'gemini_bio_pages_v2';
const TESTIMONIALS_KEY = 'gemini_bio_testimonials_v1';

const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

const DEFAULT_PAGE: BioPage = {
  id: 'default',
  slug: 'my-page',
  displayName: 'REFORTY',
  bio: 'SMKN 1 Kota Serang',
  avatarUrl: '',
  heroImage: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
  heroText: 'Download Sebelum Terlambat',
  consultationText: 'Konsultasi gratis dengan tim kami untuk menemukan jawaban permasalahan Anda!',
  whatsappNumber: '6281234567890',
  theme: 'onedream',
  links: [
    {
      id: 'info-1',
      type: 'text_block',
      title: 'Didownload Bukan Di Pindah',
      description: 'Mohon untuk mendownload file agar tersimpan dalam ponsel/laptop masing-masing.',
      url: '',
      isActive: true
    },
    {
      id: 'header-1',
      type: 'header',
      title: 'Klik Tombol Dibawah untuk mendapatkan Foto kamu ya :)',
      url: '',
      isActive: true
    },
    {
      id: 'folder-1',
      type: 'folder',
      title: 'Day 1 - Tingkat SMA',
      url: '',
      isActive: true,
      children: [
         {
           id: 'link-1',
           type: 'link',
           title: 'Foto Pembagian Piala',
           url: 'https://google.com',
           isActive: true
         }
      ]
    }
  ],
  createdAt: Date.now(),
};

export const getAllPages = (): BioPage[] => {
  try {
    const stored = localStorage.getItem(PAGES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Failed to load pages", error);
    return [];
  }
};

export const getPageBySlug = (slug: string): BioPage | undefined => {
  const pages = getAllPages();
  return pages.find(p => p.slug === slug);
};

export const getPageById = (id: string): BioPage | undefined => {
  const pages = getAllPages();
  return pages.find(p => p.id === id);
};

export const savePage = (updatedPage: BioPage): void => {
  const pages = getAllPages();
  const index = pages.findIndex(p => p.id === updatedPage.id);
  
  if (index >= 0) {
    pages[index] = updatedPage;
  } else {
    pages.push(updatedPage);
  }
  
  localStorage.setItem(PAGES_KEY, JSON.stringify(pages));
};

export const createNewPage = (slug: string, name: string): BioPage => {
  const newPage: BioPage = {
    ...DEFAULT_PAGE,
    id: generateId(),
    slug: slug.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
    displayName: name,
    createdAt: Date.now(),
    links: [] // Start empty for new pages
  };
  savePage(newPage);
  return newPage;
};

export const deletePage = (id: string): void => {
  const pages = getAllPages().filter(p => p.id !== id);
  localStorage.setItem(PAGES_KEY, JSON.stringify(pages));
};

// --- Testimonials ---

export const getTestimonials = (pageId: string): Testimonial[] => {
  try {
    const stored = localStorage.getItem(TESTIMONIALS_KEY);
    const all: Testimonial[] = stored ? JSON.parse(stored) : [];
    return all.filter(t => t.pageId === pageId).sort((a, b) => b.timestamp - a.timestamp);
  } catch (error) {
    return [];
  }
};

export const saveTestimonial = (testimonial: Omit<Testimonial, 'id' | 'timestamp'>): void => {
  const stored = localStorage.getItem(TESTIMONIALS_KEY);
  const all: Testimonial[] = stored ? JSON.parse(stored) : [];
  
  const newTestimonial: Testimonial = {
    ...testimonial,
    id: generateId(),
    timestamp: Date.now(),
  };
  
  all.push(newTestimonial);
  localStorage.setItem(TESTIMONIALS_KEY, JSON.stringify(all));
};

export const createId = generateId;
