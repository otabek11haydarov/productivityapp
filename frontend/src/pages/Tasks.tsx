import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { CheckSquare, Trash2, Plus, MoreVertical, Timer } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";

export default function Tasks() {
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const navigate = useNavigate();

  const { data: tasks, isLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      const res = await api.get('/tasks');
      return res.data;
    }
  });

  const createTask = useMutation({
    mutationFn: async (title: string) => {
      return api.post('/tasks', { title });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['statistics'] });
      setNewTaskTitle('');
      toast({ title: 'Task created' });
    }
  });

  const toggleTask = useMutation({
    mutationFn: async ({ id, status }: { id: number, status: string }) => {
      return api.put(`/tasks/${id}`, { status });
    },
    onMutate: async (newTodo) => {
      await queryClient.cancelQueries({ queryKey: ['tasks'] });
      const previousTasks = queryClient.getQueryData(['tasks']);
      queryClient.setQueryData(['tasks'], (old: any) => 
        old?.map((task: any) => 
          task.id === newTodo.id ? { ...task, status: newTodo.status } : task
        )
      );
      return { previousTasks };
    },
    onError: (err, newTodo, context) => {
      queryClient.setQueryData(['tasks'], context?.previousTasks);
      toast({ title: 'Failed to update task', variant: 'destructive' });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['statistics'] });
    }
  });

  const deleteTask = useMutation({
    mutationFn: async (id: number) => {
      return api.delete(`/tasks/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['statistics'] });
      toast({ title: 'Task deleted' });
    }
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    createTask.mutate(newTaskTitle);
  };

  if (isLoading) return <div>Loading tasks...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold font-poppins text-foreground flex items-center gap-2">
          <CheckSquare className="w-8 h-8 text-primary" />
          Tasks
        </h2>
      </div>

      <div className="flex justify-end">
        <Button onClick={() => setIsAdding(!isAdding)} className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <Plus className="w-4 h-4 mr-2" /> Add Task
        </Button>
      </div>

      {isAdding && (
        <form onSubmit={handleCreate} className="flex gap-2 p-4 border border-border rounded-lg bg-secondary/30">
          <Input 
            type="text" 
            placeholder="What needs to be done?" 
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            className="flex-1 border-border focus-visible:ring-primary bg-background"
            autoFocus
          />
          <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground">
            Save
          </Button>
          <Button type="button" variant="ghost" onClick={() => setIsAdding(false)}>
            Cancel
          </Button>
        </form>
      )}

      <div className="space-y-2 mt-6">
        {tasks?.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground border border-dashed border-border rounded-lg">
            No tasks yet. Create one above!
          </div>
        ) : (
          tasks?.map((task: any) => {
            const isCompleted = task.status === 'Completed';
            return (
              <div 
                key={task.id} 
                onClick={() => toggleTask.mutate({ id: task.id, status: isCompleted ? 'Pending' : 'Completed' })}
                className={`group flex items-center justify-between p-4 border rounded-2xl transition-all duration-300 cursor-pointer ${
                  isCompleted 
                    ? 'bg-gradient-to-r from-[rgba(0,255,136,0.15)] to-[rgba(0,200,83,0.12)] border-[#00FF88]/50 shadow-[0_0_20px_rgba(0,255,136,0.15)]' 
                    : 'bg-[#1F2937] hover:bg-[#1F2937]/80 border-transparent hover:border-gray-600'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-6 h-6 flex items-center justify-center rounded-full border-2 transition-all duration-300 ${
                    isCompleted
                      ? 'bg-[#00FF88] border-[#00FF88]'
                      : 'bg-transparent border-gray-500 group-hover:border-gray-400'
                  }`}>
                    {isCompleted && (
                      <svg className="w-4 h-4 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span className={`text-lg font-medium transition-colors duration-300 ${
                    isCompleted ? 'text-[#00FF88] line-through' : 'text-[#FFFFFF]'
                  }`}>
                    {task.title}
                  </span>
                </div>
                
                <div onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                        <MoreVertical className="w-5 h-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 bg-card border-border">
                      <DropdownMenuItem 
                        className="cursor-pointer text-foreground hover:bg-secondary flex items-center"
                        onClick={() => navigate('/pomodoro', { state: { autoStart: true, taskId: task.id, title: task.title } })}
                      >
                        <Timer className="w-4 h-4 mr-2 text-purple-500" />
                        Start Pomodoro
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="cursor-pointer text-destructive hover:bg-destructive/10 hover:text-destructive flex items-center mt-1"
                        onClick={() => deleteTask.mutate(task.id)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Task
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
