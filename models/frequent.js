let mongoose = require("mongoose");

let frequentSchema = mongoose.Schema({
  id: { type: Number, required: true },

  word: {
    type: String,
    required: true
  }
});

let Frequent = (module.exports = mongoose.model("Frequent", frequentSchema));
