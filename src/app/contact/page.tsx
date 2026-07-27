import React from "react";
import SocialsList from "@/shared/SocialsList/SocialsList";
import BackgroundSection from "@/components/BackgroundSection/BackgroundSection";
import SectionPromo1 from "@/components/SectionPromo1";
import ContactForm from "./ContactForm";
import { getGeneralSettings } from "@/lib/firebase/repositories/site-settings";

export const dynamic = "force-dynamic";

const PageContact = async () => {
  const general = await getGeneralSettings();

  const info = [
    {
      title: "🗺 ADDRESS",
      desc: general.storeAddress || "Address not set yet.",
    },
    {
      title: "💌 EMAIL",
      desc: general.storeEmail,
    },
    {
      title: "☎ PHONE",
      desc: general.storePhone || "Phone not set yet.",
    },
  ];

  return (
    <div className={`nc-PageContact overflow-hidden`}>
      <div className="">
        <h2 className="my-20 flex items-center text-3xl leading-[115%] md:text-5xl md:leading-[115%] font-semibold text-neutral-900 dark:text-neutral-100 justify-center">
          Contact
        </h2>
        <div className="container max-w-7xl mx-auto">
          <div className="flex-shrink-0 grid grid-cols-1 md:grid-cols-2 gap-12 ">
            <div className="max-w-sm space-y-8">
              {info.map((item, index) => (
                <div key={index}>
                  <h3 className="uppercase font-semibold text-sm dark:text-neutral-200 tracking-wider">
                    {item.title}
                  </h3>
                  <span className="block mt-2 text-neutral-500 dark:text-neutral-400">
                    {item.desc}
                  </span>
                </div>
              ))}
              <div>
                <h3 className="uppercase font-semibold text-sm dark:text-neutral-200 tracking-wider">
                  🌏 SOCIALS
                </h3>
                <SocialsList className="mt-2" />
              </div>
            </div>
            <div>
              <ContactForm />
            </div>
          </div>
        </div>
      </div>

      {/* OTHER SECTIONS */}
      <div className="container">
        <div className="relative my-24 lg:my-32 py-24 lg:py-32">
          <BackgroundSection />
          <SectionPromo1 />
        </div>
      </div>
    </div>
  );
};

export default PageContact;
