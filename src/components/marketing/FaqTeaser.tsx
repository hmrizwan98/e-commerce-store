import Link from "next/link";
import { ArrowRightIcon } from "@heroicons/react/24/outline";
import AccordionInfo from "@/components/AccordionInfo";
import { PLATFORM_FAQS } from "@/lib/marketing/faq-data";

export default function FaqTeaser() {
  const data = PLATFORM_FAQS.slice(0, 4).map((f) => ({ name: f.question, content: f.answer }));

  return (
    <section className="container py-20 lg:py-28 max-w-3xl mx-auto">
      <div className="text-center mb-12 space-y-3">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
          Common questions
        </h2>
        <p className="text-base text-neutral-600 dark:text-neutral-400">
          Everything you need to know about store provisioning, themes, and platform hosting.
        </p>
      </div>
      <div className="p-6 sm:p-8 rounded-3xl border border-neutral-200/80 dark:border-neutral-800/80 bg-white/70 dark:bg-neutral-900/70 backdrop-blur-sm shadow-sm">
        <AccordionInfo data={data} />
      </div>
      <div className="text-center mt-8">
        <Link
          href={"/faq" as any}
          className="inline-flex items-center gap-1.5 font-semibold text-primary-6000 hover:text-indigo-600 transition-colors group"
        >
          <span>View all platform FAQs</span>
          <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </section>
  );
}

