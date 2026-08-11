import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import fr from "./locales/fr";
import en from "./locales/en";
import frDeals from "./locales/fr.deals";
import enDeals from "./locales/en.deals";
import frPublic from "./locales/fr.public";
import enPublic from "./locales/en.public";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      fr: { translation: { ...fr, ...frDeals, ...frPublic } },
      en: { translation: { ...en, ...enDeals, ...enPublic } },
    },
    fallbackLng: "fr",
    supportedLngs: ["fr", "en"],
    interpolation: { escapeValue: false },
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
      lookupLocalStorage: "ghl_lang",
    },
  });

export default i18n;
