let mongoose = require("mongoose");

let userSchema = mongoose.Schema({
  username: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  auth: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  toLanguage: {
    type: String,
    require: false
  },
  fromLanguage: {
    type: String,
    require: false
  },
  choicesCount: {
    type: String,
    require: false
  },
  flaggedWords: {
    type: Object,
    required: false
  }
});

let User = (module.exports = mongoose.model("User", userSchema));
