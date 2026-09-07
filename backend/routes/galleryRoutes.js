// ==========================================
// MAKE ME GLAM - GALLERY ROUTES
// ==========================================

const express = require("express");

const router = express.Router();


// ==========================================
// CONTROLLER
// ==========================================

const {

    getAllGallery,

    getAllGalleryAdmin,

    createGallery,

    updateGallery,

    updateGalleryStatus,

    deleteGallery

} = require("../controllers/galleryController");


// ==========================================
// AUTH MIDDLEWARE
// ==========================================

const authenticateAdmin =
    require("../middleware/authMiddleware");


// =====================================================
// CUSTOMER / PUBLIC
// GET ALL ACTIVE GALLERY IMAGES
// =====================================================

router.get(
    "/",
    getAllGallery
);


// =====================================================
// ADMIN
// GET ALL GALLERY ITEMS
// =====================================================

router.get(
    "/admin/all",
    authenticateAdmin,
    getAllGalleryAdmin
);


// =====================================================
// ADMIN
// CREATE GALLERY IMAGE
// =====================================================

router.post(
    "/admin",
    authenticateAdmin,
    createGallery
);


// =====================================================
// ADMIN
// UPDATE GALLERY IMAGE
// =====================================================

router.put(
    "/admin/:id",
    authenticateAdmin,
    updateGallery
);


// =====================================================
// ADMIN
// CHANGE GALLERY STATUS
// =====================================================

router.patch(
    "/admin/:id/status",
    authenticateAdmin,
    updateGalleryStatus
);


// =====================================================
// ADMIN
// DELETE GALLERY IMAGE
// =====================================================

router.delete(
    "/admin/:id",
    authenticateAdmin,
    deleteGallery
);


// ==========================================
// EXPORT
// ==========================================

module.exports = router;

