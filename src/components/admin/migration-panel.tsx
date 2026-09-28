"use client";

import { useState, useTransition } from "react";
import { applyMigrationAction, previewMigrationAction } from "@/lib/actions/migration";
import type { MigrationResult } from "@/lib/migrations/two-d-three-d";

export function MigrationPanel() {
  const [result, setResult] = useState<MigrationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);

  function handlePreview() {
    setError(null);
    setConfirming(false);
    startTransition(async () => {
      try {
        setResult(await previewMigrationAction());
      } catch (err) {
        setError(err instanceof Error ? err.message : "Preview failed.");
      }
    });
  }

  function handleApply() {
    setError(null);
    startTransition(async () => {
      try {
        setResult(await applyMigrationAction());
        setConfirming(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Migration failed.");
      }
    });
  }

  const hasPreviewed = result && !result.applied;
  const hasApplied = result && result.applied;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handlePreview}
          disabled={pending}
          className="rounded-md border border-stone-300 px-5 py-2.5 text-sm font-medium text-stone-700 hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Working…" : "1. Preview changes"}
        </button>

        {hasPreviewed && result.changeCount > 0 && !confirming && (
          <button
            type="button"
            onClick={() => setConfirming(true)}
            disabled={pending}
            className="rounded-md bg-stone-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-stone-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            2. Apply migration
          </button>
        )}

        {hasPreviewed && result.changeCount === 0 && (
          <p className="self-center text-sm text-emerald-700">
            Nothing to do — your categories already match the new structure.
          </p>
        )}
      </div>

      {confirming && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-4">
          <p className="text-sm font-medium text-amber-900">
            This will write {result?.changeCount} change{result?.changeCount === 1 ? "" : "s"} to your live
            database right now. It&apos;s safe and reversible in the sense that no project is ever deleted, but
            please make sure you&apos;ve reviewed the preview above.
          </p>
          <div className="mt-3 flex gap-3">
            <button
              type="button"
              onClick={handleApply}
              disabled={pending}
              className="rounded-md bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {pending ? "Applying…" : "Yes, apply it now"}
            </button>
            <button
              type="button"
              onClick={() => setConfirming(false)}
              disabled={pending}
              className="rounded-md border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {error && (
        <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      {hasApplied && (
        <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          Done — {result.changeCount} change{result.changeCount === 1 ? "" : "s"} applied. Refresh the site to
          see 2D Design / 3D Design in the navigation.
        </p>
      )}

      {result && (
        <div>
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-stone-500">
            {result.applied ? "Applied log" : "Preview (nothing written yet)"}
          </p>
          <pre className="max-h-96 overflow-auto rounded-lg bg-stone-950 p-4 text-xs leading-relaxed text-stone-200">
            {result.log.join("\n")}
          </pre>
        </div>
      )}
    </div>
  );
}
