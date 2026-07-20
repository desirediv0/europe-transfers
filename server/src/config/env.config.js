const requiredVars = [
  "DATABASE_URL",
  "JWT_ACCESS_SECRET",
  "JWT_REFRESH_SECRET",
  "CLIENT_URL",
  "ADMIN_URL",
];

const missing = requiredVars.filter((v) => !process.env[v]);
if (missing.length > 0) {
  throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
}

const env = Object.freeze({
  PORT: parseInt(process.env.PORT, 10) || 4000,
  NODE_ENV: process.env.NODE_ENV || "development",

  DATABASE_URL: process.env.DATABASE_URL,

  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
  JWT_ACCESS_EXPIRES: process.env.JWT_ACCESS_EXPIRES || "15m",
  JWT_REFRESH_EXPIRES: process.env.JWT_REFRESH_EXPIRES || "30d",

  CLIENT_URL: process.env.CLIENT_URL,
  ADMIN_URL: process.env.ADMIN_URL,

  R2_ACCOUNT_ID: process.env.R2_ACCOUNT_ID || "",
  R2_ACCESS_KEY_ID: process.env.R2_ACCESS_KEY_ID || "",
  R2_SECRET_ACCESS_KEY: process.env.R2_SECRET_ACCESS_KEY || "",
  R2_BUCKET_NAME: process.env.R2_BUCKET_NAME || "",
  R2_ENDPOINT: process.env.R2_ENDPOINT || "",
  R2_PUBLIC_URL: process.env.R2_PUBLIC_URL || "",

  BREVO_SMTP_HOST: process.env.BREVO_SMTP_HOST || "smtp-relay.brevo.com",
  BREVO_SMTP_PORT: parseInt(process.env.BREVO_SMTP_PORT, 10) || 587,
  BREVO_SMTP_USER: process.env.BREVO_SMTP_USER || "",
  BREVO_SMTP_PASS: process.env.BREVO_SMTP_PASS || "",
  MAIL_FROM: process.env.MAIL_FROM || "Europe Transfers <no-reply@europetransfers.com>",

  OTP_EXPIRES_MIN: parseInt(process.env.OTP_EXPIRES_MIN, 10) || 5,
});

export default env;
