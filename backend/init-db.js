import pkg from 'pg';
const { Client } = pkg;
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function initDB() {
    const defaultClient = new Client({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: 'postgres' // Connect to default db first
    });

    try {
        await defaultClient.connect();
        
        // Check if database exists
        const res = await defaultClient.query(`SELECT 1 FROM pg_database WHERE datname = 'bajaraman'`);
        if (res.rowCount === 0) {
            console.log('Creating database bajaraman...');
            await defaultClient.query('CREATE DATABASE bajaraman');
        } else {
            console.log('Database bajaraman already exists.');
        }
    } catch (err) {
        console.error('Error creating database:', err);
    } finally {
        await defaultClient.end();
    }

    // Now connect to the new database and run schema
    const bajaramanClient = new Client({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: 'bajaraman'
    });

    try {
        await bajaramanClient.connect();
        const schemaPath = path.join(__dirname, 'schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');
        
        console.log('Running schema.sql...');
        await bajaramanClient.query(schema);
        console.log('Schema executed successfully! Database is ready.');
    } catch (err) {
        console.error('Error running schema:', err);
    } finally {
        await bajaramanClient.end();
        process.exit();
    }
}

initDB();
