import { listCategories } from "@/lib/data/categories";
import { getSiteContent } from "@/lib/data/site-content";
import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [categories, content] = await Promise.all([listCategories(), getSiteContent()]);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar categories={categories} />
      <main className="flex-1">{children}</main>
      <Footer categories={categories} contact={content.contact} />
    </div>
  );
}
