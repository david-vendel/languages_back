let mongoose = require("mongoose");

let logSchema = mongoose.Schema({
  username: { type: String, require: true },

  action: { type: String, required: true },

  word: {
    type: String,
    required: true
  },

  success: {
    type: Boolean,
    required: true
  },

  fromLanguage: {
    type: String,
    required: true
  },

  toLanguage: {
    type: String,
    required: true
  },

  position: {
    type: String,
    required: false
  }
});

logSchema.set("timestamps", true);

let Log = (module.exports = mongoose.model("Log", logSchema));
