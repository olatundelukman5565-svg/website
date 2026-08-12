export const SITE_NAME = "Neo Vision Team";

export const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Services", href: "/portfolio" },
  { label: "Portfolio", href: "/portfolio" },
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
  {
    slug: "2d-architectural-design",
    name: "2D Architectural Design",
    shortName: "2D Architecture",
    order: 1,
    description:
      "Precise, construction-ready 2D architectural drawings — from concept floor plans to full technical drawing sets.",
    intro:
      "Our 2D architectural design service covers the full technical documentation of a building: floor plans, elevations, sections, construction drawings, and presentation-ready sheets. Every drawing is produced to a professional technical standard, whether it's an early design-development plan or a fully dimensioned construction set.",
    capabilities: [
      "Architectural floor plans",
      "Elevations",
      "Sections",
      "Construction drawings",
      "Technical drawings",
      "Presentation drawings",
    ],
  },
  {
    slug: "3d-architectural-visualization",
    name: "3D Architectural Visualization",
    shortName: "3D Architecture",
    order: 2,
    description:
      "Photoreal 3D architectural visualization — exterior and interior renders, walkthroughs, and fully modeled buildings.",
    intro:
      "We build accurate 3D building models and turn them into compelling visual stories: exterior and interior visualization, architectural rendering, and full walkthrough animations. This service is ideal for presenting a design vision to clients, investors, or planning authorities before construction begins.",
    capabilities: [
      "3D building models",
      "Exterior visualization",
      "Interior visualization",
      "Architectural rendering",
      "Walkthrough / visualization projects",
    ],
  },
  {
    slug: "3d-character-modeling",
    name: "3D Character Modeling",
    shortName: "3D Characters",
    order: 3,
    description:
      "Original 3D character modeling and design — humans, creatures, and stylized assets, presentation and production ready.",
    intro:
      "From concept to finished asset, our character modeling service covers 3D human and creature models, character design, and production-ready assets — including rigged, presentation-quality models for games, film, and digital media.",
    capabilities: [
      "Character modeling",
      "Character design",
      "3D human / creature models",
      "Character assets",
      "Rigged or presentation-ready models",
    ],
  },
  {
    slug: "3d-environment-modeling",
    name: "3D Environment Modeling",
    shortName: "3D Environments",
    order: 4,
    description:
      "Rich, detailed 3D environments — buildings and surroundings, landscapes, cities, and full virtual worlds.",
    intro:
      "We design and build immersive 3D environments at any scale — from a single building and its surroundings to entire cities and virtual worlds. This service supports architectural context modeling as well as game and virtual-world environment art.",
    capabilities: [
      "Buildings and surroundings",
      "Landscapes",
      "Cities",
      "Virtual environments",
      "Game / virtual-world environments",
    ],
  },
  {
    slug: "3d-props-object-modeling",
    name: "3D Props & Object Modeling",
    shortName: "3D Props & Objects",
    order: 5,
    description:
      "Detailed 3D props and object modeling — furniture, products, architectural objects, and general assets.",
    intro:
      "Our props and object modeling service produces detailed, production-ready 3D assets — furniture, products, architectural objects, and industrial models — built to fit seamlessly into architectural scenes, games, or product visualization.",
    capabilities: [
      "Furniture",
      "Products",
      "Architectural objects",
      "Props",
      "Industrial / product models",
      "General 3D assets",
    ],
  },
  {
    slug: "city-permit-drawings",
    name: "City Permit / Permit Drawing Services",
    shortName: "Permit Drawings",
    order: 6,
    parentSlug: "2d-architectural-design",
    description:
      "Permit-ready drawings and documentation prepared for city submission and approval.",
    intro:
      "We prepare complete, permit-ready drawing sets and supporting documentation for city and municipal submission — formatted and detailed to meet approval requirements, so your project moves through the permitting process smoothly.",
    capabilities: [
      "City permit drawing sets",
      "Permit-ready documentation",
      "Code-compliant technical drawings",
      "Submission packages",
    ],
  },
];
