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
        
        console.log('Altering users table...');
        await client.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id VARCHAR(255) UNIQUE');
        await client.query('ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL');
        
        console.log('Migration successful!');
    } catch (err) {
        console.error('Error altering table:', err);
    } finally {
        await client.end();
        process.exit();
    }
}

migrateDB();
