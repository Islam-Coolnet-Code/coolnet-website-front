"use client";

import {
  CreditCard,
  LineChart,
  Bell,
  Headphones,
  Apple,
  Play,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useSiteSettings } from "@/services/cms";

// Helper to get setting value by key
const getSettingValue = (
  settings: Array<{ key: string; valueEn: string | null }> | undefined,
  key: string
): string | null => {
  if (!settings) return null;
  const setting = settings.find(s => s.key === key);
  return setting?.valueEn || null;
};

export default function AppDownloadSection() {
  const { t, language } = useLanguage();
  const { data: siteSettings } = useSiteSettings();

  const isRTL = language === "ar" || language === "he";

  // Get app store links from CMS only
  const appStoreLink = getSettingValue(siteSettings, 'app_store_link');
  const playStoreLink = getSettingValue(siteSettings, 'play_store_link');

  return (
    <section
      dir={isRTL ? "rtl" : "ltr"}
      className="relative w-full flex flex-col md:flex-row items-center justify-center bg-coolnet-purple text-white gap-0"
    >
      <div className="w-full px-6 pt-16 flex items-center justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-10 justify-items-center text-center">
          {/* Optional empty area for your own 3D/phone model if you want to place it via CSS/portal */}
          <div id="model-slot" className="hidden lg:block lg:col-span-5" />

          {/* Content */}
          <div className="lg:col-span-7 text-center">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight">
              {t("appDownload.download.title")}
            </h2>
            <p className="mt-4 text-slate-200/90 text-base sm:text-lg">
              {t("appDownload.download.subtitle")}
            </p>

            {/* Quick actions */}
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button className="flex items-center justify-between rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-3 transition">
                <span className="text-sm md:text-base">{t("appDownload.download.action.pay")}</span>
                <CreditCard className="size-5 opacity-90" />
              </button>
              <button className="flex items-center justify-between rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-3 transition">
                <span className="text-sm md:text-base">{t("appDownload.download.action.usage")}</span>
                <LineChart className="size-5 opacity-90" />
              </button>
              <button className="flex items-center justify-between rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-3 transition">
                <span className="text-sm md:text-base">{t("appDownload.download.action.notifications")}</span>
                <Bell className="size-5 opacity-90" />
              </button>
              <button className="flex items-center justify-between rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-3 transition">
                <span className="text-sm md:text-base">{t("appDownload.download.action.support")}</span>
                <Headphones className="size-5 opacity-90" />
              </button>
            </div>

            {/* Store badges */}
            {(appStoreLink || playStoreLink) && (
            <div className="mt-10 flex flex-wrap items-center gap-4">
              {appStoreLink && (
              <a
                href={appStoreLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-5 py-3 transition"
              >
                <div className="grid place-items-center rounded-lg bg-white/10 p-2">
                  <Apple className="size-5" />
                </div>
                <div className="leading-tight">
                  <div className="text-xs text-slate-300">{t("appDownload.download.store.availableOn")}</div>
                  <div className="text-sm font-semibold">{t("appDownload.download.store.appStore")}</div>
                </div>
              </a>
              )}

              {playStoreLink && (
              <a
                href={playStoreLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-5 py-3 transition"
              >
                <div className="grid place-items-center rounded-lg bg-white/10 p-2">
                  <Play className="size-5" />
                </div>
                <div className="leading-tight">
                  <div className="text-xs text-slate-300">{t("appDownload.download.store.directDownload")}</div>
                  <div className="text-sm font-semibold">{t("appDownload.download.store.android")}</div>
                </div>
              </a>
              )}
            </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
