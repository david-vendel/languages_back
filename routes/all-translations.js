const { ALL_TRANSLATIONS_GET } = require("./../endpoints");

let express = require("express"),
  bodyParser = require("body-parser");

let index = require("./../index.js");
let fun = require("./../fun.js");
router = express.Router();

console.log("index", index);
console.log("fun", fun);

router.use(function timeLog(req, res, next) {
  console.log("Time: ", Date.now());
  next();
});

router.post(ALL_TRANSLATIONS_GET, async (req, res, next) => {
  console.log("req body", req.body);
  const word = req.body.word;
  let languages = req.body.languages;
  let part = req.body.part;
  let outOf = req.body.outOf;

  if (!languages) {
    languages = {
      // 'auto': 'Automatic',
      af: "Afrikaans",
      sq: "Albanian",
      am: "Amharic",
      ar: "Arabic",
      hy: "Armenian",
      az: "Azerbaijani",
      eu: "Basque",
      be: "Belarusian",
      bn: "Bengali",
      bs: "Bosnian",
      bg: "Bulgarian",
      ca: "Catalan",
      ceb: "Cebuano",
      ny: "Chichewa",
      "zh-cn": "Chinese Simplified",
      "zh-tw": "Chinese Traditional",
      co: "Corsican",
      hr: "Croatian",
      cs: "Czech",
      da: "Danish",
      nl: "Dutch",
      en: "English",
      eo: "Esperanto",
      et: "Estonian",
      tl: "Filipino",
      fi: "Finnish",
      fr: "French",
      fy: "Frisian",
      gl: "Galician",
      ka: "Georgian",
      de: "German",
      el: "Greek",
      gu: "Gujarati",
      ht: "Haitian Creole",
      ha: "Hausa",
      haw: "Hawaiian",
      iw: "Hebrew",
      hi: "Hindi",
      hmn: "Hmong",
      hu: "Hungarian",
      is: "Icelandic",
      ig: "Igbo",
      id: "Indonesian",
      ga: "Irish",
      it: "Italian",
      ja: "Japanese",
      jw: "Javanese",
      kn: "Kannada",
      kk: "Kazakh",
      km: "Khmer",
      ko: "Korean",
      ku: "Kurdish (Kurmanji)",
      ky: "Kyrgyz",
      lo: "Lao",
      la: "Latin",
      lv: "Latvian",
      lt: "Lithuanian",
      lb: "Luxembourgish",
      mk: "Macedonian",
      mg: "Malagasy",
      ms: "Malay",
      ml: "Malayalam",
      mt: "Maltese",
      mi: "Maori",
      mr: "Marathi",
      mn: "Mongolian",
      my: "Myanmar (Burmese)",
      ne: "Nepali",
      no: "Norwegian",
      ps: "Pashto",
      fa: "Persian",
      pl: "Polish",
      pt: "Portuguese",
      ma: "Punjabi",
      ro: "Romanian",
      ru: "Russian",
      sm: "Samoan",
      gd: "Scots Gaelic",
      sr: "Serbian",
      st: "Sesotho",
      sn: "Shona",
      sd: "Sindhi",
      si: "Sinhala",
      sk: "Slovak",
      sl: "Slovenian",
      so: "Somali",
      es: "Spanish",
      su: "Sundanese",
      sw: "Swahili",
      sv: "Swedish",
      tg: "Tajik",
      ta: "Tamil",
      te: "Telugu",
      th: "Thai",
      tr: "Turkish",
      uk: "Ukrainian",
      ur: "Urdu",
      uz: "Uzbek",
      vi: "Vietnamese",
      cy: "Welsh",
      xh: "Xhosa",
      yi: "Yiddish",
      yo: "Yoruba",
      zu: "Zulu",
    };
  }

  let fromLanguage = "en";

  console.log("word", word, "languages", languages);
  let response = [];

  //   .slice(
  //     (languages.length * (part - 1)) / outOf,
  //     languages.length * (part / outOf)
  //   )

  for (
    let i = Math.floor((Object.keys(languages).length * (part - 1)) / outOf);
    i < Math.floor((Object.keys(languages).length * part) / outOf);
    i++
  ) {
    const l = Object.keys(languages)[i];
    const ln = Object.values(languages)[i];
    const translationA = await fun.cachedTranslation(word, fromLanguage, l);
    if (translationA) {
      response.push({
        language: l,
        languageName: ln,
        translation: translationA[0],
      });
    }
  }
  console.log("FINISH");
  res.send(response);
});

module.exports = router;
