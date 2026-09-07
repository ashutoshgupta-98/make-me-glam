// ==========================================
// MAKE ME GLAM - SETTINGS CONTROLLER
// ==========================================

const pool = require("../config/database");


// ==========================================
// GET ALL SETTINGS
// ==========================================

const getAllSettings = async (req, res) => {

    try {

        const result = await pool.query(`
            SELECT
                id,
                setting_key,
                setting_value,
                updated_at
            FROM settings
            ORDER BY id ASC
        `);

        res.json({

            success: true,

            count: result.rows.length,

            data: result.rows

        });

    } catch (error) {

        console.error(
            "Get Settings Error:",
            error
        );

        res.status(500).json({

            success: false,

            message: "Failed to fetch settings"

        });

    }

};


// ==========================================
// UPDATE SETTING
// ==========================================

const updateSetting = async (req, res) => {

    try {

        const { key } = req.params;

        const { setting_value } = req.body;


        // ==========================================
        // VALIDATION
        // ==========================================

        if (!key) {

            return res.status(400).json({

                success: false,

                message: "Setting key is required."

            });

        }


        if (
            setting_value === undefined ||
            setting_value === null
        ) {

            return res.status(400).json({

                success: false,

                message: "Setting value is required."

            });

        }


        // ==========================================
        // UPDATE SETTING
        // ==========================================

        const result = await pool.query(
            `
            UPDATE settings

            SET
                setting_value = $1,
                updated_at = CURRENT_TIMESTAMP

            WHERE setting_key = $2

            RETURNING
                id,
                setting_key,
                setting_value,
                updated_at
            `,
            [
                String(setting_value),
                key
            ]
        );


        // ==========================================
        // SETTING NOT FOUND
        // ==========================================

        if (result.rows.length === 0) {

            return res.status(404).json({

                success: false,

                message: "Setting not found."

            });

        }


        // ==========================================
        // SUCCESS
        // ==========================================

        res.json({

            success: true,

            message:
                "Setting updated successfully.",

            data:
                result.rows[0]

        });

    } catch (error) {

        console.error(
            "Update Setting Error:",
            error
        );

        res.status(500).json({

            success: false,

            message:
                "Failed to update setting"

        });

    }

};


// ==========================================
// EXPORT
// ==========================================

module.exports = {

    getAllSettings,
    updateSetting

};

