import React from "react";
import { notFound } from "next/navigation";
import PageForm from "../../PageForm";
import PageSectionsBuilder from "../../PageSectionsBuilder";
import { getPageById } from "@/lib/firebase/repositories/pages";
import { getAllPageSectionsForAdmin } from "@/lib/firebase/repositories/page-sections";

export const dynamic = "force-dynamic";

export default async function EditPagePage({ params }: { params: { id: string } }) {
  const page = await getPageById(params.id);
  if (!page) notFound();
  const sections = await getAllPageSectionsForAdmin(page.id);

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Edit page</h1>
        {page.isActive && (
          <a
            href={`/pages/${page.slug}`}
            target="_blank"
            rel="noreferrer"
            className="text-sm text-primary-600 hover:underline"
          >
            View published page ↗
          </a>
        )}
      </div>
      <PageForm mode="edit" page={page} />
      <PageSectionsBuilder pageId={page.id} sections={sections} />
    </div>
  );
}
