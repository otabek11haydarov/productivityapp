import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, CheckSquare, CalendarDays, Timer, User as UserIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Sidebar() {
  const location = useLocation();

  const links = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Tasks', path: '/tasks', icon: CheckSquare },
    { name: 'Habits', path: '/habits', icon: CalendarDays },
    { name: 'Pomodoro', path: '/pomodoro', icon: Timer },
  ];

  return (
    <aside className="w-64 bg-sidebar border-r border-border hidden md:flex flex-col">
      <div className="p-6">
        <h1 className="text-2xl font-bold font-poppins text-primary neon-text">Bajaraman</h1>
      </div>
      <nav className="flex-1 px-4 space-y-2">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname === link.path || (link.path !== '/' && location.pathname.startsWith(link.path));
          return (
            <Link
              key={link.name}
              to={link.path}
              className={cn(
                "flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors",
                isActive 
                  ? "bg-primary/10 text-primary font-medium" 
                  : "text-secondary-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <Icon className={cn("w-5 h-5", isActive ? "text-primary" : "text-muted-foreground")} />
              <span>{link.name}</span>
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-border mt-auto">
        <Link 
            to="/profile" 
            className="flex items-center space-x-3 px-3 py-2 rounded-lg text-secondary-foreground hover:bg-secondary transition-colors"
        >
            <UserIcon className="w-5 h-5 text-muted-foreground" />
            <span>Profile</span>
        </Link>
      </div>
    </aside>
  );
}
