import React from "react";
import SocialsList from "@/shared/SocialsList/SocialsList";
import BackgroundSection from "@/components/BackgroundSection/BackgroundSection";
import SectionPromo1 from "@/components/SectionPromo1";
import ContactForm from "./ContactForm";
import { getGeneralSettings, DEFAULT_GENERAL_SETTINGS } from "@/lib/firebase/repositories/site-settings";
import { getFirstBanner } from "@/lib/firebase/repositories/banners";
import { contactInfoRows } from "@/lib/contact/contact-info";
import { activeSocialLinks } from "@/components/FooterSocials";
import { isSampleBanner } from "@/lib/seed-content";
import {
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  ChatBubbleLeftRightIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";

export const dynamic = "force-dynamic";

const PageContact = async () => {
  let general = DEFAULT_GENERAL_SETTINGS;
  try {
    general = await getGeneralSettings();
  } catch (err) {
    console.warn("Contact page: site settings unavailable, using defaults.", err);
  }

  // Settings → General (address, email, phone) - only what the merchant set; never placeholders.
  const info = contactInfoRows(general);
  const hasSocials = activeSocialLinks(general.socialLinks).length > 0;
  const promoBanner = await getFirstBanner("promo1").catch(() => null);
  // Only show bottom promo banner if it's real merchant content, never installer stock photo samples (e.g. jewelry)
  const showPromo = Boolean(promoBanner && !isSampleBanner(promoBanner));

  const emailRow = info.find((r) => r.title.includes("EMAIL"));
  const phoneRow = info.find((r) => r.title.includes("PHONE"));
  const addressRow = info.find((r) => r.title.includes("ADDRESS"));

  return (
    <div className="nc-PageContact overflow-hidden min-h-[70vh]">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        {/* Header Section */}
        <div className="max-w-2xl mx-auto text-center mb-12 lg:mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800 mb-3">
            <ChatBubbleLeftRightIcon className="w-3.5 h-3.5" />
            <span>Customer Assistance</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 dark:text-white">
            Get in touch with us
          </h1>
          <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
            Have questions about an order, our products, or need support? Send us a message and our team will get back to you promptly.
          </p>
        </div>

        {/* 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column: Real Store Contact Info Cards */}
          <div className="lg:col-span-5 space-y-4">
            {/* Email Card */}
            {emailRow && (
              <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950 flex items-center justify-center text-sky-600 dark:text-sky-400 flex-shrink-0">
                  <EnvelopeIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Email Support
                  </h3>
                  <a
                    href={`mailto:${emailRow.desc}`}
                    className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white hover:text-sky-600 dark:hover:text-sky-400 transition-colors mt-0.5 block break-all"
                  >
                    {emailRow.desc}
                  </a>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Typically responds within 24 business hours.
                  </p>
                </div>
              </div>
            )}

            {/* Phone Card */}
            {phoneRow && (
              <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 dark:text-emerald-400 flex-shrink-0">
                  <PhoneIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Phone / Helpline
                  </h3>
                  <a
                    href={`tel:${phoneRow.desc}`}
                    className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors mt-0.5 block"
                  >
                    {phoneRow.desc}
                  </a>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Monday to Saturday · Working hours
                  </p>
                </div>
              </div>
            )}

            {/* Address Card */}
            {addressRow && (
              <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950 flex items-center justify-center text-amber-600 dark:text-amber-400 flex-shrink-0">
                  <MapPinIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Store Location
                  </h3>
                  <p className="text-sm font-medium text-slate-900 dark:text-white mt-0.5 whitespace-pre-line leading-relaxed">
                    {addressRow.desc}
                  </p>
                </div>
              </div>
            )}

            {/* Social Channels */}
            {hasSocials && (
              <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Connect on Social Media
                </h3>
                <SocialsList className="pt-1" />
              </div>
            )}

            {/* Support Guarantee Badge */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center gap-3">
              <ShieldCheckIcon className="w-5 h-5 text-sky-600 dark:text-sky-400 flex-shrink-0" />
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Your inquiry is direct and confidential. We prioritize verified customer requests.
              </p>
            </div>
          </div>

          {/* Right Column: Contact Message Form */}
          <div className="lg:col-span-7">
            <div className="p-6 sm:p-8 lg:p-10 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
              <div className="mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                  Send us a message
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Fill out the form below. We will review your message and reply back to your email address.
                </p>
              </div>
              <ContactForm />
            </div>
          </div>
        </div>
      </div>

      {/* Real Merchant Promo (Only when configured and non-sample) */}
      {showPromo && promoBanner && (
        <div className="container mt-12 mb-20">
          <div className="relative py-12 lg:py-16">
            <BackgroundSection />
            <SectionPromo1 banner={promoBanner} />
          </div>
        </div>
      )}
    </div>
  );
};

export default PageContact;
