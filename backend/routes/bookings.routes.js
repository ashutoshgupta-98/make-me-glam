const express = require("express");
const router = express.Router();

const pool = require("../config/database");

const authenticateAdmin =
    require("../middleware/authMiddleware");


// CREATE BOOKING
router.post("/", async (req, res) => {
    try {
        const {
            customer_name,
            customer_phone,
            customer_email,
            service_id,
            staff_id,
            booking_date,
            booking_time,
            notes
        } = req.body;

        // Basic validation
        if (
            !customer_name ||
            !customer_phone ||
            !service_id ||
            !staff_id ||
            !booking_date ||
            !booking_time
        ) {
            return res.status(400).json({
                success: false,
                message: "Please fill all required fields"
            });
        }

        // Check service exists and is active
        const serviceResult = await pool.query(
            `SELECT id FROM services
             WHERE id = $1 AND status = TRUE`,
            [service_id]
        );

        if (serviceResult.rows.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Selected service is not available"
            });
        }

        // Check staff exists and is active
        const staffResult = await pool.query(
            `SELECT id FROM staff
             WHERE id = $1 AND status = TRUE`,
            [staff_id]
        );

        if (staffResult.rows.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Selected staff member is not available"
            });
        }

        // Check whether the selected slot is already booked
        const existingBooking = await pool.query(
            `SELECT id
             FROM bookings
             WHERE staff_id = $1
             AND booking_date = $2
             AND booking_time = $3
             AND status IN ('pending', 'confirmed')`,
            [staff_id, booking_date, booking_time]
        );

        if (existingBooking.rows.length > 0) {
            return res.status(409).json({
                success: false,
                message: "This time slot is already booked"
            });
        }

        // Generate booking number
        const bookingNumber = "MMG-" + Date.now();

        // Create booking
        const result = await pool.query(
            `INSERT INTO bookings (
                booking_number,
                customer_name,
                customer_phone,
                customer_email,
                service_id,
                staff_id,
                booking_date,
                booking_time,
                status,
                payment_status,
                notes
            )
            VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8,
                'pending',
                'pending',
                $9
            )
            RETURNING
                id,
                booking_number,
                customer_name,
                customer_phone,
                customer_email,
                service_id,
                staff_id,
                booking_date::text AS booking_date,
                booking_time::text AS booking_time,
                status,
                payment_status,
                notes,
                created_at`,
            [
                bookingNumber,
                customer_name,
                customer_phone,
                customer_email || null,
                service_id,
                staff_id,
                booking_date,
                booking_time,
                notes || null
            ]
        );

        res.status(201).json({
            success: true,
            message: "Booking created successfully",
            data: result.rows[0]
        });

    } catch (error) {
        console.error("Booking API Error:", error);

        // PostgreSQL duplicate booking protection
        if (error.code === "23505") {
            return res.status(409).json({
                success: false,
                message: "This time slot is already booked"
            });
        }

        res.status(500).json({
            success: false,
            message: "Failed to create booking"
        });
    }
});

// GET ALL BOOKINGS
// router.get("/", async (req, res) => {
router.get("/", authenticateAdmin, async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                b.id,
                b.booking_number,
                b.customer_name,
                b.customer_phone,
                b.customer_email,
                s.name AS service_name,
                st.name AS staff_name,
                b.booking_date::text AS booking_date,
                b.booking_time::text AS booking_time,
                b.status,
                b.payment_status,
                b.notes,
                b.created_at
            FROM bookings b
            LEFT JOIN services s
                ON b.service_id = s.id
            LEFT JOIN staff st
                ON b.staff_id = st.id
            ORDER BY b.booking_date DESC, b.booking_time DESC
        `);

        res.json({
            success: true,
            count: result.rows.length,
            data: result.rows
        });

    } catch (error) {
        console.error("Get Bookings API Error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch bookings"
        });
    }
});

// UPDATE BOOKING STATUS
// router.patch("/:id/status", async (req, res) => {
router.patch("/:id/status", authenticateAdmin, async (req, res) => {    
    try {
        const { id } = req.params;
        const { status } = req.body;

        // Allowed statuses
        const allowedStatuses = [
            "pending",
            "confirmed",
            "cancelled",
            "completed"
        ];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid booking status"
            });
        }

        const result = await pool.query(
            `UPDATE bookings
             SET status = $1
             WHERE id = $2
             RETURNING
                id,
                booking_number,
                customer_name,
                booking_date::text AS booking_date,
                booking_time::text AS booking_time,
                status,
                payment_status`,
            [status, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Booking not found"
            });
        }

        res.json({
            success: true,
            message: "Booking status updated successfully",
            data: result.rows[0]
        });

    } catch (error) {
        console.error("Update Booking Status Error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to update booking status"
        });
    }
});

module.exports = router;