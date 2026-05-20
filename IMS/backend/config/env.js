const path = require("path");
const dotenv = require("dotenv");

dotenv.config({ path: path.resolve(__dirname, "../../../.env") });
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const clerkPublishableKey = process.env.CLERK_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || process.env.VITE_CLERK_PUBLISHABLE_KEY || "";

const config = {
  port: Number(process.env.PORT || 3000),
  database: {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    name: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
  },
  auth: {
    provider: process.env.AUTH_PROVIDER || "none",
    enableDevAuth: process.env.ENABLE_DEV_AUTH === "true",
    devAuthEmail: process.env.DEV_AUTH_EMAIL || "dev.admin@shehersaaz.local",
    devAuthName: process.env.DEV_AUTH_NAME || "Development Admin",
    clerkSecretKey: process.env.CLERK_SECRET_KEY || "",
    clerkPublishableKey
  }
};

if (String(config.auth.provider).toLowerCase() === "clerk" && !config.auth.clerkPublishableKey) {
  throw new Error("CLERK_PUBLISHABLE_KEY is required when AUTH_PROVIDER=clerk.");
}

module.exports = config;
