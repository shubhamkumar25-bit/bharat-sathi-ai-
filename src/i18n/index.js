import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import en from "./locales/en.json";
import hi from "./locales/hi.json";
import ta from "./locales/ta.json";
import te from "./locales/te.json";
import bn from "./locales/bn.json";
import gu from "./locales/gu.json";
import mr from "./locales/mr.json";
import pa from "./locales/pa.json";
import kn from "./locales/kn.json";
import ml from "./locales/ml.json";
import ur from "./locales/ur.json";

i18n
.use(LanguageDetector)
.use(initReactI18next)
.init({
  resources: {
    en: { translation: en },
    hi: { translation: hi },
    ta: { translation: ta },
    te: { translation: te },
    bn: { translation: bn },
    gu: { translation: gu },
    mr: { translation: mr },
    pa: { translation: pa },
    kn: { translation: kn },
    ml: { translation: ml },
    ur: { translation: ur },
  },

  fallbackLng: "en",

  interpolation: {
    escapeValue: false,
  },
});

export default i18n;