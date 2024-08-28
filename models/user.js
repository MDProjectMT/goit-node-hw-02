// import jwt from "jsonwebtoken";
import mongoose, { Schema } from "mongoose";
import bCrypt from "bcrypt";

const UserSchema = new Schema({
  // username: {
  //   type: String,
  //   required: true,
  // },
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
});
//ustawienie hasła przy rejestracji
UserSchema.methods.setPassword = async function (password) {
  this.password = await bCrypt.hash(password, 10);
};
//sprawdzenie hasła przy logowaniu
UserSchema.methods.validatePassword = async function (password) {
  const isMatch = await bCrypt.compare(password, this.password);
  return isMatch;
};

// const payload = {
//   id: "some_id",
//   username: "some_user",
// };

// const secret =
//   "CV4vghhwW7RxlGFyBFCQVmqYlCcwNQwQzDqEmEdpulkBhFpFTvMXe1OeEuxBUsxw";

// const token = jwt.sign(payload, secret, { expiresIn: "12h" });
// console.log(token);

export const User = mongoose.model("user", UserSchema);
