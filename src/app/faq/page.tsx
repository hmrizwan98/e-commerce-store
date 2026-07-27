import AccordionInfo from "@/components/AccordionInfo";
import { getActiveFaqs } from "@/lib/firebase/repositories/faqs";

export const dynamic = "force-dynamic";

const FaqPage = async () => {
  const faqs = await getActiveFaqs();
  const data = faqs.map((f) => ({ name: f.question, content: f.answer }));

  return (
    <div className="container py-16 lg:pb-28 lg:pt-20 max-w-3xl">
      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold mb-10">
        Frequently Asked Questions
      </h1>
      {data.length ? (
        <AccordionInfo data={data} />
      ) : (
        <p className="text-slate-500 dark:text-slate-400">
          No FAQs have been published yet.
        </p>
      )}
    </div>
  );
};

export default FaqPage;
