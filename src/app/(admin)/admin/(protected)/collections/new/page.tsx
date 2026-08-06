import React from "react";
import CollectionForm from "../CollectionForm";

export default function NewCollectionPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Add collection</h1>
      <CollectionForm mode="create" />
    </div>
  );
}
