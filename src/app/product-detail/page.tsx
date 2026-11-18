import { redirect } from "next/navigation";

/** Was a template page showing a static demo product (fake price, reviews, policy text). Real
 * products live at /product/[slug]. The folder stays: ModalViewAllReviews.tsx is used by the
 * real product page. */
export default function DemoProductDetailRedirect() {
  redirect("/collection");
}
