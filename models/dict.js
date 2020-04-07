let mongoose = require("mongoose");

let dictSchema = mongoose.Schema({
  fromLanguage: {
    type: String,
    required: true
  },

  toLanguage: {
    type: String,
    required: true
  },

  totalWords: {
    type: Number,
    required: true
  }
});

let Dict = (module.exports = mongoose.model("Dict", dictSchema));
