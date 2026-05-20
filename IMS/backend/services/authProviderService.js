const config = require("../config/env");
const { createClerkClient, verifyToken } = require("@clerk/express");

let clerkClient;

function getBearerToken(req) {
  const authorization = req.headers.authorization || "";
  const [type, token] = authorization.split(/\s+/);
  return type?.toLowerCase() === "bearer" ? token : "";
}

function getClerkClient() {
  if (!clerkClient) {
    clerkClient = createClerkClient({ secretKey: config.auth.clerkSecretKey });
  }
  return clerkClient;
}

function primaryEmailForUser(user) {
  const primaryId = user.primaryEmailAddressId;
  const primary = user.emailAddresses?.find((email) => email.id === primaryId) || user.emailAddresses?.[0];
  return primary?.emailAddress || "";
}

async function verifyRequest(req) {
  const provider = String(config.auth.provider || "none").toLowerCase();

  if (provider === "clerk") {
    if (!config.auth.clerkSecretKey) {
      const error = new Error("CLERK_SECRET_KEY is required when AUTH_PROVIDER=clerk.");
      error.statusCode = 500;
      throw error;
    }

    const token = getBearerToken(req);
    if (!token) {
      const error = new Error("Missing Clerk bearer token.");
      error.statusCode = 401;
      throw error;
    }

    const payload = await verifyToken(token, { secretKey: config.auth.clerkSecretKey });
    const user = await getClerkClient().users.getUser(payload.sub);
    const email = primaryEmailForUser(user);

    return {
      provider: "clerk",
      subject: `clerk:${payload.sub}`,
      email,
      name: user.fullName || [user.firstName, user.lastName].filter(Boolean).join(" ") || email,
      email_verified: Boolean(user.emailAddresses?.find((entry) => entry.emailAddress === email)?.verification?.status === "verified")
    };
  }

  if (provider !== "none") {
    const error = new Error(`Auth provider '${provider}' is not supported yet.`);
    error.statusCode = 501;
    throw error;
  }

  if (process.env.NODE_ENV === "development" && config.auth.enableDevAuth) {
    return {
      provider: "development",
      subject: `dev:${config.auth.devAuthEmail}`,
      email: config.auth.devAuthEmail,
      name: config.auth.devAuthName,
      email_verified: true
    };
  }

  const error = new Error("Auth provider not configured.");
  error.statusCode = 401;
  throw error;
}

module.exports = {
  verifyRequest
};
