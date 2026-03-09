import React from 'react';
import { motion } from 'motion/react';
import { Logo } from './Logo';
import { Sun, Moon, LogOut, User as UserIcon } from 'lucide-react';
import { Page } from '../App';
import { signInWithGoogle, logOut, User } from '../lib/firebase';

interface NavbarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  user: User | null;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export const Navbar = ({ currentPage, onNavigate, user, theme, onToggleTheme }: NavbarProps) => {
  const navItems: { label: string; id: Page }[] = [
    { label: 'Home', id: 'home' },
    { label: 'Create', id: 'create' },
    { label: 'Community', id: 'community' },
    { label: '🇮🇳 Campaigns', id: 'campaigns' },
    { label: 'Plans', id: 'plans' },
    { label: 'Dashboard', id: 'dashboard' },
    { label: 'Brand Kit', id: 'brand-kit' },
  ];

  const handleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error("Sign in failed", error);
    }
  };

  const handleSignOut = async () => {
    try {
      await logOut();
    } catch (error) {
      console.error("Sign out failed", error);
    }
  };

  return (
    <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-5xl px-4">
      <div className="glass-card px-6 py-3 flex items-center justify-between">
        <div
          className="cursor-pointer"
          onClick={() => onNavigate('home')}
        >
          <Logo />
        </div>

        <div className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`text-sm font-medium transition-colors hover:text-white ${currentPage === item.id ? 'text-white' : 'text-white/60'
                }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={onToggleTheme}
            className="p-2 text-white/60 hover:text-white transition-all transform hover:scale-110"
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </button>

          {user ? (
            <div className="flex items-center gap-4">
              <button
                onClick={() => onNavigate('profile')}
                className={`flex items-center gap-2 transition-all ${currentPage === 'profile' ? 'text-white' : 'text-white/60 hover:text-white'}`}
              >
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName || ''} className={`w-8 h-8 rounded-full border ${currentPage === 'profile' ? 'border-indigo-500 shadow-lg shadow-indigo-500/20' : 'border-white/10'}`} />
                ) : (
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentPage === 'profile' ? 'bg-indigo-600' : 'bg-white/10'}`}>
                    <UserIcon className="w-4 h-4 text-white" />
                  </div>
                )}
                <span className="hidden sm:block text-sm font-medium">{user.displayName?.split(' ')[0]}</span>
              </button>
              <button
                onClick={handleSignOut}
                className="p-2 text-white/60 hover:text-white transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={() => onNavigate('signin')}
                className="hidden sm:block text-sm font-medium text-white/80 hover:text-white transition-colors"
              >
                Sign in
              </button>
              <button
                onClick={() => onNavigate('create')}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-indigo-500/20"
              >
                Get Started
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};
