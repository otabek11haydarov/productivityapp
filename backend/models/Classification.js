import pool from '../config/db.js';

const Classification = {
    create: async (userId, name, color) => {
        const [result] = await pool.query(
            'INSERT INTO classifications (user_id, name, color) VALUES (?, ?, ?)',
            [userId, name, color || '#00FF88']
        );
        return result.insertId;
    },

    findByUser: async (userId) => {
        const [rows] = await pool.query('SELECT * FROM classifications WHERE user_id = ?', [userId]);
        return rows;
    },

    findById: async (id) => {
        const [rows] = await pool.query('SELECT * FROM classifications WHERE id = ?', [id]);
        return rows[0];
    },

    update: async (id, name, color) => {
        const [result] = await pool.query(
            'UPDATE classifications SET name = COALESCE(?, name), color = COALESCE(?, color) WHERE id = ?',
            [name, color, id]
        );
        return result.affectedRows;
    },

    delete: async (id) => {
        const [result] = await pool.query('DELETE FROM classifications WHERE id = ?', [id]);
        return result.affectedRows;
    }
};

export default Classification;
