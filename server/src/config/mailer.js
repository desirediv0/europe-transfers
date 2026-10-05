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

// category "registration" sends from info@; everything else (bookings, payments, enquiries) from sales@
export const sendEmail = async ({ to, subject, html, category }) => {
  const isRegistration = category === "registration";
  return transporter.sendMail({
    from: isRegistration ? env.REGISTRATION_MAIL_FROM : env.MAIL_FROM,
    replyTo: isRegistration ? env.REGISTRATION_EMAIL : env.SALES_EMAIL,
    to,
    subject,
    html,
  });
};

export default transporter;
