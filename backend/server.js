import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';

dotenv.config();

// Startup Validations
if (!process.env.GOOGLE_CLIENT_ID) {
    console.error('CRITICAL ERROR: GOOGLE_CLIENT_ID is missing in the environment variables.');
    console.error('Google OAuth will not function properly without it.');
}
if (!process.env.GOOGLE_CLIENT_SECRET) {
    console.warn('WARNING: GOOGLE_CLIENT_SECRET is missing. This is required if using the Authorization Code Flow.');
}

const requiredEmailVars = ['EMAIL_HOST', 'EMAIL_PORT', 'EMAIL_USER', 'EMAIL_PASSWORD'];
for (const envVar of requiredEmailVars) {
    if (!process.env[envVar]) {
        console.error(`CRITICAL ERROR: ${envVar} is missing from .env`);
        process.exit(1);
    }
}

const app = express();

// Middleware
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173', // Vite default port
    credentials: true,
}));
app.use(express.json());
app.use(cookieParser());
app.use(morgan('dev'));

// Routes
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import classificationRoutes from './routes/classificationRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import habitRoutes from './routes/habitRoutes.js';
import pomodoroRoutes from './routes/pomodoroRoutes.js';
import stopwatchRoutes from './routes/stopwatchRoutes.js';
import statisticsRoutes from './routes/statisticsRoutes.js';
import emailRoutes from './routes/emailRoutes.js';

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/classifications', classificationRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/habits', habitRoutes);
app.use('/api/pomodoro', pomodoroRoutes);
app.use('/api/stopwatch', stopwatchRoutes);
app.use('/api/statistics', statisticsRoutes);
app.use('/api/email', emailRoutes);

app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'success', message: 'API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    // If statusCode is still 200 (default), but an error was thrown, set to 500. 
    // Otherwise, keep the explicitly set error status code (e.g. 401, 404).
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    
    // Only log 500 errors to avoid spamming the console with expected 401s
    if (statusCode === 500) {
        console.error(err.stack);
    }
    
    res.status(statusCode).json({
        status: 'error',
        message: err.message || 'Internal Server Error'
    });
});

import { testEmailConnection } from './services/emailService.js';

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
    console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV} mode.`);
    await testEmailConnection();
});
 
