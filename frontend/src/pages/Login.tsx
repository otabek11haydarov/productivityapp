import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useToast } from '../hooks/use-toast';
import { useGoogleLogin } from '@react-oauth/google';
import AuthLayout from '../components/AuthLayout';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/login', { email, password });
      login(res.data);
      navigate('/');
    } catch (err: any) {
      toast({
        title: "Login Failed",
        description: err.response?.data?.message || "An error occurred",
        variant: "destructive"
      });
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const res = await api.post('/auth/google', { token: tokenResponse.access_token });
        login(res.data);
        navigate('/');
      } catch (err: any) {
        toast({
          title: "Google Login Failed",
          description: err.response?.data?.message || "An error occurred",
          variant: "destructive"
        });
      }
    },
    onError: () => {
      toast({ title: "Google Auth Failed", variant: "destructive" });
    }
  });

  return (
    <AuthLayout title="Welcome back" subtitle="Enter your details to access your workspace.">
      <form onSubmit={handleLogin} className="space-y-5">
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
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-foreground">Password</label>
            <Link to="/forgot-password" className="text-xs text-primary hover:underline transition-all">
              Forgot Password?
            </Link>
          </div>
          <Input 
            type="password" 
            placeholder="••••••••"
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            required 
            className="bg-background/50 border-border/50 focus:border-primary transition-colors"
          />
        </div>

        <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-lg shadow-primary/20 transition-all rounded-xl h-11">
          Sign In
        </Button>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border/50"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
          </div>
        </div>

        <Button 
          type="button" 
          onClick={() => googleLogin()}
          variant="outline" 
          className="w-full h-12 bg-transparent border border-border/50 text-foreground font-medium rounded-xl hover:bg-white/5 transition-all flex items-center justify-center gap-3 relative overflow-hidden"
        >
          {/* Subtle neon glow for Google button */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-red-500/10 to-yellow-500/10 opacity-0 hover:opacity-100 transition-opacity duration-500"></div>
          
          <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
            <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
              <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"/>
              <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"/>
              <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"/>
              <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"/>
            </g>
          </svg>
          <span className="relative z-10 text-[15px]">Continue with Google</span>
        </Button>
      </form>

      <div className="mt-6 text-center text-sm text-muted-foreground">
        Don't have an account? <Link to="/register" className="text-primary ml-1 hover:underline font-medium">Register</Link>
      </div>
    </AuthLayout>
  );
}
