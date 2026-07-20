import nodemailer from "nodemailer";
import env from "./env.config.js";

const transporter = nodemailer.createTransport({
  host: env.BREVO_SMTP_HOST,
  port: env.BREVO_SMTP_PORT,
  secure: false,
  auth: {
    user: env.BREVO_SMTP_USER,
    pass: env.BREVO_SMTP_PASS,
  },
});

export const sendEmail = async ({ to, subject, html }) => {
  return transporter.sendMail({
    from: env.MAIL_FROM,
    to,
    subject,
    html,
  });
};

export default transporter;
