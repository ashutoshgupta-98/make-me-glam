// ==========================================
// MAKE ME GLAM - CONTACT ROUTES
// ==========================================

const express = require("express");

const router = express.Router();

const {
    createContact,
    getAllContacts,
    updateContactStatus,
    deleteContact
} = require("../controllers/contactController");


const authenticateAdmin = require("../middleware/authMiddleware");

// ==========================================
// CREATE CONTACT / ENQUIRY
// ==========================================

router.post("/", createContact);



// ==========================================
// ADMIN - GET ALL CONTACT MESSAGES
// ==========================================

router.get(
    "/admin/all",
    authenticateAdmin,
    getAllContacts
);


// ==========================================
// ADMIN - UPDATE CONTACT STATUS
// ==========================================

router.patch(
    "/admin/:id/status",
    authenticateAdmin,
    updateContactStatus
);


// ==========================================
// ADMIN - DELETE CONTACT
// ==========================================

router.delete(
    "/admin/:id",
    authenticateAdmin,
    deleteContact
);


// ==========================================
// EXPORT ROUTER
// ==========================================

module.exports = router;