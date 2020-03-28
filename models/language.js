let mongoose = require("mongoose");

let languageSchema = mongoose.Schema({
  word: {
    type: String,
    required: true
  },
  translation: {
    type: String,
    required: false
  }
});

let Language = (module.exports = mongoose.model("Language", languageSchema));
