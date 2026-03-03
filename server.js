import express from 'express';
import { GoogleGenAI } from "@google/genai";
import dotenv from 'dotenv';
import cors from 'cors';
import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Database setup
const db = new Database(join(__dirname, 'ugc.db'));
db.exec(`
  CREATE TABLE IF NOT EXISTS generations (
    id TEXT PRIMARY KEY,
    userId TEXT,
    prompt TEXT,
    imageUrl TEXT,
    timestamp INTEGER,
    likes INTEGER DEFAULT 0
  );
  CREATE TABLE IF NOT EXISTS brand_kits (
    userId TEXT PRIMARY KEY,
    colors TEXT,
    logos TEXT,
    typography TEXT
  );
`);

// Seed data for Community
const seedCommunity = () => {
    const featuredItems = [
        { id: 'f1', userId: 'featured', prompt: 'Commercial shot of a luxury watch on a wooden desk, soft lighting', imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80', likes: 124 },
        { id: 'f2', userId: 'featured', prompt: 'Athletic sneakers on a urban rooftop, sunset glow', imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80', likes: 89 },
        { id: 'f3', userId: 'featured', prompt: 'Minimalist skincare bottle in a spa setting with marble', imageUrl: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&w=800&q=80', likes: 231 },
        { id: 'f4', userId: 'featured', prompt: 'Majestic elephant walking through the savannah dust, cinematic', imageUrl: 'https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?auto=format&fit=crop&w=800&q=80', likes: 156 },
        { id: 'f5', userId: 'featured', prompt: 'Professional coffee latte art in a cozy cafe morning light', imageUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80', likes: 442 },
        { id: 'f6', userId: 'featured', prompt: 'Fierce lion roaring in the golden hour, wildlife photography', imageUrl: 'https://images.unsplash.com/photo-1546182990-dffeafbe841d?auto=format&fit=crop&w=800&q=80', likes: 567 },
        { id: 'f7', userId: 'featured', prompt: 'Sports car on an open highway, motion blur, dramatic sunset', imageUrl: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80', likes: 318 },
        { id: 'f8', userId: 'featured', prompt: 'Colorful parrot sitting on a tropical branch, macro lens', imageUrl: 'https://images.unsplash.com/photo-1444464666168-49d633b867ad?auto=format&fit=crop&w=800&q=80', likes: 209 },
        { id: 'f9', userId: 'featured', prompt: 'Golden sunset over the ocean, long exposure photography', imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80', likes: 784 },
    ];

    const insert = db.prepare('INSERT OR IGNORE INTO generations (id, userId, prompt, imageUrl, timestamp, likes) VALUES (?, ?, ?, ?, ?, ?)');
    featuredItems.forEach(item => {
        insert.run(item.id, item.userId, item.prompt, item.imageUrl, Date.now(), item.likes);
    });
    console.log('Community featured items ensured.');
};

seedCommunity();

const genAI = new GoogleGenAI(process.env.GEMINI_API_KEY || '');

// Serve static files from the 'dist' directory
app.use(express.static(join(__dirname, 'dist')));

// API Routes
app.post('/api/generate', async (req, res) => {
    const { prompt, productImage, modelImage, userId } = req.body;

    try {
        let generatedImageBase64 = '';

        // Only attempt Gemini if key is present
        if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'YOUR_GEMINI_API_KEY_HERE') {
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const parts = [
                {
                    text: `Create a professional UGC lifestyle image. 
                   Product: the item in the first image. 
                   Context: ${prompt}. 
                   Style: High-end commercial, social media ready, realistic lighting.` }
            ];

            if (productImage) {
                parts.push({
                    inlineData: {
                        data: productImage.split(',')[1],
                        mimeType: "image/png"
                    }
                });
            }

            const result = await model.generateContent({ contents: [{ role: 'user', parts }] });
            const response = await result.response;

            for (const part of response.candidates?.[0]?.content?.parts || []) {
                if (part.inlineData) {
                    generatedImageBase64 = `data:image/png;base64,${part.inlineData.data}`;
                    break;
                }
            }
        }

        // FALLBACK if Gemini is skipped or fails to OUT an image
        if (!generatedImageBase64) {
            // High-quality aesthetic fallback based on prompt keywords
            const fallbacks = {
                'shoe': 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80',
                'watch': 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
                'coffee': 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80',
                'skincare': 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&w=800&q=80'
            };

            const lowerPrompt = (prompt || '').toLowerCase();
            const key = Object.keys(fallbacks).find(k => lowerPrompt.includes(k));
            generatedImageBase64 = fallbacks[key] || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80";
        }

        const generation = {
            id: Math.random().toString(36).substr(2, 9),
            userId: userId || 'anonymous',
            prompt: prompt,
            imageUrl: generatedImageBase64,
            timestamp: Date.now(),
            likes: 0
        };

        const insert = db.prepare('INSERT INTO generations (id, userId, prompt, imageUrl, timestamp, likes) VALUES (?, ?, ?, ?, ?, ?)');
        insert.run(generation.id, generation.userId, generation.prompt, generation.imageUrl, generation.timestamp, 0);

        res.json(generation);
    } catch (error) {
        console.error("Generation error:", error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/edit', async (req, res) => {
    const { prompt, image, userId } = req.body;

    try {
        // Similar to generate, we'd use Gemini to handle the instruction
        // For now, we return the same image or a slightly modified one (mocked)
        res.json({
            id: Math.random().toString(36).substr(2, 9),
            imageUrl: image, // In a real app, this would be the edited image
            prompt: prompt,
            timestamp: Date.now()
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/generations', (req, res) => {
    const rows = db.prepare('SELECT * FROM generations ORDER BY timestamp DESC LIMIT 50').all();
    res.json(rows);
});

app.post('/api/like/:id', (req, res) => {
    const { id } = req.params;
    const update = db.prepare('UPDATE generations SET likes = likes + 1 WHERE id = ?');
    update.run(id);
    res.json({ success: true });
});

app.get('/api/generations/:userId', (req, res) => {
    const { userId } = req.params;
    const rows = db.prepare('SELECT * FROM generations WHERE userId = ? ORDER BY timestamp DESC').all(userId);
    res.json(rows);
});

app.get('/api/brand-kit/:userId', (req, res) => {
    const { userId } = req.params;
    const row = db.prepare('SELECT * FROM brand_kits WHERE userId = ?').get(userId);
    if (row) {
        res.json({
            colors: JSON.parse(row.colors),
            logos: JSON.parse(row.logos),
            typography: JSON.parse(row.typography)
        });
    } else {
        res.status(404).json({ error: "Brand kit not found" });
    }
});

app.post('/api/brand-kit', (req, res) => {
    const { userId, colors, logos, typography } = req.body;
    const upsert = db.prepare('INSERT OR REPLACE INTO brand_kits (userId, colors, logos, typography) VALUES (?, ?, ?, ?)');
    upsert.run(userId, JSON.stringify(colors), JSON.stringify(logos), JSON.stringify(typography));
    res.json({ success: true });
});

app.get('/api/proxy-download', async (req, res) => {
    const { url } = req.query;
    if (!url) return res.status(400).send('URL is required');

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Failed to fetch ${url}`);

        const contentType = response.headers.get('content-type');
        if (contentType) res.setHeader('Content-Type', contentType);

        const fileName = url.split('/').pop().split('?')[0] || 'download';
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

        const arrayBuffer = await response.arrayBuffer();
        res.send(Buffer.from(arrayBuffer));
    } catch (error) {
        console.error('Proxy download error:', error);
        res.status(500).send('Failed to proxy download');
    }
});

// Catch-all route for SPA
app.get('*', (req, res) => {
    res.sendFile(join(__dirname, 'dist', 'index.html'));
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
