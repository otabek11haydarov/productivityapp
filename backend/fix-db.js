import pool from './config/db.js';

async function migrate() {
    try {
        console.log('Fixing deadline column in tasks table...');
        await pool.query('ALTER TABLE tasks MODIFY deadline DATETIME NULL');
        console.log('Successfully fixed deadline column!');
    } catch (err) {
        console.error('Error fixing column:', err);
    } finally {
        process.exit();
    }
}

migrate();
