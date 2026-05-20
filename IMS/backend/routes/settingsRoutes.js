const express = require("express");
const settingsController = require("../controllers/settingsController");
const { requireAuth, requireAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(requireAuth, requireAdmin);

router.get("/", settingsController.getSettings);
router.get("/:group", settingsController.getSettingsByGroup);
router.put("/:group", settingsController.updateSettingsGroup);
router.put("/:group/:key", settingsController.updateSetting);

module.exports = router;
