import dotenv from "dotenv";
// dotenv.config();

export const envConfig = {
  PORT: process.env.PORT,
  NODE_ENV: process.env.NODE_ENV || "development",

  MODEL_PROVIDER: process.env.MODEL_PROVIDER!,
  MODEL_NAME: process.env.MODEL_NAME!,
  MODEL_API_KEY: process.env.MODEL_API_KEY!,
  MODEL_TEMPERATURE: process.env.MODEL_TEMPERATURE!,
  MODEL_BASE_URL: process.env.MODEL_BASE_URL!,

  JWT_SECRET: process.env.JWT_SECRET!,
  JWT_EXPIRATION: process.env.JWT_EXPIRATION!,

  COOKIE_NAME: process.env.COOKIE_NAME!,
};
