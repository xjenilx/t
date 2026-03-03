import React from 'react';
import { motion } from 'motion/react';
import { Camera, TrendingUp, Sparkles, Home, ArrowRight, Zap } from 'lucide-react';

interface TemplatesProps {
  onUseStyle: (prompt: string) => void;
}

export const Templates = ({ onUseStyle }: TemplatesProps) => {
  const templates = [
    {
      id: 1,
      title: "Minimalist Studio",
      ratio: "9:16",
      description: "Clean, well-lit studio photography focusing on the product details with a soft gradient background.",
      prompt: "A professional minimalist studio shot of [PRODUCT] with soft gradient background and clean lighting.",
      icon: Camera,
      color: "text-indigo-400",
      bg: "bg-indigo-400/10"
    },
    {
      id: 2,
      title: "Lifestyle Action",
      ratio: "16:9",
      description: "Dynamic shots of the product in use during everyday activities or sports.",
      prompt: "A dynamic lifestyle action shot of [PRODUCT] being used in an urban setting, high energy, cinematic motion blur.",
      icon: TrendingUp,
      color: "text-pink-400",
      bg: "bg-pink-400/10"
    },
    {
      id: 3,
      title: "Cyberpunk Glow",
      ratio: "16:9",
      description: "Edgy, neon-lit aesthetics perfect for tech products or gaming gear.",
      prompt: "A cyberpunk aesthetic shot of [PRODUCT] with neon pink and cyan lighting, futuristic atmosphere, high contrast.",
      icon: Sparkles,
      color: "text-cyan-400",
      bg: "bg-cyan-400/10"
    },
    {
      id: 4,
      title: "Cozy Home",
      ratio: "9:16",
      description: "Warm, inviting settings ideal for home goods, decor, or comfort items.",
      prompt: "A warm and cozy home setting for [PRODUCT], soft morning sunlight through a window, comfortable and inviting atmosphere.",
      icon: Home,
      color: "text-amber-400",
      bg: "bg-amber-400/10"
    }
  ];

  return (
    <div className="pt-32 pb-20 px-6 max-w-7xl mx-auto text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-16"
      >
        <h1 className="text-5xl font-extrabold mb-6">UGC Templates</h1>
        <p className="text-white/60 max-w-2xl mx-auto">
          Jumpstart your creativity with proven, high-performing aesthetic templates.
        </p>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
        {templates.map((template, i) => (
          <motion.div
            key={template.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: i * 0.1 }}
            className="glass-card p-10 text-left group hover:border-white/20 transition-all border-white/5"
          >
            <div className="flex items-start gap-8">
              <div className={`${template.bg} p-5 rounded-[2rem] shadow-xl shadow-black/20`}>
                <template.icon className={`w-10 h-10 ${template.color}`} />
              </div>
              <div className="flex-grow">
                <div className="flex items-center gap-4 mb-3">
                  <h3 className="text-3xl font-black tracking-tight">{template.title}</h3>
                  <span className="text-[11px] font-black bg-white/10 px-3 py-1 rounded-lg uppercase tracking-widest text-white/40 border border-white/5">
                    {template.ratio}
                  </span>
                </div>
                <p className="text-white/40 text-base leading-relaxed mb-8 font-medium">
                  {template.description}
                </p>
                <button
                  onClick={() => onUseStyle(template.prompt)}
                  className="flex items-center gap-3 text-indigo-400 font-black text-lg group-hover:gap-4 transition-all"
                >
                  Use this style
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
