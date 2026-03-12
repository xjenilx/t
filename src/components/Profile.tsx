import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { User, logOut } from '../lib/firebase';
import { History, Settings, LogOut, Shield, Zap, Sparkles } from 'lucide-react';

interface ProfileProps {
    user: User | null;
    onNavigate: (page: any) => void;
}

export const Profile = ({ user, onNavigate }: ProfileProps) => {
    const [history, setHistory] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetch(`/api/generations/${user.uid}`)
                .then(res => res.json())
                .then(data => {
                    setHistory(data);
                    setIsLoading(false);
                })
                .catch(err => {
                    console.error("Failed to fetch history", err);
                    setIsLoading(false);
                });
        }
    }, [user]);

    if (!user) {
        return (
            <div className="pt-40 pb-20 px-6 text-center">
                <h2 className="text-2xl font-bold mb-4">Please sign in to view your profile</h2>
                <button
                    onClick={() => onNavigate('signin')}
                    className="bg-indigo-600 hover:bg-indigo-50 text-white px-8 py-3 rounded-2xl font-bold transition-all"
                >
                    Sign In
                </button>
            </div>
        );
    }

    return (
        <div className="pt-32 pb-20 px-6 max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Sidebar */}
                <div className="lg:col-span-1 space-y-6">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="glass-card p-8 text-center"
                    >
                        <div className="relative w-24 h-24 mx-auto mb-4">
                            {user.photoURL ? (
                                <img src={user.photoURL} alt="" className="w-full h-full rounded-3xl object-cover border-4 border-dim" />
                            ) : (
                                <div className="w-full h-full rounded-3xl bg-indigo-600 flex items-center justify-center border-4 border-dim">
                                    <Sparkles className="w-10 h-10 text-white" />
                                </div>
                            )}
                            <div className="absolute -bottom-2 -right-2 bg-indigo-500 p-2 rounded-xl border-4 border-[var(--app-bg)]">
                                <Shield className="w-4 h-4 text-white" />
                            </div>
                        </div>
                        <h2 className="text-xl font-bold mb-1">{user.displayName}</h2>
                        <p className="text-sm text-muted mb-6">{user.email}</p>

                        <div className="flex flex-col gap-2">
                            <button
                                onClick={() => logOut()}
                                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-[var(--glass-bg)] hover:bg-red-500/10 hover:text-red-400 transition-all text-sm font-medium border border-dim hover:border-red-500/20"
                            >
                                <LogOut className="w-4 h-4" />
                                Sign Out
                            </button>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="glass-card p-6"
                    >
                        <h3 className="text-sm font-bold uppercase tracking-widest text-muted mb-4">Quick Links</h3>
                        <nav className="space-y-2">
                            <button className="flex items-center gap-3 w-full p-3 rounded-xl bg-indigo-500/10 text-indigo-400 text-sm font-bold">
                                <History className="w-4 h-4" />
                                Generation History
                            </button>
                            <button
                                onClick={() => onNavigate('plans')}
                                className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-[var(--glass-bg)] text-secondary hover:text-primary transition-all text-sm font-medium"
                            >
                                <Zap className="w-4 h-4" />
                                Subscription Plans
                            </button>
                            <button className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-[var(--glass-bg)] text-secondary hover:text-primary transition-all text-sm font-medium">
                                <Settings className="w-4 h-4" />
                                Account Settings
                            </button>
                        </nav>
                    </motion.div>
                </div>

                {/* Content */}
                <div className="lg:col-span-2 space-y-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center justify-between"
                    >
                        <div>
                            <h1 className="text-3xl font-extrabold mb-2">My Creations</h1>
                            <p className="text-muted text-sm">Review and manage your AI generations</p>
                        </div>
                    </motion.div>

                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 opacity-20">
                            <Sparkles className="w-12 h-12 animate-pulse mb-4" />
                            <p>Loading your masterpieces...</p>
                        </div>
                    ) : history.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {history.map((item, i) => (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="glass-card overflow-hidden group border border-dim"
                                >
                                    <div className="aspect-square relative overflow-hidden">
                                        <img src={item.imageUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                    <div className="p-4">
                                        <p className="text-xs text-secondary line-clamp-2 italic mb-2">"{item.prompt}"</p>
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] text-muted font-mono">
                                                {new Date(item.timestamp).toLocaleDateString()}
                                            </span>
                                            <button className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 transition-colors">
                                                VIEW DETAILS
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="glass-card p-12 text-center">
                            <Sparkles className="w-12 h-12 mx-auto mb-4 text-white/10" />
                            <h3 className="text-xl font-bold mb-2">No creations yet</h3>
                            <p className="text-muted mb-8 max-w-sm mx-auto text-sm">
                                Start transforming your products into high-converting UGC ads today!
                            </p>
                            <button
                                onClick={() => onNavigate('create')}
                                className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-2xl font-bold transition-all shadow-xl shadow-indigo-500/20"
                            >
                                Create New Ad
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
