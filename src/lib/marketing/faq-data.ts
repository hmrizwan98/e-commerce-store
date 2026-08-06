export interface PlatformFaq {
  question: string;
  answer: string;
}

export const PLATFORM_FAQS: PlatformFaq[] = [
  {
    question: "Is my store's data isolated from other stores?",
    answer:
      "Yes. The platform is built on a multi-tenant architecture where every store's data is structurally separated - orders, customers, products, and finance records for one store are never visible to another.",
  },
  {
    question: "What's the difference between Store Admin and Super Admin?",
    answer:
      "Store Admin is the panel you use to run your own store day-to-day - products, orders, customers, finance, content. Super Admin is the platform-operator panel used to provision new stores and oversee the whole platform.",
  },
  {
    question: "How does pricing work?",
    answer:
      "We use a commission-based model rather than a flat license fee - see our Pricing page. Exact rates are configured per store and discussed when you book a demo.",
  },
  {
    question: "Can I use my own domain?",
    answer: "Yes, custom domains are supported per store as part of the platform's deployment foundation.",
  },
  {
    question: "How are product images and media handled?",
    answer:
      "Every image you upload is processed and delivered through Cloudinary automatically - you don't need to manage hosting or optimization yourself.",
  },
  {
    question: "How do I get started?",
    answer: "Book a demo and we'll take you through provisioning your store and choosing a starter theme.",
  },
];
