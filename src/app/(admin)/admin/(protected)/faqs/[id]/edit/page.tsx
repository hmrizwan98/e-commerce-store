import React from "react";
import { notFound } from "next/navigation";
import FaqForm from "../../FaqForm";
import { getFaqById } from "@/lib/firebase/repositories/faqs";

export const dynamic = "force-dynamic";

export default async function EditFaqPage({ params }: { params: { id: string } }) {
  const faq = await getFaqById(params.id);
  if (!faq) notFound();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Edit FAQ</h1>
      <FaqForm mode="edit" faq={faq} />
    </div>
  );
}
