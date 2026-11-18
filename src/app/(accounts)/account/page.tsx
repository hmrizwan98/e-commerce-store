import { redirect } from "next/navigation";

/** Customer accounts don't exist yet (guest checkout only) - this was a demo form with a
 * made-up profile. Orders are looked up on the Orders tab (order tracking). */
export default function Page() {
  redirect("/account-order");
}
