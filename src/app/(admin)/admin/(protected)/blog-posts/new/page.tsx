import React from "react";
import BlogPostForm from "../BlogPostForm";

export default function NewBlogPostPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Add blog post</h1>
      <BlogPostForm mode="create" />
    </div>
  );
}
