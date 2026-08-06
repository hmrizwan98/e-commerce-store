import React from "react";
import Link from "next/link";

const COLUMNS: { title: string; links: { href: string; label: string }[] }[] = [
  {
    title: "Product",
    links: [
      { href: "/features", label: "Features" },
      { href: "/themes", label: "Themes" },
      { href: "/pricing", label: "Pricing" },
      { href: "/how-it-works", label: "How It Works" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About" },
      { href: "/contact", label: "Contact" },
      { href: "/book-demo", label: "Book a Demo" },
      { href: "/faq", label: "FAQ" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/privacy", label: "Privacy Policy" },
      { href: "/terms", label: "Terms of Service" },
    ],
  },
  {
    title: "Access",
    links: [
      { href: "/admin/login", label: "Store Admin Login" },
      { href: "/superadmin/login", label: "Super Admin Login" },
    ],
  },
];

/** Self-contained - no tenant menu dependency, unlike the storefront's Footer. */
export default function MarketingFooter() {
  return (
    <footer className="border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950">
      <div className="container py-16 grid grid-cols-2 sm:grid-cols-4 gap-10">
        {COLUMNS.map((col) => (
          <div key={col.title} className="text-sm">
            <h3 className="font-semibold text-neutral-700 dark:text-neutral-200 mb-4">{col.title}</h3>
            <ul className="space-y-3">
              {col.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href as any} className="text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="container pb-10 pt-6 border-t border-neutral-200 dark:border-neutral-800 text-sm text-neutral-500 dark:text-neutral-400">
        © {new Date().getFullYear()} Tradez Glint. All rights reserved.
      </div>
    </footer>
  );
}
