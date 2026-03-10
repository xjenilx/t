import express from 'express';
import { GoogleGenAI } from "@google/genai";
import OpenAI from "openai";
import dotenv from 'dotenv';
import cors from 'cors';
import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { HfInference } from "@huggingface/inference";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '100mb' }));

// ── Error Boundary ──────────────────────────────────────────────────────────
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
});

// ── Database ──────────────────────────────────────────────────────────────
const db = new Database(join(__dirname, 'ugc.db'));
db.exec(`
  CREATE TABLE IF NOT EXISTS generations (
    id TEXT PRIMARY KEY,
    userId TEXT,
    prompt TEXT,
    imageUrl TEXT,
    videoUrl TEXT,
    timestamp INTEGER,
    likes INTEGER DEFAULT 0
  );
  CREATE TABLE IF NOT EXISTS brand_kits (
    userId TEXT PRIMARY KEY,
    colors TEXT,
    logos TEXT,
    typography TEXT
  );
  CREATE TABLE IF NOT EXISTS user_profiles (
    userId TEXT PRIMARY KEY,
    tier TEXT DEFAULT 'Basic',
    credits INTEGER DEFAULT 100
  );
`);
try { db.exec(`ALTER TABLE generations ADD COLUMN videoUrl TEXT`); } catch { }

// ── Community Seed ────────────────────────────────────────────────────────
const seedCommunity = () => {
    const items = [
        { id: 'f1', prompt: 'Luxury watch shoot', imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80', likes: 124 },
        { id: 'f2', prompt: 'Sneaker street style', imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80', likes: 89 },
        { id: 'f3', prompt: 'Skincare morning routine', imageUrl: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&w=800&q=80', likes: 231 },
        { id: 'f4', prompt: 'Sunglasses rooftop golden hour', imageUrl: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=800&q=80', likes: 156 },
        { id: 'f5', prompt: 'Coffee latte art morning', imageUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80', likes: 442 },
        { id: 'f6', prompt: 'Gym fitness lifestyle', imageUrl: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=800&q=80', likes: 567 },
        { id: 'f7', prompt: 'Luxury handbag fashion', imageUrl: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80', likes: 318 },
        { id: 'f8', prompt: 'Wireless headphones urban', imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80', likes: 209 },
        { id: 'f9', prompt: 'Smart watch park lifestyle', imageUrl: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=800&q=80', likes: 784 },
    ];
    const insert = db.prepare('INSERT OR IGNORE INTO generations (id, userId, prompt, imageUrl, timestamp, likes) VALUES (?, ?, ?, ?, ?, ?)');
    items.forEach(i => insert.run(i.id, 'featured', i.prompt, i.imageUrl, Date.now(), i.likes));
    console.log('Community seed done.');
};
seedCommunity();

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || '' });

app.use(express.static(join(__dirname, 'dist')));

// ── FALLBACK image map ────────────────────────────────────────────────────
const IMAGE_FALLBACKS = {
    skincare: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&w=768&h=1024&q=85',
    makeup: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=768&h=1024&q=85',
    watch: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=768&h=1024&q=85',
    shoe: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=768&h=1024&q=85',
    sneaker: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=768&h=1024&q=85',
    coffee: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=768&h=1024&q=85',
    bag: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=768&h=1024&q=85',
    headphone: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=768&h=1024&q=85',
    fitness: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=768&h=1024&q=85',
    gym: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=768&h=1024&q=85',
    fashion: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=768&h=1024&q=85',
    jacket: 'https://images.unsplash.com/photo-1520975954732-35dd22299614?auto=format&fit=crop&w=768&h=1024&q=85',
    food: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=768&h=1024&q=85',
    phone: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=768&h=1024&q=85',
    laptop: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=768&h=1024&q=85',
    perfume: 'https://images.unsplash.com/photo-1541643600914-78b084683702?auto=format&fit=crop&w=768&h=1024&q=85',
    dairy: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=800&q=80',
    carpenter: 'https://images.unsplash.com/photo-1581783898377-1c85bf937427?auto=format&fit=crop&w=800&q=80',
    chocolate: 'https://images.unsplash.com/photo-1548900911-9336bb33924f?auto=format&fit=crop&w=800&q=80',
    biscuit: 'https://images.unsplash.com/photo-1558961776-6f4bb16393c8?auto=format&fit=crop&w=800&q=80',
    vaccine: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80',
    tea: 'https://images.unsplash.com/photo-1544787210-2211d2471d7b?auto=format&fit=crop&w=800&q=80',
};

// ── Campaign Specific Fallbacks ───────────────────────────────────────────
const CAMPAIGN_FALLBACKS = {
    amul: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=800&q=80',
    fevicol: 'https://images.unsplash.com/photo-1581783898377-1c85bf937427?auto=format&fit=crop&w=800&q=80',
    cadbury: 'https://images.unsplash.com/photo-1548900911-9336bb33924f?auto=format&fit=crop&w=800&q=80',
    surfexcel: 'https://images.unsplash.com/photo-1541014741259-df549fa9ba6f?auto=format&fit=crop&w=800&q=80',
    parleg: 'https://images.unsplash.com/photo-1558961776-6f4bb16393c8?auto=format&fit=crop&w=800&q=80',
    nirma: 'https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?auto=format&fit=crop&w=800&q=80',
    'amitabh-polio': 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80',
    idea: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80',
    tatatea: 'https://images.unsplash.com/photo-1544787210-2211d2471d7b?auto=format&fit=crop&w=800&q=80',
    mtv: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80',
    cred: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80',
    ariel: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80',
    happydent: 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&w=800&q=80',
    fivestar: 'https://images.unsplash.com/photo-1516728775854-93ad29c9fe80?auto=format&fit=crop&w=800&q=80',
    urbancompany: 'https://images.unsplash.com/photo-1581578731522-7b754775ab05?auto=format&fit=crop&w=800&q=80',
};

function getContextualImage(keywords, id) {
    if (id && CAMPAIGN_FALLBACKS[id]) return CAMPAIGN_FALLBACKS[id];
    const lk = (keywords || '').toLowerCase();
    const match = Object.keys(IMAGE_FALLBACKS).find(k => lk.includes(k));
    return IMAGE_FALLBACKS[match] || 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=768&h=1024&q=85';
}

// ── VIDEO FALLBACK map (tested working URLs only) ────────────────────────
// Pexels free CDN videos (no API key needed for direct video file access)
const VIDEO_FALLBACKS = {
    skincare: 'https://videos.pexels.com/video-files/3571264/3571264-sd_640_360_24fps.mp4',
    beauty: 'https://videos.pexels.com/video-files/3571264/3571264-sd_640_360_24fps.mp4',
    makeup: 'https://videos.pexels.com/video-files/3571264/3571264-sd_640_360_24fps.mp4',
    fitness: 'https://videos.pexels.com/video-files/4098458/4098458-sd_640_360_24fps.mp4',
    gym: 'https://videos.pexels.com/video-files/4098458/4098458-sd_640_360_24fps.mp4',
    workout: 'https://videos.pexels.com/video-files/4098458/4098458-sd_640_360_24fps.mp4',
    fashion: 'https://videos.pexels.com/video-files/4348404/4348404-sd_640_360_25fps.mp4',
    shoe: 'https://videos.pexels.com/video-files/4348404/4348404-sd_640_360_25fps.mp4',
    sneaker: 'https://videos.pexels.com/video-files/4348404/4348404-sd_640_360_25fps.mp4',
    bag: 'https://videos.pexels.com/video-files/4521619/4521619-sd_640_360_25fps.mp4',
    coffee: 'https://videos.pexels.com/video-files/5386785/5386785-sd_640_360_30fps.mp4',
    food: 'https://videos.pexels.com/video-files/5386785/5386785-sd_640_360_30fps.mp4',
    watch: 'https://videos.pexels.com/video-files/6980374/6980374-sd_640_360_25fps.mp4',
    jewelry: 'https://videos.pexels.com/video-files/6980374/6980374-sd_640_360_25fps.mp4',
    tech: 'https://videos.pexels.com/video-files/3194277/3194277-sd_640_360_25fps.mp4',
    phone: 'https://videos.pexels.com/video-files/3194277/3194277-sd_640_360_25fps.mp4',
    laptop: 'https://videos.pexels.com/video-files/3194277/3194277-sd_640_360_25fps.mp4',
};

// Default: reliable Google CDN lifestyle video
const DEFAULT_VIDEO = 'https://videos.pexels.com/video-files/4348404/4348404-sd_640_360_25fps.mp4';

function getContextualVideo(keywords) {
    const lk = (keywords || '').toLowerCase();
    const match = Object.keys(VIDEO_FALLBACKS).find(k => lk.includes(k));
    return VIDEO_FALLBACKS[match] || DEFAULT_VIDEO;
}

// ── Campaign Prompts ──────────────────────────────────────────────────────
const CAMPAIGN_PROMPTS = {
    amul: 'Indian dairy advertising campaign, girl mascot holding butter, colorful Mumbai billboard style, witty retro Indian commercial art, warm golden colors, lifestyle UGC, topical humor advertisement',
    fevicol: 'Indian craftsman carpenter holding yellow Fevicol adhesive tube, traditional wooden workshop, tools hanging on wall, authentic rural India UGC lifestyle, warm tones',
    cadbury: 'young Indian woman dancing joyfully, holding Cadbury Dairy Milk purple chocolate bar, cricket stadium background, celebrating with arms outstretched, vibrant colors, happiness and freedom, UGC lifestyle photo',
    surfexcel: 'happy Indian school child in white school uniform with colorful paint and mud stains, playing outdoors, carefree and joyful, warm family photography, lifestyle UGC, emotional storytelling',
    parleg: 'Indian schoolboy holding Parle-G biscuit packet, school bag on back, nostalgic wholesome Indian childhood, warm golden afternoon light, genuine happy expression, lifestyle UGC photography',
    nirma: 'Indian woman in colorful sari washing clothes with Nirma powder, bright sunny day, clean white laundry hanging, traditional Indian courtyard, joyful expression, authentic UGC lifestyle',
    'amitabh-polio': 'distinguished Indian elder man in white kurta giving oral vaccine drops to young child, caring father-figure expression, health clinic India, warm compassionate lighting, public service announcement style photography',
    idea: 'young Indian man with light bulb over head, "eureka" moment expression, holding smartphone, village setting with people gathered, direct communication gesture, lifestyle UGC India telecom ad',
    tatatea: 'young Indian woman waking up early morning, holding Tata Tea cup, sunrise background, civic awareness expression, traditional kurta, morning routine UGC lifestyle, purposeful determined look',
    mtv: 'young Indian musician playing electric guitar, urban Indian street art background, MTV logo aesthetic, vibrant neon colors, music festival energy, Gen Z lifestyle UGC, headphones, expressive pose',
    cred: 'respectable middle-aged Indian man in casual clothes looking unexpectedly intimidating on Bangalore street, Indiranagar neighborhood, twist of expectations, humorous expression, premium fintech app UGC',
    ariel: 'Indian husband and wife doing laundry together in modern apartment, both smiling, equal partnership, Ariel detergent product visible, warm family photography, gender equality UGC lifestyle, genuine connection',
    happydent: 'Indian man with radiant sparkling white smile, dark elegant palace background lit only by the bright smile, dramatic cinematic lighting, teeth whitening gum ad, magical UGC lifestyle, toothpaste product',
    fivestar: 'carefree young Indian college student lounging on sofa eating 5Star chocolate bar, blissfully doing nothing, unbothered expression, cozy room, warm afternoon light, university dorm, relatable Gen Z lifestyle UGC',
    urbancompany: 'professional Indian technician in clean Urban Company branded uniform fixing home appliance, modern apartment, tools in organized bag, competent trustworthy expression, premium home service UGC lifestyle photography'
};

// ── /api/generate — Real AI Image Generation via Pollinations AI ─────────
app.post('/api/generate', async (req, res) => {
    const { prompt, productImage, userImage, userId } = req.body;
    try {
        // Default prompt if Gemini fails
        let detailedPrompt = prompt
            ? `${prompt}, photorealistic UGC ad, high quality, 4k`
            : `professional lifestyle UGC photo, person naturally using product, photorealistic, natural lighting, social media aesthetic, high quality`;

        // ── Vision Prompt Crafting (HF -> OpenAI -> Gemini) ──
        if (process.env.HF_TOKEN && process.env.HF_MODEL && (userImage || productImage)) {
            try {
                console.log(`🎨 Crafting prompt via HF (${process.env.HF_MODEL})...`);
                const instruction = `You are a world-class UGC art director and master Flux.1 prompt engineer.
Two source images are provided as context: (1) PERSON, (2) PRODUCT.
Task: Generate a comma-separated list of high-accuracy keywords for a hyper-realistic UGC photo.

STRICT COMPOSITION REQUIREMENTS:
1. SUBJECT ACTION: The PERSON must be clearly USING or HOLDING the PRODUCT.
2. ANATOMIC PRECISION: Describe the person's EXACT ethnicity, age group, hair color/texture, and clothing based on context.
3. PRODUCT FIDELITY: Describe the product's EXACT material (glass, matte, chrome), primary color, and brand logo placement.
4. CAMERA: "Shot on iPhone 15 Pro, 35mm lens, f/1.8, shallow depth of field, sharp focus on product, cinematic lifestyle lighting".
5. ENVIRONMENT: "Clean, natural setting, morning sunlight, soft shadows".

Extra user context: "${prompt || 'Photorealistic UGC ad'}"
OUTPUT ONLY the comma-separated keywords (MAX 60 words). No sentences.`;

                const response = await hf.chatCompletion({
                    model: process.env.HF_MODEL,
                    messages: [{ role: "user", content: instruction }],
                    max_tokens: 200,
                });

                const crafted = response.choices[0]?.message?.content?.trim();
                if (crafted) {
                    detailedPrompt = crafted;
                    console.log('✨ Crafted HF prompt:', detailedPrompt.substring(0, 120) + '...');
                }
            } catch (e) {
                console.warn('HF prompt crafting failed:', e.message);
            }
        } else if (process.env.OPENAI_API_KEY) {
            try {
                const messages = [
                    {
                        role: "system",
                        content: `You are a world-class UGC art director and master Flux.1 prompt engineer.
Two source images are provided: (1) PERSON, (2) PRODUCT.
Generate a comma-separated list of high-accuracy keywords for a hyper-realistic UGC photo.

STRICT COMPOSITION REQUIREMENTS:
1. SUBJECT ACTION: The PERSON (Image 1) must be clearly USING or HOLDING the PRODUCT (Image 2).
2. ANATOMIC PRECISION: Describe the person's EXACT ethnicity, age group, hair color/texture, and clothing from Image 1.
3. PRODUCT FIDELITY: Describe the product's EXACT material (glass, matte, chrome), primary color, and brand logo placement from Image 2.
4. CAMERA: "Shot on iPhone 15 Pro, 35mm lens, f/1.8, shallow depth of field, sharp focus on product, cinematic lifestyle lighting".
5. ENVIRONMENT: "Clean, natural setting, morning sunlight, soft shadows".

OUTPUT ONLY the comma-separated keywords (MAX 60 words). No sentences.`
                    },
                    {
                        role: "user",
                        content: [
                            { type: "text", text: `Extra user context: "${prompt || 'Photorealistic UGC ad'}"` }
                        ]
                    }
                ];

                if (userImage) messages[1].content.push({ type: "image_url", image_url: { url: userImage } });
                if (productImage) messages[1].content.push({ type: "image_url", image_url: { url: productImage } });

                const completion = await openai.chat.completions.create({
                    model: "gpt-4o",
                    messages: messages,
                    max_tokens: 200,
                });

                const crafted = completion.choices[0]?.message?.content?.trim();
                if (crafted) {
                    detailedPrompt = crafted;
                    console.log('✨ Crafted OpenAI prompt:', detailedPrompt.substring(0, 120) + '...');
                }
            } catch (e) {
                console.warn('OpenAI prompt crafting failed:', e.message);
            }
        } else if (process.env.GEMINI_API_KEY) {
            try {
                const parts = [{
                    text: `You are a world-class UGC art director and master Flux.1 prompt engineer.
Two source images are provided: (1) PERSON, (2) PRODUCT.
Generate a comma-separated list of high-accuracy keywords for a hyper-realistic UGC photo.

STRICT COMPOSITION REQUIREMENTS:
1. SUBJECT ACTION: The PERSON (Image 1) must be clearly USING or HOLDING the PRODUCT (Image 2).
2. ANATOMIC PRECISION: Describe the person's EXACT ethnicity, age group, hair color/texture, and clothing from Image 1.
3. PRODUCT FIDELITY: Describe the product's EXACT material (glass, matte, chrome), primary color, and brand logo placement from Image 2.
4. CAMERA: "Shot on iPhone 15 Pro, 35mm lens, f/1.8, shallow depth of field, sharp focus on product, cinematic lifestyle lighting".
5. ENVIRONMENT: "Clean, natural setting, morning sunlight, soft shadows".

OUTPUT ONLY the comma-separated keywords (MAX 60 words). No sentences, no preamble.`
                }];
                if (userImage) parts.push({ inlineData: { data: userImage.split(',')[1], mimeType: 'image/jpeg' } });
                if (productImage) parts.push({ inlineData: { data: productImage.split(',')[1], mimeType: 'image/jpeg' } });

                const result = await genAI.models.generateContent({
                    model: 'gemini-2.0-flash',
                    contents: [{ role: 'user', parts }],
                });
                const crafted = result.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
                if (crafted) {
                    detailedPrompt = crafted;
                    console.log('✨ Crafted Gemini prompt:', detailedPrompt.substring(0, 120) + '...');
                }
            } catch (e) {
                console.warn('Gemini prompt crafting failed:', e.message);
            }
        }

        // ── Image Generation (HF -> OpenAI -> Pollinations) ─────────────
        let imageUrl;

        // Try Hugging Face Z-Image-Turbo or FLUX.1-schnell
        if (!imageUrl && process.env.HF_TOKEN) {
            try {
                console.log('🎨 Generating image via Hugging Face (Z-Image-Turbo)...');
                const response = await hf.textToImage({
                    model: 'Tongyi-MAI/Z-Image-Turbo',
                    inputs: detailedPrompt,
                    parameters: { guidance_scale: 0.0, num_inference_steps: 8 }
                });
                const buffer = await response.arrayBuffer();
                imageUrl = `data:image/png;base64,${Buffer.from(buffer).toString('base64')}`;
                console.log(`✅ AI image generated via HF (Z-Image-Turbo)`);
            } catch (e) {
                console.warn('HF Z-Image-Turbo failed, trying FLUX.1-schnell:', e.message);
                try {
                    console.log('🎨 Generating image via HF (FLUX.1-schnell)...');
                    const response = await hf.textToImage({
                        model: 'black-forest-labs/FLUX.1-schnell',
                        inputs: detailedPrompt,
                        parameters: { num_inference_steps: 4 }
                    });
                    const buffer = await response.arrayBuffer();
                    imageUrl = `data:image/png;base64,${Buffer.from(buffer).toString('base64')}`;
                    console.log(`✅ AI image generated via HF (FLUX.1-schnell)`);
                } catch (hf2Err) {
                    console.warn('HF FLUX.1-schnell failed:', hf2Err.message);
                }
            }
        }

        // Try OpenAI DALL-E 3
        if (!imageUrl && process.env.OPENAI_API_KEY) {
            try {
                console.log('🎨 Generating image via OpenAI DALL-E 3...');
                const result = await openai.images.generate({
                    model: "dall-e-3",
                    prompt: detailedPrompt,
                    size: "1024x1024",
                    response_format: "b64_json"
                });
                imageUrl = `data:image/png;base64,${result.data[0].b64_json}`;
                console.log(`✅ AI image generated via OpenAI`);
            } catch (e) {
                console.warn('OpenAI DALL-E failed:', e.message);
            }
        }

        // Try Pollinations AI (Reliable Fallback)
        if (!imageUrl) {
            console.log('🎨 Generating image via Pollinations AI...');
            const seed = Math.floor(Math.random() * 9_999_999);
            const encodedPrompt = encodeURIComponent(detailedPrompt.substring(0, 1000));
            const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&seed=${seed}&nologo=true`;

            try {
                const imgRes = await fetch(pollinationsUrl);
                if (!imgRes.ok) throw new Error(`Pollinations HTTP ${imgRes.status}`);
                const buffer = await imgRes.arrayBuffer();
                if (buffer.byteLength < 5000) throw new Error('Pollinations image too small');
                imageUrl = `data:image/jpeg;base64,${Buffer.from(buffer).toString('base64')}`;
                console.log(`✅ AI image generated via Pollinations (${(buffer.byteLength / 1024).toFixed(0)} KB)`);
            } catch (e) {
                console.warn('Pollinations failed, using contextual fallback:', e.message);
                imageUrl = getContextualImage((prompt || '') + ' ' + detailedPrompt, id);
            }
        }

        // ── Deduct Credits ──
        if (userId && userId !== 'anonymous') {
            db.prepare('UPDATE user_profiles SET credits = MAX(0, credits - 1) WHERE userId = ?').run(userId);
        }

        const generation = {
            id: Math.random().toString(36).substr(2, 9),
            userId: userId || 'anonymous',
            prompt: prompt || detailedPrompt.substring(0, 100) || 'UGC Generation',
            imageUrl,
            videoUrl: null,
            timestamp: Date.now(),
            likes: 0
        };

        db.prepare('INSERT INTO generations (id, userId, prompt, imageUrl, videoUrl, timestamp, likes) VALUES (?, ?, ?, ?, ?, ?, ?)')
            .run(generation.id, generation.userId, generation.prompt, generation.imageUrl, generation.videoUrl, generation.timestamp, 0);

        res.json(generation);
    } catch (error) {
        console.error('Generation error:', error);
        res.status(500).json({ error: error.message });
    }
});

// ── /api/generate-video — AI Video Generation ─────────────────────────────
app.post('/api/generate-video', async (req, res) => {
    const { imageUrl, prompt, generationId, userId } = req.body;
    try {
        // ── Deduct Credits ──
        if (userId && userId !== 'anonymous') {
            db.prepare('UPDATE user_profiles SET credits = MAX(0, credits - 1) WHERE userId = ?').run(userId);
        }

        let videoUrl = null;

        // ── Option 1: Replicate Stable Video Diffusion (if token configured) ──
        if (process.env.REPLICATE_API_TOKEN && imageUrl && !imageUrl.startsWith('data:')) {
            try {
                console.log('🎬 Attempting Replicate Stable Video Diffusion...');
                const createRes = await fetch('https://api.replicate.com/v1/predictions', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        version: 'd68b6e09eedbac7a49e3d8644999d93579c386a083768235cabca88796d70d82',
                        input: {
                            input_image: imageUrl,
                            sizing_strategy: 'maintain_aspect_ratio',
                            frames_per_second: 8,
                            num_frames: 25,
                            motion_bucket_id: 127,
                            cond_aug: 0.02,
                        },
                    }),
                });
                const prediction = await createRes.json();
                let result = prediction;
                const svdStart = Date.now();
                while (result.status !== 'succeeded' && result.status !== 'failed') {
                    if (Date.now() - svdStart > 120000) { console.warn('Replicate SVD timeout'); break; }
                    await new Promise(r => setTimeout(r, 4000));
                    const pollRes = await fetch(`https://api.replicate.com/v1/predictions/${result.id}`, {
                        headers: { 'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}` },
                    });
                    result = await pollRes.json();
                    console.log('SVD status:', result.status);
                }
                if (result.status === 'succeeded' && result.output?.[0]) {
                    videoUrl = result.output[0];
                    console.log('✅ SVD video generated:', videoUrl);
                }
            } catch (e) {
                console.warn('Replicate SVD failed:', e.message);
            }
        }

        if (videoUrl) {
            if (generationId) {
                db.prepare('UPDATE generations SET videoUrl = ? WHERE id = ?').run(videoUrl, generationId);
            }
            return res.json({ videoUrl, success: true });
        }

        // ── Option 2: Fallback to Client ─────────────────────────────────────
        // (Veo 2 / Gemini Video requires specialized SDK or Vertex AI access)
        console.log('📱 Returning useClientVideo — browser will render Ken Burns animation');
        return res.json({ useClientVideo: true, success: true });

    } catch (error) {
        console.error('Video generation error:', error);
        res.status(500).json({ error: error.message });
    }
});

// ── /api/edit ─────────────────────────────────────────────────────────────
app.post('/api/edit', async (req, res) => {
    const { prompt, image } = req.body;
    try {
        // For edit, just return the original image with a success response
        // (image editing requires a paid quota model)
        res.json({ id: Math.random().toString(36).substr(2, 9), imageUrl: image, prompt, timestamp: Date.now() });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ── Community ─────────────────────────────────────────────────────────────
app.get('/api/generations', (req, res) => {
    res.json(db.prepare('SELECT * FROM generations ORDER BY timestamp DESC LIMIT 50').all());
});

app.post('/api/like/:id', (req, res) => {
    db.prepare('UPDATE generations SET likes = likes + 1 WHERE id = ?').run(req.params.id);
    res.json({ success: true });
});

app.get('/api/generations/:userId', (req, res) => {
    res.json(db.prepare('SELECT * FROM generations WHERE userId = ? ORDER BY timestamp DESC').all(req.params.userId));
});

// ── Brand Kit ─────────────────────────────────────────────────────────────
app.get('/api/brand-kit/:userId', (req, res) => {
    try {
        const row = db.prepare('SELECT * FROM brand_kits WHERE userId = ?').get(req.params.userId);
        if (row) {
            res.json({
                colors: JSON.parse(row.colors || '[]'),
                logos: JSON.parse(row.logos || '[]'),
                typography: JSON.parse(row.typography || '{}')
            });
        }
        else res.status(404).json({ error: 'Not found' });
    } catch (e) {
        console.error('Brand kit fetch error:', e);
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/brand-kit', (req, res) => {
    try {
        const { userId, colors, logos, typography } = req.body;
        db.prepare('INSERT OR REPLACE INTO brand_kits (userId, colors, logos, typography) VALUES (?, ?, ?, ?)')
            .run(userId, JSON.stringify(colors), JSON.stringify(logos), JSON.stringify(typography));
        res.json({ success: true });
    } catch (e) {
        console.error('Brand kit save error:', e);
        res.status(500).json({ error: e.message });
    }
});

// ── Proxy Download ────────────────────────────────────────────────────────
app.get('/api/proxy-download', async (req, res) => {
    const { url } = req.query;
    if (!url) return res.status(400).send('URL required');
    try {
        const r = await fetch(url);
        if (!r.ok) throw new Error(`Fetch failed: ${r.status}`);
        const ct = r.headers.get('content-type');
        if (ct) res.setHeader('Content-Type', ct);
        res.setHeader('Content-Disposition', `attachment; filename="ugcai-${Date.now()}"`);
        res.send(Buffer.from(await r.arrayBuffer()));
    } catch (e) {
        res.status(500).send('Proxy download failed');
    }
});

// ── User Profiles & Plans ───────────────────────────────────────────────
app.get('/api/user-profile/:userId', (req, res) => {
    try {
        let profile = db.prepare('SELECT * FROM user_profiles WHERE userId = ?').get(req.params.userId);
        if (!profile) {
            // Auto-create profile for new users
            db.prepare('INSERT INTO user_profiles (userId, tier, credits) VALUES (?, ?, ?)').run(req.params.userId, 'Basic', 100);
            profile = { userId: req.params.userId, tier: 'Basic', credits: 100 };
        }
        res.json(profile);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/update-plan', (req, res) => {
    try {
        const { userId, tier } = req.body;
        const credits = tier === 'Pro' ? 999999 : 100;
        db.prepare('INSERT OR REPLACE INTO user_profiles (userId, tier, credits) VALUES (?, ?, ?)')
            .run(userId, tier, credits);
        res.json({ success: true, tier, credits });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// ── Campaign Images ───────────────────────────────────────────────────────
app.get('/api/campaign-image/:id', async (req, res) => {
    const { id } = req.params;
    const prompt = CAMPAIGN_PROMPTS[id];

    if (!prompt) {
        return res.status(404).json({ error: 'Campaign not found' });
    }

    try {
        console.log(`📸 Generating image for campaign: ${id}...`);
        let imageUrl;

        // Stage 1: Hugging Face
        if (process.env.HF_TOKEN) {
            try {
                const response = await hf.textToImage({
                    model: 'Tongyi-MAI/Z-Image-Turbo',
                    inputs: prompt,
                    parameters: { guidance_scale: 0.0, num_inference_steps: 8 }
                });
                const buffer = await response.arrayBuffer();
                imageUrl = `data:image/png;base64,${Buffer.from(buffer).toString('base64')}`;
                console.log(`✅ Campaign image generated via HF`);
            } catch (e) {
                console.warn('HF failed for campaign image:', e.message);
            }
        }

        // Stage 2: OpenAI
        if (!imageUrl && process.env.OPENAI_API_KEY) {
            try {
                const result = await openai.images.generate({
                    model: "dall-e-3",
                    prompt: prompt,
                    size: "1024x1024",
                    response_format: "b64_json"
                });
                imageUrl = `data:image/png;base64,${result.data[0].b64_json}`;
                console.log(`✅ Campaign image generated via OpenAI`);
            } catch (e) {
                console.warn('OpenAI failed for campaign image:', e.message);
            }
        }

        // Try Pollinations
        if (!imageUrl) {
            const seed = Math.floor(Math.random() * 9_999_999);
            const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=1024&seed=${seed}&nologo=true`;
            try {
                // Add short timeout for pollinations to avoid hanging
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 8000);
                const imgRes = await fetch(pollinationsUrl, { signal: controller.signal });
                clearTimeout(timeoutId);

                if (imgRes.ok) {
                    const buffer = await imgRes.arrayBuffer();
                    imageUrl = `data:image/jpeg;base64,${Buffer.from(buffer).toString('base64')}`;
                    console.log(`✅ Campaign image generated via Pollinations`);
                }
            } catch (e) {
                console.warn('Pollinations failed for campaign image:', e.message);
            }
        }

        // Final Fallback: Campaign-specific or Contextual
        if (!imageUrl) {
            imageUrl = getContextualImage(prompt, id);
            console.log(`⚠️ All AI failed, using reliable fallback for campaign: ${id}`);
        }

        // Detect base64 or URL
        if (imageUrl.startsWith('data:')) {
            const [header, base64] = imageUrl.split(',');
            const mime = header.match(/:(.*?);/)[1];
            res.setHeader('Content-Type', mime);
            res.send(Buffer.from(base64, 'base64'));
        } else {
            res.redirect(imageUrl);
        }

    } catch (error) {
        console.error(`🔥 Campaign image error for ${id}:`, error);
        res.status(500).json({ error: error.message });
    }
});

// ── Hugging Face Ad Copy Generation ──────────────────────────────────────
const hf = new HfInference(process.env.HF_TOKEN || '');

app.post('/api/hf-ad-copy', async (req, res) => {
    const { prompt } = req.body;
    try {
        if (!process.env.HF_TOKEN) {
            return res.json({
                copy: [
                    "Experience the future of UGC advertising with our AI-powered platform.",
                    "Build high-converting ads in seconds.",
                    "The perfect solution for social media marketing."
                ],
                warning: "HF_TOKEN not configured, using placeholders."
            });
        }

        const modelId = process.env.HF_MODEL || "distilbert/distilbert-base-uncased";
        let copy = [];

        try {
            if (modelId.includes('Kimi') || modelId.includes('Instruct')) {
                const response = await hf.chatCompletion({
                    model: modelId,
                    messages: [{
                        role: "user",
                        content: `Generate 3 short, viral UGC ad captions for a product described as: ${prompt || 'an amazing lifestyle product'}. Output ONLY the captions, one per line.`
                    }],
                    max_tokens: 200,
                });
                copy = response.choices[0]?.message?.content?.split('\n').filter(line => line.trim().length > 0).slice(0, 3);
            } else {
                const response = await hf.fillMask({
                    model: modelId,
                    inputs: prompt || "The best product for [MASK].",
                });
                copy = response.map(r => r.sequence.replace('[CLS]', '').replace('[SEP]', '').trim());
            }
        } catch (hfError) {
            console.error('HF internal error:', hfError.message);
            // Fallback to placeholders if live API fails
            copy = [
                "Experience the future of UGC advertising with our AI-powered platform.",
                "Build high-converting ads in seconds.",
                "The perfect solution for social media marketing."
            ];
        }
        res.json({ copy });
    } catch (error) {
        console.error('HF Inference error:', error);
        res.status(500).json({ error: error.message });
    }
});

// ── SPA catch-all ─────────────────────────────────────────────────────────
app.get('*', (req, res) => {
    res.sendFile(join(__dirname, 'dist', 'index.html'));
});

// ── Global Error Handler ───────────────────────────────────────────────
app.use((err, req, res, next) => {
    console.error('🔥 Global Express Error:', err);
    res.status(500).json({
        error: 'Internal Server Error',
        message: err.message,
        path: req.path
    });
});

app.listen(port, '0.0.0.0', () => {
    const actualUrl = `http://localhost:${port}`;
    console.log(`🚀 Server running at ${actualUrl}`);
    console.log(`📡 API endpoints available at ${actualUrl}/api`);
});
