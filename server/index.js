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

app.use(cors());
app.use(express.json());

// Serve static files from the React app build directory
app.use(express.static(path.join(__dirname, '../dist')));

// API Routes
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date() });
});

// Sync User (Upsert)
app.post('/api/user/sync', async (req, res) => {
    try {
        const { lovenseUid, nickname } = req.body;

        if (!lovenseUid) {
            return res.status(400).json({ error: 'lovenseUid is required' });
        }

        const user = await prisma.user.upsert({
            where: { lovenseUid },
            update: { nickname }, // Update nickname if changed
            create: {
                lovenseUid,
                nickname: nickname || 'Anonymous'
            }
        });

        res.json(user);
    } catch (error) {
        console.error('Error syncing user:', error);
        res.status(500).json({ error: 'Failed to sync user' });
    }
});

// Get User Data
app.get('/api/user/:uid', async (req, res) => {
    try {
        const { uid } = req.params;
        const user = await prisma.user.findUnique({
            where: { lovenseUid: uid }
        });

        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user);
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ error: 'Failed to fetch user' });
    }
});

// Update High Score
app.post('/api/user/score', async (req, res) => {
    try {
        const { lovenseUid, score } = req.body;

        const user = await prisma.user.findUnique({ where: { lovenseUid } });
        if (!user) return res.status(404).json({ error: 'User not found' });

        if (score > user.highScore) {
            const updatedUser = await prisma.user.update({
                where: { lovenseUid },
                data: { highScore: score }
            });
            return res.json({ newHighScore: true, user: updatedUser });
        }

        res.json({ newHighScore: false, user });
    } catch (error) {
        console.error('Error updating score:', error);
        res.status(500).json({ error: 'Failed to update score' });
    }
});

// Fallback for SPA routing: serve index.html for any unknown route
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
