import pool from '../config/db.js';

const User = {
    create: async (userData) => {
        const { name, email, password_hash, avatar_url, is_verified, google_id } = userData;
        const { rows } = await pool.query(
            'INSERT INTO users (name, email, password_hash, avatar_url, is_verified, google_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
            [name, email, password_hash || null, avatar_url || null, is_verified || false, google_id || null]
        );
        return rows[0].id;
    },

    findByGoogleId: async (googleId) => {
        const { rows } = await pool.query('SELECT * FROM users WHERE google_id = $1', [googleId]);
        return rows[0];
    },

    findByEmail: async (email) => {
        const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        return rows[0];
    },

    findById: async (id) => {
        const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
        return rows[0];
    },

    findByResetToken: async (token) => {
        const { rows } = await pool.query('SELECT * FROM users WHERE reset_password_token = $1 AND reset_password_expires > NOW()', [token]);
        return rows[0];
    },

    update: async (id, userData) => {
        const { name, avatar_url, is_verified, password_hash, reset_password_token, reset_password_expires } = userData;
        
        const fields = [];
        const values = [];
        
        if (name !== undefined) { fields.push(`name = $${fields.length + 1}`); values.push(name); }
        if (avatar_url !== undefined) { fields.push(`avatar_url = $${fields.length + 1}`); values.push(avatar_url); }
        if (is_verified !== undefined) { fields.push(`is_verified = $${fields.length + 1}`); values.push(is_verified); }
        if (password_hash !== undefined) { fields.push(`password_hash = $${fields.length + 1}`); values.push(password_hash); }
        if (reset_password_token !== undefined) { fields.push(`reset_password_token = $${fields.length + 1}`); values.push(reset_password_token); }
        if (reset_password_expires !== undefined) { fields.push(`reset_password_expires = $${fields.length + 1}`); values.push(reset_password_expires); }

        if (fields.length === 0) return 0;
        
        values.push(id);
        const { rowCount } = await pool.query(`UPDATE users SET ${fields.join(', ')} WHERE id = $${values.length}`, values);
        
        return rowCount;
    }
};

export default User;
