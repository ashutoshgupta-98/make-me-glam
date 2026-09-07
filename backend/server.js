const express = require("express");
const cors = require("cors");
const path = require("path");

require("dotenv").config();



const pool = require("./config/database");

const servicesRoutes = require("./routes/services.routes");
const coursesRoutes = require("./routes/courses.routes");
const staffRoutes = require("./routes/staff.routes");
const bookingsRoutes = require("./routes/bookings.routes");
const paymentsRoutes = require("./routes/payments.routes");
const galleryRoutes = require("./routes/galleryRoutes");
const contactRoutes = require("./routes/contactRoutes");
const enrollmentRoutes = require("./routes/enrollmentRoutes");

// Admin AuthRoutes //
const authRoutes = require("./routes/authRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const customerRoutes = require("./routes/customer.routes");
const settingsRoutes = require("./routes/settingsRoutes");

const app = express();

app.use(cors());
app.use(express.json());

// ==========================================
// FRONTEND
// ==========================================

app.use(
    "/frontend",
    express.static(
        path.join(__dirname, "frontend")
    )
);

app.use("/api/services", servicesRoutes);
app.use("/api/courses", coursesRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/bookings", bookingsRoutes);
app.use("/api/payments", paymentsRoutes);
app.use("/api/gallery", galleryRoutes);
app.use("/api/contacts", contactRoutes);
app.use("/api/enrollments", enrollmentRoutes);

// admin auth Routes //
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/admin/settings", settingsRoutes);

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Make Me Glam API is running"
    });
});

app.get("/api/test-db", async (req, res) => {
    try {
        const result = await pool.query("SELECT NOW()");

        res.json({
            success: true,
            message: "Database connected successfully",
            time: result.rows[0].now
        });
    } catch (error) {
        console.error("Database Error:", error);

        res.status(500).json({
            success: false,
            message: "Database connection failed",
            error: error.message
        });
    }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Make Me Glam server running on http://localhost:${PORT}`);
});

console.log("DB USER:", process.env.DB_USER);
console.log("DB NAME:", process.env.DB_NAME);
console.log("PASSWORD EXISTS:", !!process.env.DB_PASSWORD);



