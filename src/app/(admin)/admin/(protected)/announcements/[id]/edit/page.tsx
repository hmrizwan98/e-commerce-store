import React from "react";
import { notFound } from "next/navigation";
import AnnouncementForm from "../../AnnouncementForm";
import { getAnnouncementBarById } from "@/lib/firebase/repositories/announcement-bars";

export const dynamic = "force-dynamic";

export default async function EditAnnouncementPage({ params }: { params: { id: string } }) {
  const bar = await getAnnouncementBarById(params.id);
  if (!bar) notFound();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Edit announcement bar</h1>
      <AnnouncementForm mode="edit" bar={bar} />
    </div>
  );
}
