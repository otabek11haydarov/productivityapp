import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { CalendarDays, Plus, Flame, MoreVertical, Trash2, Edit, Copy, Archive } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import HabitDrawer from '../components/habits/HabitDrawer';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";

export default function Habits() {
  const [newHabitTitle, setNewHabitTitle] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [selectedHabitId, setSelectedHabitId] = useState<number | null>(null);
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: habits, isLoading } = useQuery({
    queryKey: ['habits'],
    queryFn: async () => {
      const res = await api.get('/habits');
      return res.data;
    }
  });

  const createHabit = useMutation({
    mutationFn: async (title: string) => {
      return api.post('/habits', { title, frequency: 'Daily' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
      queryClient.invalidateQueries({ queryKey: ['statistics'] });
      setNewHabitTitle('');
      setIsAdding(false);
      toast({ title: 'Habit created' });
    }
  });

  const toggleHabit = useMutation({
    mutationFn: async (id: number) => {
      return api.post(`/habits/${id}/toggle`);
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['habits'] });
      const previousHabits = queryClient.getQueryData(['habits']);
      
      // Optimistic update
      queryClient.setQueryData(['habits'], (old: any) => 
        old?.map((habit: any) => {
          if (habit.id === id) {
            const isNowCompleted = !habit.is_completed_today;
            return { 
              ...habit, 
              is_completed_today: isNowCompleted,
              current_streak: isNowCompleted ? parseInt(habit.current_streak || 0) + 1 : Math.max(0, parseInt(habit.current_streak || 0) - 1)
            };
          }
          return habit;
        })
      );
      return { previousHabits };
    },
    onError: (_err, _newTodo, context) => {
      queryClient.setQueryData(['habits'], context?.previousHabits);
      toast({ title: 'Failed to update habit', variant: 'destructive' });
    },
    onSettled: (_data, _error, id) => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
      queryClient.invalidateQueries({ queryKey: ['statistics'] });
      queryClient.invalidateQueries({ queryKey: ['habitDetails', id] });
    }
  });

  const deleteHabit = useMutation({
    mutationFn: async (id: number) => {
      return api.delete(`/habits/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
      queryClient.invalidateQueries({ queryKey: ['statistics'] });
      toast({ title: 'Habit deleted' });
      if (selectedHabitId) setSelectedHabitId(null);
    }
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitTitle.trim()) return;
    createHabit.mutate(newHabitTitle);
  };

  if (isLoading) return <div>Loading habits...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold font-poppins text-foreground flex items-center gap-2">
          <CalendarDays className="w-8 h-8 text-[#00FF88]" />
          Habits
        </h2>
      </div>

      <div className="flex justify-end">
        <Button onClick={() => setIsAdding(!isAdding)} className="bg-[#00FF88] hover:bg-[#00FF88]/90 text-black font-semibold">
          <Plus className="w-4 h-4 mr-2" /> Add Habit
        </Button>
      </div>

      {isAdding && (
        <form onSubmit={handleCreate} className="flex gap-2 p-4 border border-border rounded-lg bg-secondary/30">
          <Input 
            type="text" 
            placeholder="What habit do you want to build?" 
            value={newHabitTitle}
            onChange={(e) => setNewHabitTitle(e.target.value)}
            className="flex-1 border-border focus-visible:ring-[#00FF88] bg-background"
            autoFocus
          />
          <Button type="submit" className="bg-[#00FF88] hover:bg-[#00FF88]/90 text-black font-semibold">
            Save
          </Button>
          <Button type="button" variant="ghost" onClick={() => setIsAdding(false)}>
            Cancel
          </Button>
        </form>
      )}

      <div className="space-y-2 mt-6">
        {habits?.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground border border-dashed border-border rounded-lg">
            No habits yet. Start tracking today!
          </div>
        ) : (
          habits?.map((habit: any) => {
            const isCompleted = habit.is_completed_today;
            
            return (
              <div 
                key={habit.id} 
                onClick={() => setSelectedHabitId(habit.id)}
                className={`group flex items-center justify-between p-4 border rounded-2xl transition-all duration-300 cursor-pointer ${
                  isCompleted 
                    ? 'bg-gradient-to-r from-[rgba(0,255,136,0.15)] to-[rgba(0,200,83,0.12)] border-[#00FF88]/50 shadow-[0_0_20px_rgba(0,255,136,0.15)]' 
                    : 'bg-[#1F2937] hover:bg-[#1F2937]/80 border-transparent hover:border-gray-600'
                }`}
              >
                <div className="flex items-center gap-4">
                  {/* Checkbox */}
                  <div 
                    onClick={(e) => { e.stopPropagation(); toggleHabit.mutate(habit.id); }}
                    className={`w-6 h-6 flex items-center justify-center rounded-full border-2 transition-all duration-300 cursor-pointer ${
                    isCompleted
                      ? 'bg-[#00FF88] border-[#00FF88]'
                      : 'bg-transparent border-gray-500 hover:border-gray-400'
                  }`}>
                    {isCompleted && (
                      <svg className="w-4 h-4 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  
                  {/* Habit Title */}
                  <span className={`text-lg font-medium transition-colors duration-300 ${
                    isCompleted ? 'text-[#00FF88]' : 'text-[#FFFFFF]'
                  }`}>
                    {habit.title}
                  </span>
                </div>
                
                <div className="flex items-center gap-4">
                  {/* Streak Badge */}
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-500">
                    <Flame className="w-4 h-4" />
                    <span className="font-bold text-sm">{habit.current_streak || 0}</span>
                  </div>

                  {/* 3-Dot Menu */}
                  <div onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                          <MoreVertical className="w-5 h-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 bg-card border-border">
                        <DropdownMenuItem className="cursor-pointer text-foreground hover:bg-secondary">
                          <Edit className="w-4 h-4 mr-2" /> Edit Habit
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer text-foreground hover:bg-secondary">
                          <Copy className="w-4 h-4 mr-2" /> Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer text-foreground hover:bg-secondary">
                          <Archive className="w-4 h-4 mr-2" /> Archive
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="cursor-pointer text-destructive hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => {
                            if (window.confirm("Are you sure you want to delete this habit? All history will be lost.")) {
                              deleteHabit.mutate(habit.id);
                            }
                          }}
                        >
                          <Trash2 className="w-4 h-4 mr-2" /> Delete Habit
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Slide Drawer */}
      <HabitDrawer 
        habitId={selectedHabitId} 
        onClose={() => setSelectedHabitId(null)} 
      />
    </div>
  );
}
