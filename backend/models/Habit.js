import pool from '../config/db.js';

const Habit = {
    create: async (userId, habitData) => {
        const { classification_id, title, frequency } = habitData;
        const { rows } = await pool.query(
            'INSERT INTO habits (user_id, classification_id, title, frequency) VALUES ($1, $2, $3, $4) RETURNING id',
            [userId, classification_id || null, title, frequency]
        );
        return rows[0].id;
    },

    findByUser: async (userId) => {
        const today = new Date().toISOString().split('T')[0];
        const { rows } = await pool.query(`
            SELECT h.*, 
                   (SELECT COUNT(*) > 0 FROM habit_logs hl WHERE hl.habit_id = h.id AND hl.date = $2) as is_completed_today
            FROM habits h 
            WHERE h.user_id = $1 
            ORDER BY h.created_at DESC
        `, [userId, today]);
        return rows;
    },

    findById: async (id) => {
        const { rows } = await pool.query('SELECT * FROM habits WHERE id = $1', [id]);
        return rows[0];
    },

    update: async (id, habitData) => {
        const { title, frequency, current_streak, max_streak } = habitData;
        
        const fields = [];
        const values = [];
        
        if (title !== undefined) { fields.push(`title = $${fields.length + 1}`); values.push(title); }
        if (frequency !== undefined) { fields.push(`frequency = $${fields.length + 1}`); values.push(frequency); }
        if (current_streak !== undefined) { fields.push(`current_streak = $${fields.length + 1}`); values.push(current_streak); }
        if (max_streak !== undefined) { fields.push(`max_streak = $${fields.length + 1}`); values.push(max_streak); }

        if (fields.length === 0) return 0;
        
        values.push(id);
        const { rowCount } = await pool.query(`UPDATE habits SET ${fields.join(', ')} WHERE id = $${values.length}`, values);
        
        return rowCount;
    },

    delete: async (id) => {
        const { rowCount } = await pool.query('DELETE FROM habits WHERE id = $1', [id]);
        return rowCount;
    },

    recalculateStreaks: async (habitId) => {
        const { rows: logs } = await pool.query(
            'SELECT date FROM habit_logs WHERE habit_id = $1 AND status = \'Completed\' ORDER BY date DESC',
            [habitId]
        );

        if (logs.length === 0) {
            await pool.query('UPDATE habits SET current_streak = 0 WHERE id = $1', [habitId]);
            return 0;
        }

        const dates = logs.map(l => l.date.toISOString().split('T')[0]);
        let currentStreak = 0;
        let tempDate = new Date(); // Today
        
        // Normalize today to YYYY-MM-DD string
        const todayStr = tempDate.toISOString().split('T')[0];
        tempDate.setDate(tempDate.getDate() - 1);
        const yesterdayStr = tempDate.toISOString().split('T')[0];

        // If neither today nor yesterday are logged, streak is broken.
        if (!dates.includes(todayStr) && !dates.includes(yesterdayStr)) {
            await pool.query('UPDATE habits SET current_streak = 0 WHERE id = $1', [habitId]);
            return 0;
        }

        // Count streak backwards
        let checkDate = new Date();
        // If today is not logged but yesterday is, we start checking from yesterday
        if (!dates.includes(todayStr)) {
            checkDate.setDate(checkDate.getDate() - 1);
        }

        while (true) {
            const checkStr = checkDate.toISOString().split('T')[0];
            if (dates.includes(checkStr)) {
                currentStreak++;
                checkDate.setDate(checkDate.getDate() - 1);
            } else {
                break;
            }
        }

        // Update current_streak and max_streak
        await pool.query(`
            UPDATE habits 
            SET current_streak = $1,
                max_streak = GREATEST(max_streak, $1)
            WHERE id = $2
        `, [currentStreak, habitId]);

        return currentStreak;
    }
};

export default Habit;
