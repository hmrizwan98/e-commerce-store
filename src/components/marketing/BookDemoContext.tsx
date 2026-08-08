"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

interface BookDemoContextType {
  isOpen: boolean;
  openBookDemoModal: () => void;
  closeBookDemoModal: () => void;
}

const BookDemoContext = createContext<BookDemoContextType>({
  isOpen: false,
  openBookDemoModal: () => {},
  closeBookDemoModal: () => {},
});

export function useBookDemoModal() {
  return useContext(BookDemoContext);
}

export function BookDemoProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const openBookDemoModal = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeBookDemoModal = useCallback(() => {
    setIsOpen(false);
  }, []);

  // Intercept click on links targeting /book-demo or /platform/book-demo to open modal on-page
  useEffect(() => {
    const handleLinkClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement)?.closest("a");
      if (!target) return;

      const href = target.getAttribute("href");
      if (href === "/book-demo" || href === "/platform/book-demo") {
        // Prevent hard navigation if on-page, open drawer modal
        e.preventDefault();
        openBookDemoModal();
      }
    };

    document.addEventListener("click", handleLinkClick, { capture: true });
    return () => {
      document.removeEventListener("click", handleLinkClick, { capture: true });
    };
  }, [openBookDemoModal]);

  return (
    <BookDemoContext.Provider value={{ isOpen, openBookDemoModal, closeBookDemoModal }}>
      {children}
    </BookDemoContext.Provider>
  );
}
