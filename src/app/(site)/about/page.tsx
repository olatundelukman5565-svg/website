import type { Metadata } from "next";
import Link from "next/link";
import { getSiteContent } from "@/lib/data/site-content";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "About",
  description: "Learn about Neo Vision Team — a digital architecture and 3D visualization studio.",
};

export default async function AboutPage() {
  const content = await getSiteContent();
  const { about } = content;

  return (
    <div>
      <section className="bg-stone-950 py-24 text-white">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-500">About us</p>
          <h1 className="mt-4 font-display text-4xl font-semibold sm:text-5xl">{about.intro}</h1>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:px-8">
        <p className="whitespace-pre-wrap text-lg leading-relaxed text-stone-600">{about.body}</p>
      </section>

      <section className="bg-stone-50 py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-600">Our approach</p>
          <h2 className="mt-3 font-display text-3xl font-semibold text-stone-900">How we work</h2>
          <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {about.approach.map((step, i) => (
              <div key={step.title}>
                <span className="font-display text-3xl font-semibold text-amber-500">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-3 font-display text-lg font-semibold text-stone-900">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-stone-500">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-600">Full-spectrum capability</p>
        <h2 className="mt-3 font-display text-3xl font-semibold text-stone-900">
          Architecture, 2D, 3D — one studio
        </h2>
        <p className="mt-4 max-w-2xl text-stone-500">
          We combine technical architectural documentation with the full range of 3D craft, so every
          project — however specialized — is handled under one roof.
        </p>
        <ul className="mt-10 grid gap-4 sm:grid-cols-2">
          {about.capabilities.map((cap) => (
            <li key={cap} className="flex items-start gap-3 rounded-xl border border-stone-200 p-4">
              <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-amber-500" />
              <span className="text-sm text-stone-700">{cap}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="bg-stone-950 py-20 text-white">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl font-semibold">Ready to start a project?</h2>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/portfolio"
              className="rounded-full border border-stone-600 px-7 py-3.5 text-sm font-semibold hover:border-amber-500 hover:text-amber-400"
            >
              View Portfolio
            </Link>
            <Link
              href="/contact"
              className="rounded-full bg-amber-500 px-7 py-3.5 text-sm font-semibold text-stone-950 hover:bg-amber-400"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
