import pool from '../config/db.js';

const Habit = {
    create: async (userId, habitData) => {
        const { classification_id, title, frequency } = habitData;
        const [result] = await pool.query(
            'INSERT INTO habits (user_id, classification_id, title, frequency) VALUES (?, ?, ?, ?)',
            [userId, classification_id || null, title, frequency || 'Daily']
        );
        return result.insertId;
    },

    findByUser: async (userId) => {
        const [rows] = await pool.query('SELECT * FROM habits WHERE user_id = ? ORDER BY created_at DESC', [userId]);
        return rows;
    },

    findById: async (id) => {
        const [rows] = await pool.query('SELECT * FROM habits WHERE id = ?', [id]);
        return rows[0];
    },

    update: async (id, habitData) => {
        const { classification_id, title, frequency, current_streak, max_streak } = habitData;
        const [result] = await pool.query(
            'UPDATE habits SET classification_id = COALESCE(?, classification_id), title = COALESCE(?, title), frequency = COALESCE(?, frequency), current_streak = COALESCE(?, current_streak), max_streak = COALESCE(?, max_streak) WHERE id = ?',
            [classification_id, title, frequency, current_streak, max_streak, id]
        );
        return result.affectedRows;
    },

    delete: async (id) => {
        const [result] = await pool.query('DELETE FROM habits WHERE id = ?', [id]);
        return result.affectedRows;
    }
};

export default Habit;
