import pool from '../config/db.js';

const PomodoroSession = {
    create: async (userId, data) => {
        const { task_id, duration, completed, start_time, end_time, interrupted, mode } = data;
        const { rows } = await pool.query(
            'INSERT INTO pomodoro_sessions (user_id, task_id, duration, completed, start_time, end_time, interrupted, mode) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id',
            [
                userId, 
                task_id || null, 
                duration, 
                completed !== undefined ? completed : true,
                start_time || null,
                end_time || null,
                interrupted !== undefined ? interrupted : false,
                mode || 'focus'
            ]
        );
        return rows[0].id;
    },

    findByUser: async (userId) => {
        const { rows } = await pool.query('SELECT * FROM pomodoro_sessions WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
        return rows;
    }
};

export default PomodoroSession;
