const express = require("express");

const router =
    express.Router();


// =====================================================
// CONTROLLER
// =====================================================

const {
    getDashboardStats
} = require(
    "../controllers/dashboardController"
);


// =====================================================
// AUTH MIDDLEWARE
// =====================================================

const authenticateAdmin =
    require(
        "../middleware/authMiddleware"
    );


// =====================================================
// DASHBOARD
// =====================================================

router.get(
    "/",
    authenticateAdmin,
    getDashboardStats
);


// =====================================================
// EXPORT
// =====================================================

module.exports = router;