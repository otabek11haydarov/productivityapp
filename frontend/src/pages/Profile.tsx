import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../components/ui/card';
import { useToast } from '../hooks/use-toast';
import { User, LogOut, Save } from 'lucide-react';

export default function Profile() {
  const { user, logout, checkAuth } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await api.put('/users/profile', { name, email });
      await checkAuth(); // Refresh user data
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
    } catch (err: any) {
      toast({
        title: "Update Failed",
        description: err.response?.data?.message || "An error occurred",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold font-poppins text-foreground flex items-center gap-2">
          <User className="w-8 h-8 text-primary" />
          Profile
        </h2>
      </div>

      <Card className="border-border bg-card shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl text-foreground">Account Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Name</label>
              <Input 
                type="text" 
                value={name} 
                onChange={e => setName(e.target.value)} 
                required 
                className="border-border focus-visible:ring-primary"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Email</label>
              <Input 
                type="email" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                required 
                className="border-border focus-visible:ring-primary"
              />
            </div>
            <Button 
              type="submit" 
              disabled={isLoading}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Save className="w-4 h-4 mr-2" /> 
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="border-t border-border mt-6 pt-6 flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            Logged in as <span className="font-medium text-foreground">{user?.email}</span>
          </div>
          <Button 
            variant="destructive" 
            onClick={handleLogout}
            className="flex items-center"
          >
            <LogOut className="w-4 h-4 mr-2" /> Logout
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
