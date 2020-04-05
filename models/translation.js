let mongoose = require("mongoose");

let translationSchema = mongoose.Schema({
  word: {
    type: String,
    required: true
  },

  translations: {
    type: Array,
    required: false
  },

  fromLanguage: {
    type: String,
    required: true
  },

  toLanguage: {
    type: String,
    required: true
  }
});

let Translation = (module.exports = mongoose.model(
  "Translation",
  translationSchema
));
