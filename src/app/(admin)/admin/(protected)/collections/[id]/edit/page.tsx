import React from "react";
import { notFound } from "next/navigation";
import CollectionForm from "../../CollectionForm";
import { getCollectionById } from "@/lib/firebase/repositories/collections";

export const dynamic = "force-dynamic";

export default async function EditCollectionPage({ params }: { params: { id: string } }) {
  const collection = await getCollectionById(params.id);
  if (!collection) notFound();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Edit collection</h1>
      <CollectionForm mode="edit" collection={collection} />
    </div>
  );
}
