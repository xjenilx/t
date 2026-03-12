import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Upload, Palette, Type, ShieldCheck, Plus, Trash2 } from 'lucide-react';
import { User } from '../lib/firebase';

interface BrandKitProps {
  user: User | null;
}

export const BrandKit = ({ user }: BrandKitProps) => {
  const [colors, setColors] = useState(['#6366f1', '#a855f7', '#050505']);
  const [logos, setLogos] = useState<string[]>([]);
  const [typography, setTypography] = useState({ primary: 'Inter', display: 'Inter Bold' });
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingLogo, setIsGeneratingLogo] = useState(false);

  React.useEffect(() => {
    if (user) {
      fetch(`/api/brand-kit/${user.uid}`)
        .then(res => res.json())
        .then(data => {
          if (data.colors) setColors(data.colors);
          if (data.logos) setLogos(data.logos);
          if (data.typography) setTypography(data.typography);
        })
        .catch(err => console.error("Failed to fetch brand kit", err));
    }
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      await fetch('/api/brand-kit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.uid,
          colors,
          logos,
          typography
        })
      });
    } catch (err) {
      console.error("Failed to save brand kit", err);
    } finally {
      setIsSaving(false);
    }
  };

  const generateAiLogo = async () => {
    setIsGeneratingLogo(true);
    // Simulate AI generation with high-quality logo placeholders
    const logoFallbacks = [
      'https://images.unsplash.com/photo-1599305445671-ac291c95aba9?auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1599305445671-ac291c95aba9?auto=format&fit=crop&w=400&q=80', // Placeholder for now
      'https://api.placeholder.com/400x400/6366f1/ffffff?text=MAKE+UGCAD'
    ];
    await new Promise(resolve => setTimeout(resolve, 1500));
    const newLogo = logoFallbacks[Math.floor(Math.random() * logoFallbacks.length)];
    setLogos(prev => [...prev, newLogo]);
    setIsGeneratingLogo(false);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogos(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    }
  };

  if (!user) {
    return (
      <div className="pt-32 px-6 max-w-7xl mx-auto text-center">
        <h1 className="text-4xl font-bold mb-4">Brand Kit</h1>
        <p className="text-muted">Please sign in to manage your brand kit.</p>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-20 px-6 max-w-5xl mx-auto">
      <div className="mb-12">
        <h1 className="text-4xl font-extrabold mb-4">Brand Kit</h1>
        <p className="text-secondary">Maintain brand consistency across all your AI-generated UGC.</p>
      </div>

      <div className="space-y-12">
        {/* Logos Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-500/20 p-2 rounded-lg">
                <Upload className="w-5 h-5 text-indigo-400" />
              </div>
              <h2 className="text-2xl font-bold">Logos</h2>
            </div>
            <div className="flex gap-2">
              <button
                onClick={generateAiLogo}
                disabled={isGeneratingLogo}
                className="bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 border border-indigo-500/20"
              >
                {isGeneratingLogo ? <div className="w-4 h-4 border-2 border-indigo-400/20 border-t-indigo-400 rounded-full animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                Generate AI Logo
              </button>
              <label className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-sm font-bold cursor-pointer transition-all flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Upload Logo
                <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
              </label>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {logos.map((logo, i) => (
              <div key={i} className="glass-card aspect-square p-6 relative group">
                <img src={logo} className="w-full h-full object-contain" alt="Brand Logo" />
                <button
                  onClick={() => setLogos(prev => prev.filter((_, idx) => idx !== i))}
                  className="absolute top-2 right-2 p-1.5 bg-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-4 h-4 text-white" />
                </button>
              </div>
            ))}
            <label className="glass-card aspect-square flex flex-col items-center justify-center border-2 border-dashed border-dim hover:border-white/20 cursor-pointer transition-all">
              <Plus className="w-8 h-8 text-muted mb-2" />
              <span className="text-xs text-muted">Add Logo</span>
              <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
            </label>
          </div>
        </section>

        {/* Colors Section */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-pink-500/20 p-2 rounded-lg">
              <Palette className="w-5 h-5 text-pink-400" />
            </div>
            <h2 className="text-2xl font-bold">Brand Colors</h2>
          </div>

          <div className="flex flex-wrap gap-6">
            {colors.map((color, i) => (
              <div key={i} className="flex flex-col gap-3">
                <div
                  className="w-24 h-24 rounded-2xl border border-dim shadow-lg"
                  style={{ backgroundColor: color }}
                />
                <input
                  type="text"
                  value={color}
                  onChange={(e) => {
                    const newColors = [...colors];
                    newColors[i] = e.target.value;
                    setColors(newColors);
                  }}
                  className="bg-[var(--glass-bg)] border border-dim rounded-lg px-3 py-1.5 text-xs text-center focus:outline-none focus:border-indigo-500/50"
                />
              </div>
            ))}
            <button
              onClick={() => setColors(prev => [...prev, '#ffffff'])}
              className="w-24 h-24 rounded-2xl border-2 border-dashed border-dim hover:border-white/20 flex items-center justify-center transition-all"
            >
              <Plus className="w-6 h-6 text-muted" />
            </button>
          </div>
        </section>

        {/* Typography Section */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-emerald-500/20 p-2 rounded-lg">
              <Type className="w-5 h-5 text-emerald-400" />
            </div>
            <h2 className="text-2xl font-bold">Typography</h2>
          </div>

          <div className="glass-card p-8 space-y-6">
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-muted mb-3 block">Primary Font</label>
              <div className="flex items-center justify-between p-4 bg-[var(--glass-bg)] rounded-xl border border-dim">
                <span className="text-xl font-bold">Inter</span>
                <span className="text-xs text-indigo-400 font-bold uppercase tracking-widest">Default</span>
              </div>
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-muted mb-3 block">Display Font</label>
              <div className="flex items-center justify-between p-4 bg-[var(--glass-bg)] rounded-xl border border-dim">
                <span className="text-xl font-extrabold tracking-tight">Inter Bold</span>
                <button className="text-xs text-muted hover:text-white transition-colors">Change</button>
              </div>
            </div>
          </div>
        </section>

        <div className="pt-8 border-t border-white/5 flex justify-end">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-2 transition-all shadow-xl shadow-indigo-500/20"
          >
            {isSaving ? (
              <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <ShieldCheck className="w-5 h-5" />
            )}
            {isSaving ? 'Saving...' : 'Save Brand Kit'}
          </button>
        </div>
      </div>
    </div>
  );
};
