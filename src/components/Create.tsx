import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Camera, Package, Wand2, Video, CheckCircle,
  Upload, Download, RefreshCw, Play, Loader2,
  ArrowRight, ChevronRight, Sparkles, Image as ImageIcon
} from 'lucide-react';
import { User, signInWithGoogle } from '../lib/firebase';
import { Generation } from '../App';

interface CreateProps {
  user: User | null;
  initialPrompt?: string | null;
  onGenerated?: (gen: Generation) => void;
  onClearTemplate?: () => void;
}

type Stage = 'upload' | 'generating-image' | 'preview-image' | 'generating-video' | 'final';
const STAGE_ORDER: Stage[] = ['upload', 'generating-image', 'preview-image', 'generating-video', 'final'];

const PIPELINE_STEPS = [
  { id: 'upload', icon: Upload, label: 'Upload', color: 'indigo' },
  { id: 'generating-image', icon: Wand2, label: 'AI Image', color: 'purple' },
  { id: 'preview-image', icon: ImageIcon, label: 'Preview', color: 'pink' },
  { id: 'generating-video', icon: Video, label: 'AI Video', color: 'rose' },
  { id: 'final', icon: CheckCircle, label: 'Done!', color: 'emerald' },
];

const IMAGE_STATUS_MSGS = [
  'Kimi AI is analyzing your photos…',
  'Crafting a cinematic Flux.1 prompt…',
  'Hugging Face Inference is starting…',
  'Pollinations AI is rendering…',
  'Applying lifestyle lighting…',
  'Almost ready…',
];

const VIDEO_STATUS_MSGS = [
  'Loading your AI photo…',
  'Building Ken Burns animation…',
  'Rendering cinematic motion…',
  'Adding vignette & depth…',
  'Encoding video frames…',
  'Encoding video frames…',
  'Finalising promo video…',
];

const MODERN_CAMPAIGNS = [
  { id: 'none', label: 'None (Default)', prompt: '' },

  // Brand Ambassadors
  { id: 'cadbury_srk', label: 'Cadbury SRK Deepfake', prompt: 'Shah Rukh Khan as brand ambassador looking at the camera, local Indian neighborhood kirana store background, personalized local ad style' },
  { id: 'ageas_sachin', label: 'Ageas Young Sachin', prompt: '11-year-old young boy resembling young Sachin Tendulkar looking confident, 1980s retro Mumbai cricket background, "Future Fearless" theme' },
  { id: 'zomato_hrithik', label: 'Zomato Hrithik', prompt: 'Hrithik Roshan holding the product, smiling and recommending it, Indian local restaurant background, food delivery ad style' },
  { id: 'charaka', label: 'CharakaVeda Zara', prompt: 'Zara Shatavari AI brand ambassador, cinematic mythological Indian theme, traditional elegance mixed with futuristic AI character setting' },

  // Cinematic / Elements
  { id: 'sultry_noir', label: 'Sultry Noir Perfume', prompt: 'black and white aesthetic, slow-motion liquid splashes, marble pedestal, mysterious silhouette walking past in the background, high-end luxurious perfume ad' },
  { id: 'stadium_power', label: 'Stadium Power', prompt: 'stadium night crowd background with flashing lights, glowing energy streaks and sparks coming off the product, winning shot, high-energy sports brand ad' },
  { id: 'levitating_luxury', label: 'Levitating Luxury', prompt: 'surreal gravity-defying scene, product floating among liquid gold and mercury droplets, expensive high-tech luxury ad, studio lighting' },
  { id: 'masala_burst', label: 'Masala Burst Food', prompt: 'slow-motion cinematic explosion of ingredients, red chilli powder, yellow turmeric, water splashes swirling around product, vibrant Indian food appetizing ad' },
  { id: 'mountain_fresh', label: 'Mountain Fresh', prompt: 'crystal-clear Himalayan stream background, product emerging from ice-cold water, hyper-realistic cold fog and condensation droplets on the surface, refreshing beverage ad' },
  { id: 'fabric_flow', label: 'Fabric Flow Fashion', prompt: 'giant flowing ribbons of smooth silk wrapping around the product, moving like a graceful dancer in the wind, elegant fashion lifestyle photography' },

  // Aesthetic / Locations
  { id: 'zomato_dolly', label: 'Street Food Cinematic', prompt: 'hyper-realistic vibrant Indian night market background, dolly zoom effect making the product pop, blurred bokeh colorful street lights, premium product photography' },
  { id: 'royal_heritage', label: 'Royal Heritage', prompt: 'inside a luxurious Mughal palace or Rajasthani Haveli, warm candle-lit lighting, rich silk textures, royal Indian aesthetic, premium jewelry luxury ad' },
  { id: 'cyberpunk_mumbai', label: 'Cyberpunk Mumbai', prompt: 'futuristic 2077 Mumbai cyberpunk setting, neon Hindi signboards, flying rickshaws in background, sci-fi tech ad, futuristic lighting' },
  { id: 'emami', label: 'Sci-Fi Neon', prompt: 'futuristic sci-fi environment, neon lights, high-tech FMCG product showcase, cyberpunk India' },

  // Quirky
  { id: 'fevikwik_quirky', label: 'Quirky Comedy', prompt: 'quirky comedic ad, two impossible objects stuck together, brightly colored minimalist studio background, humorous surreal conceptual photography' },
];

export const Create = ({ user, initialPrompt, onGenerated, onClearTemplate }: CreateProps) => {
  const [stage, setStage] = useState<Stage>('upload');
  const [userImage, setUserImage] = useState<string | null>(null);
  const [productImage, setProductImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState(initialPrompt || '');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [generatedVideo, setGeneratedVideo] = useState<string | null>(null);
  const [generationId, setGenerationId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [imageProgress, setImageProgress] = useState(0);
  const [videoProgress, setVideoProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState<'photo' | 'video' | null>(null);
  const [imageLoadError, setImageLoadError] = useState(false);
  const [imgStatusMsg, setImgStatusMsg] = useState(IMAGE_STATUS_MSGS[0]);
  const [vidStatusMsg, setVidStatusMsg] = useState(VIDEO_STATUS_MSGS[0]);
  const [campaignTheme, setCampaignTheme] = useState('none');
  const [motionStyle, setMotionStyle] = useState('smart');
  const [adCopy, setAdCopy] = useState<string[]>([]);
  const [isGeneratingCopy, setIsGeneratingCopy] = useState(false);

  const userInputRef = useRef<HTMLInputElement>(null);
  const productInputRef = useRef<HTMLInputElement>(null);
  const blobUrlRef = useRef<string | null>(null); // track video blob for cleanup

  React.useEffect(() => {
    if (initialPrompt) { setPrompt(initialPrompt); onClearTemplate?.(); }
  }, [initialPrompt]);

  /* ── helpers ── */
  const readFile = (file: File): Promise<string> =>
    new Promise((res, rej) => {
      const r = new FileReader();
      r.onloadend = () => res(r.result as string);
      r.onerror = rej;
      r.readAsDataURL(file);
    });

  const animateProgress = (setter: (v: number) => void): ReturnType<typeof setInterval> => {
    let v = 0;
    return setInterval(() => {
      v += Math.random() * 6 + 1.5;
      if (v >= 88) v = 88;
      setter(v);
    }, 400);
  };

  const cycleMessages = (msgs: string[], setter: (m: string) => void): ReturnType<typeof setInterval> => {
    let i = 0;
    setter(msgs[0]);
    return setInterval(() => {
      i = (i + 1) % msgs.length;
      setter(msgs[i]);
    }, 2800);
  };

  /* ── upload handler ── */
  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>, type: 'user' | 'product') => {
    const file = e.target.files?.[0];
    if (!file) return;
    const b64 = await readFile(file);
    if (type === 'user') setUserImage(b64);
    else setProductImage(b64);
  };

  /* ── Ken Burns video generator (client-side Canvas + MediaRecorder) ── */
  const generateKenBurnsVideo = (imageSources: string | string[], style: string, onProgress: (p: number) => void): Promise<string> => {
    return new Promise((resolve, reject) => {
      const sources = Array.isArray(imageSources) ? imageSources : [imageSources];
      const images: HTMLImageElement[] = [];
      let loadedCount = 0;

      const startRecording = () => {
        const W = 480, H = 854; // 9:16 portrait
        const canvas = document.createElement('canvas');
        canvas.width = W;
        canvas.height = H;
        const ctx = canvas.getContext('2d')!;

        const fps = 25;
        const durationSec = 6;
        const totalFrames = fps * durationSec;

        const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
          ? 'video/webm;codecs=vp9'
          : 'video/webm';

        const stream = canvas.captureStream(fps);
        const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 3_000_000 });
        const chunks: Blob[] = [];

        recorder.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data); };
        recorder.onstop = () => {
          const blob = new Blob(chunks, { type: 'video/webm' });
          const url = URL.createObjectURL(blob);
          blobUrlRef.current = url;
          resolve(url);
        };

        recorder.start(200);

        let frame = 0;
        const drawFrame = () => {
          if (frame >= totalFrames) { recorder.stop(); return; }

          const t = frame / totalFrames;
          const eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

          ctx.clearRect(0, 0, W, H);

          // Slideshow Logic
          const imgCount = images.length;
          const displayFrame = (img: HTMLImageElement, alpha: number, progress: number) => {
            const imgAspect = img.width / img.height;
            const canvasAspect = W / H;
            let sx = 0, sy = 0, sw = img.width, sh = img.height;
            if (imgAspect > canvasAspect) {
              sw = img.height * canvasAspect;
              sx = (img.width - sw) / 2;
            } else {
              sh = img.width / canvasAspect;
              sy = (img.height - sh) / 2;
            }

            // Camera Motion logic
            let scale = 1;
            let panX = 0;
            let panY = 0; // Added for consistency, though not used in user's snippet for displayFrame
            if (style === 'zoom-in') scale = 1 + 0.25 * progress;
            else if (style === 'zoom-out') scale = 1.25 - 0.25 * progress;
            else if (style === 'pan-left') { scale = 1.15; panX = 0.08 * (1 - 2 * progress); }
            else if (style === 'pan-right') { scale = 1.15; panX = 0.08 * (2 * progress - 1); }
            else { scale = 1 + 0.18 * progress; panX = 0.025 * Math.sin(progress * Math.PI); }

            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.translate(W / 2 + panX * W, H / 2 + panY * H); // Use panY here
            ctx.scale(scale, scale);
            ctx.translate(-W / 2, -H / 2);
            ctx.drawImage(img, sx, sy, sw, sh, 0, 0, W, H);
            ctx.restore();
          };

          if (imgCount === 1) {
            displayFrame(images[0], 1, eased);
          } else {
            // Two images SlideShow with Cross-fade
            if (t < 0.45) {
              displayFrame(images[0], 1, t / 0.45);
            } else if (t > 0.55) {
              displayFrame(images[1], 1, (t - 0.55) / 0.45);
            } else {
              // Transition window (0.45 to 0.55)
              const transitionT = (t - 0.45) / 0.1;
              displayFrame(images[0], 1 - transitionT, 1);
              displayFrame(images[1], transitionT, 0);
            }
          }

          // Subtle radial vignette
          const vignette = ctx.createRadialGradient(W / 2, H / 2, H * 0.22, W / 2, H / 2, H * 0.82);
          vignette.addColorStop(0, 'rgba(0,0,0,0)');
          vignette.addColorStop(1, 'rgba(0,0,0,0.28)');
          ctx.fillStyle = vignette;
          ctx.fillRect(0, 0, W, H);

          // Cinematic bars fade in during last 20%
          if (t > 0.8) {
            const alphaLine = ((t - 0.8) / 0.2) * 0.55;
            const barH = Math.round(H * 0.065);
            ctx.fillStyle = `rgba(0,0,0,${alphaLine})`;
            ctx.fillRect(0, 0, W, barH);
            ctx.fillRect(0, H - barH, W, barH);
          }

          onProgress(Math.min(97, Math.floor((frame / totalFrames) * 100)));
          frame++;
          setTimeout(drawFrame, 1000 / fps);
        };

        drawFrame();
      };

      sources.forEach((src, idx) => {
        const img = new Image();
        img.onload = () => {
          images[idx] = img;
          loadedCount++;
          if (loadedCount === sources.length) startRecording();
        };
        img.onerror = reject;
        img.src = src;
      });
    });
  };

  /* ── STEP 1 → STEP 2: Generate composite image ── */
  const generateImage = async () => {
    if (!userImage || !productImage) {
      setError('Please upload both your photo and the product photo.');
      return;
    }
    setError(null);
    setImageProgress(0);
    setStage('generating-image');
    const timer = animateProgress(setImageProgress);
    const msgTimer = cycleMessages(IMAGE_STATUS_MSGS, setImgStatusMsg);

    try {
      const selectedCampaignPrompt = MODERN_CAMPAIGNS.find(c => c.id === campaignTheme)?.prompt || '';
      const fullPrompt = campaignTheme !== 'none'
        ? `${selectedCampaignPrompt}. Additional user context: ${prompt}`
        : prompt;

      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: fullPrompt, productImage, userImage, userId: user?.uid || 'anonymous' }),
      });
      const data = await res.json();
      clearInterval(timer);
      clearInterval(msgTimer);
      if (data.error) throw new Error(data.error);
      setImageProgress(100);
      setImgStatusMsg('AI photo ready! ✨');
      setGeneratedImage(data.imageUrl);
      setGenerationId(data.id);
      setImageLoadError(false);
      if (onGenerated) onGenerated(data);

      // Auto-trigger video generation!
      setTimeout(() => generateVideo(data.imageUrl, data.id), 600);
      // Auto-trigger ad copy generation!
      setTimeout(() => generateAdCopy(), 1200);
    } catch (err: any) {
      clearInterval(timer);
      clearInterval(msgTimer);
      setError(err.message || 'Image generation failed — please try again.');
      setStage('upload');
    }
  };

  /* ── Bypass AI: Use Original Photo ── */
  const useOriginalPhoto = () => {
    const photosToUse: string[] = [];
    if (userImage) photosToUse.push(userImage);
    if (productImage) photosToUse.push(productImage);

    if (photosToUse.length === 0) {
      setError('Please upload at least one photo first.');
      return;
    }
    setError(null);
    setGeneratedImage(photosToUse[0]);
    // Give it a pseudo generation ID
    const pseudoId = 'orig-' + Math.random().toString(36).substr(2, 9);
    setGenerationId(pseudoId);
    setStage('preview-image');
    // Auto-trigger video generation
    setTimeout(() => generateVideo(photosToUse, pseudoId), 600);
  };

  /* ── STEP 3 → STEP 4: Generate video ── */
  const generateVideo = async (overrideImageUrl?: string | string[], overrideGenerationId?: string) => {
    const targetImage = overrideImageUrl || generatedImage;
    const targetId = overrideGenerationId || generationId;
    if (!targetImage) return;
    setError(null);
    setVideoProgress(0);
    setStage('generating-video');
    const timer = animateProgress(setVideoProgress);
    const msgTimer = cycleMessages(VIDEO_STATUS_MSGS, setVidStatusMsg);

    try {
      // If it's an array, it's a client-only slideshow request
      if (Array.isArray(targetImage)) {
        clearInterval(timer);
        clearInterval(msgTimer);
        setVidStatusMsg('Creating original slideshow...');

        const videoUrl = await generateKenBurnsVideo(
          targetImage,
          motionStyle,
          (p) => {
            setVideoProgress(p);
            const idx = Math.min(Math.floor((p / 100) * VIDEO_STATUS_MSGS.length), VIDEO_STATUS_MSGS.length - 1);
            setVidStatusMsg(VIDEO_STATUS_MSGS[idx]);
          }
        );
        setVideoProgress(100);
        setVidStatusMsg('Video ready! 🎬');
        setGeneratedVideo(videoUrl);
        setTimeout(() => setStage('final'), 600);
        return;
      }

      const res = await fetch('/api/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl: targetImage, prompt, generationId: targetId, userId: user?.uid }),
      });
      const data = await res.json();

      if (data.error) throw new Error(data.error);

      // Server has a real video URL (Replicate SVD or Veo2)
      if (data.videoUrl) {
        clearInterval(timer);
        clearInterval(msgTimer);
        setVideoProgress(100);
        setVidStatusMsg('Video ready! 🎬');
        setGeneratedVideo(data.videoUrl);
        setTimeout(() => setStage('final'), 600);
        return;
      }

      // Server says: render video client-side with Ken Burns
      if (data.useClientVideo) {
        clearInterval(timer);
        clearInterval(msgTimer);
        setVidStatusMsg('Building local animation...');

        try {
          const videoUrl = await generateKenBurnsVideo(
            targetImage,
            motionStyle,
            (p) => {
              setVideoProgress(p);
              const idx = Math.min(Math.floor((p / 100) * VIDEO_STATUS_MSGS.length), VIDEO_STATUS_MSGS.length - 1);
              setVidStatusMsg(VIDEO_STATUS_MSGS[idx]);
            }
          );
          setVideoProgress(100);
          setVidStatusMsg('Video ready! 🎬');
          setGeneratedVideo(videoUrl);
          setTimeout(() => setStage('final'), 600);
          return;
        } catch (kenBurnsErr: any) {
          console.error('Ken Burns animation failed:', kenBurnsErr);
          throw new Error('Animation failed: ' + kenBurnsErr.message);
        }
      }

      throw new Error('Unexpected response from video API');
    } catch (err: any) {
      console.error('Video step failure:', err);
      clearInterval(timer);
      clearInterval(msgTimer);
      setError(err.message || 'Video generation failed — please try again.');
      setStage('preview-image');
    }
  };

  /* ── download (handles data:, blob:, and external URLs) ── */
  const handleDownload = async (url: string, ext: string, which: 'photo' | 'video') => {
    setIsDownloading(which);
    try {
      if (url.startsWith('blob:') || url.startsWith('data:')) {
        // Blob / data URL — fetch it locally (no CORS)
        const r = await fetch(url);
        const blob = await r.blob();
        const objUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = objUrl;
        a.download = `ugcai-${Date.now()}.${ext}`;
        a.click();
        setTimeout(() => URL.revokeObjectURL(objUrl), 300);
      } else {
        // External URL — proxy through our server to avoid CORS
        const r = await fetch(`/api/proxy-download?url=${encodeURIComponent(url)}`);
        const blob = await r.blob();
        const objUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = objUrl;
        a.download = `ugcai-${Date.now()}.${ext}`;
        a.click();
        setTimeout(() => URL.revokeObjectURL(objUrl), 300);
      }
    } catch {
      window.open(url, '_blank');
    } finally {
      setIsDownloading(null);
    }
  };

  /* ── generate AI ad copy ── */
  const generateAdCopy = async () => {
    setIsGeneratingCopy(true);
    try {
      const res = await fetch('/api/hf-ad-copy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: prompt || 'this amazing lifestyle product' })
      });
      const data = await res.json();
      if (data.copy) setAdCopy(data.copy);
      if (data.warning) console.warn(data.warning);
    } catch (e) {
      console.error("Failed to generate ad copy", e);
    } finally {
      setIsGeneratingCopy(false);
    }
  };

  /* ── reset ── */
  const reset = () => {
    // Revoke any blob URLs to free memory
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }
    setStage('upload');
    setUserImage(null); setProductImage(null);
    setGeneratedImage(null); setGeneratedVideo(null);
    setGenerationId(null); setError(null);
    setImageProgress(0); setVideoProgress(0);
    setImageLoadError(false);
    setImgStatusMsg(IMAGE_STATUS_MSGS[0]);
    setVidStatusMsg(VIDEO_STATUS_MSGS[0]);
    setPrompt(initialPrompt || '');
    setAdCopy([]);
    setIsGeneratingCopy(false);
  };

  const stepIdx = STAGE_ORDER.indexOf(stage);

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-4xl mx-auto">

        {/* ═══ HEADER ═══ */}
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-3">
            UGC <span className="text-indigo-400">Studio</span>
          </h1>
          <p className="text-muted text-base max-w-xl mx-auto">
            Upload your photo + product → AI composites them → generates a promo video
          </p>
        </motion.div>

        {/* ═══ STEPPER ═══ */}
        <div className="flex items-center justify-center mb-10 select-none px-2">
          {PIPELINE_STEPS.map((step, i) => {
            const done = i < stepIdx;
            const active = i === stepIdx;
            const Icon = step.icon;
            return (
              <React.Fragment key={step.id}>
                <div className="flex flex-col items-center gap-1.5">
                  <motion.div
                    animate={active ? { scale: [1, 1.12, 1] } : { scale: 1 }}
                    transition={{ repeat: active ? Infinity : 0, duration: 1.6 }}
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300
                      ${done ? 'bg-indigo-600 border-indigo-400 text-white' : ''}
                      ${active ? 'bg-indigo-600/20 border-indigo-400 text-indigo-300 ring-4 ring-indigo-500/20' : ''}
                      ${!done && !active ? 'bg-[var(--glass-bg)] border-dim text-muted opacity-50' : ''}`}
                  >
                    {done ? <CheckCircle className="w-5 h-5" /> : <Icon className="w-4 h-4" />}
                  </motion.div>
                  <span className={`text-[10px] font-bold uppercase tracking-widest transition-colors
                    ${active ? 'text-indigo-400' : done ? 'text-secondary opacity-70' : 'text-muted'}`}>
                    {step.label}
                  </span>
                </div>
                {i < PIPELINE_STEPS.length - 1 && (
                  <div className={`h-0.5 flex-1 mx-1.5 rounded-full transition-all duration-700 mb-5
                    ${i < stepIdx ? 'bg-indigo-500' : 'bg-slate-200 dark:bg-white/10'}`} />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* ═══ GUEST BANNER ═══ */}
        {!user && (
          <div className="mb-6 bg-indigo-500/5 dark:bg-indigo-500/10 border border-indigo-500/10 dark:border-indigo-500/20 rounded-2xl px-5 py-3 flex items-center justify-between gap-4">
            <p className="text-sm text-indigo-700 dark:text-indigo-300">🎉 <strong>Free to try!</strong> <span className="text-muted">Sign in to save your creations.</span></p>
            <button onClick={signInWithGoogle} className="text-xs font-black bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl transition-all shadow-lg shadow-indigo-500/20">
              Sign In
            </button>
          </div>
        )}

        {/* ═══ ERROR ═══ */}
        {error && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-red-500/10 border border-red-500/20 text-red-400 px-5 py-3 rounded-2xl text-sm text-center">
            {error}
          </motion.div>
        )}

        {/* ═══════════════════════════════════════════════ */}
        {/*  STAGE CONTENT                                  */}
        {/* ═══════════════════════════════════════════════ */}
        <AnimatePresence mode="wait">

          {/* ─── STAGE 1: UPLOAD ─── */}
          {stage === 'upload' && (
            <motion.div key="upload"
              initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.35 }}
            >
              {/* Pipeline visual strip */}
              <div className="glass-card p-4 mb-6 flex items-center justify-between text-xs text-muted/60 overflow-x-auto gap-2">
                {[
                  { icon: Camera, label: 'Your Photo', color: 'text-indigo-400' },
                  { icon: Package, label: 'Product Photo', color: 'text-purple-400' },
                  { icon: Wand2, label: 'AI Composite', color: 'text-pink-400' },
                  { icon: Video, label: 'Promo Video', color: 'text-rose-400' },
                  { icon: CheckCircle, label: 'Photo + Video', color: 'text-emerald-400' },
                ].map((s, i, arr) => (
                  <React.Fragment key={s.label}>
                    <div className="flex flex-col items-center gap-1 min-w-[60px]">
                      <s.icon className={`w-4 h-4 ${s.color}`} />
                      <span className="whitespace-nowrap font-semibold">{s.label}</span>
                    </div>
                    {i < arr.length - 1 && <ChevronRight className="w-3.5 h-3.5 shrink-0" />}
                  </React.Fragment>
                ))}
              </div>

              {/* Upload zone */}
              <div className="grid sm:grid-cols-2 gap-5 mb-6">
                {/* User Photo */}
                <div
                  onClick={() => userInputRef.current?.click()}
                  className={`group relative cursor-pointer rounded-3xl border-2 border-dashed transition-all overflow-hidden
                    aspect-[3/4] flex flex-col items-center justify-center p-6 text-center
                    ${userImage ? 'border-indigo-500/60 shadow-lg shadow-indigo-500/10' : 'border-dim hover:border-indigo-500/40 hover:bg-indigo-500/5'}`}
                >
                  {userImage ? (
                    <>
                      <img src={userImage} className="absolute inset-0 w-full h-full object-cover" alt="You" />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center">
                        <Upload className="w-8 h-8 text-white mb-2" />
                        <p className="text-white font-bold text-sm">Change photo</p>
                      </div>
                      <div className="absolute bottom-3 left-3 bg-indigo-600/90 backdrop-blur text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full flex items-center gap-1.5">
                        <CheckCircle className="w-3 h-3" /> Your Photo
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="bg-indigo-500/10 border border-indigo-500/20 p-5 rounded-2xl mb-4 group-hover:bg-indigo-500/20 transition-all">
                        <Camera className="w-10 h-10 text-indigo-400" />
                      </div>
                      <p className="font-bold text-base mb-1">Your Photo</p>
                      <p className="text-xs text-muted">A clear photo of yourself</p>
                      <p className="text-[10px] text-muted/40 mt-2">PNG · JPG · up to 10MB</p>
                    </>
                  )}
                  <input ref={userInputRef} type="file" accept="image/*" className="hidden" onChange={e => handleFile(e, 'user')} />
                </div>

                {/* Product Photo */}
                <div
                  onClick={() => productInputRef.current?.click()}
                  className={`group relative cursor-pointer rounded-3xl border-2 border-dashed transition-all overflow-hidden
                    aspect-[3/4] flex flex-col items-center justify-center p-6 text-center
                    ${productImage ? 'border-purple-500/60 shadow-lg shadow-purple-500/10' : 'border-dim hover:border-purple-500/40 hover:bg-purple-500/5'}`}
                >
                  {productImage ? (
                    <>
                      <img src={productImage} className="absolute inset-0 w-full h-full object-cover" alt="Product" />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center">
                        <Upload className="w-8 h-8 text-white mb-2" />
                        <p className="text-white font-bold text-sm">Change photo</p>
                      </div>
                      <div className="absolute bottom-3 left-3 bg-purple-600/90 backdrop-blur text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full flex items-center gap-1.5">
                        <CheckCircle className="w-3 h-3" /> Product
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="bg-purple-500/10 border border-purple-500/20 p-5 rounded-2xl mb-4 group-hover:bg-purple-500/20 transition-all">
                        <Package className="w-10 h-10 text-purple-400" />
                      </div>
                      <p className="font-bold text-base mb-1">Product Photo</p>
                      <p className="text-xs text-muted">The product to feature</p>
                      <p className="text-[10px] text-muted/40 mt-2">PNG · JPG · up to 10MB</p>
                    </>
                  )}
                  <input ref={productInputRef} type="file" accept="image/*" className="hidden" onChange={e => handleFile(e, 'product')} />
                </div>
              </div>

              {/* Campaign Theme Selector */}
              <div className="mb-6">
                <label className="text-xs font-bold text-muted uppercase tracking-widest mb-3 block">
                  Modern AI Ad Theme <span className="text-purple-400 normal-case font-normal ml-2">✨ New</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {MODERN_CAMPAIGNS.map(theme => (
                    <button
                      key={theme.id}
                      onClick={() => setCampaignTheme(theme.id)}
                      className={`text-[11px] font-bold px-4 py-2 rounded-full transition-all border ${campaignTheme === theme.id
                        ? 'bg-purple-600 border-purple-400 text-white shadow-lg shadow-purple-500/20'
                        : 'bg-[var(--glass-bg)] border-dim text-secondary/70 hover:bg-white/10 hover:text-white'
                        }`}
                    >
                      {theme.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Cinematic Camera Motion */}
              <div className="mb-6">
                <label className="text-xs font-bold text-muted uppercase tracking-widest mb-3 block">
                  Cinematic Camera Motion <span className="text-purple-400 normal-case font-normal ml-2">Like Adobe Firefly / Vidu AI</span>
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {[
                    { id: 'smart', label: 'Smart Pan' },
                    { id: 'zoom-in', label: 'Zoom In' },
                    { id: 'zoom-out', label: 'Zoom Out' },
                    { id: 'pan-left', label: 'Pan Left' },
                    { id: 'pan-right', label: 'Pan Right' },
                  ].map(motion => (
                    <button
                      key={motion.id}
                      onClick={() => setMotionStyle(motion.id)}
                      className={`text-[11px] font-bold py-3 px-2 rounded-xl transition-all border ${motionStyle === motion.id
                        ? 'bg-purple-600 border-purple-400 text-white shadow-lg shadow-purple-500/20'
                        : 'bg-[var(--glass-bg)] border-dim text-secondary/70 hover:bg-white/10 hover:text-white'
                        }`}
                    >
                      {motion.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Prompt */}
              <div className="mb-6">
                <label className="text-xs font-bold text-muted uppercase tracking-widest mb-2 block">
                  Scene / Context <span className="text-muted/50 normal-case font-normal">(optional)</span>
                </label>
                <textarea
                  value={prompt}
                  onChange={e => setPrompt(e.target.value)}
                  rows={2}
                  placeholder="e.g. Morning skincare routine, gym workout, fashion shoot at sunset..."
                  className="w-full bg-[var(--glass-bg)] border border-dim rounded-2xl px-4 py-3 text-white placeholder:text-muted/50 focus:outline-none focus:border-indigo-500/50 transition-all resize-none text-sm"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <motion.button
                  whileHover={{ scale: 1.015 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={generateImage}
                  disabled={!userImage || !productImage}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500
                    disabled:opacity-30 disabled:cursor-not-allowed text-white py-4 rounded-2xl font-black text-base
                    flex items-center justify-center gap-2 transition-all shadow-xl shadow-indigo-500/20"
                >
                  <Wand2 className="w-5 h-5" />
                  Generate AI Scene
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.015 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={useOriginalPhoto}
                  disabled={!userImage && !productImage}
                  className="w-full bg-white/10 hover:bg-white/15 border border-white/20
                    disabled:opacity-30 disabled:cursor-not-allowed text-white py-4 rounded-2xl font-black text-base
                    flex items-center justify-center gap-2 transition-all shadow-xl"
                >
                  <Play className="w-5 h-5" />
                  Animate Original Photo
                </motion.button>
              </div>

              {(!userImage || !productImage) && (
                <p className="text-center text-xs text-muted/40 mt-3 block">
                  {!userImage && !productImage
                    ? 'Upload at least one photo to animate it, or both for an AI scene.'
                    : !userImage || !productImage
                      ? 'You can animate this photo now, or upload the missing photo to generate a new AI scene.'
                      : ''}
                </p>
              )}
            </motion.div>
          )}

          {/* ─── STAGE 2: GENERATING IMAGE ─── */}
          {stage === 'generating-image' && (
            <motion.div key="gen-img"
              initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-24 text-center"
            >
              <div className="relative mb-10">
                <div className="w-36 h-36 rounded-full border-4 border-indigo-500/10 border-t-indigo-500 animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Wand2 className="w-12 h-12 text-indigo-400" />
                </div>
              </div>
              <h2 className="text-3xl font-black mb-3">Generating AI Photo</h2>
              <motion.p
                key={imgStatusMsg}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-muted max-w-sm mb-10 text-sm leading-relaxed h-5"
              >
                {imgStatusMsg}
              </motion.p>
              {/* Progress bar */}
              <div className="w-72 bg-[var(--glass-bg)] rounded-full h-2 overflow-hidden mb-3">
                <motion.div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
                  animate={{ width: `${imageProgress}%` }} transition={{ ease: 'easeOut', duration: 0.5 }} />
              </div>
              <p className="text-xs text-muted/60 font-mono">{Math.round(imageProgress)}%</p>

              {/* Source thumbnails */}
              <div className="flex items-center gap-4 mt-10 opacity-50">
                {userImage && <img src={userImage} className="w-16 h-20 object-cover rounded-xl border border-dim" />}
                <Sparkles className="w-6 h-6 text-muted/60" />
                {productImage && <img src={productImage} className="w-16 h-20 object-cover rounded-xl border border-dim" />}
              </div>
              <p className="text-[10px] text-muted/50 mt-4 font-mono">Powered by Pollinations AI · Flux Model</p>
            </motion.div>
          )}

          {/* ─── STAGE 3: PREVIEW GENERATED IMAGE ─── */}
          {stage === 'preview-image' && generatedImage && (
            <motion.div key="preview"
              initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
            >
              <div className="grid md:grid-cols-2 gap-8 items-start">

                {/* Left: generated image */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span className="text-sm font-black text-emerald-400 uppercase tracking-widest">AI Photo Generated!</span>
                  </div>
                  <div className="relative rounded-3xl overflow-hidden border border-dim shadow-2xl shadow-black/40">
                    {imageLoadError ? (
                      <div className="aspect-[3/4] bg-[var(--glass-bg)] flex flex-col items-center justify-center">
                        <ImageIcon className="w-12 h-12 text-muted/50 mb-3" />
                        <p className="text-muted text-sm">Image unavailable</p>
                      </div>
                    ) : (
                      <img
                        src={generatedImage}
                        className="w-full object-cover"
                        alt="Generated"
                        onError={() => setImageLoadError(true)}
                      />
                    )}
                    {/* Download overlay */}
                    <button
                      onClick={() => handleDownload(generatedImage, 'jpg', 'photo')}
                      className="absolute top-4 right-4 bg-black/50 backdrop-blur hover:bg-black/70 text-white p-3 rounded-xl border border-dim transition-all"
                    >
                      {isDownloading === 'photo' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                    </button>
                  </div>
                  {/* Source row */}
                  <div className="mt-3 glass-card p-3 flex items-center gap-3">
                    <span className="text-[10px] text-muted/60 uppercase font-bold tracking-widest">Sources:</span>
                    {userImage && <img src={userImage} className="w-10 h-12 object-cover rounded-lg border border-dim" />}
                    <Sparkles className="w-3.5 h-3.5 text-muted/50" />
                    {productImage && <img src={productImage} className="w-10 h-12 object-cover rounded-lg border border-dim" />}
                    <ArrowRight className="w-3.5 h-3.5 text-muted/50 ml-auto" />
                    <img src={generatedImage} className="w-10 h-12 object-cover rounded-lg border border-indigo-500/30" onError={() => { }} />
                  </div>
                </div>

                {/* Right: next step card */}
                <div className="space-y-5">
                  <div className="glass-card p-6">
                    <h3 className="text-xl font-black mb-2">🎉 Photo is ready!</h3>
                    <p className="text-sm text-secondary/70 leading-relaxed">
                      AI has generated your composite lifestyle photo. Now create a promotional video from this image.
                    </p>
                  </div>

                  {/* Next: generate video */}
                  <div className="glass-card p-6 border-purple-500/20 bg-purple-500/5">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-purple-500/20 p-2.5 rounded-xl">
                        <Video className="w-5 h-5 text-purple-400" />
                      </div>
                      <div>
                        <p className="font-black text-sm">Step 4: Generate Video</p>
                        <p className="text-[11px] text-muted">AI creates a cinematic promo video</p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="text-[10px] font-bold text-muted uppercase tracking-widest mb-2 block">
                        Edit Camera Motion
                      </label>
                      <select
                        value={motionStyle}
                        onChange={(e) => setMotionStyle(e.target.value)}
                        className="w-full bg-black/40 border border-dim rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500/50"
                      >
                        <option value="smart">Smart Pan (AI Default)</option>
                        <option value="zoom-in">Cinematic Zoom In</option>
                        <option value="zoom-out">Dynamic Zoom Out</option>
                        <option value="pan-left">Pan Left (Tracking)</option>
                        <option value="pan-right">Pan Right (Tracking)</option>
                      </select>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => generateVideo()}
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500
                        text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2 shadow-xl shadow-purple-500/20"
                    >
                      <Video className="w-5 h-5" /> Generate Promo Video <ArrowRight className="w-4 h-4" />
                    </motion.button>
                  </div>

                  <button onClick={reset} className="w-full text-center text-muted/40 hover:text-secondary/70 text-sm py-2 transition-colors">
                    ↩ Start Over
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ─── STAGE 4: GENERATING VIDEO ─── */}
          {stage === 'generating-video' && (
            <motion.div key="gen-vid"
              initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-24 text-center"
            >
              <div className="relative mb-10">
                <div className="w-36 h-36 rounded-full border-4 border-purple-500/10 border-t-purple-500 animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Video className="w-12 h-12 text-purple-400" />
                </div>
              </div>
              <h2 className="text-3xl font-black mb-3">Generating Promo Video</h2>
              <motion.p
                key={vidStatusMsg}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-muted max-w-sm mb-10 text-sm leading-relaxed h-5"
              >
                {vidStatusMsg}
              </motion.p>
              <div className="w-72 bg-[var(--glass-bg)] rounded-full h-2 overflow-hidden mb-3">
                <motion.div className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
                  animate={{ width: `${videoProgress}%` }} transition={{ ease: 'easeOut', duration: 0.4 }} />
              </div>
              <p className="text-xs text-muted/60 font-mono">{Math.round(videoProgress)}%</p>

              {generatedImage && (
                <img src={generatedImage} className="w-24 h-32 object-cover rounded-2xl border border-dim mt-10 opacity-40" onError={() => { }} />
              )}
              <p className="text-[10px] text-muted/50 mt-4 font-mono">Rendering via Canvas · MediaRecorder API</p>
            </motion.div>
          )}

          {/* ─── STAGE 5: FINAL OUTPUT ─── */}
          {stage === 'final' && generatedImage && (
            <motion.div key="final"
              initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            >
              {/* Success header */}
              <div className="text-center mb-8">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 220, damping: 18 }}>
                  <div className="w-20 h-20 bg-emerald-500/15 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-10 h-10 text-emerald-400" />
                  </div>
                </motion.div>
                <h2 className="text-3xl font-black mb-2">Your UGC is Ready! 🎉</h2>
                <p className="text-muted">Download your AI-generated photo and promo video below</p>
              </div>

              {/* Two-column output */}
              <div className="grid md:grid-cols-2 gap-6 mb-8">

                {/* ── Generated Photo ── */}
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-secondary/70 uppercase tracking-widest flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5 text-indigo-400" /> AI Generated Photo
                    </span>
                    <button
                      onClick={() => handleDownload(generatedImage, 'jpg', 'photo')}
                      className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-all"
                    >
                      {isDownloading === 'photo' ? <Loader2 className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />}
                      Download
                    </button>
                  </div>
                  <div className="rounded-3xl overflow-hidden border border-dim shadow-xl bg-black/20">
                    <img src={generatedImage} className="w-full object-cover" alt="Generated Photo" onError={() => { }} />
                  </div>
                </motion.div>

                {/* ── Promotional Video ── */}
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-secondary/70 uppercase tracking-widest flex items-center gap-1.5">
                      <Play className="w-3.5 h-3.5 text-purple-400" /> Promo Video
                    </span>
                    {generatedVideo && (
                      <button
                        onClick={() => handleDownload(generatedVideo, 'webm', 'video')}
                        disabled={isDownloading === 'video'}
                        className="flex items-center gap-1.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-all"
                      >
                        {isDownloading === 'video' ? <Loader2 className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />}
                        Download
                      </button>
                    )}
                  </div>
                  {generatedVideo ? (
                    <div className="rounded-3xl overflow-hidden border border-purple-500/20 shadow-xl shadow-purple-500/10 bg-black">
                      <video
                        key={generatedVideo}
                        src={generatedVideo}
                        autoPlay
                        loop
                        playsInline
                        controls
                        muted
                        poster={generatedImage}
                        className="w-full"
                      />
                      <div className="px-4 py-2 bg-black/40 text-center">
                        <a
                          href={generatedVideo}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-purple-400 hover:text-purple-300 underline"
                        >
                          Open video in new tab ↗
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-3xl border border-dim bg-[var(--glass-bg)] aspect-[3/4] flex flex-col items-center justify-center">
                      <Video className="w-10 h-10 text-white/10 mb-3" />
                      <p className="text-muted/40 text-sm">Video unavailable</p>
                    </div>
                  )}
                </motion.div>
              </div>

              {/* ── AI Copy Generator ── */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mb-8">
                <div className="glass-card p-6 border-indigo-500/20 bg-indigo-500/5">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="bg-indigo-500/20 p-2.5 rounded-xl">
                        <Wand2 className="w-5 h-5 text-indigo-400" />
                      </div>
                      <div>
                        <p className="font-black text-sm">AI Ad Copy Generator</p>
                        <p className="text-[11px] text-muted">Powered by Hugging Face Inference</p>
                      </div>
                    </div>
                    <button
                      onClick={generateAdCopy}
                      disabled={isGeneratingCopy}
                      className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-lg shadow-indigo-500/20 flex items-center gap-2"
                    >
                      {isGeneratingCopy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                      {adCopy.length > 0 ? 'Regenerate' : 'Generate Ad Copy'}
                    </button>
                  </div>

                  {adCopy.length > 0 ? (
                    <div className="grid gap-3">
                      {adCopy.map((text, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          className="group relative bg-black/40 border border-white/5 p-4 rounded-xl hover:border-indigo-500/30 transition-all"
                        >
                          <p className="text-sm text-primary pr-10">{text}</p>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(text);
                              // Simple toast-like effect could be added here
                            }}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-[var(--glass-bg)] hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-all"
                            title="Copy to clipboard"
                          >
                            <CheckCircle className="w-4 h-4 text-emerald-400" />
                          </button>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-8 text-center border border-dashed border-dim rounded-2xl">
                      <p className="text-sm text-muted/50">Click generate to build viral captions for your ad</p>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Action row */}
              <div className="flex gap-4">
                <button
                  onClick={reset}
                  className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl bg-[var(--glass-bg)] hover:bg-white/10 border border-dim font-bold transition-all"
                >
                  <RefreshCw className="w-4 h-4" /> Create Another
                </button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
};
