export type ProjectStatus = "draft" | "published";

export interface ProjectImage {
  url: string;
  path: string;
  width?: number;
  height?: number;
}

export interface ProjectFile {
  url: string;
  path: string;
  name: string;
  size?: number;
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  shortName?: string;
  description: string;
  intro: string;
  capabilities: string[];
  parentId?: string | null;
  order: number;
  coverImageUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  slug: string;
  title: string;
  description: string;
  categoryId: string;
  categorySlug: string;
  coverImage: ProjectImage | null;
  images: ProjectImage[];
  pdf: ProjectFile | null;
  pdfPreviewUrl: string | null;
  additionalFiles: ProjectFile[];
  year: number | null;
  client: string | null;
  projectType: string | null;
  featured: boolean;
  status: ProjectStatus;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  service: string | null;
  read: boolean;
  createdAt: string;
}

export interface HomepageContent {
  heroEyebrow: string;
  heroTitle: string;
  heroSubtitle: string;
  heroImageUrl?: string | null;
  aboutBlurb: string;
  whyChooseUs: { title: string; description: string }[];
  featuredProjectIds: string[];
}

export interface AboutContent {
  intro: string;
  body: string;
  approach: { title: string; description: string }[];
  capabilities: string[];
}

export interface ContactInfo {
  email: string;
  phone: string;
  address: string;
  hours?: string;
  social: { label: string; url: string }[];
}

export interface CommunicationSettings {
  whatsappNumber: string;
  chatEnabled: boolean;
  welcomeMessage: string;
  popupEnabled: boolean;
}

export interface SiteContent {
  homepage: HomepageContent;
  about: AboutContent;
  contact: ContactInfo;
  communication: CommunicationSettings;
}

export type ChatSenderRole = "buyer" | "admin";

export type ChatAttachmentKind = "image" | "pdf" | "video" | "file";

export interface ChatAttachment {
  url: string;
  path: string;
  name: string;
  size: number;
  contentType: string;
  kind: ChatAttachmentKind;
  resourceType: "image" | "video" | "raw";
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderRole: ChatSenderRole;
  text: string;
  attachments: ChatAttachment[];
  createdAt: string;
}

export interface ChatConversation {
  id: string;
  buyerName: string;
  buyerEmail: string;
  lastMessage: string;
  lastMessageAt: string;
  lastSenderRole: ChatSenderRole;
  unreadByAdmin: number;
  unreadByBuyer: number;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
}
