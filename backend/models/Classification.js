import pool from '../config/db.js';

const Classification = {
    create: async (userId, data) => {
        const { name, color } = data;
        const { rows } = await pool.query(
            'INSERT INTO classifications (user_id, name, color) VALUES ($1, $2, $3) RETURNING id',
            [userId, name, color || '#00FF88']
        );
        return rows[0].id;
    },

    findByUser: async (userId) => {
        const { rows } = await pool.query('SELECT * FROM classifications WHERE user_id = $1', [userId]);
        return rows;
    },

    findById: async (id) => {
        const { rows } = await pool.query('SELECT * FROM classifications WHERE id = $1', [id]);
        return rows[0];
    },

    update: async (id, data) => {
        const { name, color } = data;
        const fields = [];
        const values = [];

        if (name !== undefined) { fields.push(`name = $${fields.length + 1}`); values.push(name); }
        if (color !== undefined) { fields.push(`color = $${fields.length + 1}`); values.push(color); }

        if (fields.length === 0) return 0;

        values.push(id);
        const { rowCount } = await pool.query(`UPDATE classifications SET ${fields.join(', ')} WHERE id = $${values.length}`, values);

        return rowCount;
    },

    delete: async (id) => {
        const { rowCount } = await pool.query('DELETE FROM classifications WHERE id = $1', [id]);
        return rowCount;
    }
};

export default Classification;
