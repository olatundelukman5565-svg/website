/**
 * CLI wrapper for the 2D Design / 3D Design migration. See
 * src/lib/migrations/two-d-three-d.ts for the full behavior — this file just
 * parses --apply and prints the result. The same logic also runs from the
 * admin dashboard's Data Migration page, so there is exactly one implementation.
 *
 * Usage:
 *   tsx --env-file-if-exists=.env.local scripts/migrate-2d-3d-hierarchy.ts            # dry run
 *   tsx --env-file-if-exists=.env.local scripts/migrate-2d-3d-hierarchy.ts --apply    # commit
 */
import { runTwoDThreeDMigration } from "../src/lib/migrations/two-d-three-d";

const APPLY = process.argv.includes("--apply");

runTwoDThreeDMigration(APPLY)
  .then((result) => {
    console.log(result.log.join("\n"));
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
