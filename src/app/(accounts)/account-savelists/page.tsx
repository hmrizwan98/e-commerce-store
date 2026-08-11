import { getActiveThemeConfig } from "@/lib/theme/theme-repository";
import AccountSavelistsClient from "./AccountSavelistsClient";

export const dynamic = "force-dynamic";

export default async function AccountSavelistsPage() {
  const theme = await getActiveThemeConfig();
  return <AccountSavelistsClient productCardSettings={theme.productCard} />;
}
