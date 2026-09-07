// ==========================================
// MAKE ME GLAM - CUSTOMER CONTROLLER
// ==========================================

const pool = require("../config/database");


// ==========================================
// GET ALL CUSTOMERS
// ==========================================

const getAllCustomers = async (req, res) => {

    try {

        const result = await pool.query(`
            SELECT
                customer_phone,
                MAX(customer_name) AS customer_name,
                MAX(customer_email) AS customer_email,
                COUNT(*) AS total_bookings,
                MAX(created_at) AS last_booking
            FROM bookings
            WHERE customer_phone IS NOT NULL
            GROUP BY customer_phone
            ORDER BY last_booking DESC
        `);


        res.status(200).json({

            success: true,

            count: result.rows.length,

            data: result.rows

        });


    } catch (error) {

        console.error(
            "Customer loading error:",
            error
        );


        res.status(500).json({

            success: false,

            message: "Unable to load customers"

        });

    }

};


// ==========================================
// EXPORT
// ==========================================

module.exports = {

    getAllCustomers

};