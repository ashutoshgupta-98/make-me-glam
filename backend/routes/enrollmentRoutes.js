// ==========================================
// MAKE ME GLAM - ENROLLMENT ROUTES
// ==========================================

const express = require("express");
const crypto = require("crypto");

const router = express.Router();

const pool = require("../config/database");
const razorpay = require("../config/razorpay");

const authenticateAdmin =
    require("../middleware/authMiddleware");

const {
    getAllEnrollments,
    updateEnrollmentStatus,
    deleteEnrollment
} = require("../controllers/enrollmentController");


// =====================================================
// CREATE ENROLLMENT + RAZORPAY ORDER
// CUSTOMER
// =====================================================

router.post("/", async (req, res) => {

    try {

        const {
            course_id,
            name,
            phone,
            email,
            city,
            message
        } = req.body;


        // =================================================
        // VALIDATION
        // =================================================

        if (
            !course_id ||
            !name ||
            !phone ||
            !email
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Course, name, phone and email are required."

            });

        }


        // =================================================
        // GET COURSE
        // =================================================

        const courseResult =
            await pool.query(
                `
                SELECT
                    id,
                    title,
                    fee,
                    status
                FROM courses
                WHERE id = $1
                `,
                [course_id]
            );


        if (
            courseResult.rows.length === 0
        ) {

            return res.status(404).json({

                success: false,

                message:
                    "Course not found."

            });

        }


        const course =
            courseResult.rows[0];


        // =================================================
        // CHECK ACTIVE COURSE
        // =================================================

        if (!course.status) {

            return res.status(400).json({

                success: false,

                message:
                    "This course is currently unavailable."

            });

        }


        // =================================================
        // COURSE FEE
        // =================================================

        const amount =
            Number(course.fee);


        if (
            !amount ||
            amount <= 0
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid course fee."

            });

        }


        // =================================================
        // ENROLLMENT NUMBER
        // =================================================

        const enrollmentNumber =
            `MMG-ENR-${Date.now()}`;


        // =================================================
        // RAZORPAY AMOUNT
        // Razorpay uses paise
        // ₹25,000 = 2500000 paise
        // =================================================

        const razorpayAmount =
            Math.round(
                amount * 100
            );


        // =================================================
        // CREATE RAZORPAY ORDER
        // =================================================

        const razorpayOrder =
            await razorpay.orders.create({

                amount:
                    razorpayAmount,

                currency:
                    "INR",

                receipt:
                    enrollmentNumber,

                notes: {

                    course_id:
                        String(course.id),

                    course_title:
                        course.title,

                    customer_name:
                        name,

                    customer_email:
                        email,

                    customer_phone:
                        phone

                }

            });


        // =================================================
        // SAVE ENROLLMENT
        // =================================================

        const enrollmentResult =
            await pool.query(
                `
                INSERT INTO enrollments (
                    enrollment_number,
                    course_id,
                    customer_name,
                    phone,
                    email,
                    city,
                    message,
                    amount,
                    status,
                    payment_status,
                    razorpay_order_id
                )

                VALUES (
                    $1,
                    $2,
                    $3,
                    $4,
                    $5,
                    $6,
                    $7,
                    $8,
                    'pending',
                    'pending',
                    $9
                )

                RETURNING *
                `,
                [
                    enrollmentNumber,
                    course.id,
                    name,
                    phone,
                    email,
                    city || null,
                    message || null,
                    amount,
                    razorpayOrder.id
                ]
            );


        const enrollment =
            enrollmentResult.rows[0];


        // =================================================
        // RESPONSE
        // =================================================

        res.status(201).json({

            success: true,

            message:
                "Enrollment created successfully.",

            data: {

                enrollment_id:
                    enrollment.id,

                enrollment_number:
                    enrollment.enrollment_number,

                course_id:
                    course.id,

                course_title:
                    course.title,

                amount:
                    amount,

                razorpay_order_id:
                    razorpayOrder.id,

                razorpay_key_id:
                    process.env.RAZORPAY_KEY_ID

            }

        });


    } catch (error) {

        console.error(
            "Enrollment Create Error:",
            error
        );


        res.status(500).json({

            success: false,

            message:
                "Failed to create enrollment."

        });

    }

});


// =====================================================
// VERIFY PAYMENT
// CUSTOMER
// =====================================================

router.post(
    "/verify-payment",
    async (req, res) => {

        try {

            const {
                enrollment_id,
                razorpay_order_id,
                razorpay_payment_id,
                razorpay_signature
            } = req.body;


            // =================================================
            // VALIDATION
            // =================================================

            if (
                !enrollment_id ||
                !razorpay_order_id ||
                !razorpay_payment_id ||
                !razorpay_signature
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Payment verification details are incomplete."

                });

            }


            // =================================================
            // GET ENROLLMENT
            // =================================================

            const enrollmentResult =
                await pool.query(
                    `
                    SELECT *
                    FROM enrollments
                    WHERE id = $1
                    `,
                    [enrollment_id]
                );


            if (
                enrollmentResult.rows.length === 0
            ) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Enrollment not found."

                });

            }


            const enrollment =
                enrollmentResult.rows[0];


            // =================================================
            // CHECK ORDER ID
            // =================================================

            if (
                enrollment.razorpay_order_id !==
                razorpay_order_id
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid Razorpay order."

                });

            }


            // =================================================
            // GENERATE SIGNATURE
            // =================================================

            const generatedSignature =
                crypto
                    .createHmac(
                        "sha256",
                        process.env.RAZORPAY_KEY_SECRET
                    )
                    .update(
                        `${razorpay_order_id}|${razorpay_payment_id}`
                    )
                    .digest("hex");


            // =================================================
            // VERIFY SIGNATURE
            // =================================================

            if (
                generatedSignature !==
                razorpay_signature
            ) {

                await pool.query(
                    `
                    UPDATE enrollments

                    SET
                        payment_status = 'failed',
                        status = 'payment_failed',
                        updated_at = CURRENT_TIMESTAMP

                    WHERE id = $1
                    `,
                    [enrollment_id]
                );


                return res.status(400).json({

                    success: false,

                    message:
                        "Payment verification failed."

                });

            }


            // =================================================
            // PAYMENT SUCCESS
            // =================================================

            const updatedResult =
                await pool.query(
                    `
                    UPDATE enrollments

                    SET
                        payment_status = 'paid',
                        status = 'confirmed',
                        razorpay_payment_id = $1,
                        razorpay_signature = $2,
                        updated_at = CURRENT_TIMESTAMP

                    WHERE id = $3

                    RETURNING *
                    `,
                    [
                        razorpay_payment_id,
                        razorpay_signature,
                        enrollment_id
                    ]
                );


            const updatedEnrollment =
                updatedResult.rows[0];


            // =================================================
            // SUCCESS RESPONSE
            // =================================================

            res.json({

                success: true,

                message:
                    "Payment verified successfully.",

                data: {

                    enrollment_id:
                        updatedEnrollment.id,

                    enrollment_number:
                        updatedEnrollment.enrollment_number,

                    payment_status:
                        updatedEnrollment.payment_status,

                    status:
                        updatedEnrollment.status

                }

            });


        } catch (error) {

            console.error(
                "Payment Verification Error:",
                error
            );


            res.status(500).json({

                success: false,

                message:
                    "Payment verification failed."

            });

        }

    }
);


// =====================================================
// ADMIN - GET ALL ENROLLMENTS
// =====================================================

router.get(
    "/admin/all",
    authenticateAdmin,
    getAllEnrollments
);


// =====================================================
// ADMIN - UPDATE ENROLLMENT STATUS
// =====================================================

router.patch(
    "/admin/:id/status",
    authenticateAdmin,
    updateEnrollmentStatus
);


// =====================================================
// ADMIN - DELETE ENROLLMENT
// =====================================================

router.delete(
    "/admin/:id",
    authenticateAdmin,
    deleteEnrollment
);


// =====================================================
// EXPORT ROUTER
// =====================================================

module.exports = router;