import { join } from 'path';
import { fileURLToPath } from 'url';
import i18next from 'i18next';
import I18NexFsBackend from 'i18next-fs-backend';

import constant from '../configurations/constant.js';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export const LANGUAGE_LIST = {
  'en': {n: 'English', d: 'ltr'},
  'fr': {n: 'Français', d: 'ltr'},
  'ar': {n: 'اللغة العربية', d: 'rtl'},
  'zh': {n: '中文', d: 'ltr'},
};

const SUPPORTED_LANGUAGES = Object.keys(LANGUAGE_LIST);

i18next
  .use(I18NexFsBackend)
  .init({
  debug: false,//!constant.isProduction,
  initImmediate: false,
  fallbackLng: 'en',
  supportedLngs: SUPPORTED_LANGUAGES,
  preload: SUPPORTED_LANGUAGES,
  backend: {
    loadPath: join(__dirname, '../locales/{{lng}}.json'),
  },
});
/*
readdirSync(join(__dirname, '../locales')).filter((fileName) => {
    const joinedPath = join(join(__dirname, '../locales'), fileName)
    const isDirectory = lstatSync(joinedPath).isDirectory()
    return isDirectory
  }),
*/
//const headerLangRegex = /(([a-zA-Z]+(-[a-zA-Z0-9]+){0,2})|\*)\s*;?\s*(q=([0-9.]+))?/gi
const headerLangRegex = /(([a-zA-Z]+(-[a-zA-Z0-9]+){0,2})|\*)\s*;?\s*(q=([0-9.]+))?/gi
const parseHeader = (acceptLanguage) => {
  if (acceptLanguage) {
    const res = acceptLanguage.match(headerLangRegex);
    for (let i = 0; i < res.length && res[i]; i++) {
      const lang = res[i].split(';')[0];
      if (LANGUAGE_LIST[lang]) {
        return lang;
      }
    }
  }
  return null;
}

const setRequestLanguage = (ctx) => {
  // openID params should check 'ui_locales' ex: "fr-CA fr en"
  // check in querystring
  if ((ctx.request.query.lng) && (LANGUAGE_LIST[ctx.request.query.lng])) {
    ctx.cookies.set('i18next', ctx.request.query.lng, { signed: false, httpOnly: false });
    return ctx.request.query.lng;
  }
  // check in cookie
  let foundLang = ctx.cookies.get('i18next', { signed: false, httpOnly: false });
  if (foundLang) {
    return foundLang;
  }
  // check in accept-language
  foundLang = parseHeader(ctx.request.headers['accept-language']);
  if (foundLang) {
    return foundLang;
  }
  // return default
  return 'en';
}
// Keep loaded instances
const i18nInstances = {};
for (let i = 0; i < SUPPORTED_LANGUAGES.length; i++) {
  i18nInstances[SUPPORTED_LANGUAGES[i]] = i18next.cloneInstance({ 
    initImmediate: false,
    lng: SUPPORTED_LANGUAGES[i],
  });
}
export const languageMiddleware = async (ctx, next) => {
  const lang = setRequestLanguage(ctx);
  
  ctx.state.t = i18nInstances[lang].t; // don't push the main object so it doesn't get changed
  ctx.state.html = {
    lang,
    dir: LANGUAGE_LIST[lang].d || 'ltr',
  }

  await next()
}

export { setRequestLanguage, i18nInstances };
// export default i18next;