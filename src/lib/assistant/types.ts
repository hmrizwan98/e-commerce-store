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

export interface ResolvedIntent {
  intentId: string;
  type: "knowledge" | "live_stat" | "greeting" | "unknown";
  confidence: number;
  knowledge?: KnowledgeEntry;
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
