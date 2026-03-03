import React from 'react';
import { motion } from 'motion/react';
import { Zap, Image as ImageIcon, Clock, ArrowUpRight, Plus } from 'lucide-react';
import { User } from '../lib/firebase';
import { Generation, Page } from '../App';

interface DashboardProps {
  user: User | null;
  generations: Generation[];
  onNavigate: (page: Page) => void;
}

export const Dashboard = ({ user, generations, onNavigate }: DashboardProps) => {
  const stats = [
    { label: 'Generations', value: generations.length, icon: Zap, color: 'text-indigo-400' },
    { label: 'Storage Used', value: '12%', icon: ImageIcon, color: 'text-pink-400' },
    { label: 'Credits Left', value: '850', icon: Zap, color: 'text-emerald-400' },
  ];

  if (!user) {
    return (
      <div className="pt-32 px-6 max-w-7xl mx-auto text-center">
        <h1 className="text-4xl font-bold mb-4">Dashboard</h1>
        <p className="text-white/40">Please sign in to view your dashboard.</p>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-extrabold mb-2">Welcome back, {user.displayName?.split(' ')[0]}!</h1>
          <p className="text-white/60">Here's what's happening with your UGC projects.</p>
        </div>
        <button
          onClick={() => onNavigate('create')}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all shadow-xl shadow-indigo-500/20"
        >
          <Plus className="w-5 h-5" />
          New Project
        </button>
      </div>

      <div className="grid sm:grid-cols-3 gap-6 mb-12">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: i * 0.1 }}
            className="glass-card p-6 flex items-center gap-6"
          >
            <div className={`bg-white/5 p-4 rounded-2xl ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-white/40 mb-1">{stat.label}</p>
              <p className="text-2xl font-extrabold">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Recent Generations</h2>
            <button className="text-indigo-400 text-sm font-bold hover:underline flex items-center gap-1">
              View all <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>

          {generations.length === 0 ? (
            <div className="glass-card p-12 text-center">
              <div className="bg-white/5 p-4 rounded-2xl w-fit mx-auto mb-4">
                <ImageIcon className="w-8 h-8 text-white/20" />
              </div>
              <p className="text-white/40 mb-6">You haven't generated any UGC yet.</p>
              <button
                onClick={() => onNavigate('create')}
                className="text-indigo-400 font-bold hover:underline"
              >
                Start your first project
              </button>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-6">
              {generations.map((gen) => (
                <div key={gen.id} className="glass-card overflow-hidden group">
                  <div className="aspect-[4/3] relative">
                    <img src={gen.imageUrl} className="w-full h-full object-cover" alt="Generation" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button className="bg-white text-black px-4 py-2 rounded-xl text-sm font-bold">View Details</button>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-sm text-white/80 line-clamp-1 mb-2">{gen.prompt}</p>
                    <div className="flex items-center gap-2 text-[10px] text-white/40 uppercase tracking-widest">
                      <Clock className="w-3 h-3" />
                      {new Date(gen.timestamp).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-6">Quick Actions</h2>
          <div className="space-y-4">
            <button
              onClick={() => onNavigate('templates')}
              className="w-full glass-card p-4 flex items-center gap-4 hover:bg-white/10 transition-all text-left"
            >
              <div className="bg-indigo-500/20 p-2 rounded-lg">
                <ImageIcon className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <p className="font-bold text-sm">Browse Templates</p>
                <p className="text-xs text-white/40">Proven high-performing styles</p>
              </div>
            </button>
            <button
              onClick={() => onNavigate('brand-kit')}
              className="w-full glass-card p-4 flex items-center gap-4 hover:bg-white/10 transition-all text-left"
            >
              <div className="bg-pink-500/20 p-2 rounded-lg">
                <Zap className="w-5 h-5 text-pink-400" />
              </div>
              <div>
                <p className="font-bold text-sm">Update Brand Kit</p>
                <p className="text-xs text-white/40">Logos, colors, and fonts</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
