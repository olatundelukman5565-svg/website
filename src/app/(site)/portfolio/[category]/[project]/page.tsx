import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getCategoryBySlug } from "@/lib/data/categories";
import { getProjectBySlug, listRelatedProjects } from "@/lib/data/projects";
import { GalleryLightbox } from "@/components/site/gallery-lightbox";
import { ProjectCard } from "@/components/site/project-card";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string; project: string }>;
}): Promise<Metadata> {
  const { category, project: projectSlug } = await params;
  const project = await getProjectBySlug(category, projectSlug);
  if (!project) return {};
  return {
    title: project.title,
    description: project.description.slice(0, 160),
  };
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ category: string; project: string }>;
}) {
  const { category: categorySlug, project: projectSlug } = await params;
  const category = await getCategoryBySlug(categorySlug);
  if (!category) notFound();

  const project = await getProjectBySlug(categorySlug, projectSlug);
  if (!project || project.status !== "published") notFound();

  const related = await listRelatedProjects(categorySlug, project.id, 3);
  const heroImage = project.coverImage?.url || project.pdfPreviewUrl;

  return (
    <div>
      <section className="relative h-[55vh] min-h-[380px] w-full overflow-hidden bg-stone-950">
        {heroImage && (
          <Image src={heroImage} alt={project.title} fill priority className="object-cover opacity-70" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-stone-950/10" />
        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-2 text-sm text-stone-300">
            <Link href="/portfolio" className="hover:text-amber-400">Portfolio</Link>
            <span>/</span>
            <Link href={`/portfolio/${category.slug}`} className="hover:text-amber-400">
              {category.shortName || category.name}
            </Link>
          </div>
          <h1 className="mt-3 font-display text-3xl font-semibold text-white sm:text-5xl">{project.title}</h1>
          <div className="mt-4 flex flex-wrap gap-3 text-sm text-stone-300">
            {project.year && <span>{project.year}</span>}
            {project.client && <span>· {project.client}</span>}
            {project.projectType && <span>· {project.projectType}</span>}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <h2 className="font-display text-xl font-semibold text-stone-900">About this project</h2>
            <p className="mt-4 whitespace-pre-wrap leading-relaxed text-stone-600">{project.description}</p>

            {project.images.length > 0 && (
              <div className="mt-12">
                <h2 className="font-display text-xl font-semibold text-stone-900">Gallery</h2>
                <div className="mt-4">
                  <GalleryLightbox images={project.images} title={project.title} />
                </div>
              </div>
            )}

            {project.pdf && (
              <div className="mt-12">
                <h2 className="font-display text-xl font-semibold text-stone-900">Document</h2>
                <div className="mt-4 overflow-hidden rounded-xl border border-stone-200">
                  <iframe
                    src={project.pdf.url}
                    title={`${project.title} PDF`}
                    className="h-[70vh] w-full"
                  />
                </div>
                <a
                  href={project.pdf.url}
                  download
                  className="mt-4 inline-flex items-center gap-2 rounded-full bg-stone-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-amber-600"
                >
                  Download PDF
                </a>
              </div>
            )}

            {project.additionalFiles.length > 0 && (
              <div className="mt-12">
                <h2 className="font-display text-xl font-semibold text-stone-900">Additional files</h2>
                <ul className="mt-4 space-y-2">
                  {project.additionalFiles.map((f) => (
                    <li key={f.path}>
                      <a
                        href={f.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-amber-600 hover:underline"
                      >
                        {f.name} ↗
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <aside className="lg:col-span-1">
            <div className="sticky top-24 rounded-2xl border border-stone-200 p-6">
              <h3 className="font-display text-lg font-semibold text-stone-900">Project details</h3>
              <dl className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-stone-400">Category</dt>
                  <dd className="font-medium text-stone-700">{category.shortName || category.name}</dd>
                </div>
                {project.year && (
                  <div className="flex justify-between">
                    <dt className="text-stone-400">Year</dt>
                    <dd className="font-medium text-stone-700">{project.year}</dd>
                  </div>
                )}
                {project.client && (
                  <div className="flex justify-between">
                    <dt className="text-stone-400">Client</dt>
                    <dd className="font-medium text-stone-700">{project.client}</dd>
                  </div>
                )}
                {project.projectType && (
                  <div className="flex justify-between">
                    <dt className="text-stone-400">Type</dt>
                    <dd className="font-medium text-stone-700">{project.projectType}</dd>
                  </div>
                )}
              </dl>
              <Link
                href="/contact"
                className="mt-6 block rounded-full bg-stone-900 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-amber-600"
              >
                Start a similar project
              </Link>
            </div>
          </aside>
        </div>
      </section>

      {related.length > 0 && (
        <section className="bg-stone-50 py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="font-display text-2xl font-semibold text-stone-900">Related projects</h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p) => (
                <ProjectCard key={p.id} project={p} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
