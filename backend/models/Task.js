import pool from '../config/db.js';

const Task = {
    create: async (userId, taskData) => {
        const { classification_id, title, description, deadline, priority, status } = taskData;
        const { rows } = await pool.query(
            'INSERT INTO tasks (user_id, classification_id, title, description, deadline, priority, status) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
            [userId, classification_id || null, title, description || '', deadline || null, priority || 'Medium', status || 'Pending']
        );
        return rows[0].id;
    },

    findByUser: async (userId) => {
        const { rows } = await pool.query('SELECT * FROM tasks WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
        return rows;
    },

    findById: async (id) => {
        const { rows } = await pool.query('SELECT * FROM tasks WHERE id = $1', [id]);
        return rows[0];
    },

    update: async (id, taskData) => {
        const { classification_id, title, description, deadline, priority, status, locked } = taskData;
        
        const fields = [];
        const values = [];
        
        if (classification_id !== undefined) { fields.push(`classification_id = $${fields.length + 1}`); values.push(classification_id); }
        if (title !== undefined) { fields.push(`title = $${fields.length + 1}`); values.push(title); }
        if (description !== undefined) { fields.push(`description = $${fields.length + 1}`); values.push(description); }
        if (deadline !== undefined) { fields.push(`deadline = $${fields.length + 1}`); values.push(deadline); }
        if (priority !== undefined) { fields.push(`priority = $${fields.length + 1}`); values.push(priority); }
        if (status !== undefined) { fields.push(`status = $${fields.length + 1}`); values.push(status); }
        if (locked !== undefined) { fields.push(`locked = $${fields.length + 1}`); values.push(locked); }

        if (fields.length === 0) return 0;
        
        values.push(id);
        const { rowCount } = await pool.query(`UPDATE tasks SET ${fields.join(', ')} WHERE id = $${values.length}`, values);
        
        return rowCount;
    },

    delete: async (id) => {
        const { rowCount } = await pool.query('DELETE FROM tasks WHERE id = $1', [id]);
        return rowCount;
    }
};

export default Task;
