import pool from '../config/db.js';

const PomodoroSession = {
    create: async (userId, sessionData) => {
        const { task_id, duration, completed } = sessionData;
        const [result] = await pool.query(
            'INSERT INTO pomodoro_sessions (user_id, task_id, duration, completed) VALUES (?, ?, ?, ?)',
            [userId, task_id || null, duration, completed !== undefined ? completed : true]
        );
        return result.insertId;
    },

    findByUser: async (userId) => {
        const [rows] = await pool.query('SELECT * FROM pomodoro_sessions WHERE user_id = ? ORDER BY created_at DESC', [userId]);
        return rows;
    }
};

export default PomodoroSession;
