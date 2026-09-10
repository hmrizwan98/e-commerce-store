import React from "react";
import Link from "next/link";
import Image from "next/image";

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

export default function MarketingFooter() {
  return (
    <footer className="border-t border-neutral-200/80 dark:border-neutral-800/80 bg-neutral-50/80 dark:bg-neutral-950 text-neutral-700 dark:text-neutral-300">
      <div className="container py-16 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-12">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <Link href={"/" as any} className="inline-flex items-center gap-2.5">
              <div className="relative w-8 h-8 rounded-lg overflow-hidden shadow-xs bg-neutral-900 flex items-center justify-center">
                <Image
                  src="/images/webriiz-logo.png"
                  alt="Webriiz Logo"
                  width={32}
                  height={32}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="font-bold text-lg text-neutral-900 dark:text-white">
                webriiz <span className="text-primary-6000 font-extrabold">Platform</span>
              </span>
            </Link>
            <p className="text-sm text-neutral-600 dark:text-neutral-300 max-w-sm leading-relaxed">
              Enterprise multi-tenant eCommerce SaaS platform. Launch your own store with dedicated Store Admin, tenant isolation, and Cloudinary media power.
            </p>
          </div>

          {/* Links Grid */}
          <div className="lg:col-span-3 grid grid-cols-2 sm:grid-cols-4 gap-8">
            {COLUMNS.map((col) => (
              <div key={col.title} className="space-y-3.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-white font-mono">
                  {col.title}
                </h3>
                <ul className="space-y-2.5 text-sm">
                  {col.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href as any}
                        className="hover:text-neutral-900 dark:hover:text-white transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 pt-8 border-t border-neutral-200/60 dark:border-neutral-800/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-600 dark:text-neutral-300">
          <p>© {new Date().getFullYear()} Webriiz Platform. All rights reserved.</p>
          <p className="flex items-center gap-2 font-mono">
            <span>Powered by Next.js RSC & Cloudinary</span>
          </p>
        </div>
      </div>
    </footer>
  );
}

