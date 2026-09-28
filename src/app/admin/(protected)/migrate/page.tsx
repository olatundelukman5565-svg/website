import { MigrationPanel } from "@/components/admin/migration-panel";

export default function AdminMigratePage() {
  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-semibold text-stone-900">Data migration</h1>
      <p className="mt-1 text-stone-500">
        One-time move from the old flat category list to the 2D Design / 3D Design hierarchy. Safe to run
        more than once — re-running after it&apos;s already applied does nothing.
      </p>

      <div className="mt-6 rounded-xl border border-stone-200 bg-white p-6">
        <h2 className="font-semibold text-stone-900">2D Design / 3D Design hierarchy</h2>
        <p className="mt-1 text-sm text-stone-500">
          Reorganizes your existing categories under two pillars — 2D Design (Architecture, Technical
          Drawing, Character Art) and 3D Design (Architecture, Printing &amp; Sculpture, Character,
          Environment, Props &amp; Objects) — folds City Permit Drawings into 2D Architecture, and never
          deletes a project.
        </p>
        <div className="mt-5">
          <MigrationPanel />
        </div>
      </div>
    </div>
  );
}
