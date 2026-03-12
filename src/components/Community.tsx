import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Heart, Share2, Zap } from 'lucide-react';

interface CommunityProps {
  onRemix: (prompt: string) => void;
}

export const Community = ({ onRemix }: CommunityProps) => {
  const [items, setItems] = useState<any[]>([]);
  const [likedItems, setLikedItems] = useState<string[]>([]);

  React.useEffect(() => {
    fetch('/api/generations')
      .then(res => res.json())
      .then(data => setItems(data))
      .catch(err => console.error("Failed to fetch community items", err));
  }, []);

  const toggleLike = async (id: string) => {
    if (likedItems.includes(id)) return;

    try {
      await fetch(`/api/like/${id}`, { method: 'POST' });
      setLikedItems(prev => [...prev, id]);
      setItems(prev => prev.map(item =>
        item.id === id ? { ...item, likes: (item.likes || 0) + 1 } : item
      ));
    } catch (err) {
      console.error("Failed to like item", err);
    }
  };

  return (
    <div className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-12"
      >
        <h1 className="text-4xl font-extrabold mb-4">Community</h1>
        <p className="text-secondary">See what others are creating with MAKE UGCAD</p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {items.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: i * 0.1 }}
            className="group relative aspect-[3/4] rounded-3xl overflow-hidden border border-dim"
          >
            <img
              src={item.imageUrl}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              alt={item.prompt}
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            <div className="absolute top-4 left-4 flex gap-2">
              <span className="bg-indigo-500/80 backdrop-blur-md text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-indigo-400/20">
                AI Generated
              </span>
            </div>

            <div className="absolute top-4 right-4 flex flex-col gap-2 translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
              <div className="flex flex-col items-center gap-1">
                <button
                  onClick={() => toggleLike(item.id)}
                  className={`p-2 rounded-xl backdrop-blur-md border transition-all ${likedItems.includes(item.id) ? 'bg-red-500 border-red-400 text-white' : 'bg-black/40 border-dim text-secondary hover:text-white'
                    }`}
                >
                  <Heart className={`w-5 h-5 ${likedItems.includes(item.id) ? 'fill-current' : ''}`} />
                </button>
                <span className="text-[10px] font-bold text-secondary">{item.likes || 0}</span>
              </div>
              <button className="p-2 rounded-xl bg-black/40 backdrop-blur-md border border-dim text-secondary hover:text-white transition-all">
                <Share2 className="w-5 h-5" />
              </button>
            </div>

            <div className="absolute bottom-6 left-6 right-6 translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
              <p className="text-xs text-primary mb-4 line-clamp-3 font-medium bg-black/40 backdrop-blur-md p-3 rounded-xl border border-dim">{item.prompt}</p>
              <button
                onClick={() => onRemix(item.prompt)}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-500/20"
              >
                <Zap className="w-4 h-4 fill-current" />
                Remix this style
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
