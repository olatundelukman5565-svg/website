import { adminDb } from "@/lib/firebase-admin";
import type { AboutContent, ContactInfo, HomepageContent, SiteContent } from "@/types";

const DOC_PATH = { collection: "siteContent", doc: "main" };

export const DEFAULT_SITE_CONTENT: SiteContent = {
  homepage: {
    heroEyebrow: "Architecture · 3D Visualization · Digital Design",
    heroTitle: "Neo Vision Team",
    heroSubtitle:
      "A digital architecture and 3D visualization studio crafting precise technical drawings, immersive renders, and richly detailed 3D worlds.",
    heroImageUrl: null,
    aboutBlurb:
      "Neo Vision Team partners with architects, developers, and studios to turn concepts into precise 2D drawings and photoreal 3D visualization — from permit-ready construction sets to fully modeled characters, environments, and props.",
    whyChooseUs: [
      {
        title: "Technical precision",
        description: "Construction-accurate drawings and permit-ready documentation built to code.",
      },
      {
        title: "Photoreal visualization",
        description: "High-fidelity 3D renders and walkthroughs that sell the vision before it's built.",
      },
      {
        title: "Full-spectrum 3D",
        description: "Architecture, characters, environments, and props — one studio, every asset.",
      },
      {
        title: "Reliable delivery",
        description: "Clear communication and dependable turnaround on every engagement.",
      },
    ],
    featuredProjectIds: [],
  },
  about: {
    intro: "Neo Vision Team is a digital architecture and 3D visualization studio.",
    body:
      "We work at the intersection of architecture and digital craft — producing technical 2D drawings, permit documentation, architectural 3D visualization, and a full range of 3D modeling for characters, environments, props, and objects. Our team blends design sensibility with production discipline so every project is both beautiful and buildable.",
    approach: [
      {
        title: "Understand the brief",
        description: "We start by understanding the design intent, technical constraints, and audience for every project.",
      },
      {
        title: "Build with precision",
        description: "Every drawing and model is produced to a professional technical standard.",
      },
      {
        title: "Refine the visual story",
        description: "Lighting, materials, and composition are tuned until the visualization feels real.",
      },
      {
        title: "Deliver and support",
        description: "Final files are packaged cleanly, with revisions supported through completion.",
      },
    ],
    capabilities: [
      "Architectural floor plans, elevations & sections",
      "Construction & technical drawings",
      "City permit / permit-ready drawing sets",
      "3D architectural visualization & walkthroughs",
      "3D character modeling & design",
      "3D environment & world building",
      "3D props, furniture & product modeling",
    ],
  },
  contact: {
    email: "hello@neovisionteam.com",
    phone: "+1 (555) 010-2030",
    address: "Remote-first studio — available worldwide",
    hours: "Mon–Fri, 9:00–18:00",
    social: [
      { label: "Instagram", url: "https://instagram.com" },
      { label: "Behance", url: "https://behance.net" },
      { label: "LinkedIn", url: "https://linkedin.com" },
    ],
  },
};

export async function getSiteContent(): Promise<SiteContent> {
  const doc = await adminDb.collection(DOC_PATH.collection).doc(DOC_PATH.doc).get();
  if (!doc.exists) return DEFAULT_SITE_CONTENT;
  const data = doc.data()!;
  return {
    homepage: { ...DEFAULT_SITE_CONTENT.homepage, ...(data.homepage ?? {}) },
    about: { ...DEFAULT_SITE_CONTENT.about, ...(data.about ?? {}) },
    contact: { ...DEFAULT_SITE_CONTENT.contact, ...(data.contact ?? {}) },
  };
}

export async function updateHomepageContent(input: Partial<HomepageContent>): Promise<void> {
  await adminDb
    .collection(DOC_PATH.collection)
    .doc(DOC_PATH.doc)
    .set({ homepage: input }, { merge: true });
}

export async function updateAboutContent(input: Partial<AboutContent>): Promise<void> {
  await adminDb
    .collection(DOC_PATH.collection)
    .doc(DOC_PATH.doc)
    .set({ about: input }, { merge: true });
}

export async function updateContactInfo(input: Partial<ContactInfo>): Promise<void> {
  await adminDb
    .collection(DOC_PATH.collection)
    .doc(DOC_PATH.doc)
    .set({ contact: input }, { merge: true });
}
