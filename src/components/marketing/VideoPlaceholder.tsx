import Link from "next/link";
import { PlayIcon } from "@heroicons/react/24/solid";

export default function VideoPlaceholder() {
  return (
    <section className="container py-20 lg:py-28">
      <div className="text-center max-w-2xl mx-auto mb-12 space-y-4">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
          See the platform in action
        </h2>
        <p className="text-base text-neutral-600 dark:text-neutral-400">
          Walk through the Store Admin panel, Super Admin oversight, and storefront rendering live.
        </p>
      </div>

      <div className="max-w-4xl mx-auto">
        <Link
          href={"/book-demo" as any}
          className="group relative flex aspect-video items-center justify-center overflow-hidden rounded-3xl border border-neutral-800 bg-neutral-950 shadow-2xl transition-transform hover:-translate-y-1"
        >
          {/* Glowing gradient background */}
          <div
            aria-hidden="true"
            className="absolute inset-0 opacity-40 group-hover:opacity-60 transition-opacity"
            style={{
              background:
                "radial-gradient(circle at 50% 50%, rgba(37, 99, 235, 0.4) 0%, rgba(99, 102, 241, 0.2) 40%, transparent 75%)",
            }}
          />

          <div className="relative z-10 flex flex-col items-center gap-4 text-center px-6">
            <span className="flex w-16 h-16 sm:w-20 sm:h-20 items-center justify-center rounded-full bg-white text-neutral-950 shadow-xl group-hover:scale-110 transition-transform">
              <PlayIcon className="w-7 h-7 sm:w-8 sm:h-8 translate-x-0.5" />
            </span>
            <div className="space-y-1">
              <span className="block text-lg sm:text-xl text-white font-bold tracking-tight">
                Watch a Live Product Walkthrough
              </span>
              <span className="block text-xs sm:text-sm text-neutral-400 font-medium">
                Click to schedule a 1-on-1 demo with our engineering team
              </span>
            </div>
          </div>
        </Link>
      </div>
    </section>
  );
}

