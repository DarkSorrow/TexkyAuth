//TODO: remove, this is for test purpose, check PUBLIC_URL maybe or only /api to call
export const STORAGE_TOKEN = "texky";
export const PREF_TOKEN = "tpref";
export const STORAGE_CCHALLENGE = "_ccoidc";

export const BASE_URL = 'https://admin.texky.com/';
export const CLIENT_ID = window._TEXKY_.CLIENT_ID || 'hTs2VY4FOHhmXW77';
export const OIDC_URL = window._TEXKY_.OIDC_URL || 'http://localhost:8080';
//export const IDP_URL ='http://lp5-has2-dsy.dsone.3ds.com:91'
export const LOGOUT_URL = window._TEXKY_.LOGOUT_URL || 'http://localhost:3000/connect/logout';
export const REDIRECT_URL = window._TEXKY_.REDIRECT_URL || 'http://localhost:3000/connect/login';
export const REDIRECT_SIGNUP_URL = REDIRECT_URL.replace('/login', '/signup');

export const DRAWER_WIDTH = 240;

export const DEFAULT_LANGUAGE = "en-GB";

interface List {
  [lang: string]: string;
}

export const LANGUAGE_LIST: List = {
  'en-GB': 'English',
  'fr-FR': 'Français',
}

export const SUPPORTED_LANGUAGES: string[] = Object.keys(LANGUAGE_LIST);

export interface LangNames {
  id: string;
  n: string;
}

export const LANGUAGES: Array<LangNames> = [{"id":"aa","n":"Afaraf"},{"id":"ab","n":"аҧсуа бызшәа, аҧсшәа"},{"id":"ae","n":"avesta"},{"id":"af","n":"Afrikaans"},{"id":"ak","n":"Akan"},{"id":"am","n":"አማርኛ"},{"id":"an","n":"aragonés"},{"id":"ar","n":"العربية"},{"id":"as","n":"অসমীয়া"},{"id":"av","n":"авар мацӀ, магӀарул мацӀ"},{"id":"ay","n":"aymar aru"},{"id":"az","n":"azərbaycan dili"},{"id":"ba","n":"башҡорт теле"},{"id":"be","n":"беларуская мова"},{"id":"bg","n":"български език"},{"id":"bh","n":"भोजपुरी"},{"id":"bi","n":"Bislama"},{"id":"bm","n":"bamanankan"},{"id":"bn","n":"বাংলা"},{"id":"bo","n":"བོད་ཡིག"},{"id":"br","n":"brezhoneg"},{"id":"bs","n":"bosanski jezik"},{"id":"ca","n":"català"},{"id":"ce","n":"нохчийн мотт"},{"id":"ch","n":"Chamoru"},{"id":"co","n":"corsu, lingua corsa"},{"id":"cr","n":"ᓀᐦᐃᔭᐍᐏᐣ"},{"id":"cs","n":"čeština, český jazyk"},{"id":"cu","n":"ѩзыкъ словѣньскъ"},{"id":"cv","n":"чӑваш чӗлхи"},{"id":"cy","n":"Cymraeg"},{"id":"da","n":"dansk"},{"id":"de","n":"Deutsch"},{"id":"dv","n":"ދިވެހި"},{"id":"dz","n":"རྫོང་ཁ"},{"id":"ee","n":"Eʋegbe"},{"id":"el","n":"ελληνικά"},{"id":"en","n":"English"},{"id":"eo","n":"Esperanto"},{"id":"es","n":"Español"},{"id":"et","n":"eesti, eesti keel"},{"id":"eu","n":"euskara, euskera"},{"id":"fa","n":"فارسی"},{"id":"ff","n":"Fulfulde, Pulaar, Pular"},{"id":"fi","n":"suomi, suomen kieli"},{"id":"fj","n":"vosa Vakaviti"},{"id":"fo","n":"føroyskt"},{"id":"fr","n":"français, langue française"},{"id":"fy","n":"Frysk"},{"id":"ga","n":"Gaeilge"},{"id":"gd","n":"Gàidhlig"},{"id":"gl","n":"galego"},{"id":"gn","n":"Avañe'ẽ"},{"id":"gu","n":"ગુજરાતી"},{"id":"gv","n":"Gaelg, Gailck"},{"id":"ha","n":"(Hausa) هَوُسَ"},{"id":"he","n":"עברית"},{"id":"hi","n":"हिन्दी, हिंदी"},{"id":"ho","n":"Hiri Motu"},{"id":"hr","n":"hrvatski jezik"},{"id":"ht","n":"Kreyòl ayisyen"},{"id":"hu","n":"magyar"},{"id":"hy","n":"Հայերեն"},{"id":"hz","n":"Otjiherero"},{"id":"ia","n":"Interlingua"},{"id":"id","n":"Bahasa Indonesia"},{"id":"ie","n":"Originally called Occidental; then Interlingue after WWII"},{"id":"ig","n":"Asụsụ Igbo"},{"id":"ii","n":"ꆈꌠ꒿ Nuosuhxop"},{"id":"ik","n":"Iñupiaq, Iñupiatun"},{"id":"io","n":"Ido"},{"id":"is","n":"Íslenska"},{"id":"it","n":"Italiano"},{"id":"iu","n":"ᐃᓄᒃᑎᑐᑦ"},{"id":"ja","n":"日本語 (にほんご)"},{"id":"jv","n":"ꦧꦱꦗꦮ, Basa Jawa"},{"id":"ka","n":"ქართული"},{"id":"kg","n":"Kikongo"},{"id":"ki","n":"Gĩkũyũ"},{"id":"kj","n":"Kuanyama"},{"id":"kk","n":"қазақ тілі"},{"id":"kl","n":"kalaallisut, kalaallit oqaasii"},{"id":"km","n":"ខ្មែរ, ខេមរភាសា, ភាសាខ្មែរ"},{"id":"kn","n":"ಕನ್ನಡ"},{"id":"ko","n":"한국어"},{"id":"kr","n":"Kanuri"},{"id":"ks","n":"कश्मीरी, كشميري‎"},{"id":"ku","n":"Kurdî, كوردی‎"},{"id":"kv","n":"коми кыв"},{"id":"kw","n":"Kernewek"},{"id":"ky","n":"Кыргызча, Кыргыз тили"},{"id":"la","n":"latine, lingua latina"},{"id":"lb","n":"Lëtzebuergesch"},{"id":"lg","n":"Luganda"},{"id":"li","n":"Limburgs"},{"id":"ln","n":"Lingála"},{"id":"lo","n":"ພາສາລາວ"},{"id":"lt","n":"lietuvių kalba"},{"id":"lu","n":"Tshiluba"},{"id":"lv","n":"latviešu valoda"},{"id":"mg","n":"fiteny malagasy"},{"id":"mh","n":"Kajin M̧ajeļ"},{"id":"mi","n":"te reo Māori"},{"id":"mk","n":"македонски јазик"},{"id":"ml","n":"മലയാളം"},{"id":"mn","n":"Монгол хэл"},{"id":"mr","n":"मराठी"},{"id":"ms","n":"bahasa Melayu, بهاس ملايو‎"},{"id":"mt","n":"Malti"},{"id":"my","n":"ဗမာစာ"},{"id":"na","n":"Dorerin Naoero"},{"id":"nb","n":"Norsk bokmål"},{"id":"nd","n":"isiNdebele"},{"id":"ne","n":"नेपाली"},{"id":"ng","n":"Owambo"},{"id":"nl","n":"Nederlands, Vlaams"},{"id":"nn","n":"Norsk nynorsk"},{"id":"no","n":"Norsk"},{"id":"nr","n":"Ndébélé"},{"id":"nv","n":"Diné bizaad"},{"id":"ny","n":"chiCheŵa, chinyanja"},{"id":"oc","n":"occitan, lenga d'òc"},{"id":"oj","n":"ᐊᓂᔑᓈᐯᒧᐎᓐ"},{"id":"om","n":"Afaan Oromoo"},{"id":"or","n":"ଓଡ଼ିଆ"},{"id":"os","n":"ирон æвзаг"},{"id":"pa","n":"ਪੰਜਾਬੀ"},{"id":"pi","n":"पाऴि"},{"id":"pl","n":"język polski, polszczyzna"},{"id":"ps","n":"پښتو"},{"id":"pt","n":"Português"},{"id":"qu","n":"Runa Simi, Kichwa"},{"id":"rm","n":"rumantsch grischun"},{"id":"rn","n":"Ikirundi"},{"id":"ro","n":"Română"},{"id":"ru","n":"Русский"},{"id":"rw","n":"Ikinyarwanda"},{"id":"sa","n":"संस्कृतम्"},{"id":"sc","n":"sardu"},{"id":"sd","n":"सिन्धी, سنڌي، سندھی‎"},{"id":"se","n":"Davvisámegiella"},{"id":"sg","n":"yângâ tî sängö"},{"id":"si","n":"සිංහල"},{"id":"sk","n":"slovenčina, slovenský jazyk"},{"id":"sl","n":"slovenski jezik, slovenščina"},{"id":"sm","n":"gagana fa'a Samoa"},{"id":"sn","n":"chiShona"},{"id":"so","n":"Soomaaliga, af Soomaali"},{"id":"sq","n":"Shqip"},{"id":"sr","n":"српски језик"},{"id":"ss","n":"SiSwati"},{"id":"st","n":"Sesotho"},{"id":"su","n":"Basa Sunda"},{"id":"sv","n":"svenska"},{"id":"sw","n":"Kiswahili"},{"id":"ta","n":"தமிழ்"},{"id":"te","n":"తెలుగు"},{"id":"tg","n":"тоҷикӣ, toçikī, تاجیکی‎"},{"id":"th","n":"ไทย"},{"id":"ti","n":"ትግርኛ"},{"id":"tk","n":"Türkmen, Түркмен"},{"id":"tl","n":"Wikang Tagalog"},{"id":"tn","n":"Setswana"},{"id":"to","n":"faka Tonga"},{"id":"tr","n":"Türkçe"},{"id":"ts","n":"Xitsonga"},{"id":"tt","n":"татар теле, tatar tele"},{"id":"tw","n":"Twi"},{"id":"ty","n":"Reo Tahiti"},{"id":"ug","n":"ئۇيغۇرچە‎, Uyghurche"},{"id":"uk","n":"Українська"},{"id":"ur","n":"اردو"},{"id":"uz","n":"Oʻzbek, Ўзбек, أۇزبېك‎"},{"id":"ve","n":"Tshivenḓa"},{"id":"vi","n":"Tiếng Việt"},{"id":"vo","n":"Volapük"},{"id":"wa","n":"walon"},{"id":"wo","n":"Wollof"},{"id":"xh","n":"isiXhosa"},{"id":"yi","n":"ייִדיש"},{"id":"yo","n":"Yorùbá"},{"id":"za","n":"Saɯ cueŋƅ, Saw cuengh"},{"id":"zh","n":"中文 (Zhōngwén), 汉语, 漢語"},{"id":"zu","n":"isiZulu"}];
