import { KNOWLEDGE_REGISTRY } from "./knowledge-registry";
import { TROUBLESHOOTING_REGISTRY } from "./troubleshooting-registry";
import type { ResolvedIntent, KnowledgeEntry, TroubleshootingEntry, LiveStoreStats, AssistantLanguage } from "./types";

/** Whole-word match for a single token - a plain `includes()` would let "shipping"
 * match inside "dropshipping" and misfire the shipping_settings entry for a completely
 * unsupported feature. `\b` is safe here since queries are always Latin-script. */
function hasWord(normalized: string, word: string): boolean {
  return new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`).test(normalized);
}

/** True if `phrase` matches the query. Single-word keywords always use a whole-word
 * check (so "shipping" never fires from inside "dropshipping"). Multi-word keywords
 * match either as an exact substring, or as a "bag of words" - every word in the phrase
 * appears somewhere in the query as its own whole word, in any order. The bag-of-words
 * fallback is what lets "customer ka order kaise verify karun" still match a
 * "customer order verify" keyword despite the inserted "ka kaise", and "how do I reset
 * my password" match "password reset" despite the reversed word order - both are real
 * Roman Urdu / natural-English variations, not edge cases. */
function matchesPhrase(normalized: string, phrase: string): boolean {
  const words = phrase.split(/\s+/).filter(Boolean);
  if (words.length < 2) return hasWord(normalized, phrase);
  return normalized.includes(phrase) || words.every((w) => hasWord(normalized, w));
}

/** Scores a registry entry's keyword list against the query: exact substring hits (for
 * multi-word phrases) score highest, rewarding precise phrasing; whole-word and
 * bag-of-words hits score slightly lower but still count; keywords that don't match at
 * all score 0. */
function scoreKeywords(normalized: string, keywords: string[]): number {
  let score = 0;
  for (const kw of keywords) {
    if (kw.includes(" ") && normalized.includes(kw)) {
      score += kw.length * 2;
    } else if (matchesPhrase(normalized, kw)) {
      score += kw.length * 1.3;
    }
  }
  return score;
}

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

  // Normalize Password typos
  q = q.replace(/pasword|paswrd|passwrd/g, "password");

  // Normalize Domain typos
  q = q.replace(/domian|domain\s*name/g, "domain");

  // Normalize Collection/Supplier typos
  q = q.replace(/koleksn|collction/g, "collection");
  q = q.replace(/suplier|supliers/g, "supplier");

  return q;
}

/** Roman Urdu marker tokens - if any appear (even mixed with English), the assistant
 * replies in Urdu, matching this product's Urdu-first audience and the task's own
 * examples (mixed queries get Urdu replies; only clearly pure-English queries get
 * English). This is intentionally a simple, deterministic word-list check, not NLP -
 * consistent with "keep the assistant lightweight, no external AI dependency". */
const URDU_MARKERS = [
  "kaise", "kesy", "kese", "kaisy", "kyun", "kyu", "kahan", "kahin", "kya", "kis",
  "hy", "hai", "hain", "hoga", "hogi", "honge", "karna", "karni", "karun", "karein",
  "kro", "krna", "krein", "kren", "banau", "banayein", "bnani", "lagayein", "lagani",
  "mein", "me", "ka", "ki", "ke", "wala", "wali", "nahi", "nahin", "raha", "rahi",
  "rha", "rhi", "mujhe", "mujhy", "apna", "apni", "bhool", "yaad", "dikh", "dikhta",
  "dikhta", "milegi", "mila", "milta", "sy", "se", "par", "kro", "chahiye", "zaroori",
  "assalam", "salam", "aoa", "walaikum", "madad", "sochi",
];

/** Detects whether the query should get an Urdu or English reply. */
export function detectLanguage(raw: string): AssistantLanguage {
  const normalized = raw.trim().toLowerCase();
  const words = normalized.split(/\s+/);
  const hasUrduMarker = words.some((w) => URDU_MARKERS.includes(w.replace(/[?.,!]/g, "")));
  return hasUrduMarker ? "urdu" : "english";
}

/** Query "feels like" a problem report (something's broken) rather than a how-to
 * question - used to gate TROUBLESHOOTING_REGISTRY matching so "WhatsApp kaise
 * configure karun" (how-to) and "WhatsApp button nahi aa raha" (something's wrong)
 * resolve to different registries despite sharing the word "whatsapp". */
function hasProblemFraming(normalized: string): boolean {
  const PROBLEM_MARKERS = [
    "nahi aa raha", "nahi aa rahi", "nahi ho raha", "nahi ho rahi", "nahi dikh",
    "nahi mil", "nahi mila", "nahi mili", "kaam nahi", "show nahi", "missing",
    "not showing", "not working", "not appearing", "not received", "not resolving",
    "not updating", "isn't showing", "isn't working", "won't", "can't", "cannot",
    "issue", "problem", "error", "stuck", "fail", "khali", "ghayab", "gayab",
    "broken", "invalid",
  ];
  return PROBLEM_MARKERS.some((m) => matchesPhrase(normalized, m));
}

export function resolveIntent(query: string): ResolvedIntent {
  const normalized = normalizeQuery(query);
  const language = detectLanguage(query);

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
  if (hasOrderWord && (isPendingQuery || hasCountIndicator || normalized.includes("receive") || hasWord(normalized, "aye")) && !hasActionVerb) {
    return {
      intentId: "stat_pendingOrderCount",
      type: "live_stat",
      confidence: 0.99,
      language,
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
      language,
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
      language,
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
      language,
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
      language,
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
      language,
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
      language,
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
      language,
      customResponse: {
        textUrdu:
          "Walaikum Assalam! Main aapka Webriz Store Assistant hoon. Main aapke store ki management (Products, Categories, WhatsApp, Navigation Menus, Banners, Themes, Orders) mein madad kar sakta hoon.\n\nAap mujhse pooch sakte hain:\n- WhatsApp number kaise add karun?\n- Menu me naya tab kaise add karun?\n- Product ya Category kaise banaun?\n- Slider mein image kaise lagayein?",
        textEnglish:
          "Hello! I'm your Webriz Store Assistant. I can help with managing your store (Products, Categories, WhatsApp, Navigation Menus, Banners, Themes, Orders) and troubleshooting common issues.\n\nYou can ask me things like:\n- How do I add a WhatsApp number?\n- How do I add a new tab to a menu?\n- How do I create a product or category?\n- Why isn't my WhatsApp button showing?",
      },
    };
  }

  // 3. Match against Troubleshooting Registry - only when the query reads as "something's
  // wrong" (not a plain how-to question), so e.g. "WhatsApp kaise configure karun" still
  // resolves to the how-to knowledge entry, not this diagnostic one.
  if (hasProblemFraming(normalized)) {
    let bestTroubleshooting: TroubleshootingEntry | null = null;
    let highestTsScore = 0;

    for (const entry of TROUBLESHOOTING_REGISTRY) {
      const score = scoreKeywords(normalized, entry.keywords);
      if (score > highestTsScore) {
        highestTsScore = score;
        bestTroubleshooting = entry;
      }
    }

    if (bestTroubleshooting && highestTsScore >= 6) {
      return {
        intentId: bestTroubleshooting.id,
        type: "troubleshooting",
        confidence: Math.min(highestTsScore / 20, 0.99),
        language,
        troubleshooting: bestTroubleshooting,
      };
    }
  }

  // 4. Match against Knowledge Registry with Intent Scoring
  let bestKnowledge: KnowledgeEntry | null = null;
  let highestScore = 0;

  for (const entry of KNOWLEDGE_REGISTRY) {
    let score = scoreKeywords(normalized, entry.keywords);
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
      language,
      knowledge: bestKnowledge,
    };
  }

  // 5. Smart Polite Fallback for Off-Topic or Ambiguous Queries
  return {
    intentId: "unknown",
    type: "unknown",
    confidence: 0,
    language,
    customResponse: {
      textUrdu:
        "Mujhe is sawal ka theek jawab nahi mil saka - agar ye Webriiz ka koi feature hai jo abhi implement nahi hua, to seedha keh dunga ke 'ye feature abhi available nahi hai'.\n\nAap mujhse pooch sakte hain:\n- **WhatsApp & Chat:** WhatsApp number kaise add karein?\n- **Navigation & Menus:** Header/Footer menu mein naya tab kaise add karein?\n- **Products & Categories:** Nayi product ya category kaise add karein?\n- **Payments & Shipping:** JazzCash, EasyPaisa, COD ya Delivery charges kaise set karein?\n- **Banners & Themes:** Slider image ya Storefront Theme kaise badlein?\n- **Password/Login/Email:** Password reset ya email delivery se mutalliq masail?\n- **Troubleshooting:** Kisi cheez ka kaam na karna (jaise 'WhatsApp button nahi aa raha')?",
      textEnglish:
        "I couldn't quite match that question - if it's about a Webriiz feature that isn't implemented yet, I'll tell you plainly instead of guessing.\n\nYou can ask me about:\n- **WhatsApp & Chat:** How do I add a WhatsApp number?\n- **Navigation & Menus:** How do I add a new tab to the header/footer menu?\n- **Products & Categories:** How do I add a new product or category?\n- **Payments & Shipping:** How do I set up JazzCash, EasyPaisa, COD, or delivery charges?\n- **Banners & Themes:** How do I change the slider or storefront theme?\n- **Password/Login/Email:** Password reset or email delivery issues?\n- **Troubleshooting:** Something not working (e.g. 'WhatsApp button not showing')?",
    },
  };
}
