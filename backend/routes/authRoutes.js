const express = require("express");

const router = express.Router();

const {
    adminLogin
} = require("../controllers/authController");


// =====================================================
// ADMIN LOGIN
// =====================================================

router.post(
    "/login",
    adminLogin
);


module.exports = router;