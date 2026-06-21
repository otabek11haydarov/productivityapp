import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import AuthLayout from '../components/AuthLayout';
import { useToast } from '../hooks/use-toast';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { toast } = useToast();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/forgot-password', { email });
      setSuccess(true);
      toast({
        title: "Reset link sent",
        description: res.data.message || "If an account exists, a reset link has been sent.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "An error occurred",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <AuthLayout title="Password Reset Email Sent" subtitle="We've sent a password reset link to your email address.">
        <div className="space-y-6">
          <div className="bg-primary/10 text-primary p-4 rounded-xl text-center text-sm font-medium border border-primary/20">
            Please check your inbox and spam folder.
          </div>
          
          <Button 
            onClick={() => window.open('https://mail.google.com', '_blank')}
            className="w-full bg-[#EA4335] hover:bg-[#EA4335]/90 text-white font-bold shadow-lg shadow-[#EA4335]/20 transition-all rounded-xl h-11"
          >
            Open Gmail
          </Button>

          <Button 
            onClick={handleReset} 
            disabled={loading}
            variant="outline"
            className="w-full border-border/50 text-foreground font-medium rounded-xl h-11"
          >
            {loading ? 'Sending...' : 'Resend Email'}
          </Button>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            Remembered your password? <Link to="/login" className="text-primary ml-1 hover:underline font-medium">Log in</Link>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Forgot Password" subtitle="Enter your email to receive a password reset link.">
      <form onSubmit={handleReset} className="space-y-4">
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

        <Button type="submit" disabled={loading} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-lg shadow-primary/20 transition-all rounded-xl h-11 mt-2">
          {loading ? 'Sending...' : 'Send Reset Link'}
        </Button>
      </form>

      <div className="mt-6 text-center text-sm text-muted-foreground">
        Remembered your password? <Link to="/login" className="text-primary ml-1 hover:underline font-medium">Log in</Link>
      </div>
    </AuthLayout>
  );
}
