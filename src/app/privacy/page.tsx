import type { Metadata } from "next";
import { getPageBySlug } from "@/lib/firebase/repositories/pages";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageBySlug("privacy");
  if (!page) return { title: "Privacy Policy" };
  return {
    title: page.seoTitle || page.title,
    description: page.seoDescription,
  };
}

const PrivacyPage = async () => {
  const page = await getPageBySlug("privacy");

  return (
    <div className="container py-16 lg:pb-28 lg:pt-20 max-w-3xl">
      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold mb-10">
        {page?.title ?? "Privacy Policy"}
      </h1>
      {page ? (
        <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: page.content }} />
      ) : (
        <p className="text-slate-500 dark:text-slate-400">
          This page hasn&apos;t been published yet.
        </p>
      )}
    </div>
  );
};

export default PrivacyPage;
