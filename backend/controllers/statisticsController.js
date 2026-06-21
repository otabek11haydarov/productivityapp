import asyncHandler from '../utils/asyncHandler.js';
import pool from '../config/db.js';

// @desc    Get dashboard statistics
// @route   GET /api/statistics
// @access  Private
export const getDashboardStats = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    // 1. Fetch Tasks
    const { rows: tasks } = await pool.query('SELECT * FROM tasks WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'Completed').length;
    const taskCompletionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
    const recentTasks = tasks.slice(0, 10);

    // 2. Fetch Habits
    const { rows: habits } = await pool.query('SELECT * FROM habits WHERE user_id = $1', [userId]);
    const totalHabits = habits.length;
    const currentBestStreak = habits.reduce((max, h) => Math.max(max, h.current_streak || 0), 0);
    const longestStreak = habits.reduce((max, h) => Math.max(max, h.max_streak || 0), 0);

    // 3. Fetch Habit Logs (for heatmap and charts)
    const { rows: habitLogs } = await pool.query(`
        SELECT hl.* FROM habit_logs hl 
        JOIN habits h ON hl.habit_id = h.id 
        WHERE h.user_id = $1 AND hl.status = 'Completed'
    `, [userId]);
    
    const todayStr = new Date().toISOString().split('T')[0];
    const habitsCompletedToday = habitLogs.filter(l => l.date.toISOString().split('T')[0] === todayStr).length;
    
    const habitSuccessRate = totalHabits > 0 ? Math.min(100, (habitsCompletedToday / totalHabits) * 100) : 0;

    // 4. Fetch Pomodoros & Stopwatch
    const { rows: pomodoros } = await pool.query('SELECT * FROM pomodoro_sessions WHERE user_id = $1 AND completed = true', [userId]);
    const { rows: stopwatches } = await pool.query('SELECT * FROM stopwatch_sessions WHERE user_id = $1', [userId]);

    const allFocusSessions = [
        ...pomodoros.map(p => ({ date: p.end_time, duration: p.duration })),
        ...stopwatches.map(s => ({ date: s.end_time, duration: Math.floor(s.duration / 60) }))
    ].filter(s => s.date); // Filter out any null end_times

    const totalFocusTime = allFocusSessions.reduce((acc, curr) => acc + curr.duration, 0);

    // Compute Today and This Week focus time
    const today = new Date();
    today.setHours(0,0,0,0);
    const oneWeekAgo = new Date(today);
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    let todayFocusTime = 0;
    let thisWeekFocusTime = 0;
    let todayPomodoros = 0;
    let thisWeekPomodoros = 0;

    pomodoros.forEach(p => {
        if (!p.end_time) return;
        const d = new Date(p.end_time);
        if (d >= today) {
            todayFocusTime += p.duration;
            todayPomodoros++;
        }
        if (d >= oneWeekAgo) {
            thisWeekFocusTime += p.duration;
            thisWeekPomodoros++;
        }
    });

    stopwatches.forEach(s => {
        if (!s.end_time) return;
        const d = new Date(s.end_time);
        const mins = Math.floor(s.duration / 60);
        if (d >= today) todayFocusTime += mins;
        if (d >= oneWeekAgo) thisWeekFocusTime += mins;
    });

    const averageSessionLength = pomodoros.length > 0 ? Math.round(pomodoros.reduce((a,b)=>a+b.duration,0) / pomodoros.length) : 0;

    // 5. Productivity Score
    // Formula: 40% Task Completion, 30% Habit Completion, 20% Focus Time (Target 120m), 10% Consistency
    let focusScore = Math.min(100, (todayFocusTime / 120) * 100);
    let consistencyScore = currentBestStreak > 0 ? Math.min(100, currentBestStreak * 10) : 0; // 10 days = 100%
    
    // Overall Task Completion % across lifetime or recent? Let's use lifetime.
    let taskScore = taskCompletionRate; 
    let habitScore = habitSuccessRate;

    const productivityScore = Math.round((taskScore * 0.4) + (habitScore * 0.3) + (focusScore * 0.2) + (consistencyScore * 0.1));

    // 6. Time-Series Generation (Charts & Heatmap)
    const generateTimeSeries = (days) => {
        const series = {};
        for(let i = days - 1; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            series[dateStr] = { date: dateStr, tasks: 0, habits: 0, focusMinutes: 0 };
        }
        return series;
    };

    const mapToSeries = (series, dataList, dateField, type, valMapFn = () => 1) => {
        dataList.forEach(item => {
            if(!item[dateField]) return;
            const dStr = (item[dateField] instanceof Date ? item[dateField] : new Date(item[dateField])).toISOString().split('T')[0];
            if(series[dStr]) {
                series[dStr][type] += valMapFn(item);
            }
        });
    };

    // 365 Days Map
    const heatmapSeries = generateTimeSeries(365);
    mapToSeries(heatmapSeries, tasks.filter(t => t.status === 'Completed'), 'updated_at', 'tasks');
    mapToSeries(heatmapSeries, habitLogs, 'date', 'habits');
    mapToSeries(heatmapSeries, allFocusSessions, 'date', 'focusMinutes', s => s.duration);

    // Compute activity intensity for heatmap (0-4)
    const heatmapData = Object.values(heatmapSeries).map(day => {
        let intensity = 0;
        const totalActivity = day.tasks + day.habits + Math.floor(day.focusMinutes / 25);
        if (totalActivity >= 8) intensity = 4;
        else if (totalActivity >= 5) intensity = 3;
        else if (totalActivity >= 2) intensity = 2;
        else if (totalActivity >= 1) intensity = 1;
        return { date: day.date, count: intensity };
    });

    // 7/30 Day Charts
    const last30Days = Object.values(heatmapSeries).slice(-30).map(d => ({
        date: d.date.substring(5), // MM-DD
        Tasks: d.tasks,
        Habits: d.habits,
        FocusTime: d.focusMinutes
    }));
    const last7Days = last30Days.slice(-7);

    res.json({
        totalTasks,
        completedTasks,
        taskCompletionRate: Math.round(taskCompletionRate),
        recentTasks,
        totalHabits,
        habitsCompletedToday,
        currentBestStreak,
        longestStreak,
        habitSuccessRate: Math.round(habitSuccessRate),
        todayFocusTime,
        thisWeekFocusTime,
        totalFocusTime,
        todayPomodoros,
        thisWeekPomodoros,
        averageSessionLength,
        productivityScore,
        last7Days,
        last30Days,
        heatmapData
    });
});
