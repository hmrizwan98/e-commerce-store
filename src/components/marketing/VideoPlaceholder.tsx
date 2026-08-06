"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { PlayIcon } from "@heroicons/react/24/solid";

export default function VideoPlaceholder() {
  return (
    <section className="container py-20 lg:py-28">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <h2 className="text-2xl sm:text-3xl font-semibold">See the platform in action</h2>
        <p className="mt-4 text-neutral-500 dark:text-neutral-400">
          A full walkthrough video is coming soon - in the meantime, book a live demo.
        </p>
      </div>
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto"
      >
        <Link
          href={"/book-demo" as any}
          className="group relative flex aspect-video items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-neutral-900 to-neutral-800"
        >
          <div
            aria-hidden="true"
            className="absolute inset-0 opacity-60"
            style={{ background: "radial-gradient(circle at 50% 40%, var(--primary,#2563eb) 0%, transparent 60%)" }}
          />
          <div className="relative flex flex-col items-center gap-4">
            <span className="flex w-16 h-16 sm:w-20 sm:h-20 items-center justify-center rounded-full bg-white/90 transition-transform group-hover:scale-105">
              <PlayIcon className="w-7 h-7 sm:w-8 sm:h-8 text-neutral-900 translate-x-0.5" />
            </span>
            <span className="text-sm sm:text-base text-white/90 font-medium">
              Product walkthrough - coming soon. Watch a live walkthrough instead.
            </span>
          </div>
        </Link>
      </motion.div>
    </section>
  );
}
