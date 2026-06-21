import { useState, useEffect, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Timer, Play, Pause, Square, Target } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import { useLocation } from 'react-router-dom';
import confetti from 'canvas-confetti';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog";

type Mode = 'focus' | 'short' | 'long';
type CycleState = 'idle' | 'running' | 'paused';

const DURATIONS = {
  focus: 25 * 60,
  short: 5 * 60,
  long: 15 * 60
};

// A pleasant notification chime
const NOTIFICATION_SOUND = 'https://actions.google.com/sounds/v1/alarms/positive_notification.ogg';

export default function Pomodoro() {
  const location = useLocation();
  const state = location.state as { autoStart?: boolean; taskId?: number; title?: string } | null;

  const [mode, setMode] = useState<Mode>('focus');
  const [cycleState, setCycleState] = useState<CycleState>('idle');
  const [timeLeft, setTimeLeft] = useState(DURATIONS.focus);
  const [sessionCount, setSessionCount] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);
  
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  const queryClient = useQueryClient();
  const { toast } = useToast();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio(NOTIFICATION_SOUND);
  }, []);

  // Handle auto-start from navigation
  useEffect(() => {
    if (state?.autoStart && cycleState === 'idle') {
      startTimer();
    }
  }, [state]);

  const logSession = useMutation({
    mutationFn: async (data: { duration: number; completed: boolean; interrupted: boolean; mode: string }) => {
      return api.post('/pomodoro', {
        ...data,
        task_id: state?.taskId,
        start_time: startTime?.toISOString(),
        end_time: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['statistics'] });
    }
  });

  useEffect(() => {
    let interval: any = null;

    if (cycleState === 'running' && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (cycleState === 'running' && timeLeft === 0) {
      handleNaturalCompletion();
    }

    return () => clearInterval(interval);
  }, [cycleState, timeLeft]);

  const handleNaturalCompletion = () => {
    setCycleState('idle');
    
    // Play sound and show confetti
    audioRef.current?.play().catch(e => console.log('Audio play blocked', e));
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });

    if (mode === 'focus') {
      // Log successful focus session
      logSession.mutate({ duration: DURATIONS.focus, completed: true, interrupted: false, mode: 'focus' });
      
      const newCount = sessionCount + 1;
      setSessionCount(newCount);
      
      toast({ 
        title: "Great Job! Time for a Break.", 
        description: `You've completed ${newCount} session${newCount > 1 ? 's' : ''}!`
      });

      // Auto transition
      if (newCount >= 4) {
        changeMode('long');
      } else {
        changeMode('short');
      }
    } else {
      // Break is over
      logSession.mutate({ duration: DURATIONS[mode], completed: true, interrupted: false, mode });
      
      if (mode === 'long') {
        setSessionCount(0); // Reset cycle after long break
      }
      
      toast({ title: "Break Finished. Let's Focus." });
      changeMode('focus');
    }
  };

  const startTimer = () => {
    if (cycleState === 'idle') {
      setStartTime(new Date());
    }
    setCycleState('running');
  };

  const pauseTimer = () => {
    setCycleState('paused');
  };

  const attemptStop = () => {
    setIsAlertOpen(true);
  };

  const confirmStop = () => {
    if (mode === 'focus') {
      const durationElapsed = DURATIONS.focus - timeLeft;
      logSession.mutate({ duration: durationElapsed, completed: false, interrupted: true, mode: 'focus' });
    }
    setCycleState('idle');
    setTimeLeft(DURATIONS[mode]);
    setIsAlertOpen(false);
  };

  const changeMode = (newMode: Mode) => {
    if (cycleState !== 'idle') return; // Timer is locked while running/paused
    setMode(newMode);
    setTimeLeft(DURATIONS[newMode]);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // UI Helpers
  const isLocked = cycleState !== 'idle';
  
  // Visual cycle tracking ● ● ○ ○
  const renderDots = () => {
    return Array.from({ length: 4 }).map((_, i) => (
      <div 
        key={i} 
        className={`w-3 h-3 rounded-full transition-colors duration-500 ${i < sessionCount ? 'bg-purple-500' : 'bg-secondary'}`}
      />
    ));
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 flex flex-col items-center justify-center min-h-[70vh]">
      
      <div className="flex items-center justify-center gap-2 mb-2">
        <Timer className="w-8 h-8 text-purple-500" />
        <h2 className="text-3xl font-bold font-poppins text-foreground">
          {mode === 'focus' ? 'Focus Session' : mode === 'short' ? 'Short Break' : 'Long Break'}
        </h2>
      </div>

      <div className="flex items-center gap-3 bg-secondary/30 px-4 py-2 rounded-full mb-4">
        <span className="text-sm font-medium text-muted-foreground">Current Cycle: {sessionCount}/4</span>
        <div className="flex gap-1.5">{renderDots()}</div>
      </div>

      <Card className={`w-full border-border shadow-lg p-6 rounded-3xl transition-colors duration-500 ${mode === 'focus' ? 'bg-card' : mode === 'short' ? 'bg-blue-950/20' : 'bg-green-950/20'}`}>
        <div className={`flex justify-center space-x-2 mb-6 p-1 rounded-full w-max mx-auto transition-all ${isLocked ? 'opacity-50 grayscale pointer-events-none' : 'bg-secondary/50'}`}>
          <Button 
            variant={mode === 'focus' ? 'default' : 'ghost'} 
            onClick={() => changeMode('focus')}
            className={`rounded-full transition-all ${mode === 'focus' ? 'bg-purple-500 hover:bg-purple-600 text-white shadow-md' : 'text-muted-foreground'}`}
            disabled={isLocked}
          >
            Pomodoro
          </Button>
          <Button 
            variant={mode === 'short' ? 'default' : 'ghost'} 
            onClick={() => changeMode('short')}
            className={`rounded-full transition-all ${mode === 'short' ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-md' : 'text-muted-foreground'}`}
            disabled={isLocked}
          >
            Short Break
          </Button>
          <Button 
            variant={mode === 'long' ? 'default' : 'ghost'} 
            onClick={() => changeMode('long')}
            className={`rounded-full transition-all ${mode === 'long' ? 'bg-green-500 hover:bg-green-600 text-white shadow-md' : 'text-muted-foreground'}`}
            disabled={isLocked}
          >
            Long Break
          </Button>
        </div>

        {state?.title && mode === 'focus' && (
          <div className="flex items-center justify-center gap-2 mb-6 text-muted-foreground bg-secondary/20 p-3 rounded-xl mx-8">
            <Target className="w-4 h-4 text-primary" />
            <span className="font-medium text-sm">Focusing on: <span className="text-foreground">{state.title}</span></span>
          </div>
        )}

        <CardContent className="flex flex-col items-center justify-center p-0 mt-4">
          <div className="text-[120px] leading-none md:text-[160px] font-mono font-bold text-foreground mb-12 tracking-tighter drop-shadow-sm">
            {formatTime(timeLeft)}
          </div>

          <div className="flex items-center space-x-6">
            {cycleState === 'running' ? (
              <Button 
                size="lg" 
                onClick={pauseTimer}
                className="w-32 h-16 rounded-2xl text-2xl font-bold shadow-lg bg-orange-500 hover:bg-orange-600 text-white transition-all"
              >
                <Pause className="w-6 h-6 mr-2" /> Pause
              </Button>
            ) : (
              <Button 
                size="lg" 
                onClick={startTimer}
                className={`w-32 h-16 rounded-2xl text-2xl font-bold shadow-lg transition-all text-white ${cycleState === 'paused' ? 'bg-blue-500 hover:bg-blue-600' : 'bg-purple-500 hover:bg-purple-600'}`}
              >
                <Play className="w-6 h-6 mr-2" /> {cycleState === 'paused' ? 'Resume' : 'Start'}
              </Button>
            )}

            <Button 
              size="icon" 
              variant="outline"
              onClick={attemptStop}
              disabled={cycleState === 'idle'}
              className="w-16 h-16 rounded-2xl border-border text-muted-foreground hover:bg-destructive hover:text-destructive-foreground transition-all shadow-sm disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-muted-foreground"
            >
              <Square className="w-6 h-6" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stop Confirmation Dialog */}
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent className="rounded-3xl border-border bg-card">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-bold text-foreground">End Focus Session?</AlertDialogTitle>
            <AlertDialogDescription className="text-base text-muted-foreground">
              This session will not be counted as completed and your progress will not be recorded towards your statistics.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6">
            <AlertDialogCancel className="rounded-xl border-border text-foreground hover:bg-secondary transition-colors">
              Continue Focus
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmStop}
              className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors shadow-lg shadow-destructive/20"
            >
              End Session
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}
