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
  }
});

let Pair = (module.exports = mongoose.model("Pair", pairSchema));
