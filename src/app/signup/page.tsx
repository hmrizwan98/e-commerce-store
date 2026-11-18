import type { Metadata } from "next";
import CustomerAccountsUnavailable from "@/components/CustomerAccountsUnavailable";

export const metadata: Metadata = { title: "Create an account", robots: { index: false } };

/** Customer accounts don't exist yet - the old page was a demo form that did nothing. */
export default function Page() {
  return <CustomerAccountsUnavailable title="Create an account" />;
}
