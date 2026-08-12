import { LoginForm } from "@/components/admin/login-form";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-950 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-500">
            Neo Vision Team
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-white">Admin sign in</h1>
          <p className="mt-1 text-sm text-stone-400">Manage your portfolio and site content.</p>
        </div>
        <div className="rounded-xl border border-stone-800 bg-stone-900/50 p-6 shadow-xl">
          <LoginForm next={next || "/admin"} />
        </div>
      </div>
    </div>
  );
}
