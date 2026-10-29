
const pool = require("../config/database");

// PUBLIC: Load website logo
const getLogo = async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT logo_data, mime_type FROM website_branding WHERE id = 1"
        );

        if (result.rows.length === 0) {
            return res.sendStatus(404);
        }

        const logo = result.rows[0];

        res.setHeader("Content-Type", logo.mime_type);
        res.setHeader("Cache-Control", "no-store");
        return res.send(logo.logo_data);
    } catch (error) {
        console.error("Get logo error:", error);
        return res.sendStatus(500);
    }
};

// ADMIN: Upload and save website logo
const uploadLogo = async (req, res) => {
    try {
        
        const dbCheck = await pool.query(`
            SELECT
                current_database() AS database_name,
                current_schema() AS schema_name,
                current_user AS database_user,
                to_regclass('public.website_branding') AS branding_table
        `);

        console.log("Branding DB check:", dbCheck.rows[0]);


        const allowedTypes = [
            "image/png",
            "image/jpeg",
            "image/webp"
        ];

        if (!req.file || !allowedTypes.includes(req.file.mimetype)) {
            return res.status(400).json({
                success: false,
                message: "Select a PNG, JPG or WebP logo."
            });
        }

        await pool.query(
            `INSERT INTO website_branding
                (id, logo_data, mime_type)
             VALUES (1, $1, $2)
             ON CONFLICT (id)
             DO UPDATE SET
                logo_data = EXCLUDED.logo_data,
                mime_type = EXCLUDED.mime_type,
                updated_at = NOW()`,
            [req.file.buffer, req.file.mimetype]
        );

        return res.json({
            success: true,
            message: "Logo saved successfully."
        });
    } catch (error) {
        console.error("Upload logo error:", error);
        return res.status(500).json({
            success: false,
            message: "Logo upload failed."
        });
    }
};


// PUBLIC: Load footer background image
const getFooterImage = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT image_data, mime_type
             FROM website_footer_branding
             WHERE id = 1`
        );

        if (result.rows.length === 0) {
            return res.sendStatus(404);
        }

        const image = result.rows[0];

        res.setHeader("Content-Type", image.mime_type);
        res.setHeader("Cache-Control", "no-store");

        return res.send(image.image_data);
    } catch (error) {
        console.error("Get footer image error:", error);
        return res.sendStatus(500);
    }
};

// ADMIN: Upload and save footer background image
const uploadFooterImage = async (req, res) => {
    try {
        const allowedTypes = [
            "image/png",
            "image/jpeg",
            "image/webp"
        ];

        if (!req.file || !allowedTypes.includes(req.file.mimetype)) {
            return res.status(400).json({
                success: false,
                message: "Select a PNG, JPG or WebP image."
            });
        }

        await pool.query(
            `INSERT INTO website_footer_branding
                (id, image_data, mime_type)
             VALUES (1, $1, $2)
             ON CONFLICT (id)
             DO UPDATE SET
                image_data = EXCLUDED.image_data,
                mime_type = EXCLUDED.mime_type,
                updated_at = NOW()`,
            [req.file.buffer, req.file.mimetype]
        );

        return res.json({
            success: true,
            message: "Footer background image saved successfully."
        });
    } catch (error) {
        console.error("Upload footer image error:", error);

        return res.status(500).json({
            success: false,
            message: "Footer image upload failed."
        });
    }
};

module.exports = {
    getLogo,
    uploadLogo,
    getFooterImage,
    uploadFooterImage
};
