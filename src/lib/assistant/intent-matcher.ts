import { KNOWLEDGE_REGISTRY } from "./knowledge-registry";
import type { ResolvedIntent, KnowledgeEntry, LiveStoreStats } from "./types";

const GREETING_KEYWORDS = [
  "assalam",
  "salam",
  "aoa",
  "hello",
  "hi",
  "hey",
  "kya kar sakte ho",
  "help",
  "madad",
  "kaise ho",
  "kese ho",
  "kon ho",
  "who are you",
];

/** Clean and normalize query for typos and variations */
function normalizeQuery(raw: string): string {
  let q = raw.trim().toLowerCase();

  // Normalize WhatsApp typos
  q = q.replace(/wahtsapp|watsapp|wasap|wtsap|whatsaap|whatapp|watsp/g, "whatsapp");

  // Normalize Category typos
  q = q.replace(/katgory|kategori|catgory/g, "category");

  // Normalize Product typos
  q = q.replace(/prduct|prodict|produks/g, "product");

  return q;
}

export function resolveIntent(query: string): ResolvedIntent {
  const normalized = normalizeQuery(query);

  // Helper check for action/how-to intent verbs
  const hasActionVerb =
    normalized.includes("add") ||
    normalized.includes("create") ||
    normalized.includes("kaise") ||
    normalized.includes("kesy") ||
    normalized.includes("kese") ||
    normalized.includes("kahan") ||
    normalized.includes("kahin") ||
    normalized.includes("nayi") ||
    normalized.includes("new") ||
    normalized.includes("banaun") ||
    normalized.includes("banayein") ||
    normalized.includes("lagayein") ||
    normalized.includes("lagani") ||
    normalized.includes("change") ||
    normalized.includes("update") ||
    normalized.includes("edit") ||
    normalized.includes("tarika");

  // Helper check for counting/query indicators
  const hasCountIndicator =
    normalized.includes("kitny") ||
    normalized.includes("kitne") ||
    normalized.includes("kitni") ||
    normalized.includes("kitna") ||
    normalized.includes("total") ||
    normalized.includes("count") ||
    normalized.includes("bany") ||
    normalized.includes("bane") ||
    normalized.includes("bana") ||
    normalized.includes("mojood") ||
    normalized.includes("hain") ||
    normalized.includes("hyn");

  // 1. Flexible Concept Matching for Live Store Stats
  const hasProductWord = normalized.includes("product") || normalized.includes("saman") || normalized.includes("item");
  const hasCategoryWord = normalized.includes("category");
  const hasThemeWord = normalized.includes("theme");
  const hasOrderWord = normalized.includes("order");
  const hasCustomerWord = normalized.includes("customer") || normalized.includes("user");
  const hasHomepageWord = normalized.includes("homepage") || normalized.includes("home page");

  const isPendingQuery = normalized.includes("pending");

  // Check pending order query (e.g. "mujhy ye pta rkna hy is waqt me kitny order pending me hyn")
  if (hasOrderWord && (isPendingQuery || hasCountIndicator || normalized.includes("receive") || normalized.includes("aye")) && !hasActionVerb) {
    return {
      intentId: "stat_pendingOrderCount",
      type: "live_stat",
      confidence: 0.99,
      statKey: isPendingQuery ? "pendingOrderCount" : "orderCount",
      customResponse: {
        textUrdu: "",
        textEnglish: "",
        actions: [{ label: "View Orders", href: "/admin/orders", primary: true }],
      },
    };
  }

  // Check pending product query (e.g. "pending ka btak koi product abhi pending me hy ya nhi")
  if (hasProductWord && (isPendingQuery || (hasCountIndicator && !hasActionVerb))) {
    return {
      intentId: "stat_pendingProductCount",
      type: "live_stat",
      confidence: 0.99,
      statKey: isPendingQuery ? "pendingProductCount" : "productCount",
      customResponse: {
        textUrdu: "",
        textEnglish: "",
        actions: [{ label: "View Products", href: "/admin/products", primary: true }],
      },
    };
  }
  // Check category count intent
  if (hasCategoryWord && (hasCountIndicator || normalized.includes("kitni")) && !hasActionVerb) {
    return {
      intentId: "stat_categoryCount",
      type: "live_stat",
      confidence: 0.98,
      statKey: "categoryCount",
      customResponse: {
        textUrdu: "",
        textEnglish: "",
        actions: [{ label: "View Categories", href: "/admin/categories", primary: true }],
      },
    };
  }

  // Check active theme query intent
  if (hasThemeWord && (normalized.includes("konsi") || normalized.includes("kaunsi") || normalized.includes("current") || normalized.includes("active") || normalized.includes("kon si") || normalized.includes("kya")) && !hasActionVerb) {
    return {
      intentId: "stat_activeThemeName",
      type: "live_stat",
      confidence: 0.98,
      statKey: "activeThemeName",
      customResponse: {
        textUrdu: "",
        textEnglish: "",
        actions: [{ label: "Theme Catalog", href: "/admin/appearance/themes", primary: true }],
      },
    };
  }

  // Check homepage sections query intent
  if (hasHomepageWord && (normalized.includes("section") || normalized.includes("sections") || hasCountIndicator) && !hasActionVerb) {
    return {
      intentId: "stat_homepageSectionCount",
      type: "live_stat",
      confidence: 0.98,
      statKey: "homepageSectionCount",
      customResponse: {
        textUrdu: "",
        textEnglish: "",
        actions: [{ label: "Customize Homepage", href: "/admin/appearance/customize", primary: true }],
      },
    };
  }

  // Check customer count intent
  if (hasCustomerWord && hasCountIndicator && !hasActionVerb) {
    return {
      intentId: "stat_customerCount",
      type: "live_stat",
      confidence: 0.98,
      statKey: "customerCount",
      customResponse: {
        textUrdu: "",
        textEnglish: "",
        actions: [{ label: "View Customers", href: "/admin/customers", primary: true }],
      },
    };
  }

  // Check homepage sections query intent
  if (hasHomepageWord && (normalized.includes("section") || normalized.includes("sections") || hasCountIndicator) && !hasActionVerb) {
    return {
      intentId: "stat_homepageSectionCount",
      type: "live_stat",
      confidence: 0.98,
      statKey: "homepageSectionCount",
      customResponse: {
        textUrdu: "",
        textEnglish: "",
        actions: [{ label: "Customize Homepage", href: "/admin/appearance/customize", primary: true }],
      },
    };
  }

  // 2. Check for Greetings
  const isGreeting = GREETING_KEYWORDS.some((g) => normalized === g || normalized.startsWith(`${g} `) || normalized.endsWith(` ${g}`));
  if (isGreeting) {
    return {
      intentId: "greeting",
      type: "greeting",
      confidence: 0.9,
      customResponse: {
        textUrdu:
          "Walaikum Assalam! Main aapka Webriz Store Assistant hoon. Main aapke store ki management (Products, Categories, WhatsApp, Navigation Menus, Banners, Themes, Orders) mein madad kar sakta hoon.\n\nAap mujhse pooch sakte hain:\n- WhatsApp number kaise add karun?\n- Menu me naya tab kaise add karun?\n- Product ya Category kaise banaun?\n- Slider mein image kaise lagayein?",
        textEnglish:
          "Hello! I am your Webriz Store Assistant. How can I help you manage your store today?",
      },
    };
  }

  // 3. Match against Knowledge Registry with Intent Scoring
  let bestKnowledge: KnowledgeEntry | null = null;
  let highestScore = 0;

  for (const entry of KNOWLEDGE_REGISTRY) {
    let score = 0;
    for (const kw of entry.keywords) {
      if (normalized.includes(kw)) {
        score += kw.length * 2;
      }
    }
    // Extra boost if user explicitly used action verb matching this topic
    if (hasActionVerb && normalized.includes(entry.category)) {
      score += 5;
    }

    if (score > highestScore) {
      highestScore = score;
      bestKnowledge = entry;
    }
  }

  if (bestKnowledge && highestScore >= 3) {
    return {
      intentId: bestKnowledge.id,
      type: "knowledge",
      confidence: Math.min(highestScore / 20, 0.99),
      knowledge: bestKnowledge,
    };
  }

  // 4. Smart Polite Fallback for Off-Topic or Ambiguous Queries
  return {
    intentId: "unknown",
    type: "unknown",
    confidence: 0,
    customResponse: {
      textUrdu:
        "Main aapke Webriz Store ke har feature aur setting se mutalliq sawalat ke jawabat de sakta hoon.\n\nAap mujhse pooch sakte hain:\n- **WhatsApp & Chat:** WhatsApp number kaise add karein?\n- **Navigation & Menus:** Header/Footer menu mein naya tab kaise add karein?\n- **Products & Categories:** Nayi product ya category kaise add karein?\n- **Payments & Shipping:** JazzCash, EasyPaisa, COD ya Delivery charges kaise set karein?\n- **Banners & Themes:** Slider image ya Storefront Theme kaise badlein?",
      textEnglish:
        "I can assist you with all store features and settings. Feel free to ask about WhatsApp, Menus, Products, Payments, Shipping, Banners, or Themes.",
    },
  };
}
