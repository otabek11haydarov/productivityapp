import pool from '../config/db.js';

const StopwatchSession = {
    create: async (userId, data) => {
        const { task_id, duration } = data;
        const { rows } = await pool.query(
            'INSERT INTO stopwatch_sessions (user_id, task_id, duration) VALUES ($1, $2, $3) RETURNING id',
            [userId, task_id || null, duration]
        );
        return rows[0].id;
    },

    findByUser: async (userId) => {
        const { rows } = await pool.query('SELECT * FROM stopwatch_sessions WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
        return rows;
    }
};

export default StopwatchSession;
