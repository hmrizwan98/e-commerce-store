export interface PlatformFaq {
  question: string;
  answer: string;
}

export const PLATFORM_FAQS: PlatformFaq[] = [
  {
    question: "Is my store's data isolated from other stores?",
    answer:
      "Yes. Every store's data is kept completely separate - your orders, customers, products and sales are never visible to any other store.",
  },
  {
    question: "Who manages the platform behind my store?",
    answer:
      "You run your store day-to-day from your own dashboard - products, orders, customers, sales and content. The Webriiz team looks after the platform itself: setting up new stores, keeping everything running, and helping you when you need it.",
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
      "Every image you upload is resized and served quickly automatically - you don't need to manage hosting or image optimisation yourself.",
  },
  {
    question: "How do I get started?",
    answer: "Book a demo and we'll take you through provisioning your store and choosing a starter theme.",
  },
];
