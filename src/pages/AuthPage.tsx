import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Banknote, ArrowRight, Phone } from 'lucide-react';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';

const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!email || !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setError('Please enter a valid email address');
      return;
    }
    
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    if (isSignUp && !phone.match(/^\+?[1-9]\d{1,14}$/)) {
      setError('Please enter a valid phone number');
      return;
    }

    setIsLoading(true);
    
    try {
      const { error: authError } = isSignUp 
        ? await signUp(email, password, phone)
        : await signIn(email, password);
      
      if (authError) {
        if (authError.message.includes('already exists') || authError.message.includes('already registered')) {
          setError('An account with this email already exists. Please sign in instead.');
          setIsSignUp(false); // Switch to sign in mode
        } else if (authError.message.includes('Invalid')) {
          setError('Invalid email or password. Please check your credentials and try again.');
        } else {
          setError(authError.message);
        }
        return;
      }
      
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left Panel - Brand/Info */}
      <div className="bg-gradient-to-br from-primary to-accent md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
        <div className="max-w-md mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="flex items-center mb-8"
          >
            <Banknote className="h-10 w-10 text-white mr-3" />
            <h1 className="text-3xl font-bold text-white">SplitShare</h1>
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-2xl md:text-3xl font-bold text-white mb-6"
          >
            Simplify expense sharing<br />with friends and family
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-white/90 mb-8"
          >
            Track expenses, split bills, and settle debts - all in one place. Join thousands of users who are already enjoying stress-free expense sharing.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="space-y-4"
          >
            <div className="flex items-start">
              <div className="bg-white/20 p-2 rounded-full mr-4">
                <SplitSquareVertical className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-white font-medium">Easy Splitting</h3>
                <p className="text-white/80 text-sm">Split expenses equally or customize amounts for each person</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="bg-white/20 p-2 rounded-full mr-4">
                <Receipt className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-white font-medium">Track Balances</h3>
                <p className="text-white/80 text-sm">See who owes what at a glance with clear balance tracking</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="bg-white/20 p-2 rounded-full mr-4">
                <CreditCard className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-white font-medium">UPI Payments</h3>
                <p className="text-white/80 text-sm">Settle debts directly through the app with UPI</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* Right Panel - Auth Form */}
      <div className="md:w-1/2 p-8 md:p-12 flex items-center justify-center bg-gradient-to-b from-background to-muted/20">
        <div className="w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold">{isSignUp ? 'Create account' : 'Welcome back'}</h2>
              <p className="text-muted-foreground mt-2">
                {isSignUp ? 'Create a new account to continue' : 'Sign in to your account'}
              </p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Email Address"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError(null); // Clear error on input change
                }}
                leftIcon={<Mail size={18} />}
                error={error}
                required
                className="bg-white/50 backdrop-blur-sm"
              />
              
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(null); // Clear error on input change
                }}
                leftIcon={<Lock size={18} />}
                error={error}
                required
                className="bg-white/50 backdrop-blur-sm"
              />
              
              {isSignUp && (
                <Input
                  label="Phone Number"
                  type="tel"
                  placeholder="+1234567890"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    setError(null);
                  }}
                  leftIcon={<Phone size={18} />}
                  error={error}
                  required
                  className="bg-white/50 backdrop-blur-sm"
                />
              )}

              <Button
                type="submit"
                variant="primary"
                className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity"
                isLoading={isLoading}
                rightIcon={<ArrowRight size={18} />}
              >
                {isSignUp ? 'Create Account' : 'Sign In'}
              </Button>
            </form>
            
            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError(null); // Clear any existing errors when switching modes
                  setEmail('');
                  setPassword('');
                }}
                className="text-primary hover:text-accent transition-colors text-sm font-medium"
              >
                {isSignUp 
                  ? 'Already have an account? Sign in' 
                  : "Don't have an account? Sign up"}
              </button>
            </div>
            
            <p className="text-sm text-center text-muted-foreground">
              By continuing, you agree to our <a href="#" className="text-primary hover:text-accent transition-colors font-medium">Terms of Service</a> and <a href="#" className="text-primary hover:text-accent transition-colors font-medium">Privacy Policy</a>.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

// For TypeScript
const SplitSquareVertical = Banknote;
const Receipt = Banknote;
const CreditCard = Banknote;

export default AuthPage;