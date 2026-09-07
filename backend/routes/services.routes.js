// const express = require("express");
// const router = express.Router();

// const pool = require("../config/database");

// // GET all active services
// router.get("/", async (req, res) => {
//     try {
//         const result = await pool.query(`
//             SELECT
//                 id,
//                 name,
//                 description,
//                 duration,
//                 price,
//                 image
//             FROM services
//             WHERE status = TRUE
//             ORDER BY id DESC
//         `);

//         res.json({
//             success: true,
//             count: result.rows.length,
//             data: result.rows
//         });

//     } catch (error) {
//         console.error("Services API Error:", error);

//         res.status(500).json({
//             success: false,
//             message: "Failed to fetch services"
//         });
//     }
// });

// module.exports = router;

const express = require("express");

const router = express.Router();

const pool = require("../config/database");

const authenticateAdmin =
    require("../middleware/authMiddleware");


// =====================================================
// CUSTOMER / PUBLIC
// GET ALL ACTIVE SERVICES
// =====================================================

router.get("/", async (req, res) => {

    try {

        const result = await pool.query(`

            SELECT
                id,
                name,
                description,
                duration,
                price,
                image
            FROM services
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
            "Services API Error:",
            error
        );


        res.status(500).json({

            success: false,

            message:
                "Failed to fetch services"

        });

    }

});


// =====================================================
// CUSTOMER / PUBLIC
// GET SINGLE ACTIVE SERVICE
// =====================================================

router.get("/:id", async (req, res) => {

    try {

        const { id } = req.params;


        if (
            !Number.isInteger(
                Number(id)
            )
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid service ID"

            });

        }


        const result =
            await pool.query(`

                SELECT
                    id,
                    name,
                    description,
                    duration,
                    price,
                    image
                FROM services
                WHERE id = $1
                AND status = TRUE

            `, [id]);


        if (
            result.rows.length === 0
        ) {

            return res.status(404).json({

                success: false,

                message:
                    "Service not found"

            });

        }


        res.json({

            success: true,

            data:
                result.rows[0]

        });


    } catch (error) {

        console.error(
            "Single Service API Error:",
            error
        );


        res.status(500).json({

            success: false,

            message:
                "Failed to fetch service"

        });

    }

});


// =====================================================
// ADMIN
// GET ALL SERVICES
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
                        description,
                        duration,
                        price,
                        image,
                        status
                    FROM services
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
                "Admin Services API Error:",
                error
            );


            res.status(500).json({

                success: false,

                message:
                    "Failed to fetch services"

            });

        }

    }
);


// =====================================================
// ADMIN
// CREATE SERVICE
// =====================================================

router.post(
    "/admin",
    authenticateAdmin,
    async (req, res) => {

        try {

            const {
                name,
                description,
                duration,
                price,
                image,
                status
            } = req.body;


            // -----------------------------------------
            // VALIDATION
            // -----------------------------------------

            if (
                !name ||
                duration === undefined ||
                duration === null ||
                price === undefined ||
                price === null
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Name, duration and price are required."

                });

            }


            const serviceStatus =
                status === undefined
                    ? true
                    : Boolean(status);


            // -----------------------------------------
            // INSERT
            // -----------------------------------------

            const result =
                await pool.query(`

                    INSERT INTO services
                    (
                        name,
                        description,
                        duration,
                        price,
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
                        name,
                        description,
                        duration,
                        price,
                        image,
                        status

                `, [

                    name.trim(),
                    description || null,
                    duration,
                    price,
                    image || null,
                    serviceStatus

                ]);


            res.status(201).json({

                success: true,

                message:
                    "Service created successfully.",

                data:
                    result.rows[0]

            });


        } catch (error) {

            console.error(
                "Create Service Error:",
                error
            );


            res.status(500).json({

                success: false,

                message:
                    "Failed to create service."

            });

        }

    }
);


// =====================================================
// ADMIN
// UPDATE SERVICE
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
                description,
                duration,
                price,
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
                        "Invalid service ID."

                });

            }


            // -----------------------------------------
            // VALIDATION
            // -----------------------------------------

            if (
                !name ||
                duration === undefined ||
                duration === null ||
                price === undefined ||
                price === null
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Name, duration and price are required."

                });

            }


            const serviceStatus =
                status === undefined
                    ? true
                    : Boolean(status);


            // -----------------------------------------
            // UPDATE
            // -----------------------------------------

            const result =
                await pool.query(`

                    UPDATE services

                    SET
                        name = $1,
                        description = $2,
                        duration = $3,
                        price = $4,
                        image = $5,
                        status = $6

                    WHERE id = $7

                    RETURNING
                        id,
                        name,
                        description,
                        duration,
                        price,
                        image,
                        status

                `, [

                    name.trim(),
                    description || null,
                    duration,
                    price,
                    image || null,
                    serviceStatus,
                    id

                ]);


            if (
                result.rows.length === 0
            ) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Service not found."

                });

            }


            res.json({

                success: true,

                message:
                    "Service updated successfully.",

                data:
                    result.rows[0]

            });


        } catch (error) {

            console.error(
                "Update Service Error:",
                error
            );


            res.status(500).json({

                success: false,

                message:
                    "Failed to update service."

            });

        }

    }
);


// =====================================================
// ADMIN
// CHANGE SERVICE STATUS
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
                        "Invalid service ID."

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

                    UPDATE services

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
                        "Service not found."

                });

            }


            res.json({

                success: true,

                message:
                    status
                        ? "Service activated successfully."
                        : "Service deactivated successfully.",

                data:
                    result.rows[0]

            });


        } catch (error) {

            console.error(
                "Service Status Error:",
                error
            );


            res.status(500).json({

                success: false,

                message:
                    "Failed to update service status."

            });

        }

    }
);


// =====================================================
// ADMIN
// DELETE SERVICE
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
                        "Invalid service ID."

                });

            }


            // -----------------------------------------
            // DELETE
            // -----------------------------------------

            const result =
                await pool.query(`

                    DELETE FROM services

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
                        "Service not found."

                });

            }


            res.json({

                success: true,

                message:
                    "Service deleted successfully.",

                data:
                    result.rows[0]

            });


        } catch (error) {

            console.error(
                "Delete Service Error:",
                error
            );


            res.status(500).json({

                success: false,

                message:
                    "Failed to delete service."

            });

        }

    }
);


module.exports = router;