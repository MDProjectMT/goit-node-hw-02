import mongoose, { Schema } from "mongoose";
import bCrypt from "bcrypt";

const UserSchema = new Schema({
  password: {
    type: String,
    required: [true, "Password is required"],
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
  },
  subscription: {
    type: String,
    enum: ["starter", "pro", "business"],
    default: "starter",
  },
  token: {
    type: String,
    default: null,
  },
  avatarURL: String,
  verify: {
    type: Boolean,
    default: false,
  },
  verificationToken: {
    type: String,
    required: [true, "Verify token is required"],
  },
});

UserSchema.methods.setPassword = async function (password) {
  this.password = await bCrypt.hash(password, 10);
};

UserSchema.methods.validatePassword = async function (password) {
  const isMatch = await bCrypt.compare(password, this.password);
  return isMatch;
};

export const User = mongoose.model("user", UserSchema);
