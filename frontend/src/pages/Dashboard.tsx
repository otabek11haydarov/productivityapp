import { useQuery } from '@tanstack/react-query';
import api from '../api';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { CheckSquare, CalendarDays, Timer, Activity, Plus, PlayCircle, Flame, Target } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useNavigate } from 'react-router-dom';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

export default function Dashboard() {
  const navigate = useNavigate();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['statistics'],
    queryFn: async () => {
      const res = await api.get('/statistics');
      return res.data;
    },
    // Keep it relatively fresh, but rely on manual invalidation from mutations for instant updates
    staleTime: 60000, 
    refetchOnWindowFocus: true
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  // Helper for Productivty Score Color
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-[#00FF88]';
    if (score >= 75) return 'text-emerald-400';
    if (score >= 60) return 'text-blue-400';
    if (score >= 40) return 'text-orange-400';
    return 'text-red-500';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Elite';
    if (score >= 75) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Average';
    return 'Needs Improvement';
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Header & Quick Actions */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold font-poppins text-foreground">Dashboard</h2>
          <p className="text-muted-foreground">Your real-time productivity overview.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => navigate('/tasks')} variant="outline" className="border-white/10 hover:bg-white/5">
            <Plus className="w-4 h-4 mr-2 text-primary" /> New Task
          </Button>
          <Button onClick={() => navigate('/habits')} variant="outline" className="border-white/10 hover:bg-white/5">
            <Plus className="w-4 h-4 mr-2 text-accent" /> New Habit
          </Button>
          <Button onClick={() => navigate('/pomodoro')} className="bg-purple-600 hover:bg-purple-700 text-white font-medium">
            <PlayCircle className="w-4 h-4 mr-2" /> Start Focus
          </Button>
        </div>
      </div>
      
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Tasks */}
        <Card className="border-white/5 bg-[#1F2937] shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Tasks</CardTitle>
            <CheckSquare className="w-5 h-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{stats?.completedTasks || 0} <span className="text-xl text-muted-foreground">/ {stats?.totalTasks || 0}</span></div>
            <p className="text-xs text-muted-foreground mt-1">{stats?.taskCompletionRate || 0}% completion rate</p>
          </CardContent>
        </Card>

        {/* Habits */}
        <Card className="border-white/5 bg-[#1F2937] shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Habits Today</CardTitle>
            <CalendarDays className="w-5 h-5 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{stats?.habitsCompletedToday || 0} <span className="text-xl text-muted-foreground">/ {stats?.totalHabits || 0}</span></div>
            <div className="flex items-center gap-1 mt-1">
              <Flame className="w-3 h-3 text-orange-500" />
              <p className="text-xs text-orange-500 font-medium">{stats?.currentBestStreak || 0} day best streak</p>
            </div>
          </CardContent>
        </Card>

        {/* Focus */}
        <Card className="border-white/5 bg-[#1F2937] shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Focus Time</CardTitle>
            <Timer className="w-5 h-5 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{stats?.todayFocusTime || 0} <span className="text-xl text-muted-foreground font-normal">min</span></div>
            <p className="text-xs text-muted-foreground mt-1">Today • {stats?.thisWeekFocusTime || 0}m this week</p>
          </CardContent>
        </Card>

        {/* Productivity Score */}
        <Card className="border-white/5 bg-[#1F2937] shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Productivity Score</CardTitle>
            <Activity className={`w-5 h-5 ${getScoreColor(stats?.productivityScore || 0)}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${getScoreColor(stats?.productivityScore || 0)}`}>{stats?.productivityScore || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">{getScoreLabel(stats?.productivityScore || 0)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-white/5 bg-[#1F2937]">
          <CardHeader>
            <CardTitle className="text-lg">Weekly Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {stats?.last7Days?.length > 0 ? (
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stats.last7Days} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                    <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '8px' }} />
                    <Legend iconType="circle" />
                    <Line type="monotone" dataKey="Tasks" stroke="#00FF88" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="Habits" stroke="#3B82F6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[300px] flex flex-col items-center justify-center text-muted-foreground">
                <Activity className="w-12 h-12 mb-2 opacity-20" />
                <p>No activity in the last 7 days</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-white/5 bg-[#1F2937]">
          <CardHeader>
            <CardTitle className="text-lg">Monthly Focus & Completion</CardTitle>
          </CardHeader>
          <CardContent>
            {stats?.last30Days?.length > 0 ? (
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.last30Days} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                    <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} minTickGap={20} />
                    <YAxis stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '8px' }} cursor={{ fill: '#374151', opacity: 0.4 }} />
                    <Legend iconType="circle" />
                    <Bar dataKey="FocusTime" name="Focus (min)" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[300px] flex flex-col items-center justify-center text-muted-foreground">
                <Timer className="w-12 h-12 mb-2 opacity-20" />
                <p>No focus sessions in the last 30 days</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Heatmap & Secondary Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Heatmap */}
        <Card className="border-white/5 bg-[#1F2937] lg:col-span-2 overflow-hidden">
          <CardHeader>
            <CardTitle className="text-lg">365-Day Activity Heatmap</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto pb-4 custom-scrollbar">
              <div className="min-w-[800px] grid grid-rows-7 grid-flow-col gap-1.5 w-max">
                {stats?.heatmapData?.map((day: any) => {
                  let colorClass = 'bg-[#374151]/50'; // Empty
                  if (day.count === 1) colorClass = 'bg-[#00FF88]/30';
                  if (day.count === 2) colorClass = 'bg-[#00FF88]/60';
                  if (day.count === 3) colorClass = 'bg-[#00FF88]/80';
                  if (day.count >= 4) colorClass = 'bg-[#00FF88]';

                  return (
                    <div 
                      key={day.date} 
                      className={`w-3 h-3 rounded-sm ${colorClass} hover:ring-2 hover:ring-white/50 transition-all cursor-pointer`}
                      title={`${day.date}: Level ${day.count}`}
                    />
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Analytics Widgets */}
        <div className="space-y-6">
          <Card className="border-white/5 bg-[#1F2937]">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Target className="w-4 h-4 text-accent" /> Habit Analytics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground text-sm">Longest Streak</span>
                <span className="font-bold text-foreground flex items-center gap-1"><Flame className="w-4 h-4 text-orange-500" /> {stats?.longestStreak || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground text-sm">Global Success Rate</span>
                <span className="font-bold text-foreground">{stats?.habitSuccessRate || 0}%</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/5 bg-[#1F2937]">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Timer className="w-4 h-4 text-purple-500" /> Focus Analytics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground text-sm">Today's Pomodoros</span>
                <span className="font-bold text-foreground">{stats?.todayPomodoros || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground text-sm">This Week Pomodoros</span>
                <span className="font-bold text-foreground">{stats?.thisWeekPomodoros || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground text-sm">Avg Session Length</span>
                <span className="font-bold text-foreground">{stats?.averageSessionLength || 0}m</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Tasks List */}
      <Card className="border-white/5 bg-[#1F2937]">
        <CardHeader>
          <CardTitle className="text-lg">Recent Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {stats?.recentTasks?.length > 0 ? (
              stats.recentTasks.map((task: any) => (
                <div key={task.id} onClick={() => navigate('/tasks')} className="flex items-center justify-between p-3 bg-background/50 border border-white/5 rounded-xl hover:bg-white/5 cursor-pointer transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${task.status === 'Completed' ? 'bg-[#00FF88] border-[#00FF88]' : 'border-gray-500'}`}>
                      {task.status === 'Completed' && <svg className="w-3 h-3 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                    </div>
                    <span className={`font-medium ${task.status === 'Completed' ? 'line-through text-muted-foreground' : 'text-foreground'}`}>{task.title}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(task.created_at).toLocaleDateString()}
                  </span>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                <CheckSquare className="w-8 h-8 mx-auto mb-2 opacity-20" />
                No tasks created yet.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
