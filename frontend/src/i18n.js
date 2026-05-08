import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "./locales/en.json";
import mr from "./locales/mr.json";

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: en,
      },
      mr: {
        translation: mr,
      },
    },
    lng: "mr", // Set default to Marathi as it was the original
    fallbackLng: "en",

    interpolation: {
      escapeValue: false, 
    },

    react: {
      useSuspense: false,
    },
  });

export default i18n;