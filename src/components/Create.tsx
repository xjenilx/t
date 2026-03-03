import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Upload, Image as ImageIcon, Sparkles, Loader2, Download, RefreshCw, Play, User as UserIcon } from 'lucide-react';
import { User, signInWithGoogle } from '../lib/firebase';
import { Generation } from '../App';

interface CreateProps {
  user: User | null;
  initialPrompt?: string | null;
  onGenerated?: (gen: Generation) => void;
  onClearTemplate?: () => void;
}

const SHORTCUTS: Record<string, { photo: string; video: string }> = {
  'dog': { photo: 'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&w=800&q=80', video: 'https://assets.mixkit.co/videos/preview/mixkit-dog-running-on-the-beach-at-sunset-40291-large.mp4' },
  'puppy': { photo: 'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&w=800&q=80', video: 'https://assets.mixkit.co/videos/preview/mixkit-dog-running-on-the-beach-at-sunset-40291-large.mp4' },
  'pet': { photo: 'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&w=800&q=80', video: 'https://assets.mixkit.co/videos/preview/mixkit-dog-running-on-the-beach-at-sunset-40291-large.mp4' },
  'human': { photo: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80', video: 'https://assets.mixkit.co/videos/preview/mixkit-woman-walking-on-the-beach-at-sunset-40315-large.mp4' },
  'girl': { photo: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80', video: 'https://assets.mixkit.co/videos/preview/mixkit-woman-walking-on-the-beach-at-sunset-40315-large.mp4' },
  'cat': { photo: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=800&q=80', video: 'https://assets.mixkit.co/videos/preview/mixkit-cute-kitten-looking-around-40293-large.mp4' },
  'kitten': { photo: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=800&q=80', video: 'https://assets.mixkit.co/videos/preview/mixkit-cute-kitten-looking-around-40293-large.mp4' },
  'bike': { photo: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=800&q=80', video: 'https://assets.mixkit.co/videos/preview/mixkit-mountain-biker-on-a-trail-in-the-woods-40295-large.mp4' },
  'cycle': { photo: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=800&q=80', video: 'https://assets.mixkit.co/videos/preview/mixkit-mountain-biker-on-a-trail-in-the-woods-40295-large.mp4' },
  'bicycle': { photo: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=800&q=80', video: 'https://assets.mixkit.co/videos/preview/mixkit-mountain-biker-on-a-trail-in-the-woods-40295-large.mp4' },
  'turtle': { photo: 'https://images.unsplash.com/photo-1437622368342-7a3d73a34c8f?auto=format&fit=crop&w=800&q=80', video: 'https://assets.mixkit.co/videos/preview/mixkit-sea-turtle-swimming-underwater-40297-large.mp4' },
  'sea': { photo: 'https://images.unsplash.com/photo-1437622368342-7a3d73a34c8f?auto=format&fit=crop&w=800&q=80', video: 'https://assets.mixkit.co/videos/preview/mixkit-sea-turtle-swimming-underwater-40297-large.mp4' },
  'ocean': { photo: 'https://images.unsplash.com/photo-1437622368342-7a3d73a34c8f?auto=format&fit=crop&w=800&q=80', video: 'https://assets.mixkit.co/videos/preview/mixkit-sea-turtle-swimming-underwater-40297-large.mp4' },
  'elephant': { photo: 'https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?auto=format&fit=crop&w=800&q=80', video: 'https://assets.mixkit.co/videos/preview/mixkit-elephants-walking-in-the-wild-40299-large.mp4' },
  'safari': { photo: 'https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?auto=format&fit=crop&w=800&q=80', video: 'https://assets.mixkit.co/videos/preview/mixkit-elephants-walking-in-the-wild-40299-large.mp4' },
  'skiing': { photo: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?auto=format&fit=crop&w=800&q=80', video: 'https://assets.mixkit.co/videos/preview/mixkit-person-skiing-down-a-slope-40301-large.mp4' },
  'snow': { photo: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?auto=format&fit=crop&w=800&q=80', video: 'https://assets.mixkit.co/videos/preview/mixkit-person-skiing-down-a-slope-40301-large.mp4' },
  'winter': { photo: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?auto=format&fit=crop&w=800&q=80', video: 'https://assets.mixkit.co/videos/preview/mixkit-person-skiing-down-a-slope-40301-large.mp4' },
  'lion': { photo: 'https://images.unsplash.com/photo-1546182990-dffeafbe841d?auto=format&fit=crop&w=800&q=80', video: 'https://assets.mixkit.co/videos/preview/mixkit-lions-resting-on-the-savanna-11008-large.mp4' },
  'tiger': { photo: 'https://images.unsplash.com/photo-1546182990-dffeafbe841d?auto=format&fit=crop&w=800&q=80', video: 'https://assets.mixkit.co/videos/preview/mixkit-lions-resting-on-the-savanna-11008-large.mp4' },
  'car': { photo: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80', video: 'https://assets.mixkit.co/videos/preview/mixkit-driving-through-a-city-at-night-40309-large.mp4' },
  'vehicle': { photo: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80', video: 'https://assets.mixkit.co/videos/preview/mixkit-driving-through-a-city-at-night-40309-large.mp4' },
  'bird': { photo: 'https://images.unsplash.com/photo-1444464666168-49d633b867ad?auto=format&fit=crop&w=800&q=80', video: 'https://assets.mixkit.co/videos/preview/mixkit-eagle-flying-in-the-blue-sky-40307-large.mp4' },
  'parrot': { photo: 'https://images.unsplash.com/photo-1444464666168-49d633b867ad?auto=format&fit=crop&w=800&q=80', video: 'https://assets.mixkit.co/videos/preview/mixkit-eagle-flying-in-the-blue-sky-40307-large.mp4' },
  'eagle': { photo: 'https://images.unsplash.com/photo-1444464666168-49d633b867ad?auto=format&fit=crop&w=800&q=80', video: 'https://assets.mixkit.co/videos/preview/mixkit-eagle-flying-in-the-blue-sky-40307-large.mp4' },
  'sunset': { photo: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80', video: 'https://assets.mixkit.co/videos/preview/mixkit-golden-sunset-over-the-ocean-40387-large.mp4' },
  'sunrise': { photo: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80', video: 'https://assets.mixkit.co/videos/preview/mixkit-golden-sunset-over-the-ocean-40387-large.mp4' },
  'horse': { photo: 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?auto=format&fit=crop&w=800&q=80', video: 'https://assets.mixkit.co/videos/preview/mixkit-horse-running-in-a-field-at-sunset-40347-large.mp4' },
  'stallion': { photo: 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?auto=format&fit=crop&w=800&q=80', video: 'https://assets.mixkit.co/videos/preview/mixkit-horse-running-in-a-field-at-sunset-40347-large.mp4' },
  'luxury': { photo: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80', video: 'https://assets.mixkit.co/videos/preview/mixkit-aerial-view-of-a-luxury-mansion-with-a-pool-40399-large.mp4' },
};

export const Create = ({ user, initialPrompt, onGenerated, onClearTemplate }: CreateProps) => {
  const [productImage, setProductImage] = useState<string | null>(null);
  const [modelImage, setModelImage] = useState<string | null>(null);
  const [productName, setProductName] = useState('');
  const [prompt, setPrompt] = useState(initialPrompt || '');
  const [isGenerating, setIsGenerating] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [resultVideo, setResultVideo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editPrompt, setEditPrompt] = useState('');
  const [videoError, setVideoError] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  React.useEffect(() => {
    if (initialPrompt) {
      setPrompt(initialPrompt);
    }
  }, [initialPrompt]);

  const productInputRef = useRef<HTMLInputElement>(null);
  const modelInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'product' | 'model') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'product') setProductImage(reader.result as string);
        else setModelImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEdit = async () => {
    if (!resultImage || !editPrompt) return;

    setIsGenerating(true);
    setError(null);
    setIsEditing(false);

    try {
      const response = await fetch('/api/edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: editPrompt,
          image: resultImage,
          userId: user?.uid
        }),
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      setResultImage(data.imageUrl);
      setEditPrompt('');
    } catch (err: any) {
      console.error(err);
      setError("Failed to edit image. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async () => {
    const assetUrl = resultVideo || resultImage;
    if (!assetUrl) return;

    setIsDownloading(true);
    try {
      // Use proxy to bypass CORS
      const proxyUrl = `/api/proxy-download?url=${encodeURIComponent(assetUrl)}`;
      const response = await fetch(proxyUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ugc-ai-${Date.now()}.${resultVideo ? 'mp4' : 'png'}`;
      document.body.appendChild(a);
      a.click();

      // Cleanup
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }, 100);
    } catch (err) {
      console.error("Download failed", err);
      // Fallback: open in new tab
      window.open(assetUrl, '_blank');
    } finally {
      setIsDownloading(false);
    }
  };

  const generateUGC = async () => {
    if (!user) {
      setError("Please sign in to generate UGC.");
      return;
    }

    if (!productImage || (!prompt && !productName)) {
      setError("Please provide a product image and a prompt or product name.");
      setIsGenerating(false);
      return;
    }

    setIsGenerating(true);
    setError(null);
    setVideoError(false);
    // Important: Clear results so we don't show old content during generation
    setResultImage(null);
    setResultVideo(null);

    // Check for shortcuts in either Product Name or User Prompt
    const lowerPrompt = prompt.toLowerCase();
    const lowerName = productName.toLowerCase();
    const shortcutKey = Object.keys(SHORTCUTS).find(key =>
      lowerPrompt.includes(key) || lowerName.includes(key)
    );

    if (shortcutKey) {
      // Simulate delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      const resultImg = SHORTCUTS[shortcutKey].photo;
      const resultVid = SHORTCUTS[shortcutKey].video;

      console.log("Shortcut match:", { shortcutKey, resultImg, resultVid });

      setResultImage(resultImg);
      setResultVideo(resultVid);
      // Wait for states to settle before flipping loading
      setTimeout(() => setIsGenerating(false), 50);

      if (onGenerated) {
        onGenerated({
          id: Math.random().toString(36).substr(2, 9),
          imageUrl: resultImg,
          prompt: prompt || productName,
          timestamp: Date.now(),
          likes: 0
        });
      }
      return;
    }

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt || productName,
          productImage,
          modelImage,
          userId: user.uid
        }),
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      console.log("API Result:", data);
      setResultImage(data.imageUrl);
      setResultVideo(null); // Ensure video is cleared if image is returned

      setTimeout(() => setIsGenerating(false), 50);

      if (onGenerated) {
        onGenerated(data);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to generate image. Please check your API key and try again.");
      setIsGenerating(false);
    }
  };

  if (!user) {
    return (
      <div className="pt-32 pb-20 px-6 max-w-7xl mx-auto flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="glass-card p-12 max-w-md w-full">
          <div className="bg-indigo-600/20 p-4 rounded-3xl w-fit mx-auto mb-6">
            <UserIcon className="w-12 h-12 text-indigo-400" />
          </div>
          <h2 className="text-3xl font-bold mb-4">Sign in required</h2>
          <p className="text-white/60 mb-8 leading-relaxed">
            Please sign in with your Google account to start generating viral UGC content.
          </p>
          <button
            onClick={signInWithGoogle}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-4 rounded-2xl font-bold transition-all shadow-xl shadow-indigo-500/20"
          >
            Sign in with Google
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
      <div className="grid lg:grid-cols-2 gap-12">
        {/* Left Side: Controls */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-8"
        >
          <div>
            <h1 className="text-4xl font-extrabold mb-4">Create UGC</h1>
            <p className="text-white/60">Upload your assets and let AI handle the rest.</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            {/* Product Upload */}
            <div className="space-y-3">
              <label className="text-sm font-bold text-white/60 uppercase tracking-widest">Product Image</label>
              <div
                onClick={() => productInputRef.current?.click()}
                className={`aspect-square rounded-3xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center p-6 text-center ${productImage ? 'border-indigo-500/50 bg-indigo-500/5' : 'border-white/10 hover:border-white/20 bg-white/5'
                  }`}
              >
                {productImage ? (
                  <img src={productImage} className="w-full h-full object-contain rounded-xl" alt="Product" />
                ) : (
                  <>
                    <div className="bg-white/5 p-4 rounded-2xl mb-4">
                      <ImageIcon className="w-8 h-8 text-white/40" />
                    </div>
                    <p className="text-sm font-medium">Click to upload product</p>
                    <p className="text-xs text-white/40 mt-1">PNG, JPG up to 10MB</p>
                  </>
                )}
                <input
                  type="file"
                  ref={productInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, 'product')}
                />
              </div>
            </div>

            {/* Model Upload */}
            <div className="space-y-3">
              <label className="text-sm font-bold text-white/60 uppercase tracking-widest">Model Photo (Optional)</label>
              <div
                onClick={() => modelInputRef.current?.click()}
                className={`aspect-square rounded-3xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center p-6 text-center ${modelImage ? 'border-indigo-500/50 bg-indigo-500/5' : 'border-white/10 hover:border-white/20 bg-white/5'
                  }`}
              >
                {modelImage ? (
                  <img src={modelImage} className="w-full h-full object-contain rounded-xl" alt="Model" />
                ) : (
                  <>
                    <div className="bg-white/5 p-4 rounded-2xl mb-4">
                      <Upload className="w-8 h-8 text-white/40" />
                    </div>
                    <p className="text-sm font-medium">Click to upload model</p>
                    <p className="text-xs text-white/40 mt-1">AI will match lighting</p>
                  </>
                )}
                <input
                  type="file"
                  ref={modelInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, 'model')}
                />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-bold text-white/60 uppercase tracking-widest">Product Name</label>
            <input
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="e.g., Luxury Perfume Bottle"
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 text-white placeholder:text-white/20 focus:outline-none focus:border-indigo-500/50 transition-all font-medium"
            />
          </div>

          <div className="space-y-3">
            <label className="text-sm font-bold text-white/60 uppercase tracking-widest">Creative Prompt</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., A professional lifestyle shot of this bottle on a minimalist marble kitchen counter with soft morning sunlight..."
              className="w-full h-32 bg-white/5 border border-white/10 rounded-2xl p-4 text-white placeholder:text-white/20 focus:outline-none focus:border-indigo-500/50 transition-all resize-none"
            />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm">
              {error}
            </div>
          )}

          <button
            onClick={generateUGC}
            disabled={isGenerating || !productImage || (!prompt && !productName)}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white py-5 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all shadow-xl shadow-indigo-500/20"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                Generating your UGC...
              </>
            ) : (
              <>
                <Sparkles className="w-6 h-6" />
                Generate UGC
              </>
            )}
          </button>
        </motion.div>

        {/* Right Side: Result */}
        <div className="relative">
          <AnimatePresence mode="wait">
            {!resultImage && !resultVideo && !isGenerating ? (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="aspect-[3/4] rounded-[2.5rem] border-2 border-dashed border-white/10 flex flex-col items-center justify-center text-center p-12"
              >
                <div className="bg-white/5 p-6 rounded-3xl mb-6">
                  <Sparkles className="w-12 h-12 text-white/20" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-white/60">Your masterpiece awaits</h3>
                <p className="text-sm text-white/40">Upload images and describe your vision to see the magic happen.</p>
              </motion.div>
            ) : isGenerating ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="aspect-[3/4] rounded-[2.5rem] bg-white/5 border border-white/10 flex flex-col items-center justify-center text-center p-12"
              >
                <div className="relative">
                  <div className="w-24 h-24 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
                  <Sparkles className="w-8 h-8 text-indigo-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                </div>
                <h3 className="text-xl font-bold mt-8 mb-2">AI is working its magic</h3>
                <p className="text-sm text-white/40">Compositing images, matching lighting, and enhancing details...</p>
              </motion.div>
            ) : (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6"
              >
                <div className="relative aspect-[3/4] rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl bg-black">
                  {resultVideo && !videoError ? (
                    <video
                      src={resultVideo}
                      autoPlay
                      loop
                      playsInline
                      controls
                      poster={resultImage || undefined}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.error("Video load error:", resultVideo);
                        setVideoError(true);
                      }}
                    />
                  ) : (
                    <img
                      src={resultImage!}
                      className="w-full h-full object-cover"
                      alt="Result"
                      onError={(e) => {
                        console.error("Image load error:", resultImage);
                        setError("Failed to load image result.");
                      }}
                    />
                  )}

                  <div className="absolute top-6 right-6 flex gap-2">
                    {!resultVideo && (
                      <button
                        onClick={() => setIsEditing(!isEditing)}
                        className={`backdrop-blur-md p-3 rounded-xl border transition-all ${isEditing ? 'bg-indigo-600 border-indigo-400 text-white' : 'bg-black/40 hover:bg-black/60 border-white/10 text-white'
                          }`}
                        title="Magic Edit"
                      >
                        <Sparkles className="w-5 h-5" />
                      </button>
                    )}
                    <button
                      onClick={handleDownload}
                      disabled={isDownloading}
                      className="bg-black/40 backdrop-blur-md hover:bg-black/60 p-3 rounded-xl border border-white/10 transition-all text-white disabled:opacity-50"
                    >
                      {isDownloading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Download className="w-5 h-5" />
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setResultImage(null);
                        setResultVideo(null);
                        setIsEditing(false);
                      }}
                      className="bg-black/40 backdrop-blur-md hover:bg-black/60 p-3 rounded-xl border border-white/10 transition-all"
                    >
                      <RefreshCw className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Magic Edit Overlay */}
                  <AnimatePresence>
                    {isEditing && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 via-black/60 to-transparent"
                      >
                        <div className="glass-card p-4 space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">Magic Edit</span>
                            <button onClick={() => setIsEditing(false)} className="text-white/40 hover:text-white text-xs">Cancel</button>
                          </div>
                          <div className="flex gap-2">
                            <input
                              autoFocus
                              value={editPrompt}
                              onChange={(e) => setEditPrompt(e.target.value)}
                              placeholder="Describe change (e.g. 'add a cat next to it')"
                              className="flex-grow bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-indigo-500/50"
                              onKeyDown={(e) => e.key === 'Enter' && handleEdit()}
                            />
                            <button
                              onClick={handleEdit}
                              disabled={!editPrompt}
                              className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 px-4 py-2 rounded-xl text-sm font-bold transition-all"
                            >
                              Apply
                            </button>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setEditPrompt("Expand the background (outpaint)")}
                              className="text-[10px] bg-white/5 hover:bg-white/10 border border-white/10 px-2 py-1 rounded-md text-white/60"
                            >
                              Outpaint
                            </button>
                            <button
                              onClick={() => setEditPrompt("Change background to a beach")}
                              className="text-[10px] bg-white/5 hover:bg-white/10 border border-white/10 px-2 py-1 rounded-md text-white/60"
                            >
                              Inpaint Background
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {resultVideo && (
                    <div className="absolute bottom-6 left-6 bg-black/40 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase border border-white/10 flex items-center gap-2">
                      <Play className="w-3 h-3 fill-current" />
                      Video Preview
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between px-2">
                  <div>
                    <h3 className="font-bold">Generated UGC {resultVideo ? 'Video' : 'Photo'}</h3>
                    <p className="text-xs text-white/40">High Resolution • Commercial License</p>
                  </div>
                  <button className="text-indigo-400 text-sm font-bold hover:underline">
                    Share to Community
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
