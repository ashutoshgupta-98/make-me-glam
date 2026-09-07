const jwt = require("jsonwebtoken");


// =====================================================
// AUTH MIDDLEWARE
// =====================================================

const authenticateAdmin = (
    req,
    res,
    next
) => {

    try {

        const authHeader =
            req.headers.authorization;


        // ================================================
        // CHECK TOKEN
        // ================================================

        if (
            !authHeader ||
            !authHeader.startsWith("Bearer ")
        ) {

            return res.status(401).json({

                success: false,

                message: "Authentication required."

            });

        }


        const token =
            authHeader.split(" ")[1];


        // ================================================
        // VERIFY TOKEN
        // ================================================

        const decoded =
            jwt.verify(
                token,
                process.env.JWT_SECRET
            );


        // ================================================
        // SAVE ADMIN DATA
        // ================================================

        req.admin = decoded;


        next();


    } catch (error) {

        console.error(
            "Authentication error:",
            error
        );


        return res.status(401).json({

            success: false,

            message: "Invalid or expired token."

        });

    }

};


module.exports = authenticateAdmin;