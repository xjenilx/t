import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Zap, Sparkles, ArrowRight } from 'lucide-react';
import {
  signInWithGoogle,
  auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile
} from '../lib/firebase';
import { Logo } from './Logo';

export const SignIn = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      console.error('Google sign in error', err);
      setError(err.message || 'Google sign in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isSignUp) {
        if (!username) throw new Error('Username is required');
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: username });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      console.error('Auth error', err);
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-32 pb-20 px-6 max-w-7xl mx-auto flex flex-col items-center justify-center min-h-[80vh]">
      <div className="grid lg:grid-cols-2 gap-16 items-center max-w-5xl w-full">
        {/* Left side - feature list remains same */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="hidden lg:block"
        >
          <div className="mb-8">
            <Logo />
          </div>
          <h1 className="text-5xl font-black tracking-tighter leading-tight mb-6">
            Unlock the power of <br />
            <span className="text-indigo-500">AI-driven UGC</span>
          </h1>
          <p className="text-xl text-secondary mb-10 leading-relaxed max-w-md">
            Upload your photo + product → AI generates a realistic composite → get a promo video instantly.
          </p>
          <div className="space-y-6">
            {[
              { icon: Zap, title: 'Viral UGC in seconds', desc: 'AI composites your photo with any product.' },
              { icon: ShieldCheck, title: 'Commercial Rights', desc: 'Use your creations anywhere without worry.' },
              { icon: Sparkles, title: 'Photo + Video Output', desc: 'Get both an image and a promo video.' },
            ].map((item, i) => (
              <div key={i} className="flex gap-4 items-start">
                <div className="bg-indigo-600/20 p-3 rounded-2xl">
                  <item.icon className="w-6 h-6 text-indigo-400" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">{item.title}</h3>
                  <p className="text-muted text-sm">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Right side - sign in/up card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="glass-card p-10 w-full relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

          <div className="lg:hidden flex justify-center mb-8">
            <Logo />
          </div>

          <div className="text-center mb-8">
            <h2 className="text-3xl font-black tracking-tight mb-2">
              {isSignUp ? 'Create Account' : 'Welcome Back'}
            </h2>
            <p className="text-muted font-medium">
              {isSignUp ? 'Join the future of UGC advertising' : 'Sign in to access your dashboard'}
            </p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl mb-6 text-sm text-red-600 dark:text-red-300 text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleEmailAuth} className="space-y-4 mb-6">
            {isSignUp && (
              <div>
                <input
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-[var(--glass-bg)] border border-dim rounded-2xl px-5 py-4 text-primary focus:outline-none focus:border-indigo-500 transition-all placeholder:text-muted/50"
                  required
                />
              </div>
            )}
            <div>
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[var(--glass-bg)] border border-dim rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-indigo-500 transition-all"
                required
              />
            </div>
            <div>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[var(--glass-bg)] border border-dim rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-indigo-500 transition-all"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-4 rounded-2xl font-black text-lg transition-all flex items-center justify-center gap-2 group shadow-xl"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {isSignUp ? 'Sign Up' : 'Sign In'}
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="relative flex items-center justify-center mb-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-dim"></div></div>
            <span className="relative px-4 bg-[var(--app-bg)] text-[10px] uppercase font-black tracking-widest text-muted">or continue with</span>
          </div>

          {/* Google Sign In */}
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full bg-white hover:bg-gray-100 text-gray-900 py-4 rounded-2xl font-black text-lg transition-all flex items-center justify-center gap-3 group mb-6 shadow-xl disabled:opacity-50"
          >
            <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" />
            Google
          </button>

          <div className="text-center">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
            </button>
          </div>

          <div className="glass-card p-4 border-indigo-500/20 bg-indigo-500/5 mt-8">
            <p className="text-sm text-center text-indigo-300 font-medium mb-1">💡 Don't want to sign in?</p>
            <p className="text-xs text-center text-muted">
              You can still use the <strong className="text-secondary">Create</strong> page as a guest — just your generations won't be saved to your account.
            </p>
          </div>

          <p className="mt-8 text-[10px] text-muted uppercase tracking-widest font-black text-center">
            By continuing, you agree to our Terms of Service
          </p>
        </motion.div>
      </div>
    </div>
  );
};
