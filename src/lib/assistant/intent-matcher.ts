import { KNOWLEDGE_REGISTRY } from "./knowledge-registry";
import { TROUBLESHOOTING_REGISTRY } from "./troubleshooting-registry";
import type { ResolvedIntent, KnowledgeEntry, TroubleshootingEntry, LiveStoreStats, AssistantLanguage } from "./types";

/** Minimum keyword score for a knowledge match. Below this the assistant says it doesn't
 * know rather than guessing. */
const KNOWLEDGE_THRESHOLD = 3;
/** Troubleshooting needs a stronger hit since it only runs on "something's wrong" framing
 * and a wrong diagnosis is worse than falling through to the how-to entry. */
const TROUBLESHOOTING_THRESHOLD = 6;

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Whole-word match for a single token - a plain `includes()` would let "shipping"
 * match inside "dropshipping" and misfire the shipping_settings entry for a completely
 * unsupported feature. `\b` is safe here since queries are always Latin-script; for tokens
 * that start/end with a non-word char (e.g. "$") we fall back to whitespace boundaries. */
function hasWord(normalized: string, word: string): boolean {
  const escaped = escapeRegExp(word);
  const start = /^\w/.test(word) ? "\\b" : "(?:^|\\s)";
  const end = /\w$/.test(word) ? "\\b" : "(?=\\s|$)";
  return new RegExp(`${start}${escaped}${end}`).test(normalized);
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
  return hasWord(normalized, phrase) || words.every((w) => hasWord(normalized, w));
}

/** Scores a registry entry's keyword list against the query: exact phrase hits (for
 * multi-word phrases, on word boundaries - so "order confirm" does not fire inside "order
 * confirmation") score highest, rewarding precise phrasing; whole-word and
 * bag-of-words hits score slightly lower but still count; keywords that don't match at
 * all score 0. */
function scoreKeywords(normalized: string, keywords: string[]): number {
  let score = 0;
  for (const kw of keywords) {
    if (kw.includes(" ") && hasWord(normalized, kw)) {
      score += kw.length * 2;
    } else if (matchesPhrase(normalized, kw)) {
      score += kw.length * 1.3;
    }
  }
  return score;
}

const GREETING_KEYWORDS = [
  "assalam",
  "assalamualaikum",
  "assalam o alaikum",
  "asalam",
  "salam",
  "slam",
  "aoa",
  "hello",
  "hi",
  "hey",
  "kya kar sakte ho",
  "what can you do",
  "help",
  "madad",
  "kaise ho",
  "kon ho",
  "kaun ho",
  "who are you",
  "good morning",
  "good evening",
  "thanks",
  "thank you",
  "shukriya",
];

/** Common misspellings and spacing variants -> the canonical spelling used by the
 * registries' keywords. Each pattern is whole-word (\b) so it never rewrites the middle
 * of an unrelated word. Order matters only where one rule's output feeds another. */
const TYPO_RULES: [RegExp, string][] = [
  // multi-word / spacing variants first
  [/\bwhats\s+app\b/g, "whatsapp"],
  [/\bhome\s+page\b/g, "homepage"],
  [/\bpop\s+ups?\b/g, "popup"],
  [/\be\s+mail\b/g, "email"],
  [/\blog\s+in\b/g, "login"],
  [/\bjazz\s+cash\b/g, "jazzcash"],
  [/\beasy\s+paisa\b/g, "easypaisa"],
  [/\bdomain\s+name\b/g, "domain"],
  [/\bcheck\s+out\b/g, "checkout"],
  [/\bsub\s+categor(y|ies)\b/g, "subcategory"],
  // WhatsApp
  [/\b(wahtsapp|watsapp|watsap|wasap|wtsap|whatsaap|whatapp|watsp|whatsap|whtsapp|whatsapps|watsaap|whatsapp's)\b/g, "whatsapp"],
  // Catalog
  [/\b(katgory|kategori|catgory|catagory|categry|catogery|catergory|ketagri|categori|catogary|categary)\b/g, "category"],
  [/\b(categries|catagories|catgories|categores|kategories|categoryies)\b/g, "categories"],
  [/\b(prduct|prodict|produks|prodct|porduct|prodcut|proudct|prouct|prodect|prodduct|prodoct)\b/g, "product"],
  [/\b(prducts|prodcuts|prodects|porducts|prodcts|produts)\b/g, "products"],
  [/\b(brnad|barnd|brend)\b/g, "brand"],
  [/\b(inventry|invetory|inventery|inventori|inventary)\b/g, "inventory"],
  [/\b(stok|stoke)\b/g, "stock"],
  [/\b(koleksn|collction|colection|collecton|collaction)\b/g, "collection"],
  [/\b(colections|collctions|collactions)\b/g, "collections"],
  [/\b(suplier|supplyer|suppliar)\b/g, "supplier"],
  [/\b(supliers|supplyers)\b/g, "suppliers"],
  [/\b(varient|veriant|varaint)\b/g, "variant"],
  [/\b(varients|veriants|varaints)\b/g, "variants"],
  // Orders & customers
  [/\b(ordr|oder|ordar|odrer|ordeer|odr)\b/g, "order"],
  [/\b(ordrs|oders|orderz|ordars|odrs)\b/g, "orders"],
  [/\b(costumer|custmer|coustomer|customar|kustomer|cusomer|custumer)\b/g, "customer"],
  [/\b(costumers|custmers|coustomers|customars|custumers)\b/g, "customers"],
  [/\b(invoce|invoic|invoise|invoic)\b/g, "invoice"],
  [/\b(traking|trcking|trakking|trackng)\b/g, "tracking"],
  [/\btrak\b/g, "track"],
  [/\b(curier|currier|corier|courir|kurier|coureer)\b/g, "courier"],
  [/\b(consigment|consignmnt|consignement|consinment)\b/g, "consignment"],
  [/\b(refnd|rifund|refand|refunt)\b/g, "refund"],
  [/\b(cancle|cansel|cancal|cencel|cancell)\b/g, "cancel"],
  [/\b(verfication|varification|verificaton|verifcation)\b/g, "verification"],
  [/\b(verfy|varify|verfiy|verifi)\b/g, "verify"],
  // Shipping & payments
  [/\b(shiping|shippng|shippin|shpping)\b/g, "shipping"],
  [/\b(delivry|dilivery|delevery|dilevery|delivary|delvery|delivey|dlivery)\b/g, "delivery"],
  [/\b(payement|paymnt|pyment|paymant|paymet)\b/g, "payment"],
  [/\b(payements|paymnts|pyments|paymants)\b/g, "payments"],
  [/\b(jazcash|jazzcah|jaazcash)\b/g, "jazzcash"],
  [/\b(easypesa|easypaise|esypaisa|easypasa)\b/g, "easypaisa"],
  [/\b(curency|currncy|currancy|currecy)\b/g, "currency"],
  [/\b(cupon|coupan|copon|coupen)\b/g, "coupon"],
  [/\b(discout|disount|discunt)\b/g, "discount"],
  // Appearance & content
  [/\b(theam|theem|thmee)\b/g, "theme"],
  [/\b(theams|theems)\b/g, "themes"],
  [/\b(baner|bannar|banar|bannr)\b/g, "banner"],
  [/\b(slidder|sldier|silder|slidr)\b/g, "slider"],
  [/\b(homepge|hompage|homepg)\b/g, "homepage"],
  [/\b(fevicon|favcon|favicn)\b/g, "favicon"],
  [/\b(menue|meanu)\b/g, "menu"],
  [/\b(anouncement|announcment|anouncment|annoucement)\b/g, "announcement"],
  [/\b(testimonail|testimonal|testmonial)\b/g, "testimonial"],
  [/\b(testimonails|testimonals|testmonials)\b/g, "testimonials"],
  [/\b(reveiw|reviw|rivew|reviwe)\b/g, "review"],
  [/\b(reveiws|reviws|rivews)\b/g, "reviews"],
  [/\b(analtics|anlytics|analitics|analytic|anyaltics)\b/g, "analytics"],
  // Settings & account
  [/\b(setings|settigs|settngs|settins|setttings)\b/g, "settings"],
  [/\b(pasword|paswrd|passwrd|pasward|passward|paasword|passwod)\b/g, "password"],
  [/\b(domian|domin|doamin|domen)\b/g, "domain"],
  [/\b(emial|emal|imail)\b/g, "email"],
  [/\b(loging|lgin)\b/g, "login"],
  // Roman Urdu spelling variants
  [/\b(kese|kesy|kaisy|kaisay|kaese|kayse|kesay|kesey|kaisey|kase)\b/g, "kaise"],
  [/\b(kahaan|kahn|kidhar|kdhr)\b/g, "kahan"],
  [/\b(nhi|nahin|nahee|nahii)\b/g, "nahi"],
  [/\bkrna\b/g, "karna"],
  [/\bkrni\b/g, "karni"],
  [/\bkrun\b/g, "karun"],
  [/\bkren\b/g, "karein"],
  [/\bawaaz\b/g, "awaz"],
];

/** Clean and normalize the query: lowercase, strip punctuation (keeping `$`), collapse
 * whitespace, then apply the typo map. */
export function normalizeQuery(raw: string): string {
  let q = raw.trim().toLowerCase();
  q = q.replace(/[?!.,;:"()[\]{}`~*_|/\\-]+/g, " ").replace(/'/g, "");
  q = q.replace(/\s+/g, " ").trim();
  for (const [pattern, replacement] of TYPO_RULES) {
    q = q.replace(pattern, replacement);
  }
  return q.replace(/\s+/g, " ").trim();
}

/** Roman Urdu marker tokens - if any appear (even mixed with English), the assistant
 * replies in Urdu, matching this product's Urdu-first audience (mixed queries get Urdu
 * replies; only clearly pure-English queries get English). This is intentionally a
 * simple, deterministic word-list check, not NLP. */
const URDU_MARKERS = [
  "kaise", "kesy", "kese", "kaisy", "kaisay", "kesay", "kyun", "kyu", "kyon", "kahan", "kahin", "kidhar",
  "kya", "kis", "kon", "kaun", "konsi", "kaunsi", "konsa", "kaunsa", "kab", "kitne", "kitni", "kitna", "kitny", "kitnay",
  "hy", "hai", "hain", "hyn", "hoga", "hogi", "honge", "hota", "hoti", "hotay", "hua", "hui", "hue",
  "karna", "karni", "karun", "karein", "karen", "karo", "kro", "krna", "krni", "krein", "kren", "kr", "kar", "krun",
  "banau", "banaun", "banayein", "bnani", "banani", "banana", "lagayein", "lagani", "lagana", "lagaun",
  "mein", "ka", "ki", "ke", "ko", "sy", "se", "wala", "wali", "wale", "nahi", "nahin", "nhi",
  "raha", "rahi", "rahe", "rha", "rhi", "rhe", "gaya", "gayi", "gya", "gyi", "aaya", "aayi", "aya", "ayi",
  "mujhe", "mujhy", "mera", "meri", "mere", "apna", "apni", "apne", "hamara", "hamari",
  "bhool", "yaad", "dikh", "dikhta", "dikhti", "dikhao", "batao", "bataen", "bataein", "samjhao",
  "milegi", "milega", "mila", "mili", "milta", "chahiye", "chahta", "chahti", "zaroori",
  "sakta", "sakti", "sakte", "abhi", "wapas", "kaam", "ye", "yeh", "wo", "woh", "aur", "bhi",
  "assalam", "salam", "aoa", "walaikum", "madad", "shukriya", "sochi", "pta", "pata",
];

/** Words that are Roman Urdu but also everyday English ("help me", "par" in golf) -
 * they only tip the reply into Urdu when a second marker is present. */
const WEAK_URDU_MARKERS = ["me", "par", "to"];

/** Detects whether the query should get an Urdu or English reply. */
export function detectLanguage(raw: string): AssistantLanguage {
  const words = raw
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .map((w) => w.replace(/[?.,!:;"'()]/g, ""))
    .filter(Boolean);
  const strong = words.filter((w) => URDU_MARKERS.includes(w)).length;
  const weak = words.filter((w) => WEAK_URDU_MARKERS.includes(w)).length;
  return strong > 0 || weak >= 2 ? "urdu" : "english";
}

const PROBLEM_MARKERS = [
  "nahi", "nahi aa raha", "nahi aa rahi", "nahi ho raha", "nahi ho rahi", "nahi dikh",
  "nahi mil", "kaam nahi", "show nahi", "missing", "not showing", "not working",
  "not appearing", "not received", "not resolving", "not updating", "not saving", "not",
  "isn't", "isnt", "doesn't", "doesnt", "didn't", "didnt", "won't", "wont", "can't", "cant",
  "cannot", "aren't", "arent", "disabled", "disappeared", "disappearing", "disappear", "gone",
  "issue", "problem", "masla", "error", "stuck", "fail", "failed",
  "khali", "ghayab", "gayab", "broken", "invalid", "galat", "wrong", "404",
];

/** Query "feels like" a problem report (something's broken) rather than a how-to
 * question - used to gate TROUBLESHOOTING_REGISTRY matching so "WhatsApp kaise
 * configure karun" (how-to) and "WhatsApp button nahi aa raha" (something's wrong)
 * resolve to different registries despite sharing the word "whatsapp". */
function hasProblemFraming(normalized: string): boolean {
  return PROBLEM_MARKERS.some((m) => matchesPhrase(normalized, m));
}

/** How-to / navigation verbs. When present, a count-sounding query ("kaise ... hain") is
 * a how-to question, not a live-stat question. Whole-word only, so "address" is not "add"
 * and "news" is not "new". */
const ACTION_VERBS = [
  "add", "create", "kaise", "kahan", "kahin", "banaun", "banau", "banana", "banani", "banayein", "bnani",
  "lagayein", "lagani", "lagana", "lagaun", "change", "update", "edit", "tarika", "how", "where",
  "setup", "configure", "connect", "enable", "disable", "delete", "remove", "karun", "karein", "set",
  "badlun", "badalna", "hatana", "hataun", "upload", "manage",
];

const COUNT_WORDS = ["kitne", "kitni", "kitna", "kitny", "kitnay", "kitney", "total", "count", "tadad", "tadaad"];

function hasAny(normalized: string, words: string[]): boolean {
  return words.some((w) => matchesPhrase(normalized, w));
}

function liveStat(
  intentId: string,
  statKey: keyof LiveStoreStats,
  language: AssistantLanguage,
  action: { label: string; href: string },
  confidence = 0.98
): ResolvedIntent {
  return {
    intentId,
    type: "live_stat",
    confidence,
    language,
    statKey,
    customResponse: { textUrdu: "", textEnglish: "", actions: [{ ...action, primary: true }] },
  };
}

/** Live store numbers ("Kitne orders pending hain?"). Returns null when the query isn't a
 * clear count/status question - those continue on to the knowledge registry. */
function resolveLiveStat(normalized: string, language: AssistantLanguage): ResolvedIntent | null {
  // "how many" / "how much" are count phrases, not the how-to verb "how".
  const withoutCountPhrases = normalized.replace(/\bhow (many|much)\b/g, " ");
  const hasActionVerb = hasAny(withoutCountPhrases, ACTION_VERBS);
  if (hasActionVerb) return null;

  const hasCount = hasAny(normalized, COUNT_WORDS) || /\bhow (many|much)\b/.test(normalized) || normalized.includes("number of");
  const isPending = hasWord(normalized, "pending");

  const hasOrderWord = hasAny(normalized, ["order", "orders"]);
  const hasProductWord = hasAny(normalized, ["product", "products", "saman", "samaan", "item", "items"]);
  const hasCategoryWord = hasAny(normalized, ["category", "categories"]);
  const hasThemeWord = hasAny(normalized, ["theme", "themes"]);
  const hasCustomerWord = hasAny(normalized, ["customer", "customers", "user", "users", "buyers"]);
  const hasHomepageWord = hasWord(normalized, "homepage");

  // e.g. "mujhy ye pta rkna hy is waqt me kitny order pending me hyn", "aaj kitne orders aaye"
  // ("pending verification" is a question about the COD card, not a count.)
  const orderArrival = hasAny(normalized, ["aye", "aaye", "aaya", "aya"]) && hasAny(normalized, ["aaj", "today", "naye", "new"]);
  if (hasOrderWord && (hasCount || orderArrival || (isPending && !/\bverif|\breject|\bconfirm/.test(normalized)))) {
    return liveStat("stat_pendingOrderCount", isPending ? "pendingOrderCount" : "orderCount", language, {
      label: "View Orders",
      href: "/admin/orders",
    }, 0.99);
  }

  // e.g. "pending ka btak koi product abhi pending me hy ya nhi", "kitne products hain"
  // Stock questions go to the Inventory entry instead (there's no out-of-stock stat reply).
  if (hasProductWord && (hasCount || isPending) && !hasWord(normalized, "stock")) {
    return liveStat("stat_pendingProductCount", isPending ? "pendingProductCount" : "productCount", language, {
      label: "View Products",
      href: "/admin/products",
    }, 0.99);
  }

  if (hasCategoryWord && hasCount) {
    return liveStat("stat_categoryCount", "categoryCount", language, { label: "View Categories", href: "/admin/categories" });
  }

  const asksWhichTheme = hasAny(normalized, [
    "konsi", "kaunsi", "kon si", "kaun si", "konsa", "kaunsa", "current", "currently", "which",
    "active theme", "live theme", "meri theme", "my theme", "abhi",
  ]);
  if (hasThemeWord && asksWhichTheme) {
    return liveStat("stat_activeThemeName", "activeThemeName", language, { label: "Theme Catalog", href: "/admin/appearance/themes" });
  }

  if (hasHomepageWord && (hasCount || hasAny(normalized, ["kaun se sections", "kon se sections", "konse sections", "which sections"]))) {
    return liveStat("stat_homepageSectionCount", "homepageSectionCount", language, {
      label: "Customize Homepage",
      href: "/admin/appearance/customize",
    });
  }

  if (hasCustomerWord && hasCount) {
    return liveStat("stat_customerCount", "customerCount", language, { label: "View Customers", href: "/admin/customers" });
  }

  return null;
}

function isGreeting(normalized: string): boolean {
  return GREETING_KEYWORDS.some((g) => normalized === g || normalized.startsWith(`${g} `) || normalized.endsWith(` ${g}`));
}

/** Best-scoring entry of a registry (ties keep the earlier entry). */
function bestMatch<T extends { keywords: string[] }>(
  normalized: string,
  entries: T[],
  bonus?: (entry: T) => number
): { entry: T | null; score: number } {
  let best: T | null = null;
  let highest = 0;
  for (const entry of entries) {
    const score = scoreKeywords(normalized, entry.keywords) + (bonus ? bonus(entry) : 0);
    if (score > highest) {
      highest = score;
      best = entry;
    }
  }
  return { entry: best, score: highest };
}

export function resolveIntent(query: string): ResolvedIntent {
  const normalized = normalizeQuery(query);
  const language = detectLanguage(query);

  // 1. Troubleshooting - only when the query reads as "something's wrong" (not a plain
  // how-to), so "WhatsApp kaise configure karun" still resolves to the how-to entry.
  if (hasProblemFraming(normalized)) {
    const { entry, score } = bestMatch<TroubleshootingEntry>(normalized, TROUBLESHOOTING_REGISTRY);
    if (entry && score >= TROUBLESHOOTING_THRESHOLD) {
      return {
        intentId: entry.id,
        type: "troubleshooting",
        confidence: Math.min(score / 20, 0.99),
        language,
        troubleshooting: entry,
      };
    }
  }

  // 2. Live store numbers ("Kitne orders pending hain?").
  const stat = resolveLiveStat(normalized, language);
  if (stat) return stat;

  // 3. Knowledge registry. A how-to verb plus the entry's category word ("settings",
  // "catalog"...) adds a small boost.
  const hasActionVerb = hasAny(normalized, ACTION_VERBS);
  const { entry: knowledge, score } = bestMatch<KnowledgeEntry>(normalized, KNOWLEDGE_REGISTRY, (entry) =>
    hasActionVerb && hasWord(normalized, entry.category) ? 5 : 0
  );
  if (knowledge && score >= KNOWLEDGE_THRESHOLD) {
    return {
      intentId: knowledge.id,
      type: "knowledge",
      confidence: Math.min(score / 20, 0.99),
      language,
      knowledge,
    };
  }

  // 4. Greetings / "what can you do" - checked after topics so "salam, product kaise add
  // karun" still gets the product answer.
  if (isGreeting(normalized)) {
    return {
      intentId: "greeting",
      type: "greeting",
      confidence: 0.9,
      language,
      customResponse: {
        textUrdu:
          "Walaikum Assalam! Main aapka Webriiz Store Assistant hoon. Main Store Admin ke har hissay mein madad kar sakta hoon - Products, Categories, Orders, COD verification, Customers, Finance, Analytics, Menus, Pages, Banners, Themes aur Settings.\n\nAap mujhse pooch sakte hain:\n- Nayi product kaise add karun?\n- COD order kaise confirm karun?\n- Delivery charges kaise set karun?\n- Kitne orders pending hain?\n- WhatsApp button kyun nahi aa raha?",
        textEnglish:
          "Hello! I'm your Webriiz Store Assistant. I can help with every part of Store Admin - Products, Categories, Orders, COD verification, Customers, Finance, Analytics, Menus, Pages, Banners, Themes and Settings.\n\nYou can ask me things like:\n- How do I add a new product?\n- How do I confirm a COD order?\n- How do I set delivery charges?\n- How many orders are pending?\n- Why isn't my WhatsApp button showing?",
      },
    };
  }

  // 5. Nothing matched well enough - say so plainly instead of guessing.
  return {
    intentId: "unknown",
    type: "unknown",
    confidence: 0,
    language,
    customResponse: {
      textUrdu:
        "Maaf kijiye, mujhe is sawal ka pakka jawab nahi mila, is liye main andaza nahi lagaunga. Main sirf Webriiz Store Admin ke features ke bare mein bata sakta hoon.\n\nAap mujhse pooch sakte hain:\n- **Catalog:** Product, variant, category, brand ya stock kaise manage karun?\n- **Orders:** Order status, COD verification, courier tracking, cancel ya refund?\n- **Appearance:** Theme, homepage sections, slider, logo ya popup?\n- **Settings:** Shipping, payments (COD, Bank Transfer, JazzCash), WhatsApp, currency, domain ya password?\n- **Masail:** Jaise 'Product storefront par nahi dikh raha'",
      textEnglish:
        "Sorry, I couldn't find a reliable answer to that, so I won't guess. I can only help with Webriiz Store Admin features.\n\nYou can ask me about:\n- **Catalog:** Managing products, variants, categories, brands or stock\n- **Orders:** Order status, COD verification, courier tracking, cancelling or refunds\n- **Appearance:** Theme, homepage sections, slider, logo or popup\n- **Settings:** Shipping, payments (COD, Bank Transfer, JazzCash), WhatsApp, currency, domain or password\n- **Problems:** e.g. 'My product isn't showing on the storefront'",
    },
  };
}
