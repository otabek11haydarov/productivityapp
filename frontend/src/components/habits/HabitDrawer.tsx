import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import api from '../../api';
import { 
  X, Flame, Target, Calendar as CalendarIcon, 
  ChevronLeft, ChevronRight, Activity 
} from 'lucide-react';
import { Progress } from '../ui/progress';

interface HabitDrawerProps {
  habitId: number | null;
  onClose: () => void;
}

export default function HabitDrawer({ habitId, onClose }: HabitDrawerProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const { data: details, isLoading } = useQuery({
    queryKey: ['habitDetails', habitId],
    queryFn: async () => {
      if (!habitId) return null;
      const res = await api.get(`/habits/${habitId}/details`);
      return res.data;
    },
    enabled: !!habitId
  });

  // Calendar Logic
  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const daysInMonth = getDaysInMonth(currentMonth.getFullYear(), currentMonth.getMonth());
  const firstDay = getFirstDayOfMonth(currentMonth.getFullYear(), currentMonth.getMonth());

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  // Helper to check if a day is completed
  const isCompleted = (day: number) => {
    if (!details?.completedDates) return false;
    const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return details.completedDates.includes(dateStr);
  };

  const isFutureDate = (day: number) => {
    const today = new Date();
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    today.setHours(0,0,0,0);
    return date > today;
  };

  return (
    <AnimatePresence>
      {habitId && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-[#111827] border-l border-border z-50 overflow-y-auto shadow-2xl"
          >
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
              </div>
            ) : details ? (
              <div className="p-6 pb-20 space-y-8">
                
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-2xl">
                      ⭐
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-foreground">{details.title}</h2>
                      <p className="text-sm text-muted-foreground">{details.frequency} Habit</p>
                    </div>
                  </div>
                  <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-muted-foreground transition-colors">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Statistics Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#1F2937] p-4 rounded-2xl border border-white/5">
                    <div className="flex items-center gap-2 text-orange-500 mb-2">
                      <Flame className="w-5 h-5" />
                      <span className="font-medium text-sm">Current Streak</span>
                    </div>
                    <p className="text-3xl font-bold text-foreground">{details.current_streak || 0}</p>
                  </div>
                  
                  <div className="bg-[#1F2937] p-4 rounded-2xl border border-white/5">
                    <div className="flex items-center gap-2 text-primary mb-2">
                      <Target className="w-5 h-5" />
                      <span className="font-medium text-sm">Completion Rate</span>
                    </div>
                    <p className="text-3xl font-bold text-foreground">{details.completionRate || 0}%</p>
                  </div>

                  <div className="bg-[#1F2937] p-4 rounded-2xl border border-white/5">
                    <div className="flex items-center gap-2 text-blue-500 mb-2">
                      <CalendarIcon className="w-5 h-5" />
                      <span className="font-medium text-sm">Total Check-ins</span>
                    </div>
                    <p className="text-3xl font-bold text-foreground">{details.totalCheckins || 0}</p>
                  </div>

                  <div className="bg-[#1F2937] p-4 rounded-2xl border border-white/5">
                    <div className="flex items-center gap-2 text-purple-500 mb-2">
                      <Activity className="w-5 h-5" />
                      <span className="font-medium text-sm">Longest Streak</span>
                    </div>
                    <p className="text-3xl font-bold text-foreground">{details.max_streak || 0}</p>
                  </div>
                </div>

                {/* Progress Card */}
                <div className="bg-[#1F2937] p-5 rounded-2xl border border-white/5 space-y-4">
                  <div className="flex justify-between items-end">
                    <h3 className="font-semibold text-foreground">Annual Progress</h3>
                    <span className="text-sm font-medium text-muted-foreground">
                      <span className="text-primary">{details.totalCheckins || 0}</span> / 365 days
                    </span>
                  </div>
                  <Progress value={((details.totalCheckins || 0) / 365) * 100} className="h-2 bg-background" />
                </div>

                {/* Monthly Calendar View */}
                <div className="bg-[#1F2937] p-5 rounded-2xl border border-white/5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-foreground">History</h3>
                    <div className="flex items-center gap-2">
                      <button onClick={prevMonth} className="p-1 hover:bg-white/10 rounded transition-colors text-muted-foreground">
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <span className="text-sm font-medium w-24 text-center">
                        {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                      </span>
                      <button onClick={nextMonth} disabled={currentMonth.getMonth() === new Date().getMonth() && currentMonth.getFullYear() === new Date().getFullYear()} className="p-1 hover:bg-white/10 rounded transition-colors text-muted-foreground disabled:opacity-30">
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-7 gap-2 text-center text-xs mb-2 text-muted-foreground">
                    {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                      <div key={day}>{day}</div>
                    ))}
                  </div>

                  <div className="grid grid-cols-7 gap-2">
                    {Array.from({ length: firstDay }).map((_, i) => (
                      <div key={`empty-${i}`} className="w-full aspect-square" />
                    ))}
                    
                    {Array.from({ length: daysInMonth }).map((_, i) => {
                      const day = i + 1;
                      const completed = isCompleted(day);
                      const future = isFutureDate(day);
                      const isToday = !future && currentMonth.getMonth() === new Date().getMonth() && day === new Date().getDate();

                      return (
                        <div 
                          key={day} 
                          className={`w-full aspect-square rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300
                            ${future ? 'opacity-20 cursor-not-allowed text-muted-foreground' : 
                              completed ? 'bg-primary text-primary-foreground shadow-[0_0_10px_rgba(0,255,136,0.3)] scale-110' : 
                              isToday ? 'border-2 border-primary text-primary' : 
                              'bg-background text-muted-foreground hover:bg-white/10'
                            }
                          `}
                        >
                          {day}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Timeline */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-foreground px-1">Recent Activity</h3>
                  <div className="space-y-3">
                    {details.logs && details.logs.slice(0, 5).map((log: any) => (
                      <div key={log.id} className="flex items-center gap-4 bg-[#1F2937] p-3 rounded-xl border border-white/5">
                        <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                          {log.status === 'Completed' ? '✅' : '❌'}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{log.status}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(log.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                          </p>
                        </div>
                      </div>
                    ))}
                    {(!details.logs || details.logs.length === 0) && (
                      <p className="text-sm text-muted-foreground italic px-1">No activity logged yet.</p>
                    )}
                  </div>
                </div>

              </div>
            ) : (
              <div className="p-6 text-muted-foreground">Failed to load details.</div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
