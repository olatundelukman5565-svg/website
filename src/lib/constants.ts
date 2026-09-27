export const SITE_NAME = "Neo Vision Team";

export const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "2D", href: "/2d" },
  { label: "3D Model", href: "/3d-model" },
  { label: "Portfolio", href: "/portfolio" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
] as const;

export interface SeedCategory {
  slug: string;
  name: string;
  shortName: string;
  description: string;
  intro: string;
  capabilities: string[];
  order: number;
  parentSlug?: string;
}

export const SEED_CATEGORIES: SeedCategory[] = [
  // ---- Primary pillars ----
  {
    slug: "2d",
    name: "2D",
    shortName: "2D",
    order: 1,
    description: "Design, drawing, documentation, and 2D artwork.",
    intro:
      "Our 2D division covers every discipline that starts and ends on the page — from construction-ready architectural drawings and permit documentation, to technical and patent-style illustration, to original 2D character art.",
    capabilities: [],
  },
  {
    slug: "3d-model",
    name: "3D Model",
    shortName: "3D Model",
    order: 2,
    description: "3D modeling, visualization, sculpture, printing, and 3D characters.",
    intro:
      "Our 3D Model division spans architectural visualization, physical sculpture and 3D printing, and full character production — built to the same technical standard as our 2D work.",
    capabilities: [],
  },

  // ---- 2D subcategories ----
  {
    slug: "architecture",
    parentSlug: "2d",
    name: "2D Architecture",
    shortName: "Architecture",
    order: 1,
    description: "Construction-ready architectural drawings and permit documentation — far more than floor plans.",
    intro:
      "2D Architecture covers the full range of architectural drawing and documentation work. It spans everything a project needs on paper, from early planning drawings through fully dimensioned, permit-ready construction sets — including city permit drawings, which live here rather than as a separate category.",
    capabilities: [
      "City Permit Drawings",
      "Floor Plans",
      "Architectural Plans",
      "Building Plans",
      "Elevations",
      "Sections",
      "Site Plans",
      "Reflected Ceiling Plans",
      "Door/Window Plans",
      "Existing/Proposed Plans",
      "Construction Drawings",
      "Architectural Documentation",
      "Permit Sets",
      "Planning Drawings",
      "Residential Drawings",
      "Commercial Drawings",
    ],
  },
  {
    slug: "technical-drawing",
    parentSlug: "2d",
    name: "Technical Drawing",
    shortName: "Technical Drawing",
    order: 2,
    description: "Precise technical, patent, and engineering drawing work — architecture not required.",
    intro:
      "Technical Drawing is our home for detailed technical documentation outside of architecture — patent-style drawings, engineering and manufacturing documentation, and precise technical illustration for any product or process.",
    capabilities: [
      "Technical Drawings",
      "Patent Drawings",
      "Patent Illustrations",
      "Product Technical Drawings",
      "Engineering Drawings",
      "Manufacturing Drawings",
      "Mechanical Drawings",
      "Assembly Drawings",
      "Detail Drawings",
      "Dimensioned Drawings",
      "Exploded Views",
      "Technical Illustrations",
      "Product Documentation",
    ],
  },
  {
    slug: "character-art",
    parentSlug: "2d",
    name: "2D Character Art",
    shortName: "Character Art",
    order: 3,
    description: "Character concept art, illustration, and design in 2D.",
    intro:
      "2D Character Art brings characters to life on the page — from early concept sketches and character sheets to fully rendered illustration, for games, animation, and original stories.",
    capabilities: [
      "Character Concept Art",
      "Character Illustration",
      "Character Design",
      "Stylized Character Art",
      "Cartoon Character Art",
      "Game Character Concept Art",
      "Character Sheets",
      "Character Poses",
      "2D Game Assets",
      "Illustration",
    ],
  },

  // ---- 3D Model subcategories ----
  {
    slug: "architecture",
    parentSlug: "3d-model",
    name: "3D Architecture",
    shortName: "Architecture",
    order: 1,
    description: "Photoreal architectural visualization, interiors, and exteriors.",
    intro:
      "3D Architecture turns building designs into fully modeled, photoreal visualization — exteriors, interiors, and everything needed to sell a design vision before it's built.",
    capabilities: [
      "3D Architectural Modeling",
      "Exterior Modeling",
      "Interior Modeling",
      "Architectural Visualization",
      "3D Building Models",
      "Residential 3D Models",
      "Commercial 3D Models",
      "Environment Modeling",
      "Architectural Rendering",
      "Realistic Visualization",
      "3D Walkthrough Assets",
      "Digital Twin Assets",
    ],
  },
  {
    slug: "printing-sculpture",
    parentSlug: "3d-model",
    name: "3D Printing & Sculpture",
    shortName: "Printing & Sculpture",
    order: 2,
    description: "Digital sculpture and print-ready models — figurines, prototypes, and collectibles.",
    intro:
      "3D Printing & Sculpture covers both digital sculpting and physical production — from character and product sculpts to fully print-ready files for figurines, collectibles, and prototypes.",
    capabilities: [
      "3D Printing Models",
      "3D Printable Objects",
      "Digital Sculpting",
      "Character Sculpting",
      "Product Sculpting",
      "Figurines",
      "Collectibles",
      "Miniatures",
      "Custom Sculptures",
      "3D Print Preparation",
      "STL/OBJ-Ready Models",
      "Prototype Models",
    ],
  },
  {
    slug: "character",
    parentSlug: "3d-model",
    name: "3D Character",
    shortName: "Character",
    order: 3,
    description: "Game- and animation-ready 3D character modeling.",
    intro:
      "3D Character is our dedicated pipeline for character creation in three dimensions — modeling, sculpting, retopology, and texturing, built to be game-ready or animation-ready.",
    capabilities: [
      "3D Character Modeling",
      "Realistic Characters",
      "Stylized Characters",
      "Game Characters",
      "Animation Characters",
      "Character Sculpting",
      "Character Retopology",
      "Character Texturing",
      "Character Accessories",
      "Character Assets",
      "Game-Ready Models",
      "Animation-Ready Models",
    ],
  },
  {
    slug: "environment",
    parentSlug: "3d-model",
    name: "3D Environment",
    shortName: "Environment",
    order: 4,
    description: "Rich, detailed 3D environments — buildings and surroundings, landscapes, cities, and full virtual worlds.",
    intro:
      "We design and build immersive 3D environments at any scale — from a single building and its surroundings to entire cities and virtual worlds. This supports architectural context modeling as well as game and virtual-world environment art.",
    capabilities: [
      "Buildings and Surroundings",
      "Landscapes",
      "Cities",
      "Virtual Environments",
      "Game / Virtual-World Environments",
    ],
  },
  {
    slug: "props-objects",
    parentSlug: "3d-model",
    name: "3D Props & Objects",
    shortName: "Props & Objects",
    order: 5,
    description: "Detailed 3D props and object modeling — furniture, products, architectural objects, and general assets.",
    intro:
      "Our props and object modeling covers detailed, production-ready 3D assets — furniture, products, architectural objects, and industrial models — built to fit seamlessly into architectural scenes, games, or product visualization.",
    capabilities: [
      "Furniture",
      "Products",
      "Architectural Objects",
      "Props",
      "Industrial / Product Models",
      "General 3D Assets",
    ],
  },
];
