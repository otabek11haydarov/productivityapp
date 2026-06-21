import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, TrendingUp, Clock, Target } from 'lucide-react';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle: string;
}

export default function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row font-poppins">
      
      {/* Left Side: Auth Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 sm:p-12 md:p-24 bg-background relative z-10">
        <div className="w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <div className="flex items-center gap-2 mb-8">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <CheckCircle2 className="text-primary-foreground w-5 h-5" />
              </div>
              <span className="text-xl font-bold text-foreground tracking-tight">Bajaraman</span>
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">{title}</h1>
            <p className="text-muted-foreground">{subtitle}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="backdrop-blur-xl bg-card/80 border border-border p-8 rounded-3xl shadow-[0_0_40px_rgba(0,0,0,0.1)] relative overflow-hidden"
          >
            {/* Subtle glow effect behind card */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[150%] h-32 bg-primary/10 blur-[60px] -z-10 rounded-full pointer-events-none" />
            {children}
          </motion.div>
        </div>
      </div>

      {/* Right Side: Showcase */}
      <div className="w-full md:w-1/2 bg-[#0D1117] hidden md:flex flex-col justify-center items-center p-12 relative overflow-hidden border-l border-border/10">
        
        {/* Decorative background glow */}
        <div className="absolute top-1/4 -right-1/4 w-[800px] h-[800px] bg-primary/20 rounded-full blur-[120px] mix-blend-screen opacity-50 pointer-events-none" />
        <div className="absolute bottom-0 -left-1/4 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[100px] mix-blend-screen opacity-30 pointer-events-none" />

        <div className="max-w-xl relative z-10 w-full">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-12"
          >
            <h2 className="text-5xl font-extrabold text-white leading-tight mb-4 tracking-tight">
              Organize Your Life. <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-green-300">Achieve More.</span>
            </h2>
            <p className="text-lg text-gray-400 max-w-md">
              Manage tasks, build habits, track focus sessions, and monitor productivity from one intelligent workspace.
            </p>
          </motion.div>

          {/* Floating Stats */}
          <div className="grid grid-cols-2 gap-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-white/5 border border-white/10 backdrop-blur-md p-6 rounded-2xl flex flex-col hover:bg-white/10 transition-colors"
            >
              <Target className="w-8 h-8 text-primary mb-4" />
              <div className="text-3xl font-bold text-white mb-1">98%</div>
              <div className="text-sm text-gray-400">Task Completion Rate</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="bg-white/5 border border-white/10 backdrop-blur-md p-6 rounded-2xl flex flex-col hover:bg-white/10 transition-colors"
            >
              <Clock className="w-8 h-8 text-blue-400 mb-4" />
              <div className="text-3xl font-bold text-white mb-1">12 Hrs</div>
              <div className="text-sm text-gray-400">Weekly Focus Time</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="bg-white/5 border border-white/10 backdrop-blur-md p-6 rounded-2xl flex flex-col hover:bg-white/10 transition-colors"
            >
              <CheckCircle2 className="w-8 h-8 text-green-400 mb-4" />
              <div className="text-3xl font-bold text-white mb-1">124</div>
              <div className="text-sm text-gray-400">Completed Tasks</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
              className="bg-white/5 border border-white/10 backdrop-blur-md p-6 rounded-2xl flex flex-col hover:bg-white/10 transition-colors"
            >
              <TrendingUp className="w-8 h-8 text-orange-400 mb-4" />
              <div className="text-3xl font-bold text-white mb-1">42 Days</div>
              <div className="text-sm text-gray-400">Longest Habit Streak</div>
            </motion.div>
          </div>
        </div>

      </div>
    </div>
  );
}
