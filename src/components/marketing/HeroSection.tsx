"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function HeroSection() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container pt-20 pb-16 lg:pt-28 lg:pb-24 text-center max-w-3xl mx-auto"
    >
      <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-primary-6000/10 text-primary-6000 mb-5">
        Multi-tenant SaaS for online retail
      </span>
      <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold leading-tight">
        The enterprise eCommerce platform for launching your own online store
      </h1>
      <p className="mt-6 text-lg text-neutral-500 dark:text-neutral-400">
        Multi-tenant architecture, a dedicated Store Admin, platform-wide Super Admin oversight, fast hosting,
        Cloudinary-powered media, and enterprise security - all on a commission-based model that grows with you.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
        <Link href={"/book-demo" as any} className="px-6 py-3 rounded-full bg-primary-6000 text-white font-medium">
          Book a Demo
        </Link>
        <Link
          href={"/pricing" as any}
          className="px-6 py-3 rounded-full border border-neutral-300 dark:border-neutral-700 font-medium"
        >
          View Pricing
        </Link>
      </div>
    </motion.section>
  );
}
