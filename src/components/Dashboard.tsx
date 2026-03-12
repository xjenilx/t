import React from 'react';
import { motion } from 'motion/react';
import { Zap, Image as ImageIcon, Clock, ArrowUpRight, Plus, Video, TrendingUp, Sparkles } from 'lucide-react';
import { User } from '../lib/firebase';
import { Generation, Page } from '../App';

interface DashboardProps {
  user: User | null;
  generations: Generation[];
  onNavigate: (page: Page) => void;
}

export const Dashboard = ({ user, generations, onNavigate }: DashboardProps) => {
  const [profile, setProfile] = React.useState<{ tier: string; credits: number } | null>(null);

  React.useEffect(() => {
    if (user) {
      fetch(`/api/user-profile/${user.uid}`)
        .then(res => res.json())
        .then(data => setProfile(data))
        .catch(err => console.error("Failed to fetch profile", err));
    }
  }, [user]);

  const totalGenerations = generations.length;
  const totalLikes = generations.reduce((s, g) => s + (g.likes || 0), 0);
  const recentDays = 7;
  const recentCount = generations.filter(g => Date.now() - g.timestamp < recentDays * 86400000).length;

  const stats = [
    { label: 'Total Generations', value: totalGenerations, icon: Sparkles, color: 'text-indigo-400', bg: 'bg-indigo-500/10', delta: `+${recentCount} this week` },
    { label: 'Total Likes', value: totalLikes, icon: TrendingUp, color: 'text-pink-400', bg: 'bg-pink-500/10', delta: 'From community' },
    { label: 'Credits Left', value: profile?.credits ?? '...', icon: Zap, color: 'text-emerald-400', bg: 'bg-emerald-500/10', delta: profile?.tier ? `${profile.tier} Plan` : 'Loading...' },
  ];

  if (!user) {
    return (
      <div className="pt-32 px-6 max-w-7xl mx-auto flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="glass-card p-12 max-w-md w-full">
          <Sparkles className="w-12 h-12 text-indigo-400 mx-auto mb-6 opacity-60" />
          <h2 className="text-2xl font-bold mb-3">Sign in to access Dashboard</h2>
          <p className="text-muted mb-6 text-sm">Track your generations, stats, and manage projects.</p>
          <button onClick={() => onNavigate('signin')} className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-2xl font-bold transition-all">
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-extrabold mb-2">
            Welcome back, <span className="text-indigo-400">{user.displayName?.split(' ')[0] || 'Creator'}</span>!
          </h1>
          <p className="text-secondary">Here's your UGC creation overview.</p>
        </div>
        <button
          onClick={() => onNavigate('create')}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all shadow-xl shadow-indigo-500/20"
        >
          <Plus className="w-5 h-5" /> New UGC
        </button>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-3 gap-5 mb-10">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="glass-card p-6"
          >
            <div className={`${stat.bg} p-3 rounded-2xl w-fit mb-4`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <p className="text-3xl font-black mb-1">{stat.value}</p>
            <p className="text-xs font-bold text-muted uppercase tracking-widest mb-1">{stat.label}</p>
            <p className="text-xs text-muted">{stat.delta}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Recent Generations */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-black">Recent Generations</h2>
            <button
              onClick={() => onNavigate('profile')}
              className="text-indigo-400 text-sm font-bold hover:underline flex items-center gap-1"
            >
              View all <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>

          {generations.length === 0 ? (
            <div className="glass-card p-12 text-center">
              <div className="bg-indigo-500/10 p-4 rounded-2xl w-fit mx-auto mb-4">
                <ImageIcon className="w-10 h-10 text-indigo-400/40" />
              </div>
              <h3 className="font-bold text-lg mb-2">No generations yet</h3>
              <p className="text-muted mb-6 text-sm max-w-xs mx-auto">Create your first UGC ad by uploading your photo and product.</p>
              <button
                onClick={() => onNavigate('create')}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-2xl font-bold text-sm transition-all shadow-lg shadow-indigo-500/20"
              >
                Start Creating
              </button>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-5">
              {generations.slice(0, 6).map((gen, i) => (
                <motion.div
                  key={gen.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="glass-card overflow-hidden group border-dim"
                >
                  <div className="aspect-[4/3] relative overflow-hidden">
                    <img src={gen.imageUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                      <button
                        onClick={() => onNavigate('create')}
                        className="text-[10px] bg-white text-black font-black px-3 py-1.5 rounded-lg shadow-xl"
                      >
                        Remix This
                      </button>
                    </div>
                    {(gen as any).videoUrl && (
                      <div className="absolute top-2 right-2 bg-purple-600/80 backdrop-blur-md p-1.5 rounded-lg">
                        <Video className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-xs text-secondary/80 line-clamp-1 mb-1.5">"{gen.prompt}"</p>
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] text-muted font-mono flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" /> {new Date(gen.timestamp).toLocaleDateString()}
                      </span>
                      {gen.likes !== undefined && gen.likes > 0 && (
                        <span className="text-[9px] text-pink-400 font-bold">♥ {gen.likes}</span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          <h2 className="text-xl font-black">Quick Actions</h2>
          {[
            { label: 'New UGC Creation', desc: 'Photo + Video pipeline', page: 'create' as Page, icon: Sparkles, color: 'bg-indigo-500/20 text-indigo-400' },
            { label: 'Browse Templates', desc: '8 proven UGC styles', page: 'templates' as Page, icon: ImageIcon, color: 'bg-pink-500/20 text-pink-400' },
            { label: 'Brand Kit', desc: 'Colors, logos, fonts', page: 'brand-kit' as Page, icon: Zap, color: 'bg-emerald-500/20 text-emerald-400' },
            { label: 'Community', desc: 'Get inspired by others', page: 'community' as Page, icon: TrendingUp, color: 'bg-amber-500/20 text-amber-400' },
          ].map((action) => (
            <button
              key={action.label}
              onClick={() => onNavigate(action.page)}
              className="w-full glass-card p-4 flex items-center gap-4 hover:bg-white/10 transition-all text-left group"
            >
              <div className={`p-2.5 rounded-xl ${action.color}`}>
                <action.icon className="w-4 h-4" />
              </div>
              <div className="flex-grow">
                <p className="font-bold text-sm">{action.label}</p>
                <p className="text-xs text-muted">{action.desc}</p>
              </div>
              <ArrowUpRight className="w-4 h-4 text-muted/40 group-hover:text-white/60 transition-colors" />
            </button>
          ))}

          {/* Plan card */}
          <div className="glass-card p-5 border-indigo-500/20 bg-indigo-500/5 dark:bg-indigo-500/10 shadow-premium">
            <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-2">Current Plan</p>
            <p className="font-black text-lg mb-1">{profile?.tier ?? 'Loading...'}</p>
            <p className="text-xs text-muted mb-4">{profile?.credits ?? '...'} credits remaining</p>
            <div className="w-full bg-slate-200 dark:bg-white/10 rounded-full h-1.5 mb-4 overflow-hidden">
              <div className="bg-indigo-600 dark:bg-indigo-500 h-full rounded-full" style={{ width: profile?.tier === 'Pro' ? '100%' : `${(profile?.credits || 0)}%` }} />
            </div>
            <button
              onClick={() => onNavigate('plans')}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-2.5 rounded-xl text-sm font-bold transition-all"
            >
              Upgrade to Pro
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
