import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

// --- Security Middleware ---
app.use((req, res, next) => {
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline' https://*.lovense.club; connect-src 'self' https://*.lovense.club https://*.up.railway.app wss://*.peerjs.com; style-src 'self' 'unsafe-inline'; img-src 'self' data:;");
    next();
});

app.use(cors({
    origin: process.env.NODE_ENV === 'production' ? [/up\.railway\.app$/, /lovense\.com$/] : '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10kb' })); // Limit body size to prevent DoS

// Serve static files from the React app build directory
app.use(express.static(path.join(__dirname, '../dist')));

// --- API Routes ---

// Health Check
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok', uptime: process.uptime() });
});

// Lovense Callback Validation
app.get('/api/lovense/callback', (req, res) => {
    res.status(200).send('OK');
});

app.post('/api/lovense/callback', (req, res) => {
    res.status(200).json({ status: 'received' });
});

// Sync User (Upsert)
app.post('/api/user/sync', async (req, res) => {
    try {
        const { lovenseUid, nickname } = req.body;

        if (!lovenseUid || typeof lovenseUid !== 'string' || lovenseUid.length < 5) {
            return res.status(400).json({ error: 'Valid lovenseUid is required' });
        }

        const user = await prisma.user.upsert({
            where: { lovenseUid },
            update: {
                nickname: nickname?.substring(0, 50),
                updatedAt: new Date()
            },
            create: {
                lovenseUid,
                nickname: nickname?.substring(0, 50) || 'Anonymous'
            }
        });

        res.json({
            id: user.id,
            nickname: user.nickname,
            highScore: user.highScore
        });
    } catch (error) {
        console.error('[Auth] Sync error');
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Get User Data
app.get('/api/user/:uid', async (req, res) => {
    try {
        const { uid } = req.params;
        if (!uid || uid.length < 5) return res.status(400).json({ error: 'Invalid UID' });

        const user = await prisma.user.findUnique({
            where: { lovenseUid: uid },
            select: { id: true, nickname: true, highScore: true }
        });

        if (!user) return res.status(404).json({ error: 'Not found' });
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Update High Score
app.post('/api/user/score', async (req, res) => {
    try {
        const { lovenseUid, score } = req.body;
        const scoreInt = parseInt(score);

        if (!lovenseUid || isNaN(scoreInt) || scoreInt < 0 || scoreInt > 1000000) {
            return res.status(400).json({ error: 'Invalid submission' });
        }

        const user = await prisma.user.findUnique({ where: { lovenseUid } });
        if (!user) return res.status(404).json({ error: 'User not found' });

        if (scoreInt > user.highScore) {
            const updatedUser = await prisma.user.update({
                where: { lovenseUid },
                data: { highScore: scoreInt },
                select: { id: true, highScore: true }
            });
            return res.json({ newHighScore: true, score: updatedUser.highScore });
        }

        res.json({ newHighScore: false, score: user.highScore });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// --- Fallback ---
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// --- Server Boot ---
const server = app.listen(PORT, () => {
    console.log(`[Bust] Secure server active on port ${PORT}`);
});

// Graceful Shutdown
process.on('SIGTERM', () => {
    server.close(() => {
        prisma.$disconnect();
        console.log('[Bust] Server closed');
    });
});
