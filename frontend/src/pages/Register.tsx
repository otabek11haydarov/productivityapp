import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useToast } from '../hooks/use-toast';
import { GoogleLogin } from '@react-oauth/google';
import AuthLayout from '../components/AuthLayout';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        title: "Passwords do not match",
        variant: "destructive"
      });
      return;
    }

    try {
      const res = await api.post('/auth/register', { name, email, password });
      login(res.data);
      navigate('/');
    } catch (err: any) {
      toast({
        title: "Registration Failed",
        description: err.response?.data?.message || "An error occurred",
        variant: "destructive"
      });
    }
  };

  const handleGoogleLogin = async (credentialResponse: any) => {
    try {
      const res = await api.post('/auth/google', { token: credentialResponse.credential });
      login(res.data);
      navigate('/');
    } catch (err: any) {
      toast({
        title: "Google Auth Failed",
        description: err.response?.data?.message || "An error occurred",
        variant: "destructive"
      });
    }
  };

  return (
    <AuthLayout title="Create an account" subtitle="Start organizing your life in seconds.">
      <form onSubmit={handleRegister} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Full Name</label>
          <Input 
            type="text" 
            placeholder="John Doe"
            value={name} 
            onChange={e => setName(e.target.value)} 
            required 
            className="bg-background/50 border-border/50 focus:border-primary transition-colors"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Email</label>
          <Input 
            type="email" 
            placeholder="name@example.com"
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            required 
            className="bg-background/50 border-border/50 focus:border-primary transition-colors"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Password</label>
            <Input 
              type="password" 
              placeholder="••••••••"
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required 
              className="bg-background/50 border-border/50 focus:border-primary transition-colors"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Confirm</label>
            <Input 
              type="password" 
              placeholder="••••••••"
              value={confirmPassword} 
              onChange={e => setConfirmPassword(e.target.value)} 
              required 
              className="bg-background/50 border-border/50 focus:border-primary transition-colors"
            />
          </div>
        </div>

        <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-lg shadow-primary/20 transition-all rounded-xl h-11 mt-2">
          Sign Up
        </Button>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border/50"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">Or sign up with</span>
          </div>
        </div>

        <div className="flex justify-center w-full overflow-hidden rounded-xl">
          <GoogleLogin
            onSuccess={handleGoogleLogin}
            onError={() => {
              toast({ title: "Google Auth Failed", variant: "destructive" });
            }}
            shape="rectangular"
            theme="filled_black"
            text="signup_with"
            size="large"
          />
        </div>
      </form>

      <div className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account? <Link to="/login" className="text-primary ml-1 hover:underline font-medium">Log in</Link>
      </div>
    </AuthLayout>
  );
}
