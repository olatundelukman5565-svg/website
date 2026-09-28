import { adminDb } from "@/lib/firebase-admin";
import type { AboutContent, CommunicationSettings, ContactInfo, HomepageContent, SiteContent } from "@/types";

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
    intro: "Neo Vision Team is a full-spectrum 2D and 3D design studio.",
    body:
      "Neo Vision Team is a digital design studio built around two disciplines: 2D Design and 3D Design. On the 2D side, we produce construction-ready architectural drawings and permit documentation, patent-style technical and engineering illustration, and original 2D character art. On the 3D side, we build photoreal architectural visualization, digital sculpture and print-ready models, and full production-quality 3D characters.\n\nWe work directly with architects, product teams, inventors, game studios, and independent creators — anyone who needs precise, professional 2D or 3D work without managing an in-house team. Every project moves through the same disciplined process regardless of size: a clear brief, careful technical execution, a visual refinement pass, and a clean, organized handoff of final files.\n\nWe're available for direct engagements through this website's chat and contact form, and we also take on projects through Upwork and Fiverr for clients who prefer to work through those platforms — same team, same quality, same process, whichever way you'd rather hire us.",
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
      "2D Architecture — floor plans, elevations, sections, city permit & construction drawings",
      "Technical Drawing — patent, engineering, mechanical & product technical illustration",
      "2D Character Art — character design, illustration, concept art & character sheets",
      "3D Architecture — architectural modeling, interior/exterior rendering & visualization",
      "3D Printing & Sculpture — digital sculpting, figurines, collectibles & print-ready models",
      "3D Character — game-ready and animation-ready character modeling & sculpting",
    ],
    faqs: [
      {
        question: "Do you work with clients outside your home country?",
        answer:
          "Yes — we're a remote-first studio and work with clients worldwide. All communication, files, and revisions happen online through this website's live chat, email, or your platform of choice.",
      },
      {
        question: "Can I hire you through Upwork or Fiverr instead of this website?",
        answer:
          "Yes. We take on projects directly through this website as well as through Upwork and Fiverr. It's the same team and process either way — use whichever platform you're most comfortable with.",
      },
      {
        question: "What file formats do you deliver?",
        answer:
          "It depends on the project — common deliverables include PDF drawing sets, high-resolution images and renders, and 3D files in formats like OBJ/STL/FBX. Tell us your required format up front and we'll match it.",
      },
      {
        question: "Do you offer revisions?",
        answer:
          "Yes, revisions are part of our standard process. We refine drawings and visualizations with you until the result matches the brief before final delivery.",
      },
      {
        question: "How do I start a project?",
        answer:
          "Use the Live Chat button, the contact form, or WhatsApp — tell us what you need (2D drawings, a 3D render, a character model, etc.) and we'll follow up with next steps and timing.",
      },
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
  communication: {
    whatsappNumber: "",
    chatEnabled: true,
    welcomeMessage:
      "Hello! Welcome to Neo Vision Team. How can we help with your architectural or 3D project?",
    popupEnabled: true,
    upworkUrl: "",
    fiverrUrl: "",
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
    communication: { ...DEFAULT_SITE_CONTENT.communication, ...(data.communication ?? {}) },
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

export async function updateCommunicationSettings(input: Partial<CommunicationSettings>): Promise<void> {
  await adminDb
    .collection(DOC_PATH.collection)
    .doc(DOC_PATH.doc)
    .set({ communication: input }, { merge: true });
}
