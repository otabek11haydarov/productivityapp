import pool from '../config/db.js';

const StopwatchSession = {
    create: async (userId, sessionData) => {
        const { task_id, duration } = sessionData;
        const [result] = await pool.query(
            'INSERT INTO stopwatch_sessions (user_id, task_id, duration) VALUES (?, ?, ?)',
            [userId, task_id || null, duration]
        );
        return result.insertId;
    },

    findByUser: async (userId) => {
        const [rows] = await pool.query('SELECT * FROM stopwatch_sessions WHERE user_id = ? ORDER BY created_at DESC', [userId]);
        return rows;
    }
};

export default StopwatchSession;
