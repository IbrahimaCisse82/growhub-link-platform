import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import fr from "./locales/fr";
import en from "./locales/en";
import frDeals from "./locales/fr.deals";
import enDeals from "./locales/en.deals";
import frCoach from "./locales/fr.coach";
import enCoach from "./locales/en.coach";
import frPublic from "./locales/fr.public";
import enPublic from "./locales/en.public";
import frNet from "./locales/fr.net";
import enNet from "./locales/en.net";
import frProfile from "./locales/fr.profile";
import enProfile from "./locales/en.profile";
import frUi from "./locales/fr.ui";
import enUi from "./locales/en.ui";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      fr: { translation: { ...fr, ...frDeals, ...frCoach, ...frPublic, ...frNet, ...frProfile, ...frUi } },
      en: { translation: { ...en, ...enDeals, ...enCoach, ...enPublic, ...enNet, ...enProfile, ...enUi } },
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
