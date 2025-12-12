"use client";

import { NextIntlClientProvider } from "next-intl";
import { useState, useEffect, useCallback } from "react";

export default function IntlProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [locale, setLocale] = useState<"en" | "es">("en");
  const [messages, setMessages] = useState<any>(null);

  const loadMessages = useCallback(async (loc: "en" | "es") => {
    try {
      const mod = await import(`../../messages/${loc}.json`);
      setMessages(mod.default);
    } catch {
      // Fallback to English if locale file doesn't exist
      const mod = await import("../../messages/en.json");
      setMessages(mod.default);
    }
  }, []);

  useEffect(() => {
    // Get locale from localStorage or default to 'en'
    const savedLocale = (localStorage.getItem("locale") || "en") as "en" | "es";
    setLocale(savedLocale);
    loadMessages(savedLocale);
  }, [loadMessages]);

  // Listen for locale changes
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "locale" && e.newValue) {
        const newLocale = e.newValue as "en" | "es";
        if (newLocale !== locale) {
          setLocale(newLocale);
          loadMessages(newLocale);
        }
      }
    };

    // Custom event for same-tab updates
    const handleCustomStorageChange = () => {
      const newLocale = (localStorage.getItem("locale") || "en") as "en" | "es";
      if (newLocale !== locale) {
        setLocale(newLocale);
        loadMessages(newLocale);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("localechange", handleCustomStorageChange);
    
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("localechange", handleCustomStorageChange);
    };
  }, [locale, loadMessages]);

  if (!messages) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
