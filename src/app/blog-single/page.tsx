import { redirect } from "next/navigation";

/** Was a demo article with made-up content. Real articles live at /blog/[slug]. */
export default function BlogSingleRedirect() {
  redirect("/blog");
}
