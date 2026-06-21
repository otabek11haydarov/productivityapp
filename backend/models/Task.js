import pool from '../config/db.js';

const Task = {
    create: async (userId, taskData) => {
        const { classification_id, title, description, deadline, priority, status } = taskData;
        const [result] = await pool.query(
            'INSERT INTO tasks (user_id, classification_id, title, description, deadline, priority, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [userId, classification_id || null, title, description || '', deadline || null, priority || 'Medium', status || 'Pending']
        );
        return result.insertId;
    },

    findByUser: async (userId) => {
        const [rows] = await pool.query('SELECT * FROM tasks WHERE user_id = ? ORDER BY created_at DESC', [userId]);
        return rows;
    },

    findById: async (id) => {
        const [rows] = await pool.query('SELECT * FROM tasks WHERE id = ?', [id]);
        return rows[0];
    },

    update: async (id, taskData) => {
        const { classification_id, title, description, deadline, priority, status, locked } = taskData;
        const [result] = await pool.query(
            'UPDATE tasks SET classification_id = COALESCE(?, classification_id), title = COALESCE(?, title), description = COALESCE(?, description), deadline = COALESCE(?, deadline), priority = COALESCE(?, priority), status = COALESCE(?, status), locked = COALESCE(?, locked) WHERE id = ?',
            [classification_id, title, description, deadline, priority, status, locked, id]
        );
        return result.affectedRows;
    },

    delete: async (id) => {
        const [result] = await pool.query('DELETE FROM tasks WHERE id = ?', [id]);
        return result.affectedRows;
    }
};

export default Task;
