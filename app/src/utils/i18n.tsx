import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import Backend from "i18next-http-backend";
import LanguageDetector from "i18next-browser-languagedetector";

import { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES } from "./constants";
import pkg from '../../package.json';
// Change to check cookies, url language and then browser language
i18n
  // load translation using http -> see /public/locales (i.e. https://github.com/i18next/react-i18next/tree/master/example/react/public/locales)
  // learn more: https://github.com/i18next/i18next-http-backend
  .use(Backend)
  // detect user language
  // learn more: https://github.com/i18next/i18next-browser-languageDetector
  .use(LanguageDetector)
  // pass the i18n instance to react-i18next.
  .use(initReactI18next)
  // init i18next
  // for all options read: https://www.i18next.com/overview/configuration-options
  .init({
    ns: ['translation', 'website'],
    defaultNS: 'translation',
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
      queryStringParams: { v: pkg.version }
    },
    detection: {
      lookupCookie: 'lng',
      order: ['querystring', 'cookie', 'navigator'],
      caches: ['cookie'],
      cookieOptions: { sameSite: "strict" }
    },
    fallbackLng: DEFAULT_LANGUAGE,
    debug: process.env.NODE_ENV !== "production",
    supportedLngs: SUPPORTED_LANGUAGES,
    load: "currentOnly",
  });

export default i18n;
