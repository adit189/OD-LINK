export interface LinkItem {
  id: string;
  title: string;
  url: string; // Used for links
  description?: string; // Used for text blocks
  isActive: boolean;
  type: 'link' | 'header' | 'folder' | 'text_block'; 
  children?: LinkItem[]; // For folders
  expiresAt?: number; // Timestamp for auto-deletion
}

// We removed ThemeType as we are sticking to one specific UI
export type ThemeType = 'onedream'; 

export interface Testimonial {
  id: string;
  pageId: string;
  visitorName: string;
  content: string;
  targetLinkTitle: string;
  timestamp: number;
}

// A single "Link in Bio" page (Project)
export interface BioPage {
  id: string;
  slug: string;
  displayName: string;
  bio: string;
  avatarUrl: string;
  
  // Layout Fields
  heroImage?: string; 
  heroText?: string;
  
  // Footer / Consultation
  consultationText?: string;
  whatsappNumber?: string;

  theme: ThemeType; 
  links: LinkItem[];
  createdAt: number;
  
  backgroundUrl?: string; 
}
