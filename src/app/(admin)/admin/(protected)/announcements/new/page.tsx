import React from "react";
import AnnouncementForm from "../AnnouncementForm";

export default function NewAnnouncementPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Add announcement bar</h1>
      <AnnouncementForm mode="create" />
    </div>
  );
}
