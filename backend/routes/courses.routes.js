const express = require("express");

const router = express.Router();

const pool = require("../config/database");

const authenticateAdmin =
    require("../middleware/authMiddleware");


// =====================================================
// CUSTOMER / PUBLIC
// GET ALL ACTIVE COURSES
// =====================================================

router.get("/", async (req, res) => {

    try {

        const result = await pool.query(`

            SELECT
                id,
                title,
                description,
                duration,
                fee,
                image
            FROM courses
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
            "Courses API Error:",
            error
        );


        res.status(500).json({

            success: false,

            message:
                "Failed to fetch courses"

        });

    }

});



// =====================================================
// ADMIN
// GET ALL COURSES
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
                        title,
                        description,
                        duration,
                        fee,
                        image,
                        status
                    FROM courses
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
                "Admin Courses API Error:",
                error
            );


            res.status(500).json({

                success: false,

                message:
                    "Failed to fetch courses"

            });

        }

    }
);


// =====================================================
// ADMIN
// CREATE COURSE
// =====================================================

router.post(
    "/admin",
    authenticateAdmin,
    async (req, res) => {

        try {

            const {
                title,
                description,
                duration,
                fee,
                image,
                status
            } = req.body;


            // -----------------------------------------
            // VALIDATION
            // -----------------------------------------

            if (
                !title ||
                !duration ||
                fee === undefined ||
                fee === null
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Title, duration and fee are required."

                });

            }


            const courseStatus =
                status === undefined
                    ? true
                    : Boolean(status);


            // -----------------------------------------
            // INSERT
            // -----------------------------------------

            const result =
                await pool.query(`

                    INSERT INTO courses
                    (
                        title,
                        description,
                        duration,
                        fee,
                        image,
                        status
                    )

                    VALUES
                    (
                        $1,
                        $2,
                        $3,
                        $4,
                        $5,
                        $6
                    )

                    RETURNING
                        id,
                        title,
                        description,
                        duration,
                        fee,
                        image,
                        status

                `, [

                    title.trim(),
                    description || null,
                    duration.trim(),
                    fee,
                    image || null,
                    courseStatus

                ]);


            res.status(201).json({

                success: true,

                message:
                    "Course created successfully.",

                data:
                    result.rows[0]

            });


        } catch (error) {

            console.error(
                "Create Course Error:",
                error
            );


            res.status(500).json({

                success: false,

                message:
                    "Failed to create course."

            });

        }

    }
);


// =====================================================
// ADMIN
// UPDATE COURSE
// =====================================================

router.put(
    "/admin/:id",
    authenticateAdmin,
    async (req, res) => {

        try {

            const { id } =
                req.params;


            const {
                title,
                description,
                duration,
                fee,
                image,
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
                        "Invalid course ID."

                });

            }


            // -----------------------------------------
            // VALIDATION
            // -----------------------------------------

            if (
                !title ||
                !duration ||
                fee === undefined ||
                fee === null
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Title, duration and fee are required."

                });

            }


            const courseStatus =
                status === undefined
                    ? true
                    : Boolean(status);


            // -----------------------------------------
            // UPDATE
            // -----------------------------------------

            const result =
                await pool.query(`

                    UPDATE courses

                    SET
                        title = $1,
                        description = $2,
                        duration = $3,
                        fee = $4,
                        image = $5,
                        status = $6

                    WHERE id = $7

                    RETURNING
                        id,
                        title,
                        description,
                        duration,
                        fee,
                        image,
                        status

                `, [

                    title.trim(),
                    description || null,
                    duration.trim(),
                    fee,
                    image || null,
                    courseStatus,
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
                        "Course not found."

                });

            }


            res.json({

                success: true,

                message:
                    "Course updated successfully.",

                data:
                    result.rows[0]

            });


        } catch (error) {

            console.error(
                "Update Course Error:",
                error
            );


            res.status(500).json({

                success: false,

                message:
                    "Failed to update course."

            });

        }

    }
);


// =====================================================
// ADMIN
// CHANGE COURSE STATUS
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
                        "Invalid course ID."

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

                    UPDATE courses

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
                        "Course not found."

                });

            }


            res.json({

                success: true,

                message:
                    status
                        ? "Course activated successfully."
                        : "Course deactivated successfully.",

                data:
                    result.rows[0]

            });


        } catch (error) {

            console.error(
                "Course Status Error:",
                error
            );


            res.status(500).json({

                success: false,

                message:
                    "Failed to update course status."

            });

        }

    }
);


// =====================================================
// ADMIN
// DELETE COURSE
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
                        "Invalid course ID."

                });

            }


            // -----------------------------------------
            // DELETE
            // -----------------------------------------

            const result =
                await pool.query(`

                    DELETE FROM courses

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
                        "Course not found."

                });

            }


            res.json({

                success: true,

                message:
                    "Course deleted successfully.",

                data:
                    result.rows[0]

            });


        } catch (error) {

            console.error(
                "Delete Course Error:",
                error
            );


            res.status(500).json({

                success: false,

                message:
                    "Failed to delete course."

            });

        }

    }
);



// =====================================================
// CUSTOMER / PUBLIC
// GET SINGLE ACTIVE COURSE
// =====================================================

router.get("/:id", async (req, res) => {

    try {

        const { id } = req.params;


        // ---------------------------------------------
        // VALIDATE ID
        // ---------------------------------------------

        if (!Number.isInteger(Number(id))) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid course ID"

            });

        }


        // ---------------------------------------------
        // FETCH COURSE
        // ---------------------------------------------

        const result = await pool.query(`

            SELECT
                id,
                title,
                description,
                duration,
                fee,
                image
            FROM courses
            WHERE id = $1
            AND status = TRUE

        `, [id]);


        // ---------------------------------------------
        // NOT FOUND
        // ---------------------------------------------

        if (result.rows.length === 0) {

            return res.status(404).json({

                success: false,

                message:
                    "Course not found"

            });

        }


        res.json({

            success: true,

            data:
                result.rows[0]

        });


    } catch (error) {

        console.error(
            "Single Course API Error:",
            error
        );


        res.status(500).json({

            success: false,

            message:
                "Failed to fetch course"

        });

    }

});



module.exports = router;

