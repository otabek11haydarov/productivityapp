import pool from './config/db.js';

async function testDB() {
    try {
        const { rows } = await pool.query('SELECT * FROM users LIMIT 1');
        console.log('SUCCESS:', rows);
    } catch (err) {
        console.error('ERROR:', err.message);
    } finally {
        process.exit(0);
    }
}

testDB();
