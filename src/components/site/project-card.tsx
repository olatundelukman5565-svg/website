import Link from "next/link";
import Image from "next/image";
import type { Project } from "@/types";

export function ProjectCard({
  project,
  categoryName,
  priority = false,
}: {
  project: Project;
  categoryName?: string;
  priority?: boolean;
}) {
  const image = project.coverImage?.url || project.pdfPreviewUrl;

  return (
    <Link
      href={`/portfolio/${project.categorySlug}/${project.slug}`}
      className="group block overflow-hidden rounded-2xl border border-stone-200 bg-white transition hover:-translate-y-1 hover:shadow-xl"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-stone-100">
        {image ? (
          <Image
            src={image}
            alt={project.title}
            fill
            priority={priority}
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-stone-300">
            <span className="font-display text-lg">Neo Vision</span>
          </div>
        )}
        {project.featured && (
          <span className="absolute left-3 top-3 rounded-full bg-amber-500 px-2.5 py-1 text-xs font-semibold text-stone-950">
            Featured
          </span>
        )}
        {project.pdf && (
          <span className="absolute right-3 top-3 rounded-full bg-stone-950/80 px-2.5 py-1 text-xs font-medium text-white">
            PDF
          </span>
        )}
      </div>
      <div className="p-5">
        {categoryName && (
          <p className="text-xs font-semibold uppercase tracking-wider text-amber-600">{categoryName}</p>
        )}
        <h3 className="mt-1 font-display text-lg font-semibold text-stone-900">{project.title}</h3>
        <p className="mt-1.5 line-clamp-2 text-sm text-stone-500">{project.description}</p>
        {(project.year || project.client) && (
          <p className="mt-3 text-xs text-stone-400">
            {[project.year, project.client].filter(Boolean).join(" · ")}
          </p>
        )}
      </div>
    </Link>
  );
}
