import pool from '../config/db.js';

const User = {
    create: async (userData) => {
        const { name, email, password_hash, avatar_url, is_verified } = userData;
        const [result] = await pool.query(
            'INSERT INTO users (name, email, password_hash, avatar_url, is_verified) VALUES (?, ?, ?, ?, ?)',
            [name, email, password_hash, avatar_url || null, is_verified || false]
        );
        return result.insertId;
    },

    findByEmail: async (email) => {
        const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        return rows[0];
    },

    findById: async (id) => {
        const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
        return rows[0];
    },

    update: async (id, userData) => {
        const { name, avatar_url, is_verified, password_hash } = userData;
        const [result] = await pool.query(
            'UPDATE users SET name = COALESCE(?, name), avatar_url = COALESCE(?, avatar_url), is_verified = COALESCE(?, is_verified), password_hash = COALESCE(?, password_hash) WHERE id = ?',
            [name, avatar_url, is_verified, password_hash, id]
        );
        return result.affectedRows;
    }
};

export default User;
