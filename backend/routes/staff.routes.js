const express = require("express");
const router = express.Router();

const pool = require("../config/database");

const authenticateAdmin =
    require("../middleware/authMiddleware");


// =====================================================
// CUSTOMER / PUBLIC
// GET ALL ACTIVE STAFF
// =====================================================

router.get("/", async (req, res) => {

    try {

        const result = await pool.query(`

            SELECT
                id,
                name,
                designation,
                phone,
                email,
                photo,
                bio
            FROM staff
            WHERE status = TRUE
            ORDER BY id DESC

        `);


        res.json({

            success: true,

            count:
                result.rows.length,

            data:
                result.rows

        });


    } catch (error) {

        console.error(
            "Staff API Error:",
            error
        );


        res.status(500).json({

            success: false,

            message:
                "Failed to fetch staff"

        });

    }

});


// =====================================================
// ADMIN
// GET ALL STAFF
// =====================================================

router.get(
    "/admin/all",
    authenticateAdmin,
    async (req, res) => {

        try {

            const result =
                await pool.query(`

                    SELECT
                        id,
                        name,
                        designation,
                        phone,
                        email,
                        photo,
                        bio,
                        status
                    FROM staff
                    ORDER BY id DESC

                `);


            res.json({

                success: true,

                count:
                    result.rows.length,

                data:
                    result.rows

            });


        } catch (error) {

            console.error(
                "Admin Staff API Error:",
                error
            );


            res.status(500).json({

                success: false,

                message:
                    "Failed to fetch staff"

            });

        }

    }
);


// =====================================================
// ADMIN
// CREATE STAFF
// =====================================================

router.post(
    "/admin",
    authenticateAdmin,
    async (req, res) => {

        try {

            const {
                name,
                designation,
                phone,
                email,
                photo,
                bio,
                status
            } = req.body;


            // -----------------------------------------
            // VALIDATION
            // -----------------------------------------

            if (
                !name ||
                !designation
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Name and designation are required."

                });

            }


            const staffStatus =
                status === undefined
                    ? true
                    : Boolean(status);


            // -----------------------------------------
            // INSERT
            // -----------------------------------------

            const result =
                await pool.query(`

                    INSERT INTO staff
                    (
                        name,
                        designation,
                        phone,
                        email,
                        photo,
                        bio,
                        status
                    )

                    VALUES
                    (
                        $1,
                        $2,
                        $3,
                        $4,
                        $5,
                        $6,
                        $7
                    )

                    RETURNING
                        id,
                        name,
                        designation,
                        phone,
                        email,
                        photo,
                        bio,
                        status

                `, [

                    name.trim(),
                    designation.trim(),
                    phone
                        ? phone.trim()
                        : null,
                    email
                        ? email.trim()
                        : null,
                    photo
                        ? photo.trim()
                        : null,
                    bio
                        ? bio.trim()
                        : null,
                    staffStatus

                ]);


            res.status(201).json({

                success: true,

                message:
                    "Staff created successfully.",

                data:
                    result.rows[0]

            });


        } catch (error) {

            console.error(
                "Create Staff Error:",
                error
            );


            res.status(500).json({

                success: false,

                message:
                    "Failed to create staff."

            });

        }

    }
);


// =====================================================
// ADMIN
// UPDATE STAFF
// =====================================================

router.put(
    "/admin/:id",
    authenticateAdmin,
    async (req, res) => {

        try {

            const { id } =
                req.params;


            const {
                name,
                designation,
                phone,
                email,
                photo,
                bio,
                status
            } = req.body;


            // -----------------------------------------
            // VALIDATE ID
            // -----------------------------------------

            if (
                !Number.isInteger(
                    Number(id)
                )
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid staff ID."

                });

            }


            // -----------------------------------------
            // VALIDATION
            // -----------------------------------------

            if (
                !name ||
                !designation
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Name and designation are required."

                });

            }


            const staffStatus =
                status === undefined
                    ? true
                    : Boolean(status);


            // -----------------------------------------
            // UPDATE
            // -----------------------------------------

            const result =
                await pool.query(`

                    UPDATE staff

                    SET
                        name = $1,
                        designation = $2,
                        phone = $3,
                        email = $4,
                        photo = $5,
                        bio = $6,
                        status = $7

                    WHERE id = $8

                    RETURNING
                        id,
                        name,
                        designation,
                        phone,
                        email,
                        photo,
                        bio,
                        status

                `, [

                    name.trim(),
                    designation.trim(),
                    phone
                        ? phone.trim()
                        : null,
                    email
                        ? email.trim()
                        : null,
                    photo
                        ? photo.trim()
                        : null,
                    bio
                        ? bio.trim()
                        : null,
                    staffStatus,
                    id

                ]);


            // -----------------------------------------
            // NOT FOUND
            // -----------------------------------------

            if (
                result.rows.length === 0
            ) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Staff not found."

                });

            }


            res.json({

                success: true,

                message:
                    "Staff updated successfully.",

                data:
                    result.rows[0]

            });


        } catch (error) {

            console.error(
                "Update Staff Error:",
                error
            );


            res.status(500).json({

                success: false,

                message:
                    "Failed to update staff."

            });

        }

    }
);


// =====================================================
// ADMIN
// CHANGE STAFF STATUS
// =====================================================

router.patch(
    "/admin/:id/status",
    authenticateAdmin,
    async (req, res) => {

        try {

            const { id } =
                req.params;

            const { status } =
                req.body;


            // -----------------------------------------
            // VALIDATE ID
            // -----------------------------------------

            if (
                !Number.isInteger(
                    Number(id)
                )
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid staff ID."

                });

            }


            // -----------------------------------------
            // VALIDATE STATUS
            // -----------------------------------------

            if (
                typeof status !== "boolean"
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Status must be true or false."

                });

            }


            // -----------------------------------------
            // UPDATE STATUS
            // -----------------------------------------

            const result =
                await pool.query(`

                    UPDATE staff

                    SET status = $1

                    WHERE id = $2

                    RETURNING
                        id,
                        name,
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
                        "Staff not found."

                });

            }


            res.json({

                success: true,

                message:
                    status
                        ? "Staff activated successfully."
                        : "Staff deactivated successfully.",

                data:
                    result.rows[0]

            });


        } catch (error) {

            console.error(
                "Staff Status Error:",
                error
            );


            res.status(500).json({

                success: false,

                message:
                    "Failed to update staff status."

            });

        }

    }
);


// =====================================================
// ADMIN
// DELETE STAFF
// =====================================================

router.delete(
    "/admin/:id",
    authenticateAdmin,
    async (req, res) => {

        try {

            const { id } =
                req.params;


            // -----------------------------------------
            // VALIDATE ID
            // -----------------------------------------

            if (
                !Number.isInteger(
                    Number(id)
                )
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid staff ID."

                });

            }


            // -----------------------------------------
            // DELETE
            // -----------------------------------------

            const result =
                await pool.query(`

                    DELETE FROM staff

                    WHERE id = $1

                    RETURNING
                        id,
                        name

                `, [id]);


            if (
                result.rows.length === 0
            ) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Staff not found."

                });

            }


            res.json({

                success: true,

                message:
                    "Staff deleted successfully.",

                data:
                    result.rows[0]

            });


        } catch (error) {

            console.error(
                "Delete Staff Error:",
                error
            );


            res.status(500).json({

                success: false,

                message:
                    "Failed to delete staff."

            });

        }

    }
);


// =====================================================
// EXPORT
// =====================================================

module.exports = router;