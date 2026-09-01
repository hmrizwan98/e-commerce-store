"use client";

import React, { useState, useEffect, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  SparklesIcon,
  XMarkIcon,
  PaperAirplaneIcon,
  ArrowPathIcon,
  TrashIcon,
  ArrowRightIcon,
  BuildingStorefrontIcon,
} from "@heroicons/react/24/outline";
import {
  sendMessageToAssistant,
  getAssistantChatHistory,
  clearAssistantChatHistory,
} from "@/lib/assistant/actions";
import type { AssistantMessage, NavigationAction } from "@/lib/assistant/types";

interface StoreAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const SUGGESTED_PROMPTS = [
  "Product kahan sy add karni hy?",
  "Category kesy bnani hy?",
  "Slider me new image kesy lagani hy?",
  "Homepage customize kesy krni hy?",
  "Theme kesy change krni hy?",
  "Menu me item kesy add karna hy?",
  "Mere store me kitny products hain?",
  "Meri current theme konsi hy?",
];

export default function StoreAssistantDrawer({ isOpen, onClose }: StoreAssistantDrawerProps) {
  const router = useRouter();
  const [messages, setMessages] = useState<AssistantMessage[]>([]);
  const [inputQuery, setInputQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      setInitialLoading(true);
      getAssistantChatHistory("default-session", 40).then((res) => {
        setInitialLoading(false);
        if (res.success && res.messages) {
          setMessages(res.messages);
        }
      });
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || inputQuery;
    if (!query || !query.trim() || loading) return;

    const userText = query.trim();
    setInputQuery("");

    // Optimistic user message
    const tempUserMsg: AssistantMessage = {
      id: `temp_u_${Date.now()}`,
      chatId: "default-session",
      role: "user",
      content: userText,
      createdAt: Date.now(),
    };

    setMessages((prev) => [...prev, tempUserMsg]);
    setLoading(true);

    try {
      const res = await sendMessageToAssistant(userText, "default-session");
      setLoading(false);

      if (res.success && res.userMessage && res.assistantMessage) {
        setMessages((prev) => [
          ...prev.filter((m) => m.id !== tempUserMsg.id),
          res.userMessage!,
          res.assistantMessage!,
        ]);
      } else {
        toast.error(res.error || "Failed to get assistant response");
      }
    } catch {
      setLoading(false);
      toast.error("Failed to connect to Store Assistant");
    }
  };

  const handleClearHistory = () => {
    startTransition(async () => {
      try {
        const res = await clearAssistantChatHistory("default-session");
        if (res.success) {
          setMessages([]);
          toast.success("Chat history cleared");
        } else {
          toast.error("Failed to clear history");
        }
      } catch {
        toast.error("Failed to clear chat history");
      }
    });
  };

  const handleActionClick = (action: NavigationAction) => {
    onClose();
    router.push(action.href as any);
  };

  // Helper to render bolding / markdown formatted text
  const renderFormattedText = (text: string) => {
    const lines = text.split("\n");
    return lines.map((line, lineIdx) => {
      const parts = line.split(/(\*\*.*?\*\*)/g);
      return (
        <p key={lineIdx} className={lineIdx > 0 ? "mt-1.5" : ""}>
          {parts.map((part, pIdx) => {
            if (part.startsWith("**") && part.endsWith("**")) {
              return (
                <strong key={pIdx} className="font-bold text-neutral-900 dark:text-white">
                  {part.slice(2, -2)}
                </strong>
              );
            }
            return part;
          })}
        </p>
      );
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-neutral-950/40 backdrop-blur-xs"
          />

          {/* Slide-over Drawer Panel */}
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 220 }}
            className="fixed inset-y-0 right-0 z-50 w-full max-w-lg bg-white dark:bg-neutral-900 border-l border-neutral-200/80 dark:border-neutral-800/80 shadow-2xl flex flex-col justify-between overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-neutral-200/80 dark:border-neutral-800/80 bg-neutral-50/80 dark:bg-neutral-900/80 backdrop-blur-md flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-primary-6000 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-primary-6000/20">
                  <SparklesIcon className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-base text-neutral-900 dark:text-white tracking-tight">
                      Webriz Store Assistant
                    </h3>
                  </div>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    Ask questions in Roman Urdu &amp; manage your store
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {messages.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearHistory}
                    disabled={isPending}
                    title="Clear Chat History"
                    className="p-2 rounded-xl text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  className="p-2 rounded-xl text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 text-xs sm:text-sm">
              {initialLoading ? (
                <div className="flex flex-col items-center justify-center h-full space-y-3 text-neutral-400">
                  <ArrowPathIcon className="w-6 h-6 animate-spin text-primary-6000" />
                  <span className="text-xs font-medium">Loading Assistant history...</span>
                </div>
              ) : messages.length === 0 ? (
                <div className="space-y-6 pt-4">
                  {/* Welcome Message Card */}
                  <div className="p-5 rounded-3xl bg-gradient-to-b from-primary-50/50 via-white to-transparent dark:from-neutral-850 dark:to-neutral-900 border border-primary-100 dark:border-neutral-800 space-y-3 shadow-xs">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary-6000/10 text-primary-6000 dark:text-primary-400">
                      <SparklesIcon className="w-4 h-4" />
                      <span>Assalam o Alaikum!</span>
                    </div>
                    <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200 leading-relaxed">
                      Main aapke store ko manage karne mein help kar sakta hoon. Aap mujhse Roman Urdu ya English mein koi bhi store question pooch sakte hain!
                    </p>
                  </div>

                  {/* Suggested Quick Prompts */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider px-1">
                      Poochhein (Suggested Questions):
                    </h4>
                    <div className="grid gap-2">
                      {SUGGESTED_PROMPTS.map((prompt) => (
                        <button
                          key={prompt}
                          type="button"
                          onClick={() => handleSend(prompt)}
                          className="w-full text-left p-3 rounded-2xl border border-neutral-200/80 dark:border-neutral-800/80 bg-neutral-50/60 dark:bg-neutral-850/60 hover:bg-primary-50/50 dark:hover:bg-neutral-800 hover:border-primary-500/40 text-xs font-semibold text-neutral-700 dark:text-neutral-300 transition-all flex items-center justify-between group shadow-2xs"
                        >
                          <span>{prompt}</span>
                          <ArrowRightIcon className="w-3.5 h-3.5 text-neutral-400 group-hover:text-primary-6000 group-hover:translate-x-0.5 transition-all" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] p-4 rounded-3xl space-y-3 shadow-xs ${
                        msg.role === "user"
                          ? "bg-primary-6000 text-white rounded-br-xs font-medium"
                          : "bg-neutral-100 dark:bg-neutral-800/90 text-neutral-800 dark:text-neutral-200 border border-neutral-200/60 dark:border-neutral-700/60 rounded-bl-xs"
                      }`}
                    >
                      <div className="leading-relaxed whitespace-pre-line text-xs sm:text-sm">
                        {renderFormattedText(msg.content)}
                      </div>

                      {/* Navigation Action Buttons */}
                      {msg.actions && msg.actions.length > 0 && (
                        <div className="pt-2 border-t border-neutral-200/60 dark:border-neutral-700/60 flex flex-wrap gap-2">
                          {msg.actions.map((act) => (
                            <button
                              key={act.href}
                              type="button"
                              onClick={() => handleActionClick(act)}
                              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-white dark:bg-neutral-900 text-primary-6000 dark:text-primary-400 border border-primary-6000/20 shadow-2xs hover:bg-primary-50 dark:hover:bg-neutral-800 transition-all"
                            >
                              <BuildingStorefrontIcon className="w-3.5 h-3.5" />
                              <span>{act.label}</span>
                              <ArrowRightIcon className="w-3 h-3" />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}

              {loading && (
                <div className="flex justify-start">
                  <div className="p-4 rounded-3xl rounded-bl-xs bg-neutral-100 dark:bg-neutral-800 text-neutral-500 flex items-center gap-2 text-xs">
                    <ArrowPathIcon className="w-4 h-4 animate-spin text-primary-6000" />
                    <span>Store Assistant Sochi raha hy...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Footer */}
            <div className="p-4 border-t border-neutral-200/80 dark:border-neutral-800/80 bg-neutral-50/80 dark:bg-neutral-900/80 backdrop-blur-md">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={inputQuery}
                  onChange={(e) => setInputQuery(e.target.value)}
                  placeholder="Ask a question in Roman Urdu (e.g. product kaise add karun?)..."
                  disabled={loading}
                  className="flex-1 px-4 py-3 rounded-2xl border border-neutral-200/80 dark:border-neutral-700/80 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary-6000/30 focus:border-primary-6000 transition-all disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={loading || !inputQuery.trim()}
                  className="p-3 rounded-2xl bg-primary-6000 text-white font-bold text-xs hover:bg-primary-700 transition-colors disabled:opacity-40 disabled:hover:bg-primary-6000 shadow-md shadow-primary-6000/20"
                >
                  <PaperAirplaneIcon className="w-4 h-4" />
                </button>
              </form>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
