import Link from "next/link";
import Image from "next/image";
import { listCategories } from "@/lib/data/categories";
import { listPublishedProjectsByIds, listFeaturedProjects } from "@/lib/data/projects";
import { getSiteContent } from "@/lib/data/site-content";

export const dynamic = "force-dynamic";
import { ProjectCard } from "@/components/site/project-card";

export default async function HomePage() {
  const [categories, content] = await Promise.all([listCategories(), getSiteContent()]);

  const configuredFeatured = await listPublishedProjectsByIds(content.homepage.featuredProjectIds);
  const featured =
    configuredFeatured.length > 0 ? configuredFeatured : await listFeaturedProjects(6);

  const topLevel = categories.filter((c) => !c.parentId);
  const categoryBySlug = Object.fromEntries(categories.map((c) => [c.slug, c]));

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-stone-950 text-white">
        {content.homepage.heroImageUrl && (
          <div className="absolute inset-0">
            <Image
              src={content.homepage.heroImageUrl}
              alt=""
              fill
              priority
              className="object-cover opacity-40"
            />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-stone-950/60 via-stone-950/70 to-stone-950" />
        <div className="relative mx-auto max-w-7xl px-4 py-28 sm:px-6 lg:px-8 lg:py-40">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-amber-500">
            {content.homepage.heroEyebrow}
          </p>
          <h1 className="mt-6 max-w-3xl font-display text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
            {content.homepage.heroTitle}
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-stone-300">
            {content.homepage.heroSubtitle}
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/portfolio"
              className="rounded-full bg-amber-500 px-7 py-3.5 text-sm font-semibold text-stone-950 transition hover:bg-amber-400"
            >
              View Portfolio
            </Link>
            <Link
              href="/contact"
              className="rounded-full border border-stone-600 px-7 py-3.5 text-sm font-semibold text-white transition hover:border-amber-500 hover:text-amber-400"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      {/* Featured services */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-600">What we do</p>
          <h2 className="mt-3 font-display text-3xl font-semibold text-stone-900 sm:text-4xl">
            Services built for architecture &amp; 3D
          </h2>
          <p className="mt-4 text-stone-500">
            From construction-ready 2D drawings to fully realized 3D worlds, Neo Vision Team delivers
            technical precision and visual craft across every discipline.
          </p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {topLevel.map((c) => (
            <Link
              key={c.id}
              href={`/portfolio/${c.slug}`}
              className="group rounded-2xl border border-stone-200 p-7 transition hover:border-amber-400 hover:shadow-lg"
            >
              <h3 className="font-display text-xl font-semibold text-stone-900 group-hover:text-amber-600">
                {c.name}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-stone-500">{c.description}</p>
              <span className="mt-4 inline-block text-sm font-medium text-amber-600">
                Explore work →
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured projects */}
      {featured.length > 0 && (
        <section className="bg-stone-50 py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-600">Selected work</p>
                <h2 className="mt-3 font-display text-3xl font-semibold text-stone-900 sm:text-4xl">
                  Featured projects
                </h2>
              </div>
              <Link href="/portfolio" className="text-sm font-medium text-stone-700 hover:text-amber-600">
                View full portfolio →
              </Link>
            </div>
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((p, i) => (
                <ProjectCard
                  key={p.id}
                  project={p}
                  categoryName={categoryBySlug[p.categorySlug]?.shortName}
                  priority={i < 3}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 2D / 3D split */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl bg-stone-950 p-10 text-white">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-500">Core focus</p>
            <h3 className="mt-3 font-display text-2xl font-semibold">2D Architecture</h3>
            <p className="mt-4 leading-relaxed text-stone-300">
              Construction-accurate floor plans, elevations, sections, and full technical drawing sets —
              including permit-ready documentation prepared for city submission.
            </p>
            <Link
              href="/portfolio/2d-architectural-design"
              className="mt-6 inline-block text-sm font-semibold text-amber-400 hover:text-amber-300"
            >
              View 2D Architecture →
            </Link>
          </div>
          <div className="rounded-2xl bg-amber-500 p-10 text-stone-950">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-stone-800">Visualize the vision</p>
            <h3 className="mt-3 font-display text-2xl font-semibold">3D Architecture &amp; Modeling</h3>
            <p className="mt-4 leading-relaxed text-stone-900/80">
              Photoreal architectural visualization, walkthroughs, and a full range of 3D modeling —
              characters, environments, props, and objects.
            </p>
            <Link
              href="/portfolio/3d-architectural-visualization"
              className="mt-6 inline-block text-sm font-semibold text-stone-950 hover:text-stone-700"
            >
              View 3D Work →
            </Link>
          </div>
        </div>
      </section>

      {/* About blurb */}
      <section className="bg-stone-100 py-24">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-600">About the studio</p>
          <h2 className="mt-3 font-display text-3xl font-semibold text-stone-900 sm:text-4xl">
            Neo Vision Team
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-stone-600">{content.homepage.aboutBlurb}</p>
          <Link href="/about" className="mt-6 inline-block text-sm font-semibold text-amber-600 hover:text-amber-700">
            Learn more about us →
          </Link>
        </div>
      </section>

      {/* Why choose us */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-600">Why Neo Vision</p>
          <h2 className="mt-3 font-display text-3xl font-semibold text-stone-900 sm:text-4xl">
            Why choose us
          </h2>
        </div>
        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {content.homepage.whyChooseUs.map((item) => (
            <div key={item.title}>
              <div className="h-1 w-10 rounded-full bg-amber-500" />
              <h3 className="mt-4 font-display text-lg font-semibold text-stone-900">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-stone-500">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Contact CTA */}
      <section className="bg-stone-950 py-24 text-white">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl font-semibold sm:text-4xl">Let&apos;s build something precise.</h2>
          <p className="mt-4 text-stone-300">
            Tell us about your project — from a single floor plan to a full 3D world.
          </p>
          <Link
            href="/contact"
            className="mt-8 inline-block rounded-full bg-amber-500 px-8 py-3.5 text-sm font-semibold text-stone-950 hover:bg-amber-400"
          >
            Get in touch
          </Link>
        </div>
      </section>
    </div>
  );
}
