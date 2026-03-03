import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Play, Zap, ShieldCheck } from 'lucide-react';

interface HeroProps {
  onStart: () => void;
}

export const Hero = ({ onStart }: HeroProps) => {
  return (
    <div className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-3 bg-white/5 border border-white/10 rounded-full px-4 py-2 mb-8">
            <div className="flex -space-x-2">
              {[1, 2, 3].map((i) => (
                <img
                  key={i}
                  src={`https://picsum.photos/seed/user${i}/100/100`}
                  className="w-7 h-7 rounded-full border-2 border-[#050505]"
                  alt="User"
                  referrerPolicy="no-referrer"
                />
              ))}
            </div>
            <span className="text-sm font-semibold text-white/80">Trusted by 10,000+ creators</span>
          </div>

          <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] mb-8">
            Create viral UGC <br />
            <span className="text-indigo-500">in seconds</span>
          </h1>

          <p className="text-xl text-white/60 mb-12 max-w-xl leading-relaxed font-medium">
            Upload product images and a model photo — our AI instantly produces professional lifestyle imagery and short-form videos optimized for commercials & Reels.
          </p>

          <div className="flex flex-wrap gap-4 mb-16">
            <button
              onClick={onStart}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-10 py-5 rounded-2xl font-bold flex items-center gap-3 transition-all shadow-2xl shadow-indigo-500/30 group text-lg"
            >
              Start generating — it's free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="bg-white/5 hover:bg-white/10 border border-white/10 text-white px-10 py-5 rounded-2xl font-bold flex items-center gap-3 transition-all text-lg">
              <Play className="w-5 h-5 fill-current" />
              Watch demo
            </button>
          </div>

          <div className="grid sm:grid-cols-2 gap-6 max-w-lg">
            <div className="glass-card p-5 flex items-center gap-5 border-white/5">
              <div className="bg-indigo-500/20 p-3 rounded-2xl">
                <Zap className="w-6 h-6 text-indigo-400 fill-current" />
              </div>
              <div>
                <p className="font-bold text-lg leading-none mb-1">Seconds to create</p>
                <p className="text-sm text-white/40">Optimized social formats</p>
              </div>
            </div>
            <div className="glass-card p-5 flex items-center gap-5 border-white/5">
              <div className="bg-indigo-500/20 p-3 rounded-2xl">
                <ShieldCheck className="w-6 h-6 text-indigo-400" />
              </div>
              <div>
                <p className="font-bold text-lg leading-none mb-1">Commercial rights</p>
                <p className="text-sm text-white/40">Use anywhere, no fuss</p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative"
        >
          <div className="relative aspect-[4/3] rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl">
            <img
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80"
              className="w-full h-full object-cover"
              alt="UGC Preview"
              referrerPolicy="no-referrer"
            />
            <div className="absolute top-8 left-8 bg-black/40 backdrop-blur-md px-5 py-2 rounded-full text-xs font-bold tracking-widest uppercase border border-white/10 text-white/80">
              Social-ready • 9:16 & 16:9
            </div>
            <div className="absolute bottom-8 right-8">
              <button className="bg-black/40 backdrop-blur-md hover:bg-black/60 border border-white/20 text-white px-6 py-3 rounded-2xl text-sm font-bold flex items-center gap-3 transition-all">
                <Play className="w-5 h-5 fill-current" />
                Preview
              </button>
            </div>
          </div>

          <div className="flex gap-4 mt-8">
            {[
              "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=300&q=80",
              "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=300&q=80",
              "https://images.unsplash.com/photo-1533107862482-0e6974b06ec4?auto=format&fit=crop&w=300&q=80"
            ].map((src, i) => (
              <div key={i} className="w-20 h-20 rounded-2xl overflow-hidden border border-white/10 shadow-lg">
                <img src={src} className="w-full h-full object-cover" alt="Thumbnail" referrerPolicy="no-referrer" />
              </div>
            ))}
            <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-sm font-bold text-white/40">
              <div className="w-3 h-3 bg-emerald-500 rounded-full mr-2 shadow-lg shadow-emerald-500/50" />
              +20 more
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
