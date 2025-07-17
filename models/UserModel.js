const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  favRecipes: [{ type: mongoose.Schema.Types.ObjectId, ref: "recipe" }],
});

module.exports = mongoose.model("user", UserSchema);
