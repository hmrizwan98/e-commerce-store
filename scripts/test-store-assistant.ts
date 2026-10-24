/**
 * Store Assistant - intent matching + registry integrity tests.
 * Run: npx tsx --test scripts/test-store-assistant.ts
 *
 * Pure, deterministic checks (no Firestore, no network): every question below must resolve
 * to the expected knowledge/troubleshooting entry, live stat, greeting, or "unknown".
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import path from "node:path";
import { resolveIntent, detectLanguage, normalizeQuery } from "../src/lib/assistant/intent-matcher";
import { KNOWLEDGE_REGISTRY } from "../src/lib/assistant/knowledge-registry";
import { TROUBLESHOOTING_REGISTRY } from "../src/lib/assistant/troubleshooting-registry";
import type { ResolvedIntent } from "../src/lib/assistant/types";

type Expect =
  | { k: string } // knowledge entry id
  | { t: string } // troubleshooting entry id
  | { stat: string } // live stat key
  | "greeting"
  | "unknown";

/** [question, expected] - English, Roman Urdu, mixed and misspelled forms. */
const CASES: [string, Expect][] = [
  // ── Catalog ──
  ["How do I add a new product?", { k: "add_product" }],
  ["Product kahan sy add karni hy?", { k: "add_product" }],
  ["nayi prodcut kese add krun", { k: "add_product" }],
  ["product ki price kaise change karun", { k: "add_product" }],
  ["Product mein size aur color kaise add karun?", { k: "product_variants" }],
  ["how do i add variants to a product", { k: "product_variants" }],
  ["product delete kaise karun", { k: "product_trash_duplicate" }],
  ["How do I duplicate a product?", { k: "product_trash_duplicate" }],
  ["Product ko featured kaise karun?", { k: "product_merchandising" }],
  ["new arrival mein product kaise dalun", { k: "product_merchandising" }],
  ["Products Excel se import kaise karun?", { k: "product_bulk_import_export" }],
  ["Category kesy bnani hy?", { k: "create_category" }],
  ["nayi catagory kaise banaun", { k: "create_category" }],
  ["How do I create a sub category?", { k: "create_category" }],
  ["Brand kaise add karun?", { k: "manage_brands" }],
  ["Stock kaise update karun?", { k: "manage_inventory" }],
  ["where is inventry management", { k: "manage_inventory" }],
  ["Collection kaise banani hai?", { k: "manage_collections" }],
  ["suplier kaise add karun", { k: "manage_suppliers" }],

  // ── Orders ──
  ["Orders kahan dikhte hain?", { k: "view_orders" }],
  ["Order ka status kaise change karun?", { k: "order_status_update" }],
  ["How do I mark an order as shipped?", { k: "order_status_update" }],
  ["Consignment number kaise enter karun?", { k: "courier_tracking_number" }],
  ["Where do I add the TCS tracking number?", { k: "courier_tracking_number" }],
  ["Order cancle kaise karun?", { k: "cancel_order" }],
  ["Refund kaise karun?", { k: "order_refund_return" }],
  ["How do I process a return?", { k: "order_refund_return" }],
  ["Order ko paid kaise mark karun?", { k: "order_payment_status" }],
  ["Invoice kaise print karun?", { k: "print_invoice" }],
  ["Orders ki Excel file kaise nikalun? export orders", { k: "order_export" }],
  ["Order delivered karne ke baad kya hota hai?", { k: "order_delivered_lifecycle" }],
  ["Customer apna order kaise track karega?", { k: "customer_order_verification" }],
  ["Customer ka order kaise verify karun?", { k: "customer_order_verification" }],
  ["COD order kaise confirm karun?", { k: "cod_order_verification" }],
  ["Order verification card kya hai?", { k: "cod_order_verification" }],
  ["Fake order kaise reject karun?", { k: "cod_order_verification" }],
  ["Naye order par awaz kyun nahi aa rahi?", { k: "new_order_sound" }],

  // ── Customers / money / analytics ──
  ["Customer history kaise dekhun?", { k: "view_customers" }],
  ["How do I block a customer?", { k: "view_customers" }],
  ["Customers ki list Excel mein export kaise karun?", { k: "customer_export" }],
  ["Finance summary kahan hy?", { k: "finance_payouts" }],
  ["Where can I check my earnings?", { k: "finance_payouts" }],
  ["Store analytics kahan hain?", { k: "analytics_reports" }],
  ["Sales report kaise dekhun?", { k: "analytics_reports" }],
  ["Facebook pixel kaise lagayein?", { k: "analytics_tracking_pixels" }],
  ["Where do I add my Google Analytics ID?", { k: "analytics_tracking_pixels" }],
  ["Dashboard par kya kya hai?", { k: "dashboard_overview" }],

  // ── Content ──
  ["Menu me ik new tab add krna hy kesy ho ga?", { k: "manage_menus" }],
  ["Header menu me new link kaise add karun?", { k: "manage_menus" }],
  ["footer links kaise badlun", { k: "manage_menus" }],
  ["Privacy Policy page kaise banaun?", { k: "manage_pages" }],
  ["How do I create an About Us page?", { k: "manage_pages" }],
  ["FAQ kaise add karun?", { k: "manage_faqs" }],
  ["Reviews kaise approve karun?", { k: "manage_reviews" }],
  ["Blog post kaise add karun?", { k: "blog_posts" }],
  ["Testimonial kaise add karun?", { k: "manage_testimonials" }],
  ["Announcement bar kaise lagayein?", { k: "manage_announcements" }],

  // ── Appearance ──
  ["Theme kesy change krni hy?", { k: "change_theme" }],
  ["theam kaise badlun", { k: "change_theme" }],
  ["Homepage customize kesy krni hy?", { k: "customize_homepage" }],
  ["How do I add a section to the home page?", { k: "customize_homepage" }],
  ["Store ke colors kaise change karun?", { k: "storefront_colors_fonts" }],
  ["How do I change the font?", { k: "storefront_colors_fonts" }],
  ["Logo kaise change karun?", { k: "store_logo" }],
  ["How do I upload a fevicon?", { k: "store_logo" }],
  ["Slider me new image kesy lagani hy?", { k: "add_hero_slide" }],
  ["Main banner kaise change karun?", { k: "add_hero_slide" }],
  ["Promo banner kaise lagayein?", { k: "promo_banners" }],
  ["Popup banner kaise lagayein?", { k: "popups_modals" }],
  ["How do I enable a discount pop-up?", { k: "popups_modals" }],
  ["Theme editor kahan hai?", { k: "theme_editor" }],

  // ── Settings ──
  ["Store settings kahan hain?", { k: "manage_settings" }],
  ["Store ka naam kaise change karun?", { k: "general_store_info" }],
  ["Currency kaise badlun?", { k: "store_currency" }],
  ["Prices mein $ ki jagah Rs kaise dikhaun?", { k: "store_currency" }],
  ["GST tax kaise lagayein?", { k: "tax_settings" }],
  ["Delivery charges kaise set karun?", { k: "shipping_settings" }],
  ["Free shipping threshold kaise lagayein?", { k: "shipping_settings" }],
  ["dilivery charges kaise lagaun", { k: "shipping_settings" }],
  ["JazzCash/EasyPaisa account kaise add karun?", { k: "payment_settings" }],
  ["Cash on Delivery (COD) kaise enable karun?", { k: "payment_settings" }],
  ["Can customers pay with credit card?", { k: "payment_settings" }],
  ["Commission kahan set hota hai?", { k: "commission_settings" }],
  ["SEO kaise karun?", { k: "seo_settings" }],
  ["Instagram link kaise lagayein?", { k: "social_links" }],
  ["Admin panel ka color kaise badlun?", { k: "branding_settings" }],
  ["WhatsApp number add krna hy kesy ho ga?", { k: "whatsapp_settings" }],
  ["watsapp button kaise lagayein", { k: "whatsapp_settings" }],
  ["Customer ko order ki email kis naam se jati hai?", { k: "order_confirmation_email" }],
  ["Email template kaise badlun?", { k: "email_templates" }],
  ["SMTP kaise set karun?", { k: "integrations_settings" }],
  ["SMS notification kaise on karun?", { k: "notifications_settings" }],
  ["Store ka backup kaise lun?", { k: "backup_settings" }],
  ["Store ko maintenance mode mein kaise dalun?", { k: "advanced_settings" }],
  ["Store ki language kaise badlun?", { k: "localization_settings" }],
  ["Apna password kaise change karun?", { k: "change_password_store_admin" }],
  ["Password bhool gaya, kya karun?", { k: "forgot_password" }],
  ["How do I reset my pasword?", { k: "forgot_password" }],
  ["Custom domain kaise connect karun?", { k: "custom_domain" }],
  ["how to connect my own domian", { k: "custom_domain" }],

  // ── General ──
  ["Store setup wizard kahan hai?", { k: "onboarding_wizard" }],
  ["Store Admin URL kya hai?", { k: "storefront_vs_admin_url" }],
  ["Email kis address se jayegi?", { k: "platform_sender_email" }],
  ["Store create hone ke baad owner ko email kaise milegi?", { k: "welcome_email_after_store_creation" }],
  ["Discount coupon kaise banaun?", { k: "discount_coupons" }],
  ["Staff member kaise add karun?", { k: "staff_accounts" }],

  // ── Troubleshooting ──
  ["WhatsApp button storefront par kyun nahi aa raha?", { t: "whatsapp_button_missing" }],
  ["Customer ko WhatsApp message kyun nahi gaya?", { t: "whatsapp_order_message_not_sent" }],
  ["Product storefront par nahi dikh raha", { t: "product_not_appearing" }],
  ["Why isn't my new product showing up?", { t: "product_not_appearing" }],
  ["Product save nahi ho raha", { t: "product_save_error" }],
  ["Image upload nahi ho rahi", { t: "image_not_showing" }],
  ["My logo isn't showing", { t: "image_not_showing" }],
  ["Category nahi mil rahi", { t: "category_missing" }],
  ["Order status change nahi ho raha", { t: "order_status_not_updating" }],
  ["Tracking number save nahi ho raha", { t: "courier_details_not_saving" }],
  ["Order cancel kiya lekin stock wapas nahi aya", { t: "stock_not_restored" }],
  ["Login nahi ho raha", { t: "login_problem" }],
  ["My reset link isn't working", { t: "password_reset_problem" }],
  ["Customer ko order confirmation email nahi mili", { t: "email_not_received" }],
  ["Theme changes nahi dikh rahe", { t: "theme_changes_not_appearing" }],
  ["Slider homepage par nahi aa raha", { t: "slider_not_showing" }],
  ["Popup show nahi ho raha", { t: "popup_not_showing" }],
  ["Announcement bar nahi dikh raha", { t: "announcement_bar_not_showing" }],
  ["Menu mein naya link show nahi ho raha", { t: "menu_link_not_showing" }],
  ["Privacy page nahi khul raha 404 aa raha", { t: "page_not_showing" }],
  ["Review show nahi ho raha", { t: "review_not_showing" }],
  ["Custom domain kaam nahi kar raha", { t: "domain_not_resolving" }],
  ["Customer checkout nahi kar pa raha", { t: "checkout_issue" }],
  ["Checkout par JazzCash option nahi aa raha", { t: "payment_method_missing" }],
  ["Free shipping nahi lag rahi", { t: "shipping_charge_wrong" }],
  ["Customer order track nahi kar pa raha", { t: "order_tracking_not_working" }],
  ["Settings save nahi ho rahi", { t: "settings_not_saving" }],
  ["Cart khali dikh raha hai", { t: "cart_issue" }],
  ["export button kaam nahi kar raha", { t: "export_import_not_working" }],
  ["menu save nahi ho raha", { t: "menu_link_not_showing" }],
  ["COD order confirm nahi ho raha", { t: "order_status_not_updating" }],
  ["I cannot login", { t: "login_problem" }],

  // ── Unavailable features answer honestly ──
  ["order delete kaise karun", { k: "cancel_order" }],
  ["TCS ke sath integration hai?", { k: "courier_tracking_number" }],
  ["Store ko maintenance mode mein kaise dalun", { k: "advanced_settings" }],
  ["Can I bulk upload products from CSV?", { k: "product_bulk_import_export" }],

  // ── Live stats ──
  ["Kitne orders pending hain?", { stat: "pendingOrderCount" }],
  ["mujhy ye pta rkna hy is waqt me kitny order pending me hyn", { stat: "pendingOrderCount" }],
  ["How many orders do I have?", { stat: "orderCount" }],
  ["pending ka btak koi product abhi pending me hy ya nhi", { stat: "pendingProductCount" }],
  ["store mein kitne products hain", { stat: "productCount" }],
  ["Kitni categories bani hain?", { stat: "categoryCount" }],
  ["meri current theme konsi hy", { stat: "activeThemeName" }],
  ["Which theme is active?", { stat: "activeThemeName" }],
  ["homepage par kitne sections hain", { stat: "homepageSectionCount" }],
  ["Kitne customers hain?", { stat: "customerCount" }],

  // ── Greetings ──
  ["Assalam o alaikum", "greeting"],
  ["hello", "greeting"],
  ["kya kar sakte ho", "greeting"],

  // ── Out of scope: must not guess ──
  ["Aaj mausam kaisa hai?", "unknown"],
  ["What is the capital of France?", "unknown"],
  ["Write me a poem about the sea", "unknown"],
  ["cricket match ka score batao", "unknown"],
  ["bitcoin ka rate kya hai", "unknown"],
  ["Who won the football world cup?", "unknown"],
  ["mujhe biryani ki recipe chahiye", "unknown"],
];

function describe(r: ResolvedIntent): string {
  if (r.type === "knowledge") return `knowledge:${r.knowledge?.id}`;
  if (r.type === "troubleshooting") return `troubleshooting:${r.troubleshooting?.id}`;
  if (r.type === "live_stat") return `live_stat:${String(r.statKey)}`;
  return r.type;
}

function expected(e: Expect): string {
  if (e === "greeting" || e === "unknown") return e;
  if ("k" in e) return `knowledge:${e.k}`;
  if ("t" in e) return `troubleshooting:${e.t}`;
  return `live_stat:${e.stat}`;
}

for (const [question, exp] of CASES) {
  test(`"${question}" -> ${expected(exp)}`, () => {
    assert.equal(describe(resolveIntent(question)), expected(exp));
  });
}

test("every expected id refers to a real registry entry", () => {
  const knowledgeIds = new Set(KNOWLEDGE_REGISTRY.map((e) => e.id));
  const tsIds = new Set(TROUBLESHOOTING_REGISTRY.map((e) => e.id));
  for (const [, exp] of CASES) {
    if (typeof exp === "string") continue;
    if ("k" in exp) assert.ok(knowledgeIds.has(exp.k), `unknown knowledge id ${exp.k}`);
    if ("t" in exp) assert.ok(tsIds.has(exp.t), `unknown troubleshooting id ${exp.t}`);
  }
});

test("language detection: Roman Urdu / mixed -> urdu, plain English -> english", () => {
  assert.equal(detectLanguage("Product kaise add karun?"), "urdu");
  assert.equal(detectLanguage("menu me new tab add krna hy"), "urdu");
  assert.equal(detectLanguage("Kitne orders pending hain?"), "urdu");
  assert.equal(detectLanguage("How do I add a product?"), "english");
  assert.equal(detectLanguage("Can you help me add a product?"), "english");
});

test("normalizeQuery fixes common misspellings", () => {
  assert.equal(normalizeQuery("Watsapp nmbr kese lagaun?"), "whatsapp nmbr kaise lagaun");
  assert.equal(normalizeQuery("prodcut catagory"), "product category");
  assert.equal(normalizeQuery("home page pop-up"), "homepage popup");
  assert.equal(normalizeQuery("dropshipping"), "dropshipping");
});

test("unsupported features resolve honestly, not to a lookalike", () => {
  // "dropshipping" must not hit shipping_settings via substring.
  assert.equal(resolveIntent("dropshipping kaise karein").type, "unknown");
});

test("every knowledge response is in the requested language", () => {
  const urdu = resolveIntent("Currency kaise badlun?");
  assert.equal(urdu.language, "urdu");
  const english = resolveIntent("How do I change the currency?");
  assert.equal(english.language, "english");
  assert.equal(english.knowledge?.id, "store_currency");
});

// ── Structural integrity ──

const ADMIN_DIR = path.join(__dirname, "..", "src", "app", "(admin)", "admin");

/** True if `/admin/...` is a real Store Admin route: a page.tsx under (protected)/ or
 * directly under admin/ (login, reset-password). */
function adminRouteExists(route: string): boolean {
  if (!route.startsWith("/admin")) return false;
  const rest = route.replace(/^\/admin\/?/, "").split(/[?#]/)[0];
  const candidates = [path.join(ADMIN_DIR, "(protected)", rest, "page.tsx"), path.join(ADMIN_DIR, rest, "page.tsx")];
  return candidates.some((p) => existsSync(p));
}

test("knowledge ids are unique", () => {
  const ids = KNOWLEDGE_REGISTRY.map((e) => e.id);
  assert.equal(new Set(ids).size, ids.length, `duplicate ids: ${ids.filter((id, i) => ids.indexOf(id) !== i)}`);
});

test("troubleshooting ids are unique and don't clash with knowledge ids", () => {
  const ids = TROUBLESHOOTING_REGISTRY.map((e) => e.id);
  assert.equal(new Set(ids).size, ids.length);
  const knowledgeIds = new Set(KNOWLEDGE_REGISTRY.map((e) => e.id));
  for (const id of ids) assert.ok(!knowledgeIds.has(id), `id ${id} used in both registries`);
});

test("required existing entries are still present", () => {
  const ids = new Set(KNOWLEDGE_REGISTRY.map((e) => e.id));
  for (const id of [
    "cod_order_verification",
    "new_order_sound",
    "store_currency",
    "order_confirmation_email",
    "custom_domain",
    "customer_order_verification",
    "add_product",
    "create_category",
    "manage_menus",
    "whatsapp_settings",
    "view_orders",
  ]) {
    assert.ok(ids.has(id), `missing entry ${id}`);
  }
});

test("every knowledge entry has all fields filled", () => {
  const categories = new Set(["catalog", "content", "sales", "appearance", "settings", "analytics", "general"]);
  for (const e of KNOWLEDGE_REGISTRY) {
    assert.ok(e.id && /^[a-z0-9_]+$/.test(e.id), `bad id ${e.id}`);
    assert.ok(e.title.trim(), `${e.id}: title`);
    assert.ok(categories.has(e.category), `${e.id}: category ${e.category}`);
    assert.ok(e.keywords.length > 0 && e.keywords.every((k) => k.trim() === k && k === k.toLowerCase() && k.length > 0), `${e.id}: keywords must be non-empty, trimmed, lowercase`);
    assert.ok(e.navigationPath.length > 0 && e.navigationPath.every((p) => p.trim()), `${e.id}: navigationPath`);
    assert.ok(e.actionLabel.trim(), `${e.id}: actionLabel`);
    assert.ok(e.instructionsUrdu.trim().length > 40, `${e.id}: instructionsUrdu`);
    assert.ok(e.instructionsEnglish.trim().length > 40, `${e.id}: instructionsEnglish`);
    assert.ok(e.exampleQuestions.length > 0 && e.exampleQuestions.every((q) => q.trim()), `${e.id}: exampleQuestions`);
  }
});

test("every knowledge route is a real admin route folder", () => {
  for (const e of KNOWLEDGE_REGISTRY) {
    assert.ok(adminRouteExists(e.route), `${e.id}: route ${e.route} has no page.tsx`);
  }
});

test("every troubleshooting entry has all fields filled and a real route", () => {
  for (const e of TROUBLESHOOTING_REGISTRY) {
    assert.ok(e.id && e.title.trim(), `${e.id}: id/title`);
    assert.ok(e.keywords.length > 0 && e.keywords.every((k) => k.trim() === k && k === k.toLowerCase()), `${e.id}: keywords`);
    assert.ok(e.symptomUrdu.trim() && e.symptomEnglish.trim(), `${e.id}: symptom`);
    assert.ok(e.checklist.length > 0 && e.checklist.every((c) => c.urdu.trim() && c.english.trim()), `${e.id}: checklist`);
    assert.ok(e.fixUrdu.trim() && e.fixEnglish.trim(), `${e.id}: fix`);
    assert.ok(e.exampleQuestions.length > 0, `${e.id}: exampleQuestions`);
    assert.ok(e.route && adminRouteExists(e.route), `${e.id}: route ${e.route} has no page.tsx`);
    assert.ok(e.actionLabel?.trim(), `${e.id}: actionLabel`);
  }
});

test("each entry's own example questions resolve back to that entry", () => {
  for (const e of KNOWLEDGE_REGISTRY) {
    for (const q of e.exampleQuestions) {
      const r = resolveIntent(q);
      assert.ok(
        r.knowledge?.id === e.id || r.type === "troubleshooting",
        `knowledge example "${q}" resolved to ${describe(r)} instead of ${e.id}`
      );
    }
  }
  for (const e of TROUBLESHOOTING_REGISTRY) {
    for (const q of e.exampleQuestions) {
      const r = resolveIntent(q);
      assert.equal(r.troubleshooting?.id, e.id, `troubleshooting example "${q}" resolved to ${describe(r)}`);
    }
  }
});
