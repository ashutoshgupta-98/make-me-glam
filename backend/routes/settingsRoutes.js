// ==========================================
// MAKE ME GLAM - SETTINGS ROUTES
// ==========================================

const express = require("express");

const router = express.Router();

const {
    getAllSettings,
    updateSetting
} = require("../controllers/settingsController");

const authenticateAdmin =
    require("../middleware/authMiddleware");


// ==========================================
// GET ALL SETTINGS
// ==========================================

router.get(
    "/",
    authenticateAdmin,
    getAllSettings
);


// ==========================================
// UPDATE SETTING
// ==========================================

router.patch(
    "/:key",
    authenticateAdmin,
    updateSetting
);


// ==========================================
// EXPORT ROUTER
// ==========================================

module.exports = router;

