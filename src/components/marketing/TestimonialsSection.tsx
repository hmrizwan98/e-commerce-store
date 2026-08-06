"use client";

import React from "react";
import { motion } from "framer-motion";
import { UserCircleIcon, StarIcon } from "@heroicons/react/24/solid";

interface Illustration {
  role: string;
  quote: string;
}

const ILLUSTRATIONS: Illustration[] = [
  {
    role: "Fashion retailer",
    quote:
      "Launched with the Fashion Pro theme and had orders flowing within a day of provisioning - no developer needed.",
  },
  {
    role: "Restaurant & food delivery",
    quote:
      "The Store Admin's order and inventory tools made it easy to manage a busy daily menu without extra tooling.",
  },
  {
    role: "Electronics store",
    quote:
      "Multi-tenant isolation meant our catalog and customer data stayed fully separate from every other store on the platform.",
  },
];

function TestimonialsSection() {
  return (
    <section className="container py-20 lg:py-28">
      <div className="text-center max-w-2xl mx-auto mb-3">
        <h2 className="text-2xl sm:text-3xl font-semibold">What store owners experience</h2>
      </div>
      <p className="text-center text-xs text-neutral-400 dark:text-neutral-500 mb-12">
        Illustrative examples of what stores can expect on the platform
      </p>
      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
        className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {ILLUSTRATIONS.map((item) => (
          <motion.div
            key={item.role}
            variants={{ hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0 } }}
            transition={{ duration: 0.4 }}
            className="p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900"
          >
            <div className="flex gap-0.5 mb-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <StarIcon key={i} className="w-4 h-4 text-amber-400" />
              ))}
            </div>
            <p className="text-sm text-neutral-600 dark:text-neutral-300">&ldquo;{item.quote}&rdquo;</p>
            <div className="mt-5 flex items-center gap-2">
              <UserCircleIcon className="w-8 h-8 text-neutral-300 dark:text-neutral-700" />
              <span className="text-sm font-medium">{item.role}</span>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}

export default React.memo(TestimonialsSection);
