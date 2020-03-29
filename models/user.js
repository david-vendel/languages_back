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
  }
});

let User = (module.exports = mongoose.model("User", userSchema));
