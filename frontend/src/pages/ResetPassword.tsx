import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import AuthLayout from '../components/AuthLayout';
import { useToast } from '../hooks/use-toast';
import { Eye, EyeOff, CheckCircle2, XCircle } from 'lucide-react';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [isValidating, setIsValidating] = useState(true);
  const [isValid, setIsValid] = useState(false);
  
  const { toast } = useToast();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const { token } = useParams<{ token: string }>();

  useEffect(() => {
    const validateToken = async () => {
      try {
        await api.get(`/auth/validate-reset-token/${token}`);
        setIsValid(true);
      } catch (error) {
        setIsValid(false);
      } finally {
        setIsValidating(false);
      }
    };
    if (token) validateToken();
  }, [token]);

  const calculateStrength = (pass: string) => {
    let strength = 0;
    if (pass.length >= 8) strength += 25;
    if (pass.match(/[A-Z]/)) strength += 25;
    if (pass.match(/[0-9]/)) strength += 25;
    if (pass.match(/[^A-Za-z0-9]/)) strength += 25;
    return strength;
  };

  const strength = calculateStrength(password);
  
  const getStrengthColor = () => {
    if (strength <= 25) return 'bg-red-500';
    if (strength <= 50) return 'bg-orange-500';
    if (strength <= 75) return 'bg-yellow-500';
    return 'bg-emerald-500';
  };

  const getStrengthText = () => {
    if (password.length === 0) return 'Enter a password';
    if (strength <= 25) return 'Weak';
    if (strength <= 50) return 'Fair';
    if (strength <= 75) return 'Good';
    return 'Strong';
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({ title: "Passwords do not match", variant: "destructive" });
      return;
    }

    if (strength < 50) {
      toast({ title: "Password is too weak", description: "Please use a stronger password.", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      await api.post(`/auth/reset-password/${token}`, {
        password });
      toast({ title: "Success", description: "Password successfully updated. Redirecting to login..." });
      
      setTimeout(() => {
        navigate('/login');
      }, 3000);
      
    } catch (error: any) {
      toast({ 
        title: "Error resetting password", 
        description: error.response?.data?.message || "Something went wrong.", 
        variant: "destructive" 
      });
      setLoading(false);
    }
  };

  if (isValidating) {
    return (
      <AuthLayout title="Validating Link" subtitle="Please wait while we verify your request.">
        <div className="flex justify-center my-8">
          <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
        </div>
      </AuthLayout>
    );
  }

  if (!isValid) {
    return (
      <AuthLayout title="Link Invalid" subtitle="This password reset link has expired or is invalid.">
        <div className="flex flex-col items-center justify-center space-y-6 my-4">
          <XCircle className="w-16 h-16 text-destructive/80" />
          <Button onClick={() => navigate('/forgot-password')} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-lg shadow-primary/20 transition-all rounded-xl h-11">
            Request New Reset Link
          </Button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Reset Password" subtitle="Choose a new secure password.">
      <form onSubmit={handleReset} className="space-y-5">
        
        {/* New Password Field */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">New Password</label>
          <div className="relative">
            <Input 
              type={showPassword ? "text" : "password"} 
              placeholder="••••••••"
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required 
              className="bg-background/50 border-border/50 focus:border-primary transition-colors pr-10"
            />
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          
          {/* Password Strength Indicator */}
          <div className="pt-2">
            <div className="flex justify-between items-center mb-1 text-xs">
              <span className="text-muted-foreground font-medium">Password strength:</span>
              <span className={`font-semibold ${password.length === 0 ? 'text-muted-foreground' : strength <= 25 ? 'text-red-500' : strength <= 50 ? 'text-orange-500' : strength <= 75 ? 'text-yellow-500' : 'text-emerald-500'}`}>
                {getStrengthText()}
              </span>
            </div>
            <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden flex">
              <div 
                className={`h-full transition-all duration-300 ease-out ${getStrengthColor()}`}
                style={{ width: `${Math.max(strength, password.length > 0 ? 5 : 0)}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Confirm Password Field */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Confirm Password</label>
          <div className="relative">
            <Input 
              type={showConfirmPassword ? "text" : "password"} 
              placeholder="••••••••"
              value={confirmPassword} 
              onChange={e => setConfirmPassword(e.target.value)} 
              required 
              className="bg-background/50 border-border/50 focus:border-primary transition-colors pr-10"
            />
            <button 
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          
          {/* Match Indicator */}
          {confirmPassword.length > 0 && (
            <div className="flex items-center gap-1.5 text-xs mt-1.5">
              {password === confirmPassword ? (
                <><CheckCircle2 size={14} className="text-emerald-500" /> <span className="text-emerald-500 font-medium">Passwords match</span></>
              ) : (
                <><XCircle size={14} className="text-red-500" /> <span className="text-red-500 font-medium">Passwords do not match</span></>
              )}
            </div>
          )}
        </div>

        <Button 
          type="submit" 
          disabled={loading || password !== confirmPassword || strength < 50} 
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-lg shadow-primary/20 transition-all rounded-xl h-11 mt-4 disabled:opacity-50 disabled:shadow-none"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></div>
              Updating...
            </div>
          ) : 'Update Password'}
        </Button>
      </form>

      <div className="mt-6 text-center text-sm text-muted-foreground">
        Back to <Link to="/login" className="text-primary ml-1 hover:underline font-medium">Log in</Link>
      </div>
    </AuthLayout>
  );
}
