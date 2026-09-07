const pool = require("../config/database");


// ==========================================
// GET ALL ENROLLMENTS - ADMIN
// ==========================================

const getAllEnrollments = async (req, res) => {

    try {

        const result = await pool.query(`
            SELECT
                e.id,
                e.enrollment_number,
                e.customer_name,
                e.phone,
                e.email,
                e.city,
                e.message,
                e.amount,
                e.status,
                e.payment_status,
                e.razorpay_order_id,
                e.razorpay_payment_id,
                e.created_at,
                e.updated_at,

                c.title AS course_title,
                c.duration AS course_duration,
                c.fee AS course_fee

            FROM enrollments e

            LEFT JOIN courses c
                ON e.course_id = c.id

            ORDER BY e.created_at DESC
        `);


        res.status(200).json({

            success: true,

            count: result.rows.length,

            data: result.rows

        });


    } catch (error) {

        console.error(
            "Get Enrollments Error:",
            error
        );


        res.status(500).json({

            success: false,

            message: "Failed to fetch enrollments"

        });

    }

};


// ==========================================
// UPDATE ENROLLMENT STATUS - ADMIN
// ==========================================

const updateEnrollmentStatus = async (req, res) => {

    try {

        const { id } = req.params;

        const { status } = req.body;


        const allowedStatuses = [

            "pending",
            "confirmed",
            "cancelled",
            "completed"

        ];


        if (!allowedStatuses.includes(status)) {

            return res.status(400).json({

                success: false,

                message: "Invalid enrollment status"

            });

        }


        const result = await pool.query(

            `
            UPDATE enrollments

            SET
                status = $1,
                updated_at = NOW()

            WHERE id = $2

            RETURNING
                id,
                enrollment_number,
                customer_name,
                phone,
                email,
                city,
                amount,
                status,
                payment_status,
                created_at,
                updated_at
            `,

            [status, id]

        );


        if (result.rows.length === 0) {

            return res.status(404).json({

                success: false,

                message: "Enrollment not found"

            });

        }


        res.status(200).json({

            success: true,

            message:
                "Enrollment status updated successfully.",

            data: result.rows[0]

        });


    } catch (error) {

        console.error(

            "Update Enrollment Status Error:",

            error

        );


        res.status(500).json({

            success: false,

            message:
                "Failed to update enrollment status"

        });

    }

};


// ==========================================
// DELETE ENROLLMENT - ADMIN
// ==========================================

const deleteEnrollment = async (req, res) => {

    try {

        const { id } = req.params;


        const result = await pool.query(

            `
            DELETE FROM enrollments

            WHERE id = $1

            RETURNING id
            `,

            [id]

        );


        if (result.rows.length === 0) {

            return res.status(404).json({

                success: false,

                message: "Enrollment not found"

            });

        }


        res.status(200).json({

            success: true,

            message:
                "Enrollment deleted successfully."

        });


    } catch (error) {

        console.error(

            "Delete Enrollment Error:",

            error

        );


        res.status(500).json({

            success: false,

            message:
                "Failed to delete enrollment"

        });

    }

};


// ==========================================
// EXPORT
// ==========================================

module.exports = {

    getAllEnrollments,

    updateEnrollmentStatus,

    deleteEnrollment

};