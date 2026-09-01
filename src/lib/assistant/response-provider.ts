import type {
  IAssistantResponseProvider,
  LiveStoreStats,
  NavigationAction,
  AssistantMessage,
} from "./types";
import { resolveIntent } from "./intent-matcher";

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

    if (resolved.type === "knowledge" && resolved.knowledge) {
      const k = resolved.knowledge;
      const actions: NavigationAction[] = [
        {
          label: k.actionLabel || `Open ${k.title}`,
          href: k.route,
          primary: true,
        },
      ];

      return {
        replyText: `${k.instructionsUrdu}\n\n📍 **Path:** ${k.navigationPath.join(" → ")}`,
        actions,
        intentId: k.id,
      };
    }

    if (resolved.type === "live_stat" && resolved.statKey && resolved.customResponse) {
      const key = resolved.statKey;
      const val = liveStats ? liveStats[key] : "N/A";
      let formattedText = "";

      if (key === "productCount") {
        formattedText = `Aapke store mein filhal total **${val ?? 0} products** mojood hain.\n\nNayi product add karne ya existing products edit karne ke liye niche button par click karein.`;
      } else if (key === "categoryCount") {
        formattedText = `Aapke store mein total **${val ?? 0} categories** bani hui hain.\n\nCategories ko view ya add karne ke liye niche link par jayen.`;
      } else if (key === "activeThemeName") {
        formattedText = `Aapke store ki current active theme **${val || "Default Theme"}** hy.\n\nTheme badalne ya preview karne ke liye Theme Catalog par jayen.`;
      } else if (key === "homepageSectionCount") {
        formattedText = `Aapke homepage par total **${val ?? 0} active sections** (Hero Slider, Featured Products, Promo, etc.) configured hain.`;
      } else if (key === "orderCount") {
        const totalOrders = liveStats?.orderCount ?? val ?? 0;
        const pendingOrders = liveStats?.pendingOrderCount ?? 0;
        formattedText = `Aapke store mein total **${totalOrders} orders** hain, jin mein se **${pendingOrders} pending action** hai(n).\n\nOrders inspect karne aur fulfill karne ke liye niche button par click karein.`;
      } else if (key === "pendingOrderCount") {
        formattedText = `Aapke store mein filhal **${val ?? 0} pending order(s)** hain jo action ke muntazir hain.`;
      } else if (key === "pendingProductCount") {
        formattedText = `Aapke store mein filhal **${val ?? 0} pending/draft products** hain (Total **${liveStats?.productCount ?? 0} active products**).`;
      } else if (key === "customerCount") {
        formattedText = `Aapke store par total **${val ?? 0} registered customers** record hue hain.`;
      } else {
        formattedText = `Aapke store ki details: **${val}**.`;
      }

      return {
        replyText: formattedText,
        actions: resolved.customResponse.actions,
        intentId: resolved.intentId,
      };
    }

    if (resolved.customResponse) {
      return {
        replyText: resolved.customResponse.textUrdu,
        actions: resolved.customResponse.actions,
        intentId: resolved.intentId,
      };
    }

    return {
      replyText:
        "Aapke sawal ka jawab dene ke liye mujhe mazeed detail darkaar hy. Aap Products, Categories, Theme, Banners, ya Orders ke bare mein pooch sakte hain.",
      intentId: "fallback",
    };
  }
}

export const defaultResponseProvider: IAssistantResponseProvider = new StructuredResponseProvider();
