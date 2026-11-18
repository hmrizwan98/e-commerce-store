import { redirect } from "next/navigation";

/** Was a template page with a static demo product. Real products live at /product/[slug]. */
export default function DemoProductDetail2Redirect() {
  redirect("/collection");
}
