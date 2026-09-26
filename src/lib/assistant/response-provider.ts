import type {
  IAssistantResponseProvider,
  LiveStoreStats,
  NavigationAction,
  AssistantMessage,
  AssistantLanguage,
} from "./types";
import { resolveIntent } from "./intent-matcher";

/** Per-statKey reply text in both languages - kept as simple template functions rather
 * than a giant switch/conditional ladder, so adding a new stat is one new entry here. */
const LIVE_STAT_TEXT: Record<
  string,
  (val: unknown, liveStats: LiveStoreStats | undefined) => { urdu: string; english: string }
> = {
  productCount: (val) => ({
    urdu: `Aapke store mein filhal total **${val ?? 0} products** mojood hain.\n\nNayi product add karne ya existing products edit karne ke liye niche button par click karein.`,
    english: `Your store currently has **${val ?? 0} products**.\n\nClick the button below to add a new product or edit existing ones.`,
  }),
  categoryCount: (val) => ({
    urdu: `Aapke store mein total **${val ?? 0} categories** bani hui hain.\n\nCategories ko view ya add karne ke liye niche link par jayen.`,
    english: `Your store has **${val ?? 0} categories** set up.\n\nUse the link below to view or add categories.`,
  }),
  activeThemeName: (val) => ({
    urdu: `Aapke store ki current active theme **${val || "Default Theme"}** hy.\n\nTheme badalne ya preview karne ke liye Theme Catalog par jayen.`,
    english: `Your store's current active theme is **${val || "Default Theme"}**.\n\nGo to the Theme Catalog to change or preview it.`,
  }),
  homepageSectionCount: (val) => ({
    urdu: `Aapke homepage par total **${val ?? 0} active sections** (Hero Slider, Featured Products, Promo, etc.) configured hain.`,
    english: `Your homepage currently has **${val ?? 0} active sections** configured (Hero Slider, Featured Products, Promo, etc.).`,
  }),
  orderCount: (val, liveStats) => {
    const totalOrders = liveStats?.orderCount ?? val ?? 0;
    const pendingOrders = liveStats?.pendingOrderCount ?? 0;
    return {
      urdu: `Aapke store mein total **${totalOrders} orders** hain, jin mein se **${pendingOrders} pending action** hai(n).\n\nOrders inspect karne aur fulfill karne ke liye niche button par click karein.`,
      english: `Your store has **${totalOrders} orders** total, with **${pendingOrders}** awaiting action.\n\nClick below to inspect and fulfill orders.`,
    };
  },
  pendingOrderCount: (val) => ({
    urdu: `Aapke store mein filhal **${val ?? 0} pending order(s)** hain jo action ke muntazir hain.`,
    english: `Your store currently has **${val ?? 0} pending order(s)** awaiting action.`,
  }),
  pendingProductCount: (val, liveStats) => ({
    urdu: `Aapke store mein filhal **${val ?? 0} pending/draft products** hain (Total **${liveStats?.productCount ?? 0} active products**).`,
    english: `Your store currently has **${val ?? 0} pending/draft products** (Total **${liveStats?.productCount ?? 0} active products**).`,
  }),
  customerCount: (val) => ({
    urdu: `Aapke store par total **${val ?? 0} registered customers** record hue hain.`,
    english: `Your store has **${val ?? 0} registered customers** on record.`,
  }),
};

function formatTroubleshootingReply(
  troubleshooting: NonNullable<import("./types").ResolvedIntent["troubleshooting"]>,
  language: AssistantLanguage
): string {
  const t = troubleshooting;
  if (language === "english") {
    const checks = t.checklist.map((c, i) => `${i + 1}. ${c.english}`).join("\n");
    return `**Problem:** ${t.symptomEnglish}\n\n**Check:**\n${checks}\n\n**Fix:** ${t.fixEnglish}`;
  }
  const checks = t.checklist.map((c, i) => `${i + 1}. ${c.urdu}`).join("\n");
  return `**Masla:** ${t.symptomUrdu}\n\n**Check karein:**\n${checks}\n\n**Hal:** ${t.fixUrdu}`;
}

export class StructuredResponseProvider implements IAssistantResponseProvider {
  name = "StructuredZeroCostProvider";

  async generateResponse(params: {
    query: string;
    storeId: string;
    liveStats?: LiveStoreStats;
    history?: AssistantMessage[];
  }): Promise<{
    replyText: string;
    actions?: NavigationAction[];
    intentId?: string;
  }> {
    const { query, liveStats } = params;
    const resolved = resolveIntent(query);
    const language = resolved.language;

    if (resolved.type === "knowledge" && resolved.knowledge) {
      const k = resolved.knowledge;
      const actions: NavigationAction[] = [
        {
          label: k.actionLabel || `Open ${k.title}`,
          href: k.route,
          primary: true,
        },
      ];
      const instructions = language === "english" ? k.instructionsEnglish : k.instructionsUrdu;

      return {
        replyText: `${instructions}\n\n📍 **Path:** ${k.navigationPath.join(" → ")}`,
        actions,
        intentId: k.id,
      };
    }

    if (resolved.type === "troubleshooting" && resolved.troubleshooting) {
      const t = resolved.troubleshooting;
      const actions: NavigationAction[] = t.route
        ? [{ label: t.actionLabel || `Open ${t.title}`, href: t.route, primary: true }]
        : [];
      return {
        replyText: formatTroubleshootingReply(t, language),
        actions,
        intentId: t.id,
      };
    }

    if (resolved.type === "live_stat" && resolved.statKey && resolved.customResponse) {
      const key = resolved.statKey;
      const val = liveStats ? liveStats[key] : "N/A";
      const textBuilder = LIVE_STAT_TEXT[key];
      const formattedText = textBuilder
        ? language === "english"
          ? textBuilder(val, liveStats).english
          : textBuilder(val, liveStats).urdu
        : `Aapke store ki details: **${val}**.`;

      return {
        replyText: formattedText,
        actions: resolved.customResponse.actions,
        intentId: resolved.intentId,
      };
    }

    if (resolved.customResponse) {
      return {
        replyText: language === "english" ? resolved.customResponse.textEnglish : resolved.customResponse.textUrdu,
        actions: resolved.customResponse.actions,
        intentId: resolved.intentId,
      };
    }

    return {
      replyText:
        language === "english"
          ? "I need a bit more detail to answer that. You can ask about Products, Categories, Theme, Banners, WhatsApp, Orders, or account/password settings."
          : "Aapke sawal ka jawab dene ke liye mujhe mazeed detail darkaar hy. Aap Products, Categories, Theme, Banners, WhatsApp, Orders, ya account/password settings ke bare mein pooch sakte hain.",
      intentId: "fallback",
    };
  }
}

export const defaultResponseProvider: IAssistantResponseProvider = new StructuredResponseProvider();
