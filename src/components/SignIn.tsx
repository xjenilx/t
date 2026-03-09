import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Zap, Sparkles, ArrowRight } from 'lucide-react';
import { signInWithGoogle } from '../lib/firebase';
import { Logo } from './Logo';

export const SignIn = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <div className="pt-32 pb-20 px-6 max-w-7xl mx-auto flex flex-col items-center justify-center min-h-[80vh]">
      <div className="grid lg:grid-cols-2 gap-16 items-center max-w-5xl w-full">
        {/* Left side - feature list */}
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
          <p className="text-xl text-white/60 mb-10 leading-relaxed max-w-md">
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
                  <p className="text-white/40 text-sm">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Right side - sign in card */}
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
            <h2 className="text-3xl font-black tracking-tight mb-2">Welcome</h2>
            <p className="text-white/40 font-medium">Sign in to save your generations & access all features</p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl mb-6 text-sm text-red-300 text-center">
              {error}
            </div>
          )}

          {/* Google Sign In - Primary */}
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full bg-white hover:bg-gray-100 text-gray-900 py-4 rounded-2xl font-black text-lg transition-all flex items-center justify-center gap-3 group mb-4 shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="w-6 h-6 border-2 border-gray-400 border-t-gray-800 rounded-full animate-spin" />
            ) : (
              <>
                <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" />
                Continue with Google
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>

          <div className="glass-card p-4 border-indigo-500/20 bg-indigo-500/5">
            <p className="text-sm text-center text-indigo-300 font-medium mb-1">💡 Don't want to sign in?</p>
            <p className="text-xs text-center text-white/40">
              You can still use the <strong className="text-white/60">Create</strong> page as a guest — just your generations won't be saved to your account.
            </p>
          </div>

          <p className="mt-8 text-[10px] text-white/20 uppercase tracking-widest font-black text-center">
            By continuing, you agree to our Terms of Service
          </p>
        </motion.div>
      </div>
    </div>
  );
};
