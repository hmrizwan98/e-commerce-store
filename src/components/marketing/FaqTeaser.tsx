import Link from "next/link";
import AccordionInfo from "@/components/AccordionInfo";
import { PLATFORM_FAQS } from "@/lib/marketing/faq-data";

export default function FaqTeaser() {
  const data = PLATFORM_FAQS.slice(0, 4).map((f) => ({ name: f.question, content: f.answer }));

  return (
    <section className="container py-20 lg:py-28 max-w-2xl mx-auto">
      <div className="text-center mb-10">
        <h2 className="text-2xl sm:text-3xl font-semibold">Common questions</h2>
      </div>
      <AccordionInfo data={data} />
      <div className="text-center mt-8">
        <Link href={"/faq" as any} className="font-medium text-primary-6000 hover:underline">
          View all FAQs →
        </Link>
      </div>
    </section>
  );
}
