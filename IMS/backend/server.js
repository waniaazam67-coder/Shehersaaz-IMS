const path = require("path");
const express = require("express");
const settingsRoutes = require("./routes/settingsRoutes");
const inventoryRoutes = require("./routes/inventoryRoutes");
const imsRoutes = require("./routes/imsRoutes");
const { errorHandler, notFoundHandler } = require("./middleware/errorMiddleware");
const { corsMiddleware } = require("./middleware/corsMiddleware");
const { testDatabaseConnection } = require("./config/database");
const config = require("./config/env");

const app = express();
const PORT = process.env.PORT || 3000;
const frontendPath = path.resolve(__dirname, "../frontend");

app.use(corsMiddleware);
app.use(express.json({ limit: "1mb" }));
app.use(express.static(frontendPath, {
  setHeaders(res, filePath) {
    if (filePath.endsWith(".html")) {
      res.setHeader("Cache-Control", "no-store");
    }
  }
}));

app.get("/api/health", async (req, res, next) => {
  try {
    await testDatabaseConnection();
    res.json({ success: true, data: { status: "ok" } });
  } catch (error) {
    next(error);
  }
});

function publicConfig() {
  return {
    authProvider: config.auth.provider,
    clerkPublishableKey: config.auth.clerkPublishableKey
  };
}

app.get("/api/config", (req, res) => {
  res.json(publicConfig());
});

app.get("/api/auth/config", (req, res) => {
  const data = publicConfig();
  res.json({
    success: true,
    data: {
      provider: data.authProvider,
      authProvider: data.authProvider,
      clerkPublishableKey: data.clerkPublishableKey
    }
  });
});

app.use("/api", imsRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/inventory", inventoryRoutes);

app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api/")) return notFoundHandler(req, res);
  return res.sendFile(path.join(frontendPath, "index.html"), next);
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`IMS server running at http://localhost:${PORT}`);
});
