// ==========================================
// MAKE ME GLAM - GALLERY CONTROLLER
// ==========================================

const pool = require("../config/database");


// ==========================================
// CUSTOMER / PUBLIC
// GET ALL ACTIVE GALLERY ITEMS
// ==========================================

const getAllGallery = async (req, res) => {

    try {

        const result = await pool.query(`
            SELECT
                id,
                title,
                image_url,
                description,
                category,
                status,
                created_at
            FROM gallery
            WHERE status = TRUE
            ORDER BY created_at DESC
        `);


        res.status(200).json({

            success: true,

            data: result.rows

        });


    } catch (error) {

        console.error(
            "Gallery loading error:",
            error
        );


        res.status(500).json({

            success: false,

            message: "Unable to load gallery"

        });

    }

};


// ==========================================
// ADMIN
// GET ALL GALLERY ITEMS
// ==========================================

const getAllGalleryAdmin = async (req, res) => {

    try {

        const result = await pool.query(`
            SELECT
                id,
                title,
                image_url,
                description,
                category,
                status,
                created_at
            FROM gallery
            ORDER BY created_at DESC
        `);


        res.status(200).json({

            success: true,

            count: result.rows.length,

            data: result.rows

        });


    } catch (error) {

        console.error(
            "Admin Gallery loading error:",
            error
        );


        res.status(500).json({

            success: false,

            message: "Unable to load gallery"

        });

    }

};


// ==========================================
// ADMIN
// CREATE GALLERY ITEM
// ==========================================

const createGallery = async (req, res) => {

    try {

        const {
            title,
            image_url,
            description,
            category,
            status
        } = req.body;


        // ------------------------------------------
        // VALIDATION
        // ------------------------------------------

        if (
            !title ||
            !image_url
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Title and image URL are required."

            });

        }


        const galleryStatus =
            status === undefined
                ? true
                : Boolean(status);


        // ------------------------------------------
        // INSERT
        // ------------------------------------------

        const result = await pool.query(`

            INSERT INTO gallery
            (
                title,
                image_url,
                description,
                category,
                status
            )

            VALUES
            (
                $1,
                $2,
                $3,
                $4,
                $5
            )

            RETURNING
                id,
                title,
                image_url,
                description,
                category,
                status,
                created_at

        `, [

            title.trim(),
            image_url.trim(),
            description
                ? description.trim()
                : null,
            category
                ? category.trim()
                : null,
            galleryStatus

        ]);


        res.status(201).json({

            success: true,

            message:
                "Gallery image added successfully.",

            data:
                result.rows[0]

        });


    } catch (error) {

        console.error(
            "Create Gallery Error:",
            error
        );


        res.status(500).json({

            success: false,

            message:
                "Failed to add gallery image."

        });

    }

};


// ==========================================
// ADMIN
// UPDATE GALLERY ITEM
// ==========================================

const updateGallery = async (req, res) => {

    try {

        const { id } = req.params;

        const {
            title,
            image_url,
            description,
            category,
            status
        } = req.body;


        // ------------------------------------------
        // VALIDATE ID
        // ------------------------------------------

        if (
            !Number.isInteger(Number(id))
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid gallery ID."

            });

        }


        // ------------------------------------------
        // VALIDATION
        // ------------------------------------------

        if (
            !title ||
            !image_url
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Title and image URL are required."

            });

        }


        const galleryStatus =
            status === undefined
                ? true
                : Boolean(status);


        // ------------------------------------------
        // UPDATE
        // ------------------------------------------

        const result = await pool.query(`

            UPDATE gallery

            SET
                title = $1,
                image_url = $2,
                description = $3,
                category = $4,
                status = $5

            WHERE id = $6

            RETURNING
                id,
                title,
                image_url,
                description,
                category,
                status,
                created_at

        `, [

            title.trim(),
            image_url.trim(),
            description
                ? description.trim()
                : null,
            category
                ? category.trim()
                : null,
            galleryStatus,
            id

        ]);


        // ------------------------------------------
        // NOT FOUND
        // ------------------------------------------

        if (
            result.rows.length === 0
        ) {

            return res.status(404).json({

                success: false,

                message:
                    "Gallery item not found."

            });

        }


        res.status(200).json({

            success: true,

            message:
                "Gallery image updated successfully.",

            data:
                result.rows[0]

        });


    } catch (error) {

        console.error(
            "Update Gallery Error:",
            error
        );


        res.status(500).json({

            success: false,

            message:
                "Failed to update gallery image."

        });

    }

};


// ==========================================
// ADMIN
// CHANGE GALLERY STATUS
// ==========================================

const updateGalleryStatus = async (req, res) => {

    try {

        const { id } = req.params;

        const { status } = req.body;


        // ------------------------------------------
        // VALIDATE ID
        // ------------------------------------------

        if (
            !Number.isInteger(Number(id))
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid gallery ID."

            });

        }


        // ------------------------------------------
        // VALIDATE STATUS
        // ------------------------------------------

        if (
            typeof status !== "boolean"
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Status must be true or false."

            });

        }


        // ------------------------------------------
        // UPDATE STATUS
        // ------------------------------------------

        const result = await pool.query(`

            UPDATE gallery

            SET status = $1

            WHERE id = $2

            RETURNING
                id,
                title,
                status

        `, [

            status,
            id

        ]);


        if (
            result.rows.length === 0
        ) {

            return res.status(404).json({

                success: false,

                message:
                    "Gallery item not found."

            });

        }


        res.status(200).json({

            success: true,

            message:
                status
                    ? "Gallery image activated successfully."
                    : "Gallery image deactivated successfully.",

            data:
                result.rows[0]

        });


    } catch (error) {

        console.error(
            "Gallery Status Error:",
            error
        );


        res.status(500).json({

            success: false,

            message:
                "Failed to update gallery status."

        });

    }

};


// ==========================================
// ADMIN
// DELETE GALLERY ITEM
// ==========================================

const deleteGallery = async (req, res) => {

    try {

        const { id } = req.params;


        // ------------------------------------------
        // VALIDATE ID
        // ------------------------------------------

        if (
            !Number.isInteger(Number(id))
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid gallery ID."

            });

        }


        // ------------------------------------------
        // DELETE
        // ------------------------------------------

        const result = await pool.query(`

            DELETE FROM gallery

            WHERE id = $1

            RETURNING
                id,
                title

        `, [id]);


        if (
            result.rows.length === 0
        ) {

            return res.status(404).json({

                success: false,

                message:
                    "Gallery item not found."

            });

        }


        res.status(200).json({

            success: true,

            message:
                "Gallery image deleted successfully.",

            data:
                result.rows[0]

        });


    } catch (error) {

        console.error(
            "Delete Gallery Error:",
            error
        );


        res.status(500).json({

            success: false,

            message:
                "Failed to delete gallery image."

        });

    }

};


// ==========================================
// EXPORT
// ==========================================

module.exports = {

    getAllGallery,

    getAllGalleryAdmin,

    createGallery,

    updateGallery,

    updateGalleryStatus,

    deleteGallery

};

