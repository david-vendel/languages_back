let mongoose = require("mongoose");

let oxfordSchema = mongoose.Schema({
  word: {
    type: String,
    required: true,
  },

  data: {
    type: String,
    required: false,
  },
});

let Oxford = (module.exports = mongoose.model("Oxford", oxfordSchema));
