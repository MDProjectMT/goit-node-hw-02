import sgMail from "@sendgrid/mail";
import dotenv from "dotenv";

dotenv.config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const port = process.env.PORT || 3000;

export const sendVerificationEmail = async (email, verificationToken) => {
  const message = {
    to: email,
    from: process.env.EMAIL_FROM_USER,
    subject: "E-mail verification",
    text: `Verify your email by clicking this link: <a href="http://localhost:${port}/api/users/verify/${verificationToken}">Link</a>`,
    html: `Verify your email by clicking this link: <a href="http://localhost:${port}/api/users/verify/${verificationToken}">Link</a>`,
  };
  try {
    await sgMail.send(message);
    console.log(`Verification email sent to ${email}`);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};
