export type AssistantMessageRole = "user" | "assistant" | "system";

export interface NavigationAction {
  label: string;
  href: string;
  icon?: string;
  primary?: boolean;
}

export interface AssistantMessage {
  id: string;
  chatId: string;
  role: AssistantMessageRole;
  content: string;
  actions?: NavigationAction[];
  intentId?: string;
  createdAt: number;
}

export interface AssistantChatSession {
  id: string;
  storeId: string;
  userId: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  lastMessage?: string;
}

export interface KnowledgeEntry {
  id: string;
  title: string;
  category: "catalog" | "content" | "sales" | "appearance" | "settings" | "analytics" | "general";
  keywords: string[];
  navigationPath: string[]; // e.g. ["Catalog", "Products", "Add Product"]
  route: string; // e.g. "/admin/products"
  actionLabel: string; // e.g. "Open Products"
  instructionsUrdu: string;
  instructionsEnglish: string;
  exampleQuestions: string[];
}

/** A single diagnostic step in a TroubleshootingEntry's checklist - rendered as a plain
 * "Check" line, not a yes/no form control (the assistant can't inspect the merchant's
 * actual settings from a stateless text query, only tell them what to go verify). */
export interface TroubleshootingCheck {
  urdu: string;
  english: string;
}

export interface TroubleshootingEntry {
  id: string;
  title: string;
  /** Same substring-scoring keyword model as KnowledgeEntry, but matched only when the
   * query also carries "something's wrong" framing (see hasProblemFraming in
   * intent-matcher.ts) - so "WhatsApp kaise configure karun" (how-to) and "WhatsApp button
   * nahi aa raha" (troubleshooting) resolve to different registries despite sharing the
   * word "whatsapp". */
  keywords: string[];
  symptomUrdu: string;
  symptomEnglish: string;
  checklist: TroubleshootingCheck[];
  fixUrdu: string;
  fixEnglish: string;
  route?: string;
  actionLabel?: string;
  exampleQuestions: string[];
}

export interface LiveStoreStats {
  productCount?: number;
  categoryCount?: number;
  brandCount?: number;
  activeThemeId?: string;
  activeThemeName?: string;
  homepageSectionCount?: number;
  orderCount?: number;
  pendingOrderCount?: number;
  pendingProductCount?: number;
  outOfStockProductCount?: number;
  customerCount?: number;
}

export type AssistantLanguage = "urdu" | "english";

export interface ResolvedIntent {
  intentId: string;
  type: "knowledge" | "troubleshooting" | "live_stat" | "greeting" | "unknown";
  confidence: number;
  language: AssistantLanguage;
  knowledge?: KnowledgeEntry;
  troubleshooting?: TroubleshootingEntry;
  statKey?: keyof LiveStoreStats;
  customResponse?: {
    textUrdu: string;
    textEnglish: string;
    actions?: NavigationAction[];
  };
}

export interface IAssistantResponseProvider {
  name: string;
  generateResponse(params: {
    query: string;
    storeId: string;
    liveStats?: LiveStoreStats;
    history?: AssistantMessage[];
  }): Promise<{
    replyText: string;
    actions?: NavigationAction[];
    intentId?: string;
  }>;
}
