
// const express = require("express");
// const multer = require("multer");

// const router = express.Router();

// const {
//     getLogo,
//     uploadLogo
// } = require("../controllers/brandingController");

// // Apne existing admin authentication middleware ka path check karna.
// const requireAdmin = require("../middleware/requireAdmin");

// const upload = multer({
//     storage: multer.memoryStorage(),
//     limits: {
//         fileSize: 2 * 1024 * 1024
//     }
// });

// // Public logo endpoint
// router.get("/branding/logo", getLogo);

// // Admin-only logo upload
// router.post(
//     "/admin/branding/logo",
//     requireAdmin,
//     upload.single("logo"),
//     uploadLogo
// );

// module.exports = router;


const express = require("express");
const multer = require("multer");

const router = express.Router();

const {
    getLogo,
    uploadLogo,
    getFooterImage,
    uploadFooterImage
} = require("../controllers/brandingController");

const authenticateAdmin = require("../middleware/authMiddleware");

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 2 * 1024 * 1024
    }
});

// Public logo endpoint
router.get("/branding/logo", getLogo);

// Admin-only logo upload
router.post(
    "/admin/branding/logo",
    authenticateAdmin,
    upload.single("logo"),
    uploadLogo
);

// Public footer image endpoint
router.get("/branding/footer-image", getFooterImage);

// Admin-only footer image upload
router.post(
    "/admin/branding/footer-image",
    authenticateAdmin,
    upload.single("footerImage"),
    uploadFooterImage
);

module.exports = router;
