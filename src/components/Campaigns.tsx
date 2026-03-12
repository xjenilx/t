import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, X, Download, Wand2, ChevronRight, Sparkles, Loader2, Video } from 'lucide-react';
import { Page } from '../App';

interface CampaignsProps {
    onNavigate: (page: Page) => void;
    onUsePrompt?: (prompt: string) => void;
}

const CAMPAIGNS = [
    {
        id: 'amul',
        brand: 'Amul',
        category: 'Dairy / FMCG',
        tagline: 'The Taste of India',
        campaign: 'The Amul Girl',
        era: '1966–Present',
        description: 'Longest-running ad campaign in India — witty, topical, satirical billboards commenting on daily news since the 60s.',
        color: '#F59E0B',
        gradient: 'from-amber-500/20 to-yellow-500/10',
        border: 'border-amber-500/30',
        badge: 'bg-amber-500/20 text-amber-300',
        imagePrompt: 'Indian dairy advertising campaign, girl mascot holding butter, colorful Mumbai billboard style, witty retro Indian commercial art, warm golden colors, lifestyle UGC, topical humor advertisement',
        videoPrompt: 'rotating butter product, Indian dairy commercial vibes',
    },
    {
        id: 'fevicol',
        brand: 'Fevicol',
        category: 'Adhesives',
        tagline: 'Chipku — The Ultimate Bond',
        campaign: 'Fevicol Ads',
        era: '1990s–2010s',
        description: 'Famous for absurdly funny "chipku" ads — the fish on a hook and bus-full-of-people campaigns are marketing legends.',
        color: '#3B82F6',
        gradient: 'from-blue-500/20 to-cyan-500/10',
        border: 'border-blue-500/30',
        badge: 'bg-blue-500/20 text-blue-300',
        imagePrompt: 'Indian craftsman carpenter holding yellow Fevicol adhesive tube, traditional wooden workshop, tools hanging on wall, authentic rural India UGC lifestyle, warm tones',
        videoPrompt: 'carpenter workshop, woodworking bench, adhesive product',
    },
    {
        id: 'cadbury',
        brand: 'Cadbury Dairy Milk',
        category: 'Confectionery',
        tagline: 'Real Taste of Life',
        campaign: 'Cricket Pitch Dance',
        era: '1994',
        description: 'Young woman running onto a cricket pitch to celebrate — captured pure joy and became the gold standard for emotional advertising.',
        color: '#8B5CF6',
        gradient: 'from-purple-500/20 to-violet-500/10',
        border: 'border-purple-500/30',
        badge: 'bg-purple-500/20 text-purple-300',
        imagePrompt: 'young Indian woman dancing joyfully, holding Cadbury Dairy Milk purple chocolate bar, cricket stadium background, celebrating with arms outstretched, vibrant colors, happiness and freedom, UGC lifestyle photo',
        videoPrompt: 'cricket stadium celebration, chocolate product reveal',
    },
    {
        id: 'surfexcel',
        brand: 'Surf Excel',
        category: 'Detergent / FMCG',
        tagline: 'Daag Acche Hain',
        campaign: 'Stains Are Good',
        era: '2005–Present',
        description: 'Revolutionized detergent advertising by reframing stains as proof of a well-lived life — emotional storytelling at its finest.',
        color: '#06B6D4',
        gradient: 'from-cyan-500/20 to-sky-500/10',
        border: 'border-cyan-500/30',
        badge: 'bg-cyan-500/20 text-cyan-300',
        imagePrompt: 'happy Indian school child in white school uniform with colorful paint and mud stains, playing outdoors, carefree and joyful, warm family photography, lifestyle UGC, emotional storytelling',
        videoPrompt: 'child playing outdoors, colorful stains on clothes',
    },
    {
        id: 'parleg',
        brand: 'Parle-G',
        category: 'Biscuits / FMCG',
        tagline: 'G for Genius',
        campaign: 'The Genius Biscuit',
        era: '1939–Present',
        description: "India's most sold biscuit — the Parle-G girl on the packet has connected with generations of Indian children. Pure nostalgia.",
        color: '#F97316',
        gradient: 'from-orange-500/20 to-red-500/10',
        border: 'border-orange-500/30',
        badge: 'bg-orange-500/20 text-orange-300',
        imagePrompt: 'Indian schoolboy holding Parle-G biscuit packet, school bag on back, nostalgic wholesome Indian childhood, warm golden afternoon light, genuine happy expression, lifestyle UGC photography',
        videoPrompt: 'school child, biscuit snack time, nostalgic India',
    },
    {
        id: 'nirma',
        brand: 'Nirma',
        category: 'Detergent / FMCG',
        tagline: 'Washing Powder Nirma',
        campaign: 'The Iconic Jingle',
        era: '1975–Present',
        description: '"Washing Powder Nirma" — one of the most iconic jingles in advertising history, sung by every Indian household.',
        color: '#EC4899',
        gradient: 'from-pink-500/20 to-rose-500/10',
        border: 'border-pink-500/30',
        badge: 'bg-pink-500/20 text-pink-300',
        imagePrompt: 'Indian woman in colorful sari washing clothes with Nirma powder, bright sunny day, clean white laundry hanging, traditional Indian courtyard, joyful expression, authentic UGC lifestyle',
        videoPrompt: 'laundry cleaning, white clothes drying, sunny courtyard',
    },
    {
        id: 'amitabh-polio',
        brand: 'Pulse Polio',
        category: 'Public Health PSA',
        tagline: 'Do Boond Zindagi Ki',
        campaign: 'Amitabh Bachchan Polio PSA',
        era: '1994–2012',
        description: 'Amitabh Bachchan\'s celebrity advocacy helped eradicate polio in India — a landmark case of advertising saving millions of lives.',
        color: '#10B981',
        gradient: 'from-emerald-500/20 to-green-500/10',
        border: 'border-emerald-500/30',
        badge: 'bg-emerald-500/20 text-emerald-300',
        imagePrompt: 'distinguished Indian elder man in white kurta giving oral vaccine drops to young child, caring father-figure expression, health clinic India, warm compassionate lighting, public service announcement style photography',
        videoPrompt: 'healthcare worker, child vaccination, India health clinic',
    },
    {
        id: 'idea',
        brand: 'Idea Cellular',
        category: 'Telecom',
        tagline: 'No Ullu Banaoing',
        campaign: 'What an Idea Sirji',
        era: '2002–2010s',
        description: '"What an Idea Sirji!" became a cultural catchphrase — ads focused on creative use of mobile connectivity to solve Indian problems.',
        color: '#FBBF24',
        gradient: 'from-yellow-500/20 to-amber-500/10',
        border: 'border-yellow-500/30',
        badge: 'bg-yellow-500/20 text-yellow-300',
        imagePrompt: 'young Indian man with light bulb over head, "eureka" moment expression, holding smartphone, village setting with people gathered, direct communication gesture, lifestyle UGC India telecom ad',
        videoPrompt: 'smartphone connection, rural India, bright idea moment',
    },
    {
        id: 'tatatea',
        brand: 'Tata Tea',
        category: 'Beverages',
        tagline: 'Jaago Re',
        campaign: 'Wake Up Campaign',
        era: '2007–2010s',
        description: '"Jaago Re" (Wake Up) promoted social consciousness around voting and civic responsibility — tea ad that inspired a nation.',
        color: '#DC2626',
        gradient: 'from-red-500/20 to-rose-500/10',
        border: 'border-red-500/30',
        badge: 'bg-red-500/20 text-red-300',
        imagePrompt: 'young Indian woman waking up early morning, holding Tata Tea cup, sunrise background, civic awareness expression, traditional kurta, morning routine UGC lifestyle, purposeful determined look',
        videoPrompt: 'morning tea routine, sunrise India, social awareness',
    },
    {
        id: 'mtv',
        brand: 'MTV Beats',
        category: 'Entertainment',
        tagline: "There's Beat in Its Blood",
        campaign: 'MTV India Beat',
        era: '2010s',
        description: "MTV Beats tapped into India's love of music with high-energy campaigns celebrating local music culture.",
        color: '#7C3AED',
        gradient: 'from-violet-500/20 to-purple-500/10',
        border: 'border-violet-500/30',
        badge: 'bg-violet-500/20 text-violet-300',
        imagePrompt: 'young Indian musician playing electric guitar, urban Indian street art background, MTV logo aesthetic, vibrant neon colors, music festival energy, Gen Z lifestyle UGC, headphones, expressive pose',
        videoPrompt: 'music guitarist, urban India, vibrant neon night',
    },
    {
        id: 'cred',
        brand: 'CRED',
        category: 'Fintech',
        tagline: 'Indiranagar Ka Gunda',
        campaign: 'Unexpected Celebrities',
        era: '2021–Present',
        description: '"Indiranagar ka Gunda" — Rahul Dravid playing an angry man in Bangalore became the most talked-about Indian ad in years.',
        color: '#1D4ED8',
        gradient: 'from-blue-600/20 to-indigo-500/10',
        border: 'border-blue-600/30',
        badge: 'bg-blue-600/20 text-blue-300',
        imagePrompt: 'respectable middle-aged Indian man in casual clothes looking unexpectedly intimidating on Bangalore street, Indiranagar neighborhood, twist of expectations, humorous expression, premium fintech app UGC',
        videoPrompt: 'Bangalore streets, unexpected celebrity, fintech rewards',
    },
    {
        id: 'ariel',
        brand: 'Ariel',
        category: 'Detergent / FMCG',
        tagline: '#ShareTheLoad',
        campaign: 'Share The Load',
        era: '2015–Present',
        description: '"#ShareTheLoad" sparked national conversation on gender equality in housework — a culturally transformative ad campaign.',
        color: '#0EA5E9',
        gradient: 'from-sky-500/20 to-blue-500/10',
        border: 'border-sky-500/30',
        badge: 'bg-sky-500/20 text-sky-300',
        imagePrompt: 'Indian husband and wife doing laundry together in modern apartment, both smiling, equal partnership, Ariel detergent product visible, warm family photography, gender equality UGC lifestyle, genuine connection',
        videoPrompt: 'couple sharing laundry chores, modern India apartment',
    },
    {
        id: 'happydent',
        brand: 'Happydent',
        category: 'Confectionery',
        tagline: 'The Smile That Lights Things Up',
        campaign: 'Palace Lighting',
        era: '2007',
        description: 'Men eating gum whose smiles light up a dark palace — a Rs 2 crore high-production-value spectacle of humor and creativity.',
        color: '#F59E0B',
        gradient: 'from-amber-400/20 to-yellow-400/10',
        border: 'border-amber-400/30',
        badge: 'bg-amber-400/20 text-amber-300',
        imagePrompt: 'Indian man with radiant sparkling white smile, dark elegant palace background lit only by the bright smile, dramatic cinematic lighting, teeth whitening gum ad, magical UGC lifestyle, toothpaste product',
        videoPrompt: 'glowing smile, palace lit by teeth, dark dramatic lighting',
    },
    {
        id: 'fivestar',
        brand: '5 Star',
        category: 'Confectionery',
        tagline: 'Eat 5 Star, Do Nothing',
        campaign: 'Nothing University',
        era: '2010s–Present',
        description: '"Nothing University" — 5Star celebrated the art of doing nothing, becoming a meme-worthy counterculture brand voice.',
        color: '#78350F',
        gradient: 'from-yellow-600/20 to-amber-700/10',
        border: 'border-yellow-600/30',
        badge: 'bg-yellow-600/20 text-yellow-300',
        imagePrompt: 'carefree young Indian college student lounging on sofa eating 5Star chocolate bar, blissfully doing nothing, unbothered expression, cozy room, warm afternoon light, university dorm, relatable Gen Z lifestyle UGC',
        videoPrompt: 'relaxing student, chocolate break, doing absolutely nothing',
    },
    {
        id: 'urbancompany',
        brand: 'Urban Company',
        category: 'Home Services',
        tagline: 'Chhota Kaam, Bada Kaam',
        campaign: 'Chhota Kaam',
        era: '2019–Present',
        description: '"Chhota Kaam" positioned home services as essential — transforming the perception of home professionals in urban India.',
        color: '#059669',
        gradient: 'from-emerald-500/20 to-teal-500/10',
        border: 'border-emerald-500/30',
        badge: 'bg-emerald-500/20 text-emerald-300',
        imagePrompt: 'professional Indian technician in clean Urban Company branded uniform fixing home appliance, modern apartment, tools in organized bag, competent trustworthy expression, premium home service UGC lifestyle photography',
        videoPrompt: 'home service technician, modern apartment repair, professional',
    },
];

const buildPollinationsUrl = (prompt: string, seed?: number) => {
    const s = seed ?? Math.floor(Math.random() * 999999);
    return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=512&height=680&seed=${s}&model=flux&nologo=true`;
};

interface VideoState {
    status: 'idle' | 'rendering' | 'ready';
    url: string | null;
    progress: number;
}

export const Campaigns = ({ onNavigate, onUsePrompt }: CampaignsProps) => {
    const [selected, setSelected] = useState<string | null>(null);
    const [videoStates, setVideoStates] = useState<Record<string, VideoState>>({});
    const [imageSeeds] = useState<Record<string, number>>(() =>
        Object.fromEntries(CAMPAIGNS.map(c => [c.id, Math.floor(Math.random() * 999999)]))
    );
    const blobRefs = useRef<Record<string, string>>({});

    const selectedCampaign = CAMPAIGNS.find(c => c.id === selected);

    const generateVideo = async (campaignId: string) => {
        const campaign = CAMPAIGNS.find(c => c.id === campaignId);
        if (!campaign) return;
        const imageUrl = `/api/campaign-image/${campaignId}`;

        setVideoStates(prev => ({ ...prev, [campaignId]: { status: 'rendering', url: null, progress: 0 } }));

        try {
            // Fetch image through proxy to avoid CORS
            const proxyRes = await fetch(`/api/proxy-download?url=${encodeURIComponent(imageUrl)}`);
            const blob = await proxyRes.blob();
            const objectUrl = URL.createObjectURL(blob);

            const videoUrl = await renderKenBurns(objectUrl, (p) => {
                setVideoStates(prev => ({ ...prev, [campaignId]: { status: 'rendering', url: null, progress: p } }));
            });

            // Clean up image blob
            URL.revokeObjectURL(objectUrl);

            // Track video blob for cleanup
            if (blobRefs.current[campaignId]) URL.revokeObjectURL(blobRefs.current[campaignId]);
            blobRefs.current[campaignId] = videoUrl;

            setVideoStates(prev => ({ ...prev, [campaignId]: { status: 'ready', url: videoUrl, progress: 100 } }));
        } catch (e) {
            console.error('Video render failed:', e);
            setVideoStates(prev => ({ ...prev, [campaignId]: { status: 'idle', url: null, progress: 0 } }));
        }
    };

    const renderKenBurns = (imageObjectUrl: string, onProgress: (p: number) => void): Promise<string> => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                const W = 480, H = 680;
                const canvas = document.createElement('canvas');
                canvas.width = W; canvas.height = H;
                const ctx = canvas.getContext('2d')!;

                const iA = img.width / img.height;
                const cA = W / H;
                let sx = 0, sy = 0, sw = img.width, sh = img.height;
                if (iA > cA) { sw = img.height * cA; sx = (img.width - sw) / 2; }
                else { sh = img.width / cA; sy = (img.height - sh) / 2; }

                const fps = 25, sec = 5, total = fps * sec;
                const mime = MediaRecorder.isTypeSupported('video/webm;codecs=vp9') ? 'video/webm;codecs=vp9' : 'video/webm';
                const stream = canvas.captureStream(fps);
                const rec = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 2_500_000 });
                const chunks: Blob[] = [];
                rec.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data); };
                rec.onstop = () => resolve(URL.createObjectURL(new Blob(chunks, { type: 'video/webm' })));
                rec.start(200);

                let f = 0;
                const draw = () => {
                    if (f >= total) { rec.stop(); return; }
                    const t = f / total;
                    const e = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
                    const scale = 1 + 0.15 * e;
                    const panX = 0.02 * Math.sin(e * Math.PI);
                    ctx.clearRect(0, 0, W, H);
                    ctx.save();
                    ctx.translate(W / 2 + panX * W, H / 2);
                    ctx.scale(scale, scale);
                    ctx.translate(-W / 2, -H / 2);
                    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, W, H);
                    ctx.restore();
                    const vg = ctx.createRadialGradient(W / 2, H / 2, H * 0.2, W / 2, H / 2, H * 0.8);
                    vg.addColorStop(0, 'rgba(0,0,0,0)');
                    vg.addColorStop(1, 'rgba(0,0,0,0.3)');
                    ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
                    onProgress(Math.floor((f / total) * 100));
                    f++; setTimeout(draw, 1000 / fps);
                };
                draw();
            };
            img.onerror = reject;
            img.src = imageObjectUrl;
        });
    };

    const handleUseTemplate = (campaign: typeof CAMPAIGNS[0]) => {
        onUsePrompt?.(`${campaign.tagline} — ${campaign.description.split(' — ')[0]}`);
        onNavigate('create');
    };

    const handleDownloadVideo = async (url: string, brand: string) => {
        const a = document.createElement('a');
        a.href = url;
        a.download = `${brand.toLowerCase().replace(/\s+/g, '-')}-ugc-video.webm`;
        a.click();
    };

    return (
        <div className="min-h-screen pt-24 pb-20 px-4">
            <div className="max-w-7xl mx-auto">

                {/* Header */}
                <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-14">
                    <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4">
                        🇮🇳 Iconic Indian Campaigns
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-4">
                        India's Greatest <span className="text-indigo-400">Ads</span>
                    </h1>
                    <p className="text-muted max-w-2xl mx-auto text-base leading-relaxed">
                        AI-generated UGC reimaginings of 15 iconic campaigns that shaped Indian advertising.
                        Click any campaign to generate a cinematic promo video — or use as a creative template.
                    </p>
                </motion.div>

                {/* Campaign Grid */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {CAMPAIGNS.map((campaign, index) => {
                        const vs = videoStates[campaign.id];
                        const imgUrl = `/api/campaign-image/${campaign.id}`;

                        return (
                            <motion.div
                                key={campaign.id}
                                initial={{ opacity: 0, y: 24 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.04 }}
                                className={`group relative glass-card border ${campaign.border} overflow-hidden cursor-pointer
                  hover:shadow-2xl transition-all duration-300 hover:-translate-y-1`}
                                onClick={() => setSelected(campaign.id)}
                            >
                                {/* Campaign Image */}
                                <div className="relative aspect-[3/4] overflow-hidden bg-black/30">
                                    <img
                                        src={imgUrl}
                                        alt={campaign.brand}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                        loading="lazy"
                                    />
                                    {/* Gradient overlay */}
                                    <div className={`absolute inset-0 bg-gradient-to-t ${campaign.gradient} opacity-60`} />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                                    {/* Era badge */}
                                    <div className={`absolute top-3 left-3 ${campaign.badge} text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full`}>
                                        {campaign.era}
                                    </div>

                                    {/* Category */}
                                    <div className="absolute top-3 right-3 bg-black/50 backdrop-blur text-primary/70 text-[10px] font-semibold px-2.5 py-1 rounded-full">
                                        {campaign.category}
                                    </div>

                                    {/* Play button overlay */}
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur border border-white/30 flex items-center justify-center">
                                            <Play className="w-5 h-5 text-white ml-0.5" />
                                        </div>
                                    </div>

                                    {/* Video ready indicator */}
                                    {vs?.status === 'ready' && (
                                        <div className="absolute bottom-3 right-3 bg-emerald-500/80 backdrop-blur text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
                                            <Video className="w-3 h-3" /> Video Ready
                                        </div>
                                    )}
                                    {vs?.status === 'rendering' && (
                                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
                                            <div className="h-full bg-indigo-500 transition-all" style={{ width: `${vs.progress}%` }} />
                                        </div>
                                    )}
                                </div>

                                {/* Campaign Info */}
                                <div className="p-4">
                                    <div className="flex items-start justify-between gap-2 mb-1.5">
                                        <h3 className="font-black text-base leading-tight">{campaign.brand}</h3>
                                        <ChevronRight className="w-4 h-4 text-muted/60 shrink-0 mt-0.5 group-hover:text-secondary transition-colors" />
                                    </div>
                                    <p className="text-xs font-semibold mb-1" style={{ color: campaign.color }}>{campaign.campaign}</p>
                                    <p className="text-xs text-muted leading-snug line-clamp-2">{campaign.description}</p>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Empty divider */}
                <div className="mt-16 text-center">
                    <p className="text-muted/50 text-xs">Images generated by Pollinations AI • Flux Model</p>
                </div>
            </div>

            {/* ══════════════════════════════════════════════ */}
            {/* CAMPAIGN DETAIL MODAL                          */}
            {/* ══════════════════════════════════════════════ */}
            <AnimatePresence>
                {selected && selectedCampaign && (() => {
                    const vs = videoStates[selected];
                    const imgUrl = `/api/campaign-image/${selected}`;

                    return (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                            onClick={() => setSelected(null)}
                        >
                            <motion.div
                                initial={{ opacity: 0, scale: 0.94, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.94, y: 20 }}
                                transition={{ type: 'spring', stiffness: 260, damping: 24 }}
                                className={`glass-card border ${selectedCampaign.border} max-w-3xl w-full max-h-[90vh] overflow-y-auto`}
                                onClick={e => e.stopPropagation()}
                            >
                                {/* Modal header */}
                                <div className="flex items-center justify-between p-5 border-b border-dim">
                                    <div>
                                        <h2 className="text-xl font-black">{selectedCampaign.brand}</h2>
                                        <p className="text-xs font-semibold mt-0.5" style={{ color: selectedCampaign.color }}>
                                            {selectedCampaign.campaign} · {selectedCampaign.era}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setSelected(null)}
                                        className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 text-secondary/70 hover:text-primary transition-all"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="p-5 grid md:grid-cols-2 gap-6">
                                    {/* Left: Image + Video */}
                                    <div className="space-y-3">
                                        {/* AI Image */}
                                        <div className="relative rounded-2xl overflow-hidden border border-dim">
                                            <img
                                                src={imgUrl}
                                                alt={selectedCampaign.brand}
                                                className="w-full object-cover"
                                            />
                                            <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur text-secondary text-[10px] px-2 py-1 rounded-lg">
                                                AI Generated · Pollinations Flux
                                            </div>
                                        </div>

                                        {/* Video area */}
                                        {vs?.status === 'ready' && vs.url && (
                                            <div className="rounded-2xl overflow-hidden border border-emerald-500/20">
                                                <video
                                                    src={vs.url}
                                                    autoPlay loop muted playsInline controls
                                                    className="w-full"
                                                />
                                                <div className="p-2 bg-black/40 flex items-center justify-between">
                                                    <span className="text-xs text-emerald-400 font-semibold">✓ Ken Burns Video Ready</span>
                                                    <button
                                                        onClick={() => handleDownloadVideo(vs.url!, selectedCampaign.brand)}
                                                        className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-all"
                                                    >
                                                        <Download className="w-3 h-3" /> Download
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        {vs?.status === 'rendering' && (
                                            <div className="rounded-2xl border border-dim bg-[var(--glass-bg)] p-5 text-center">
                                                <Loader2 className="w-8 h-8 text-indigo-400 animate-spin mx-auto mb-2" />
                                                <p className="text-sm font-semibold mb-2">Rendering Ken Burns Video...</p>
                                                <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                                                    <div className="h-full bg-indigo-500 transition-all" style={{ width: `${vs.progress}%` }} />
                                                </div>
                                                <p className="text-xs text-muted/60 mt-1.5 font-mono">{vs.progress}%</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Right: Info + Actions */}
                                    <div className="space-y-4">
                                        {/* Description */}
                                        <div>
                                            <p className={`text-xs font-black uppercase tracking-widest mb-1.5`} style={{ color: selectedCampaign.color }}>
                                                {selectedCampaign.tagline}
                                            </p>
                                            <p className="text-sm text-primary/70 leading-relaxed">{selectedCampaign.description}</p>
                                        </div>

                                        {/* Stats */}
                                        <div className={`bg-gradient-to-br ${selectedCampaign.gradient} border ${selectedCampaign.border} rounded-xl p-4 space-y-2`}>
                                            <div className="flex justify-between text-xs">
                                                <span className="text-muted">Campaign</span>
                                                <span className="font-semibold">{selectedCampaign.campaign}</span>
                                            </div>
                                            <div className="flex justify-between text-xs">
                                                <span className="text-muted">Era</span>
                                                <span className="font-semibold">{selectedCampaign.era}</span>
                                            </div>
                                            <div className="flex justify-between text-xs">
                                                <span className="text-muted">Category</span>
                                                <span className="font-semibold">{selectedCampaign.category}</span>
                                            </div>
                                        </div>

                                        {/* Generate Video button */}
                                        {(!vs || vs.status === 'idle') && (
                                            <motion.button
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => generateVideo(selected)}
                                                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500
                          text-white py-3.5 rounded-xl font-black flex items-center justify-center gap-2 shadow-xl shadow-purple-500/20"
                                            >
                                                <Video className="w-4 h-4" /> Generate Promo Video
                                            </motion.button>
                                        )}

                                        {vs?.status === 'ready' && (
                                            <button
                                                onClick={() => {
                                                    setVideoStates(prev => ({ ...prev, [selected]: { status: 'idle', url: null, progress: 0 } }));
                                                }}
                                                className="w-full border border-dim hover:bg-white dark:hover:bg-[var(--glass-bg)] text-secondary hover:text-primary transition-all py-3 rounded-xl text-sm font-semibold"
                                            >
                                                Regenerate Video
                                            </button>
                                        )}

                                        {/* Use as Template */}
                                        <button
                                            onClick={() => handleUseTemplate(selectedCampaign)}
                                            className="w-full flex items-center justify-center gap-2 border border-indigo-500/30 bg-indigo-500/10
                        hover:bg-indigo-500/20 text-indigo-300 py-3 rounded-xl font-black text-sm transition-all"
                                        >
                                            <Wand2 className="w-4 h-4" /> Use as UGC Template
                                        </button>

                                        {/* AI Prompt preview */}
                                        <div className="bg-black/30 rounded-xl p-3 border border-dim">
                                            <p className="text-[10px] text-muted/60 uppercase font-bold tracking-widest mb-1.5">AI Prompt</p>
                                            <p className="text-[11px] text-secondary/70 leading-relaxed font-mono line-clamp-4">
                                                {selectedCampaign.imagePrompt}
                                            </p>
                                        </div>

                                        {/* Navigation */}
                                        <div className="flex gap-2 pt-1">
                                            {CAMPAIGNS.indexOf(selectedCampaign) > 0 && (
                                                <button
                                                    onClick={() => setSelected(CAMPAIGNS[CAMPAIGNS.indexOf(selectedCampaign) - 1].id)}
                                                    className="flex-1 flex items-center justify-center gap-1 py-2 text-xs text-muted hover:text-white transition-colors"
                                                >
                                                    ← Prev
                                                </button>
                                            )}
                                            {CAMPAIGNS.indexOf(selectedCampaign) < CAMPAIGNS.length - 1 && (
                                                <button
                                                    onClick={() => setSelected(CAMPAIGNS[CAMPAIGNS.indexOf(selectedCampaign) + 1].id)}
                                                    className="flex-1 flex items-center justify-center gap-1 py-2 text-xs text-muted hover:text-white transition-colors"
                                                >
                                                    Next →
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    );
                })()}
            </AnimatePresence>
        </div>
    );
};
