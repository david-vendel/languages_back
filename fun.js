let Translation = require("./models/translation.js");
const GOOGLE_TRANSLATE_API_KEY = process.env.GOOGLE_TRANSLATE_API_KEY;
const fetch = require("node-fetch");

const cachedTranslation = async (word, fromLanguage, toLanguage) => {
  if (fromLanguage === toLanguage) {
    return [word];
  }
  const answer = await Translation.find({
    word: word,
    fromLanguage: fromLanguage,
    toLanguage: toLanguage,
  }).exec();
  //   console.log("answer", answer);

  if (answer.length === 0) {
    const totalCount = await Translation.countDocuments({}, (err, c) => {
      console.log("count", c);
      return c;
    });
    if (totalCount > 10000) {
      return false;
    }

    const translations = await realTranslation(word, fromLanguage, toLanguage);
    if (!translations) {
      return false;
    }
    // console.log("got real trans", translations.translations[0].translatedText);
    saveTranslation(
      word,
      [translations.translations[0].translatedText],
      fromLanguage,
      toLanguage
    );
    return [translations.translations[0].translatedText];
  } else {
    const cache = await Translation.findOne({
      word: word,
      fromLanguage: fromLanguage,
      toLanguage: toLanguage,
    }).exec();

    return cache.translations;
  }
};

const realTranslation = async (word, fromLanguage, toLanguage) => {
  let url = `https://translation.googleapis.com/language/translate/v2?key=${GOOGLE_TRANSLATE_API_KEY}`;
  url += "&q=" + encodeURI(word);
  url += `&source=${fromLanguage}`;
  url += `&target=${toLanguage}`;

  if (toLanguage === undefined) {
    console.log("toLanguage is undefined");
    return false;
  }
  //   console.log("url", url);
  try {
    return await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    })
      .then((res) => res.json())
      .then((response) => {
        // console.log("response from google: ", response);
        if (response.error) {
          return false;
        }
        // console.log("return", response.data.translations[0].translatedText);

        return response.data;
      })
      .catch((error) => {
        console.log("There was an error with the translation request: ", error);
        return false;
      });
  } catch (e) {
    console.log("translateion e", e);
  }
};

const saveTranslation = (word, translations, fromLanguage, toLanguage) => {
  Translation.create(
    {
      word: word,
      translations: translations,
      fromLanguage: fromLanguage,
      toLanguage: toLanguage,
    },
    (err, res) => {
      if (err) {
        // console.log("err", err);
      } else {
        // console.log("res", res);
      }
    }
  );
};

module.exports = {
  cachedTranslation: cachedTranslation,
};
