const express = require("express");
const router = express.Router();

const crypto = require("crypto");

const pool = require("../config/database");

const Razorpay = require("razorpay");

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

// GET PAYMENT DETAILS FOR A BOOKING
router.get("/booking/:bookingId", async (req, res) => {
    try {
        const { bookingId } = req.params;

        const result = await pool.query(
            `SELECT
                b.id AS booking_id,
                b.booking_number,
                b.customer_name,
                s.name AS service_name,
                s.price AS amount,
                b.payment_status,
                b.status AS booking_status
             FROM bookings b
             LEFT JOIN services s
                ON b.service_id = s.id
             WHERE b.id = $1`,
            [bookingId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Booking not found"
            });
        }

        res.json({
            success: true,
            data: result.rows[0]
        });

    } catch (error) {
        console.error("Payment Details Error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch payment details"
        });
    }
});


// CREATE RAZORPAY ORDER
router.post("/create-order", async (req, res) => {
    try {
        const { booking_id } = req.body;

        if (!booking_id) {
            return res.status(400).json({
                success: false,
                message: "Booking ID is required"
            });
        }

        // Get booking + service price from database
        const result = await pool.query(
            `SELECT
                b.id AS booking_id,
                b.booking_number,
                b.customer_name,
                b.payment_status,
                b.status AS booking_status,
                s.name AS service_name,
                s.price
             FROM bookings b
             INNER JOIN services s
                ON b.service_id = s.id
             WHERE b.id = $1`,
            [booking_id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Booking not found"
            });
        }

        const booking = result.rows[0];

        // Prevent payment for already paid booking
        if (booking.payment_status === "paid") {
            return res.status(400).json({
                success: false,
                message: "Payment has already been completed"
            });
        }

        // Convert ₹ amount to paise
        const amountInPaise = Math.round(
            Number(booking.price) * 100
        );

        // Create Razorpay order
        const order = await razorpay.orders.create({
            amount: amountInPaise,
            currency: "INR",
            receipt: booking.booking_number,
            notes: {
                booking_id: String(booking.booking_id),
                booking_number: booking.booking_number
            }
        });

        res.status(201).json({
            success: true,
            message: "Razorpay order created successfully",
            data: {
                booking_id: booking.booking_id,
                booking_number: booking.booking_number,
                service_name: booking.service_name,
                amount: booking.price,
                amount_in_paise: order.amount,
                currency: order.currency,
                razorpay_order_id: order.id,
                key_id: process.env.RAZORPAY_KEY_ID
            }
        });

    } catch (error) {
        console.error("Razorpay Order Error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to create Razorpay order"
        });
    }
});

// VERIFY RAZORPAY PAYMENT
router.post("/verify", async (req, res) => {
    try {
        const {
            booking_id,
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        } = req.body;

        if (
            !booking_id ||
            !razorpay_order_id ||
            !razorpay_payment_id ||
            !razorpay_signature
        ) {
            return res.status(400).json({
                success: false,
                message: "Payment verification details are required"
            });
        }

        // Get booking
        const bookingResult = await pool.query(
            `SELECT
                id,
                booking_number,
                payment_status,
                status
             FROM bookings
             WHERE id = $1`,
            [booking_id]
        );

        if (bookingResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Booking not found"
            });
        }

        const booking = bookingResult.rows[0];

        // Create signature
        const generatedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(
                razorpay_order_id + "|" + razorpay_payment_id
            )
            .digest("hex");

        // Compare signatures
        if (generatedSignature !== razorpay_signature) {
            return res.status(400).json({
                success: false,
                message: "Payment verification failed"
            });
        }

        // Payment verified successfully
        await pool.query(
            `UPDATE bookings
             SET
                payment_status = 'paid',
                status = 'confirmed'
             WHERE id = $1`,
            [booking_id]
        );

        res.json({
            success: true,
            message: "Payment verified successfully",
            data: {
                booking_id: booking.id,
                booking_number: booking.booking_number,
                payment_status: "paid",
                booking_status: "confirmed",
                razorpay_payment_id
            }
        });

    } catch (error) {
        console.error("Payment Verification Error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to verify payment"
        });
    }
});

module.exports = router;