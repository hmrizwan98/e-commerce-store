import type { Metadata } from "next";
import CustomerAccountsUnavailable from "@/components/CustomerAccountsUnavailable";

export const metadata: Metadata = { title: "Forgot password", robots: { index: false } };

/** Customer accounts don't exist yet - the old page was a demo form that did nothing. */
export default function Page() {
  return <CustomerAccountsUnavailable title="Forgot password" />;
}
