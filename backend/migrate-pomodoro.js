import pkg from 'pg';
const { Client } = pkg;
import dotenv from 'dotenv';

dotenv.config();

async function migrateDB() {
    const client = new Client({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    try {
        await client.connect();
        
        console.log('Altering pomodoro_sessions table...');
        await client.query('ALTER TABLE pomodoro_sessions ADD COLUMN IF NOT EXISTS start_time TIMESTAMP');
        await client.query('ALTER TABLE pomodoro_sessions ADD COLUMN IF NOT EXISTS end_time TIMESTAMP');
        await client.query('ALTER TABLE pomodoro_sessions ADD COLUMN IF NOT EXISTS interrupted BOOLEAN DEFAULT FALSE');
        await client.query('ALTER TABLE pomodoro_sessions ADD COLUMN IF NOT EXISTS mode VARCHAR(50)');
        
        console.log('Migration successful!');
    } catch (err) {
        console.error('Error altering table:', err);
    } finally {
        await client.end();
        process.exit();
    }
}

migrateDB();
