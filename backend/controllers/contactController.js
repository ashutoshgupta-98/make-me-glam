// ==========================================
// MAKE ME GLAM - CONTACT CONTROLLER
// ==========================================

const pool = require("../config/database");


// ==========================================
// CREATE CONTACT / ENQUIRY
// ==========================================

const createContact = async (req, res) => {

    try {

        const {
            name,
            phone,
            email,
            subject,
            message
        } = req.body;


        // ==========================================
        // VALIDATION
        // ==========================================

        if (!name || !phone || !subject || !message) {

            return res.status(400).json({
                success: false,
                message: "Name, phone, subject and message are required."
            });

        }


        // ==========================================
        // INSERT INTO DATABASE
        // ==========================================

        const query = `
            INSERT INTO contacts
            (
                name,
                phone,
                email,
                subject,
                message
            )
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `;


        const values = [
            name.trim(),
            phone.trim(),
            email ? email.trim() : null,
            subject.trim(),
            message.trim()
        ];


        const result = await pool.query(
            query,
            values
        );


        // ==========================================
        // SUCCESS RESPONSE
        // ==========================================

        res.status(201).json({

            success: true,

            message:
                "Your enquiry has been submitted successfully.",

            data: result.rows[0]

        });


    } catch (error) {

        console.error(
            "Create Contact Error:",
            error
        );


        res.status(500).json({

            success: false,

            message:
                "Unable to submit your enquiry.",

            error:
                error.message

        });

    }

};



// ==========================================
// GET ALL CONTACT MESSAGES - ADMIN
// ==========================================

const getAllContacts = async (req, res) => {

    try {

        const result = await pool.query(`
            SELECT
                id,
                name,
                email,
                phone,
                subject,
                message,
                status,
                created_at
            FROM contacts
            ORDER BY created_at DESC
        `);


        res.status(200).json({

            success: true,

            count: result.rows.length,

            data: result.rows

        });


    } catch (error) {

        console.error(
            "Get Contacts Error:",
            error
        );


        res.status(500).json({

            success: false,

            message:
                "Unable to load contact messages."

        });

    }

};


// ==========================================
// UPDATE CONTACT STATUS - ADMIN
// ==========================================

const updateContactStatus = async (req, res) => {

    try {

        const { id } = req.params;

        const { status } = req.body;


        const allowedStatuses = [
            "unread",
            "read"
        ];


        if (!allowedStatuses.includes(status)) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid contact status."

            });

        }


        const result = await pool.query(
            `
            UPDATE contacts

            SET status = $1

            WHERE id = $2

            RETURNING
                id,
                name,
                email,
                phone,
                subject,
                message,
                status,
                created_at
            `,
            [status, id]
        );


        if (result.rows.length === 0) {

            return res.status(404).json({

                success: false,

                message:
                    "Contact message not found."

            });

        }


        res.status(200).json({

            success: true,

            message:
                "Contact status updated successfully.",

            data:
                result.rows[0]

        });


    } catch (error) {

        console.error(
            "Update Contact Status Error:",
            error
        );


        res.status(500).json({

            success: false,

            message:
                "Unable to update contact status."

        });

    }

};


// ==========================================
// DELETE CONTACT - ADMIN
// ==========================================

const deleteContact = async (req, res) => {

    try {

        const { id } = req.params;


        const result = await pool.query(
            `
            DELETE FROM contacts

            WHERE id = $1

            RETURNING id
            `,
            [id]
        );


        if (result.rows.length === 0) {

            return res.status(404).json({

                success: false,

                message:
                    "Contact message not found."

            });

        }


        res.status(200).json({

            success: true,

            message:
                "Contact message deleted successfully."

        });


    } catch (error) {

        console.error(
            "Delete Contact Error:",
            error
        );


        res.status(500).json({

            success: false,

            message:
                "Unable to delete contact message."

        });

    }

};



// ==========================================
// EXPORT
// ==========================================

module.exports = {
    createContact,
    getAllContacts, 
    updateContactStatus, 
    deleteContact
};