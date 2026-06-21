import pool from '../config/db.js';

const HabitLog = {
    toggleToday: async (habitId) => {
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        
        // Check if log exists for today
        const { rows } = await pool.query(
            'SELECT * FROM habit_logs WHERE habit_id = $1 AND date = $2',
            [habitId, today]
        );

        if (rows.length > 0) {
            // Delete the log (uncheck)
            await pool.query('DELETE FROM habit_logs WHERE habit_id = $1 AND date = $2', [habitId, today]);
            return { action: 'removed', date: today };
        } else {
            // Create the log (check)
            await pool.query(
                'INSERT INTO habit_logs (habit_id, date, status) VALUES ($1, $2, $3)',
                [habitId, today, 'Completed']
            );
            return { action: 'added', date: today };
        }
    },

    getLogsByHabit: async (habitId) => {
        const { rows } = await pool.query(
            'SELECT * FROM habit_logs WHERE habit_id = $1 ORDER BY date DESC',
            [habitId]
        );
        return rows;
    },
    
    getCompletedDatesByHabit: async (habitId) => {
        const { rows } = await pool.query(
            'SELECT date FROM habit_logs WHERE habit_id = $1 AND status = \'Completed\' ORDER BY date DESC',
            [habitId]
        );
        return rows.map(r => r.date.toISOString().split('T')[0]);
    }
};

export default HabitLog;
