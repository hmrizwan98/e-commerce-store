import React from "react";
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
      <div className="text-center max-w-2xl mx-auto mb-4 space-y-2">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
          What store owners experience
        </h2>
        <p className="text-xs text-neutral-400 dark:text-neutral-500 font-medium">
          Illustrative examples of what stores can expect on the platform
        </p>
      </div>

      <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {ILLUSTRATIONS.map((item) => (
          <div
            key={item.role}
            className="p-6 sm:p-7 rounded-2xl border border-neutral-200/80 dark:border-neutral-800/80 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
          >
            <div>
              <div className="flex gap-1 mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <StarIcon key={i} className="w-4 h-4 text-amber-400" />
                ))}
              </div>
              <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed font-medium">
                &ldquo;{item.quote}&rdquo;
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-neutral-100 dark:border-neutral-800 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-primary-6000/10 dark:bg-primary-6000/20 text-primary-6000 flex items-center justify-center font-bold text-sm">
                {item.role.charAt(0)}
              </div>
              <div>
                <span className="block text-sm font-semibold text-neutral-900 dark:text-white">{item.role}</span>
                <span className="block text-[11px] text-neutral-400">Verified Platform Merchant</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default React.memo(TestimonialsSection);

