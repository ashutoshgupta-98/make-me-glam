const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const pool = require("../config/database");


// =====================================================
// ADMIN LOGIN
// =====================================================

const adminLogin = async (req, res) => {

    try {

        const {
            email,
            password
        } = req.body;


        // ================================================
        // VALIDATION
        // ================================================

        if (!email || !password) {

            return res.status(400).json({

                success: false,

                message: "Email and password are required."

            });

        }


        // ================================================
        // FIND ADMIN
        // ================================================

        const result = await pool.query(
            `
            SELECT
                id,
                name,
                email,
                password,
                role,
                is_active
            FROM admins
            WHERE email = $1
            LIMIT 1
            `,
            [
                email.toLowerCase().trim()
            ]
        );


        // ================================================
        // ADMIN NOT FOUND
        // ================================================

        if (result.rows.length === 0) {

            return res.status(401).json({

                success: false,

                message: "Invalid email or password."

            });

        }


        const admin =
            result.rows[0];


        // ================================================
        // CHECK ACTIVE STATUS
        // ================================================

        if (!admin.is_active) {

            return res.status(403).json({

                success: false,

                message: "Your admin account is inactive."

            });

        }


        // ================================================
        // CHECK PASSWORD
        // ================================================

        const passwordMatch =
            await bcrypt.compare(
                password,
                admin.password
            );


        if (!passwordMatch) {

            return res.status(401).json({

                success: false,

                message: "Invalid email or password."

            });

        }


        // ================================================
        // CREATE JWT TOKEN
        // ================================================

        const token =
            jwt.sign(

                {
                    id: admin.id,
                    email: admin.email,
                    role: admin.role
                },

                process.env.JWT_SECRET,

                {
                    expiresIn: "1d"
                }

            );


        // ================================================
        // SUCCESS
        // ================================================

        return res.status(200).json({

            success: true,

            message: "Admin login successful.",

            token,

            admin: {

                id: admin.id,

                name: admin.name,

                email: admin.email,

                role: admin.role

            }

        });


    } catch (error) {
    console.error("ADMIN LOGIN ERROR:", error);

    res.status(500).json({
        success: false,
        message: "Server error during admin login.",
        error: error.message
    });
}

};


// =====================================================
// EXPORT
// =====================================================

module.exports = {
    adminLogin
};