import React from "react";
import { notFound } from "next/navigation";
import BlogPostForm from "../../BlogPostForm";
import { getBlogPostById } from "@/lib/firebase/repositories/blog-posts";

export const dynamic = "force-dynamic";

export default async function EditBlogPostPage({ params }: { params: { id: string } }) {
  const post = await getBlogPostById(params.id);
  if (!post) notFound();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Edit blog post</h1>
      <BlogPostForm mode="edit" post={post} />
    </div>
  );
}
