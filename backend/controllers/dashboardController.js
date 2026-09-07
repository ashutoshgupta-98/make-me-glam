const pool = require("../config/database");


// =====================================================
// ADMIN DASHBOARD
// =====================================================

const getDashboardStats = async (req, res) => {

    try {

        // =================================================
        // TOTAL BOOKINGS
        // =================================================

        const bookingsResult = await pool.query(`
            SELECT COUNT(*) AS total
            FROM bookings
        `);


        // =================================================
        // TOTAL COURSES
        // =================================================

        const coursesResult = await pool.query(`
            SELECT COUNT(*) AS total
            FROM courses
        `);


        // =================================================
        // TOTAL SERVICES
        // =================================================

        const servicesResult = await pool.query(`
            SELECT COUNT(*) AS total
            FROM services
        `);


        // =================================================
        // TOTAL ENROLLMENTS
        // =================================================

        const enrollmentsResult = await pool.query(`
            SELECT COUNT(*) AS total
            FROM enrollments
        `);


        // =================================================
        // RECENT BOOKINGS
        // =================================================

        const recentBookingsResult = await pool.query(`
            SELECT
                id,
                booking_number,
                customer_name,
                booking_date,
                booking_time,
                status
            FROM bookings
            ORDER BY created_at DESC
            LIMIT 5
        `);


        // =================================================
        // RESPONSE
        // =================================================

        res.json({

            success: true,

            data: {

                stats: {

                    totalBookings:
                        Number(
                            bookingsResult.rows[0].total
                        ),

                    totalCourses:
                        Number(
                            coursesResult.rows[0].total
                        ),

                    totalServices:
                        Number(
                            servicesResult.rows[0].total
                        ),

                    totalEnrollments:
                        Number(
                            enrollmentsResult.rows[0].total
                        )

                },

                recentBookings:
                    recentBookingsResult.rows

            }

        });


    } catch (error) {

        console.error(
            "Dashboard error:",
            error
        );


        res.status(500).json({

            success: false,

            message:
                "Unable to load dashboard data.",

            error:
                error.message

        });

    }

};


module.exports = {

    getDashboardStats

};