import type { Metadata } from "next";
import "./globals.css";
import "@/fonts/line-awesome-1.3.0/css/line-awesome.css";
import "@/styles/index.scss";
import "rc-slider/assets/index.css";
import ClientProviders from "./ClientProviders";
import { getActiveTheme } from "@/lib/firebase/repositories/themes";
import { getGeneralSettings } from "@/lib/firebase/repositories/site-settings";
import { themeToCssText } from "@/lib/theme/css-variables";
import { FONT_PRESETS, ALL_FONT_VARIABLES } from "@/lib/theme/fonts";

export async function generateMetadata(): Promise<Metadata> {
  const [theme, general] = await Promise.all([getActiveTheme(), getGeneralSettings()]);
  return {
    title: general.seoTitle || general.storeName,
    description: general.seoDescription,
    icons: theme.logos.favicon
      ? {
          icon: theme.logos.favicon,
          apple: theme.logos.appleTouchIcon || theme.logos.favicon,
        }
      : undefined,
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
  params: any;
}) {
  const [theme, general] = await Promise.all([getActiveTheme(), getGeneralSettings()]);
  const cssText = themeToCssText(theme);
  const bodyFont = FONT_PRESETS[theme.typography.bodyFont ?? "poppins"];
  const headingFont = FONT_PRESETS[theme.typography.headingFont ?? "poppins"];

  return (
    <html
      lang="en"
      dir=""
      className={`${bodyFont.className} ${ALL_FONT_VARIABLES}`}
    >
      <head>
        <style
          id="theme-vars"
          dangerouslySetInnerHTML={{
            __html: `${cssText}\n:root { --font-body: var(${bodyFont.variable}); --font-heading: var(${headingFont.variable}); }`,
          }}
        />
      </head>
      <body className="bg-[var(--background,white)] text-base dark:bg-neutral-900 text-[var(--text,#111827)] dark:text-neutral-200">
        <ClientProviders
          headerSettings={theme.header}
          footerSettings={theme.footer}
          storeName={general.storeName}
        >
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}
