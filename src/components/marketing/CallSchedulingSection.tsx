import Link from "next/link";
import { CheckCircleIcon, CalendarDaysIcon, ArrowRightIcon } from "@heroicons/react/24/outline";

const AGENDA = [
  "A walkthrough of the multi-tenant architecture & security boundary",
  "A live tour of the Store Admin panel & Homepage Builder",
  "A commission rate discussion tailored to your retail volume",
];

export default function CallSchedulingSection() {
  return (
    <section className="border-t border-neutral-200/80 dark:border-neutral-800/80 bg-neutral-50/50 dark:bg-neutral-950/50">
      <div className="container py-20 lg:py-28 grid lg:grid-cols-12 gap-10 items-center">
        <div className="lg:col-span-6 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
            <CalendarDaysIcon className="w-3.5 h-3.5" />
            <span>1-on-1 Engineering Walkthrough</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 dark:text-white tracking-tight leading-tight">
            Prefer to talk it through live?
          </h2>

          <p className="text-base text-neutral-600 dark:text-neutral-400 leading-relaxed">
            Schedule a 20–30 minute demo call. We&apos;ll walk you through Store Admin, Super Admin, and answer all technical and pricing questions directly.
          </p>

          <div className="pt-2">
            <Link
              href={"/book-demo" as any}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-primary-6000 via-indigo-600 to-indigo-700 text-white font-bold text-base shadow-xl shadow-primary-6000/25 hover:shadow-primary-6000/40 hover:-translate-y-0.5 transition-all"
            >
              <span>Schedule a Demo Call</span>
              <ArrowRightIcon className="w-5 h-5" />
            </Link>
          </div>
        </div>

        <div className="lg:col-span-6 p-8 rounded-3xl border border-neutral-200/80 dark:border-neutral-800/80 bg-white dark:bg-neutral-900 shadow-lg shadow-neutral-900/5 space-y-4">
          <h3 className="font-bold text-lg text-neutral-900 dark:text-white tracking-tight">What we&apos;ll cover on the call</h3>
          <ul className="space-y-4 text-sm text-neutral-700 dark:text-neutral-300">
            {AGENDA.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <CheckCircleIcon className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <span className="leading-snug">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

