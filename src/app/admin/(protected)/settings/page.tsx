import { getSiteContent } from "@/lib/data/site-content";
import { listAllProjects } from "@/lib/data/projects";
import {
  AboutSettingsForm,
  ContactSettingsForm,
  HomepageSettingsForm,
} from "@/components/admin/settings-forms";

export default async function AdminSettingsPage() {
  const [content, projects] = await Promise.all([getSiteContent(), listAllProjects()]);
  const publishedProjects = projects.filter((p) => p.status === "published");

  return (
    <div className="max-w-3xl space-y-10">
      <div>
        <h1 className="text-2xl font-semibold text-stone-900">Site content</h1>
        <p className="mt-1 text-stone-500">Manage homepage, about, and contact page content.</p>
      </div>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-stone-900">Homepage</h2>
        <div className="rounded-xl border border-stone-200 bg-white p-6">
          <HomepageSettingsForm content={content.homepage} projects={publishedProjects} />
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-stone-900">About page</h2>
        <div className="rounded-xl border border-stone-200 bg-white p-6">
          <AboutSettingsForm content={content.about} />
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-stone-900">Contact information</h2>
        <div className="rounded-xl border border-stone-200 bg-white p-6">
          <ContactSettingsForm content={content.contact} />
        </div>
      </section>
    </div>
  );
}
