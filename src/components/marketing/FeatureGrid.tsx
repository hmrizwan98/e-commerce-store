import React from "react";
import {
  BuildingStorefrontIcon,
  ShieldCheckIcon,
  BoltIcon,
  PhotoIcon,
  BanknotesIcon,
  UserGroupIcon,
  TruckIcon,
  ChatBubbleLeftRightIcon,
} from "@heroicons/react/24/outline";

export interface Highlight {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}

const HIGHLIGHTS: Highlight[] = [
  {
    icon: BuildingStorefrontIcon,
    title: "Your own store, your own data",
    description:
      "Your products, customers and orders belong to your store alone - private to you and never shared with other sellers.",
  },
  {
    icon: TruckIcon,
    title: "Courier tracking customers understand",
    description:
      "Add the courier and tracking number - customers follow their parcel on your store with a clear step-by-step timeline and a direct link to Couriers Next, TCS, PostEx, Trax, Leopards or CallCourier.",
  },
  {
    icon: ShieldCheckIcon,
    title: "Fewer fake COD orders",
    description:
      "Every Cash on Delivery order gets a quick risk check based on the customer's details and order history, so you can confirm it by call or WhatsApp before you ship.",
  },
  {
    icon: ChatBubbleLeftRightIcon,
    title: "WhatsApp order updates & chat",
    description:
      "Send ready-made order confirmed, dispatched and delivered messages - with the tracking link - in one click, plus a WhatsApp chat button on your store.",
  },
  {
    icon: UserGroupIcon,
    title: "We set up your store with you",
    description:
      "Our team creates your store, connects your domain and helps you get your first products live - no developer needed.",
  },
  {
    icon: PhotoIcon,
    title: "Sharp, fast-loading product photos",
    description:
      "Upload your photos and they're automatically resized and compressed, so pages stay quick even on mobile data.",
  },
  {
    icon: BoltIcon,
    title: "A fast store on every phone",
    description:
      "Pages load quickly and search and filters respond instantly, so shoppers find what they want and check out.",
  },
  {
    icon: BanknotesIcon,
    title: "No monthly fee",
    description:
      "No setup fee, no monthly subscription and no paid apps to unlock the basics - you pay a small commission only when you make a sale.",
  },
];

function FeatureGrid() {
  return (
    <section className="container py-16 lg:py-24">
      <div className="text-center max-w-2xl mx-auto mb-12 lg:mb-14 space-y-4">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
          Everything you need to run a serious store
        </h2>
        <p className="text-base sm:text-lg text-neutral-700 dark:text-neutral-300">
          Everything a growing Pakistani business needs to sell online, take payments and deliver - in one place.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {HIGHLIGHTS.map(({ icon: Icon, title, description }) => (
          <div
            key={title}
            className="group relative p-6 sm:p-7 rounded-2xl border border-neutral-200/80 dark:border-neutral-800/80 bg-white/70 dark:bg-neutral-900/70 backdrop-blur-sm hover:border-primary-6000/40 hover:shadow-xl hover:shadow-primary-6000/5 hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-primary-6000/10 dark:bg-primary-6000/20 text-primary-6000 flex items-center justify-center mb-5 group-hover:scale-110 group-hover:bg-primary-6000 group-hover:text-white transition-all">
                <Icon className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-neutral-900 dark:text-white mb-2 tracking-tight">{title}</h3>
              <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">{description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default React.memo(FeatureGrid);

