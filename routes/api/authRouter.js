import express from "express";
import jwt from "jsonwebtoken";
import gravatar from "gravatar";
import path from "path";
import upload from "../../middleware/multer.js";
import { User } from "../../models/user.js";
import { sendVerificationEmail } from "../../helpers/verification.js";
import { fileURLToPath } from "url";
import { Jimp } from "jimp";
import { v4 as uuidV4 } from "uuid";
import "colors";
import authMiddleware from "../../middleware/jwt.js";

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const tempDir = path.join(__dirname, "../../temp");
const storeImageDir = path.join(__dirname, "../../public/avatars");

router.post(
  "/users/signup",
  upload.single("avatar"),
  async (req, res, next) => {
    const { username, email, password } = req.body;
    const verificationToken = uuidV4();

    let avatarURL;

    avatarURL = gravatar.url(email, { s: "250" }, true);

    const { error } = User.validate({
      username,
      email,
      password,
      avatarURL,
      verificationToken,
    });
    if (error) {
      return res.status(400).json({
        status: "error",
        code: 400,
        message: error.details[0].message,
      });
    }

    const user = await User.findOne({ email }).lean();
    if (user) {
      return res.status(409).json({
        status: "409 Conflict",
        code: 409,
        message: "Email in use",
        data: "Conflict",
      });
    }

    try {
      const newUser = new User({
        username,
        email,
        avatarURL,
        verificationToken,
        verify: false,
      });

      await newUser.setPassword(password);
      await newUser.save();

      await sendVerificationEmail(newUser.email, verificationToken);

      return res.status(201).json({
        status: "201 Created",
        code: 201,
        message: "Registration successfull",
        user: {
          email: newUser.email,
          subscription: newUser.subscription,
          avatarURL: newUser.avatarURL,
        },
      });
    } catch (error) {
      console.error(
        `Błąd podczas rejestracji nowego użytkownika: ${error.message}`
      );
      next(error);
    }
  }
);

router.post("/users/login", async (req, res, _next) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({
      status: "400 Bad Request",
      code: 400,
      message: "Error",
    });
  }

  if (!user.verify) {
    return res.status(403).json({
      status: "error",
      code: 403,
      message:
        "Your email is not verified. Please verify your email before logging in.",
    });
  }
  const isPasswordCorrect = await user.validatePassword(password);
  if (isPasswordCorrect) {
    const payload = {
      id: user.id,
      username: user.username,
    };
    const token = jwt.sign(payload, process.env.SECRET, { expiresIn: "1w" });

    user.token = token;
    await user.save();

    return res.status(200).json({
      status: "200 OK",
      code: 200,
      message: "Log in successfull",
      token: token,
      user: {
        email: user.email,
        subscription: user.subscription,
        avatarURL: user.avatarURL,
      },
    });
  } else {
    return res.status(401).json({
      status: "401 Unauthorized",
      code: 401,
      message: "Email or password is wrong",
    });
  }
});

router.patch(
  "/users/avatars",
  authMiddleware,
  upload.single("avatar"),
  async (req, res, next) => {
    const userId = req.user._id;

    const user = await User.findOne({ _id: userId });
    if (!user) {
      return res.status(404).json({
        status: "400 Bad Request",
        code: 400,
        message: "Error",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        status: "400 Bad Request",
        code: 400,
        message: "No file uploaded",
      });
    }

    let avatarURL;

    const tempPath = path.join(tempDir, req.file.filename);
    const uniqueFileName = `${uuidV4()}${path.extname(
      req.file.originalname.toLowerCase()
    )}`;
    const finalePath = path.join(storeImageDir, uniqueFileName);

    try {
      const image = await Jimp.read(tempPath);
      await image.cover({ w: 250, h: 250 }).write(finalePath);

      avatarURL = `/public/avatars/${uniqueFileName}`;
    } catch (error) {
      return next(error);
    }

    user.avatarURL = avatarURL;
    await user.save();
    return res.status(200).json({
      status: "success",
      code: 200,
      message: "Avatar updated successfully",
      user: {
        email: user.email,
        avatarURL: user.avatarURL,
      },
    });
  }
);

router.get("/users/verify/:verificationToken", async (req, res, next) => {
  const { verificationToken } = req.params;

  try {
    const user = await User.findOne({ verificationToken });

    if (!user) {
      return res.status(404).json({
        status: "404 Not Found",
        code: 404,
        message: "User not found with this verification token",
      });
    }
    user.verificationToken = " ";
    user.verify = true;
    await user.save();

    return res.status(200).json({
      status: "success",
      code: 200,
      message: "Verification successful",
    });
  } catch (error) {
    next(error);
  }
});

router.post("/users/verify", async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      status: "400",
      code: 400,
      message: "missing required field email",
    });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        status: "404 Not Found",
        code: 404,
        message: "User not found",
      });
    }
    if (user.verify) {
      return res.status(400).json({
        status: "Bad request 400",
        code: 400,
        message: "Verification has already been passed",
      });
    }
    const verificationToken = uuidV4();
    user.verificationToken = verificationToken;
    user.save();

    if (!verificationToken) {
      return res.status(400).json({
        status: "400 Bad Request",
        code: 400,
        message: "User does not have a verification token",
      });
    }
    await sendVerificationEmail(user.email, verificationToken);
    return res.status(200).json({
      status: "success",
      code: 200,
      message: "Verification email send",
    });
  } catch (error) {
    next(error);
  }
});

export default router;
