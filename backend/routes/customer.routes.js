// ==========================================
// MAKE ME GLAM - CUSTOMER ROUTES
// ==========================================

const express = require("express");

const router = express.Router();

const {
    getAllCustomers
} = require("../controllers/customerController");

const authenticateAdmin =
    require("../middleware/authMiddleware");


// ==========================================
// GET ALL CUSTOMERS
// ==========================================

router.get(
    "/",
    authenticateAdmin,
    getAllCustomers
);


// ==========================================
// EXPORT
// ==========================================

module.exports = router;