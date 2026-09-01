"use server";

import { adminDb } from "@/lib/firebase/admin";
import { requireAdmin } from "@/lib/firebase/require-admin";
import { getStoreById } from "@/lib/firebase/repositories/stores";
import { fetchLiveStoreStats } from "./store-context-resolver";
import { defaultResponseProvider } from "./response-provider";
import type { AssistantMessage, AssistantChatSession } from "./types";
import { FieldValue } from "firebase-admin/firestore";

export interface SendMessageResult {
  success: boolean;
  userMessage?: AssistantMessage;
  assistantMessage?: AssistantMessage;
  chatId?: string;
  error?: string;
}

export interface GetChatHistoryResult {
  success: boolean;
  messages: AssistantMessage[];
  chatId: string;
  error?: string;
}

export async function sendMessageToAssistant(
  query: string,
  chatId?: string
): Promise<SendMessageResult> {
  try {
    const admin = await requireAdmin();
    const storeId = admin.tenantId;

    if (!storeId) {
      return { success: false, error: "Unauthorized: Missing tenant ID." };
    }

    if (!query || !query.trim()) {
      return { success: false, error: "Message content cannot be empty." };
    }

    const store = await getStoreById(storeId);
    if (!store) {
      return { success: false, error: "Store not found." };
    }

    if (store.assistantEnabled === false) {
      return {
        success: false,
        error: "Store Assistant is currently disabled for your store by Super Admin.",
      };
    }

    const activeChatId = chatId || "default-session";
    const now = Date.now();

    const storeRef = adminDb().collection("stores").doc(storeId);
    const chatDocRef = storeRef.collection("assistantChats").doc(activeChatId);
    const messagesCol = chatDocRef.collection("messages");

    // Ensure session doc exists
    await chatDocRef.set(
      {
        id: activeChatId,
        storeId,
        userId: admin.uid,
        updatedAt: FieldValue.serverTimestamp(),
        createdAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    const userMessageId = `msg_user_${now}_${Math.random().toString(36).substring(2, 7)}`;
    const userMsgObj: AssistantMessage = {
      id: userMessageId,
      chatId: activeChatId,
      role: "user",
      content: query.trim(),
      createdAt: now,
    };

    await messagesCol.doc(userMessageId).set({
      ...userMsgObj,
      createdAt: FieldValue.serverTimestamp(),
    });

    // Resolve live stats if needed
    const liveStats = await fetchLiveStoreStats(storeId);

    // Fetch recent 5 messages for context
    const recentSnap = await messagesCol
      .orderBy("createdAt", "desc")
      .limit(6)
      .get();

    const historyMessages: AssistantMessage[] = recentSnap.docs
      .map((d) => {
        const data = d.data();
        return {
          id: d.id,
          chatId: activeChatId,
          role: data.role,
          content: data.content,
          actions: data.actions,
          intentId: data.intentId,
          createdAt: data.createdAt?.toMillis?.() || now,
        };
      })
      .reverse();

    // Generate response using provider
    const providerResult = await defaultResponseProvider.generateResponse({
      query,
      storeId,
      liveStats,
      history: historyMessages,
    });

    const assistantMsgId = `msg_ast_${now + 1}_${Math.random().toString(36).substring(2, 7)}`;
    const assistantMsgObj: AssistantMessage = {
      id: assistantMsgId,
      chatId: activeChatId,
      role: "assistant",
      content: providerResult.replyText,
      actions: providerResult.actions,
      intentId: providerResult.intentId,
      createdAt: now + 1,
    };

    await messagesCol.doc(assistantMsgId).set({
      ...assistantMsgObj,
      createdAt: FieldValue.serverTimestamp(),
    });

    await chatDocRef.update({
      lastMessage: providerResult.replyText.substring(0, 100),
      updatedAt: FieldValue.serverTimestamp(),
    });

    return {
      success: true,
      userMessage: userMsgObj,
      assistantMessage: assistantMsgObj,
      chatId: activeChatId,
    };
  } catch (err) {
    console.error("[sendMessageToAssistant] Error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to process assistant message.",
    };
  }
}

export async function getAssistantChatHistory(
  chatId: string = "default-session",
  limitCount: number = 30
): Promise<GetChatHistoryResult> {
  try {
    const admin = await requireAdmin();
    const storeId = admin.tenantId;

    if (!storeId) {
      return { success: false, messages: [], chatId, error: "Unauthorized." };
    }

    const storeRef = adminDb().collection("stores").doc(storeId);
    const messagesCol = storeRef.collection("assistantChats").doc(chatId).collection("messages");

    const snap = await messagesCol.orderBy("createdAt", "asc").limit(limitCount).get();

    const messages: AssistantMessage[] = snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        chatId,
        role: data.role,
        content: data.content,
        actions: data.actions,
        intentId: data.intentId,
        createdAt: data.createdAt?.toMillis?.() || Date.now(),
      };
    });

    return {
      success: true,
      messages,
      chatId,
    };
  } catch (err) {
    console.error("[getAssistantChatHistory] Error:", err);
    return {
      success: false,
      messages: [],
      chatId,
      error: err instanceof Error ? err.message : "Failed to load chat history.",
    };
  }
}

export async function clearAssistantChatHistory(chatId: string = "default-session"): Promise<{ success: boolean; error?: string }> {
  try {
    const admin = await requireAdmin();
    const storeId = admin.tenantId;

    if (!storeId) {
      return { success: false, error: "Unauthorized." };
    }

    const storeRef = adminDb().collection("stores").doc(storeId);
    const messagesCol = storeRef.collection("assistantChats").doc(chatId).collection("messages");

    const snap = await messagesCol.get();
    const batch = adminDb().batch();
    snap.docs.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();

    return { success: true };
  } catch (err) {
    console.error("[clearAssistantChatHistory] Error:", err);
    return { success: false, error: err instanceof Error ? err.message : "Failed to clear history." };
  }
}
