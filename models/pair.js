let mongoose = require("mongoose");

let pairSchema = mongoose.Schema({
  id: { type: Number, required: true },

  word: {
    type: String,
    required: true
  },

  translation: {
    type: String,
    required: false
  },

  fromLanguage: {
    type: String,
    required: true
  },

  toLanguage: {
    type: String,
    required: true
  },

  display: {
    type: Boolean,
    required: true
  }
});

let Pair = (module.exports = mongoose.model("Pair", pairSchema));
