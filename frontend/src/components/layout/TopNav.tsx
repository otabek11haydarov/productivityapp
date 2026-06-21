import { Bell, Search, Sun, Moon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useEffect, useState } from 'react';

export function TopNav() {
  const { user } = useAuth();
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    // Check local storage or default to dark
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark';
    const initialTheme = savedTheme || 'dark';
    
    setTheme(initialTheme);
    if (initialTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <header className="h-16 border-b border-border bg-card flex items-center justify-between px-4 md:px-8 shrink-0 z-10">
      <div className="flex items-center flex-1">
        <h1 className="text-xl font-bold font-poppins text-primary md:hidden">Bajaraman</h1>
        <div className="hidden md:flex items-center bg-secondary rounded-lg px-3 py-2 w-96 ml-4">
          <Search className="w-4 h-4 text-muted-foreground mr-2" />
          <input 
            type="text" 
            placeholder="Search tasks, habits..." 
            className="bg-transparent border-none outline-none text-sm w-full text-foreground placeholder:text-muted-foreground"
          />
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-secondary text-muted-foreground transition-colors">
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
        <button className="p-2 rounded-full hover:bg-secondary text-muted-foreground transition-colors relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full"></span>
        </button>
        <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold shadow-sm cursor-pointer">
          {user?.name?.charAt(0).toUpperCase() || 'U'}
        </div>
      </div>
    </header>
  );
}
