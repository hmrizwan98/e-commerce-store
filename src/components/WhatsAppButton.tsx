"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

interface WhatsAppConfig {
  enabled: boolean;
  phoneNumber: string | null;
  defaultMessage: string | null;
}

/**
 * Floating "chat on WhatsApp" button, configured from Admin -> Settings.
 * Renders nothing until an admin enables it and sets a real phone number -
 * no fabricated contact info.
 */
export default function WhatsAppButton() {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin");
  const [config, setConfig] = useState<WhatsAppConfig | null>(null);

  useEffect(() => {
    if (isAdminRoute) return;
    fetch("/api/whatsapp/config")
      .then((res) => (res.ok ? res.json() : null))
      .then(setConfig)
      .catch(() => {});
  }, [isAdminRoute]);

  if (isAdminRoute || !config?.enabled || !config.phoneNumber) return null;

  const href = `https://wa.me/${config.phoneNumber}${
    config.defaultMessage ? `?text=${encodeURIComponent(config.defaultMessage)}` : ""
  }`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-5 right-5 z-40 flex items-center justify-center w-14 h-14 rounded-full bg-[#25D366] text-white shadow-lg hover:scale-105 active:scale-95 transition-transform"
    >
      <svg viewBox="0 0 32 32" className="w-8 h-8" fill="currentColor" aria-hidden="true">
        <path d="M16.001 2.667c-7.363 0-13.334 5.97-13.334 13.333 0 2.353.615 4.66 1.784 6.687L2.667 29.333l6.81-1.756a13.27 13.27 0 0 0 6.524 1.72h.006c7.362 0 13.333-5.97 13.333-13.333 0-3.56-1.387-6.909-3.905-9.428a13.246 13.246 0 0 0-9.434-3.87Zm0 24.4h-.005a11.06 11.06 0 0 1-5.634-1.542l-.404-.24-4.04 1.043 1.08-3.938-.264-.404a11.05 11.05 0 0 1-1.695-5.887c0-6.115 4.976-11.09 11.098-11.09 2.964 0 5.75 1.155 7.845 3.253a11.02 11.02 0 0 1 3.248 7.844c0 6.116-4.977 11.09-11.09 11.09Zm6.08-8.306c-.333-.167-1.97-.972-2.276-1.083-.305-.111-.527-.166-.75.167-.222.333-.86 1.083-1.055 1.305-.194.222-.388.25-.72.083-.334-.167-1.41-.52-2.686-1.658-.993-.886-1.664-1.981-1.858-2.314-.194-.333-.02-.513.147-.68.15-.15.334-.389.5-.583.168-.194.223-.333.334-.556.11-.222.055-.417-.028-.583-.083-.167-.75-1.806-1.028-2.472-.27-.65-.545-.562-.75-.572l-.639-.011a1.225 1.225 0 0 0-.889.416c-.305.334-1.166 1.14-1.166 2.778s1.194 3.223 1.36 3.445c.167.222 2.352 3.59 5.7 5.036.796.343 1.417.548 1.902.702.799.254 1.527.218 2.102.132.641-.096 1.97-.805 2.248-1.583.277-.778.277-1.445.194-1.583-.083-.14-.305-.222-.639-.389Z" />
      </svg>
    </a>
  );
}
