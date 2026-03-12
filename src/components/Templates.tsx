import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { Camera, TrendingUp, Sparkles, Home, Zap, Star, Coffee, ShoppingBag } from 'lucide-react';

interface TemplatesProps {
  onUseStyle: (prompt: string) => void;
}

export const Templates = ({ onUseStyle }: TemplatesProps) => {
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Fashion', 'Beauty', 'Tech', 'Lifestyle', 'Food'];

  const templates = [
    {
      id: 1, title: "Minimalist Studio", category: "Beauty", ratio: "9:16",
      description: "Clean, professional studio photography with soft gradient backgrounds.",
      prompt: "A professional studio lifestyle shot, person naturally using the product with clean white/gradient background, soft studio lighting, high-end commercial look.",
      icon: Camera, color: "text-indigo-400", bg: "bg-indigo-400/10",
      preview: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&w=400&q=80",
      tags: ['Studio', 'Clean', 'Commercial']
    },
    {
      id: 2, title: "Street Fashion", category: "Fashion", ratio: "9:16",
      description: "Dynamic street-style photography in urban environments.",
      prompt: "Urban street fashion photography, person confidently wearing/using product in a city setting, golden hour sunlight, candid authentic feel, high contrast editorial.",
      icon: TrendingUp, color: "text-pink-400", bg: "bg-pink-400/10",
      preview: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=400&q=80",
      tags: ['Urban', 'Editorial', 'Fashion']
    },
    {
      id: 3, title: "Tech & Gaming", category: "Tech", ratio: "16:9",
      description: "Neon-lit cyberpunk aesthetics for tech and gaming products.",
      prompt: "Cinematic cyberpunk aesthetic, person interacting with tech product in a futuristic setting, neon lighting (pink and cyan), dramatic shadows, moody atmosphere.",
      icon: Sparkles, color: "text-cyan-400", bg: "bg-cyan-400/10",
      preview: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&w=400&q=80",
      tags: ['Neon', 'Futuristic', 'Tech']
    },
    {
      id: 4, title: "Cozy Home Vibes", category: "Lifestyle", ratio: "9:16",
      description: "Warm, inviting home settings for lifestyle and home goods.",
      prompt: "Warm cozy home lifestyle photo, person relaxing and naturally using the product, soft morning sunlight through a window, hygge aesthetic, warm tones.",
      icon: Home, color: "text-amber-400", bg: "bg-amber-400/10",
      preview: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=400&q=80",
      tags: ['Warm', 'Cozy', 'Home']
    },
    {
      id: 5, title: "Fitness & Active", category: "Lifestyle", ratio: "9:16",
      description: "High-energy action shots for fitness and sportswear.",
      prompt: "High energy fitness lifestyle photo, athletic person actively using the product during workout or outdoor activity, dramatic dynamic lighting, motivational and powerful.",
      icon: Zap, color: "text-emerald-400", bg: "bg-emerald-400/10",
      preview: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=400&q=80",
      tags: ['Active', 'Sport', 'Dynamic']
    },
    {
      id: 6, title: "Luxury Editorial", category: "Fashion", ratio: "4:5",
      description: "High-end editorial photography for premium brands.",
      prompt: "High-end luxury editorial photograph, person elegantly holding or using a premium product, sophisticated setting (rooftop, gallery, luxury interior), magazine quality, Vogue-style.",
      icon: Star, color: "text-yellow-400", bg: "bg-yellow-400/10",
      preview: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=400&q=80",
      tags: ['Luxury', 'Editorial', 'Premium']
    },
    {
      id: 7, title: "Café Morning", category: "Food", ratio: "1:1",
      description: "Cozy café aesthetics, perfect for food and beverage brands.",
      prompt: "Café morning lifestyle photo, person enjoying the product in a cozy artisan coffee shop, warm light, latte art in background, relaxed and aesthetic, Instagram-worthy.",
      icon: Coffee, color: "text-orange-400", bg: "bg-orange-400/10",
      preview: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=400&q=80",
      tags: ['Café', 'Morning', 'Warm']
    },
    {
      id: 8, title: "Unboxing UGC", category: "Tech", ratio: "9:16",
      description: "Authentic unboxing experience for product launches.",
      prompt: "Authentic UGC-style unboxing video frame, person excitedly unboxing or first-using the product, genuine surprised reaction, close-up hands, real home environment, TikTok aesthetic.",
      icon: ShoppingBag, color: "text-purple-400", bg: "bg-purple-400/10",
      preview: "https://images.unsplash.com/photo-1565849904461-04a58ad377e0?auto=format&fit=crop&w=400&q=80",
      tags: ['Unboxing', 'Authentic', 'TikTok']
    },
  ];

  const filtered = selectedCategory === 'All' ? templates : templates.filter(t => t.category === selectedCategory);

  return (
    <div className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center mb-12">
        <span className="text-indigo-400 text-xs font-bold uppercase tracking-widest mb-3 block">Templates</span>
        <h1 className="text-5xl font-extrabold mb-4">UGC Style Templates</h1>
        <p className="text-secondary max-w-2xl mx-auto">
          Pick a proven style template. Upload your photo + product and get instant AI-generated UGC.
        </p>
      </motion.div>

      {/* Category Filter */}
      <div className="flex justify-center gap-2 flex-wrap mb-10">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border ${selectedCategory === cat
              ? 'bg-indigo-600 border-indigo-500 text-white'
              : 'bg-[var(--glass-bg)] border-dim text-secondary hover:text-white hover:border-white/20'
              }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
        {filtered.map((template, i) => (
          <motion.div
            key={template.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.05 }}
            className="glass-card overflow-hidden group cursor-pointer hover:border-white/20 transition-all border-dim flex flex-col"
          >
            {/* Preview Image */}
            <div className="relative aspect-[3/4] overflow-hidden">
              <img
                src={template.preview}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                alt={template.title}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
              <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
                {template.tags.map(tag => (
                  <span key={tag} className="text-[9px] font-bold bg-black/50 backdrop-blur-md text-white/70 px-2 py-0.5 rounded-full border border-dim uppercase tracking-wider">
                    {tag}
                  </span>
                ))}
              </div>
              <span className="absolute top-3 right-3 text-[10px] font-black bg-indigo-600/80 backdrop-blur-md text-white px-2 py-0.5 rounded-full">
                {template.ratio}
              </span>
            </div>

            {/* Info */}
            <div className="p-4 flex flex-col flex-grow">
              <div className="flex items-center gap-2 mb-2">
                <div className={`${template.bg} p-1.5 rounded-lg`}>
                  <template.icon className={`w-3.5 h-3.5 ${template.color}`} />
                </div>
                <h3 className="font-black text-sm">{template.title}</h3>
              </div>
              <p className="text-muted text-xs leading-relaxed mb-4 flex-grow">{template.description}</p>
              <button
                onClick={() => onUseStyle(template.prompt)}
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white py-2.5 rounded-xl text-xs font-black transition-all group-hover:shadow-lg group-hover:shadow-indigo-500/20"
              >
                Use Template <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
