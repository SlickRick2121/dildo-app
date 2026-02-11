import React, { useRef, useEffect, useState, useImperativeHandle, forwardRef } from 'react';
import { Lovense } from '../services/lan.js';

const PASTEL_COLORS = [
    'hsl(340, 100%, 85%)', // Pink
    'hsl(200, 100%, 85%)', // Blue
    'hsl(60, 100%, 85%)',  // Yellow
    'hsl(120, 100%, 85%)', // Green
    'hsl(280, 100%, 85%)', // Purple
];

const DARK_COLORS = [
    'hsl(340, 100%, 65%)',
    'hsl(200, 100%, 65%)',
    'hsl(60, 100%, 65%)',
    'hsl(120, 100%, 65%)',
    'hsl(280, 100%, 65%)',
];

const GameCanvas = forwardRef(({ theme, hostEvent, onStatsUpdate, onLovenseCmd }, ref) => {
    const canvasRef = useRef(null);
    const [score, setScore] = useState(0);
    const [combo, setCombo] = useState(0);
    const [maxCombo, setMaxCombo] = useState(0);
    const [notification, setNotification] = useState(null);

    // Helper to trigger local AND remote vibration
    const dispatchLovense = (func, ...args) => {
        // Local (Host)
        if (Lovense[func]) Lovense[func](...args);
        // Remote (Controller - via App)
        if (onLovenseCmd) onLovenseCmd(func, ...args);
    };

    // Game State Refs
    const gameState = useRef({
        balloons: [],
        particles: [],
        lastTime: 0,
        spawnTimer: 0,
        combo: 0,
        score: 0,
        isRunning: true,
        width: 0,
        height: 0,
        reactions: [] // Floating emojis
    });

    // Expose Reset Method
    useImperativeHandle(ref, () => ({
        resetGame: () => {
            gameState.current.score = 0;
            gameState.current.combo = 0;
            gameState.current.balloons = [];
            gameState.current.particles = [];
            gameState.current.spawnTimer = 0;
            setScore(0);
            setCombo(0);
        }
    }));

    // Handle Host Events
    useEffect(() => {
        if (!hostEvent) return;

        if (hostEvent.type === 'thumbsUp' || hostEvent.type === 'thumbsDown') {
            // Add reaction to game loop
            const emoji = hostEvent.type === 'thumbsUp' ? '👍' : '👎';
            gameState.current.reactions.push({
                text: emoji,
                x: gameState.current.width / 2,
                y: gameState.current.height / 2,
                vy: -5,
                life: 1.0,
                scale: 0.1
            });
            // Haptic feedback for reaction
            dispatchLovense('pulse', 50, 200);
        }

        if (hostEvent.type === 'notification') {
            setNotification(hostEvent.message);
            dispatchLovense('vibrate', 20);
            setTimeout(() => dispatchLovense('vibrate', 0), 200);

            // Auto hide notification
            setTimeout(() => setNotification(null), 4000);
        }

    }, [hostEvent]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        // Reset state
        gameState.current.isRunning = true;
        gameState.current.lastTime = 0;

        const handleResize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            gameState.current.width = window.innerWidth;
            gameState.current.height = window.innerHeight;
        };
        window.addEventListener('resize', handleResize);
        handleResize();

        const handleInput = (e) => {
            e.preventDefault();
            if (!gameState.current.isRunning) return;

            const rect = canvas.getBoundingClientRect();
            const x = (e.clientX || e.touches[0].clientX) - rect.left;
            const y = (e.clientY || e.touches[0].clientY) - rect.top;

            let hit = false;
            for (let i = gameState.current.balloons.length - 1; i >= 0; i--) {
                const b = gameState.current.balloons[i];
                if (b.popped) continue;

                const dist = Math.sqrt((x - b.x) ** 2 + (y - b.y) ** 2);
                if (dist < b.radius + 20) {
                    popBalloon(b);
                    hit = true;
                    break;
                }
            }
        };

        canvas.addEventListener('mousedown', handleInput);
        canvas.addEventListener('touchstart', handleInput, { passive: false });

        const loop = (time) => {
            if (!gameState.current.lastTime) {
                gameState.current.lastTime = time;
                requestAnimationFrame(loop);
                return;
            }

            const dt = time - gameState.current.lastTime;
            gameState.current.lastTime = time;
            const clampedDt = Math.min(dt, 100);

            update(clampedDt, time);
            draw(ctx);

            if (gameState.current.isRunning) {
                requestAnimationFrame(loop);
            }
        };

        requestAnimationFrame(loop);

        return () => {
            window.removeEventListener('resize', handleResize);
            canvas.removeEventListener('mousedown', handleInput);
            canvas.removeEventListener('touchstart', handleInput);
            gameState.current.isRunning = false;
        };
    }, []); // Theme change doesn't restart loop, just changes draw colors

    const popBalloon = (b) => {
        b.popped = true;
        gameState.current.score += 10 + (gameState.current.combo * 2);
        gameState.current.combo += 1;

        setScore(gameState.current.score);
        setCombo(gameState.current.combo);
        if (gameState.current.combo > maxCombo) setMaxCombo(gameState.current.combo);

        // Notify Parent for sync
        if (onStatsUpdate) {
            onStatsUpdate(gameState.current.score, gameState.current.combo);
        }

        createParticles(b.x, b.y, b.color);
        handleHaptics(gameState.current.combo);
    };

    const handleHaptics = (currentCombo) => {
        if (currentCombo >= 5) {
            dispatchLovense('pattern', 'wave', 500, Math.min(100, 50 + currentCombo * 5));
        } else if (currentCombo >= 3) {
            dispatchLovense('vibrate', 40);
            setTimeout(() => dispatchLovense('vibrate', 0), 300);
        } else {
            dispatchLovense('pulse', 30, 150);
        }
    };

    const createParticles = (x, y, color) => {
        for (let i = 0; i < 12; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 4 + 2;
            gameState.current.particles.push({
                x, y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 1.0,
                color: color
            });
        }
    };

    const update = (dt, time) => {
        const state = gameState.current;

        // Spawn
        state.spawnTimer += dt;
        const spawnRate = Math.max(500, 2000 - state.score);
        if (state.spawnTimer > spawnRate) {
            const palette = theme === 'dark' ? DARK_COLORS : PASTEL_COLORS;
            state.balloons.push({
                x: Math.random() * (state.width - 60) + 30,
                y: state.height + 50,
                radius: 30 + Math.random() * 15,
                speed: (Math.random() * 0.1 + 0.1) * (1 + state.score / 1000),
                color: palette[Math.floor(Math.random() * palette.length)],
                popped: false,
                wobbleOffset: Math.random() * 100
            });
            state.spawnTimer = 0;
        }

        // Balloons
        for (let i = state.balloons.length - 1; i >= 0; i--) {
            const b = state.balloons[i];
            if (b.popped) {
                state.balloons.splice(i, 1);
                continue;
            }
            b.y -= b.speed * dt;
            b.x += Math.sin((time / 500) + b.wobbleOffset) * 0.5;
            if (b.y < -50) {
                state.balloons.splice(i, 1);
                state.combo = 0;
                setCombo(0);
            }
        }

        // Particles
        for (let i = state.particles.length - 1; i >= 0; i--) {
            const p = state.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.1;
            p.life -= 0.02;
            if (p.life <= 0) state.particles.splice(i, 1);
        }

        // Reactions (Floating Emojis)
        for (let i = state.reactions.length - 1; i >= 0; i--) {
            const r = state.reactions[i];
            r.y += r.vy;
            r.vy *= 0.95; // dampening
            r.life -= 0.01;
            r.scale = Math.min(1.5, r.scale + 0.05); // grow in
            if (r.life <= 0) state.reactions.splice(i, 1);
        }
    };

    const draw = (ctx) => {
        const { width, height, balloons, particles, reactions } = gameState.current;
        ctx.clearRect(0, 0, width, height);

        // Balloons
        balloons.forEach(b => {
            ctx.beginPath();
            ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
            ctx.fillStyle = b.color;
            ctx.fill();

            // Shine
            ctx.beginPath();
            ctx.arc(b.x - b.radius * 0.3, b.y - b.radius * 0.3, b.radius * 0.2, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255,255,255,0.4)';
            ctx.fill();

            // String
            ctx.beginPath();
            ctx.moveTo(b.x, b.y + b.radius);
            ctx.quadraticCurveTo(b.x - 5, b.y + b.radius + 15, b.x, b.y + b.radius + 30);
            ctx.strokeStyle = theme === 'dark' ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.6)';
            ctx.lineWidth = 2;
            ctx.stroke();
        });

        // Particles
        particles.forEach(p => {
            ctx.globalAlpha = p.life;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1.0;
        });

        // Reactions
        reactions.forEach(r => {
            if (r.life > 0) {
                ctx.save();
                ctx.globalAlpha = r.life;
                ctx.translate(r.x, r.y);
                ctx.scale(r.scale, r.scale);
                ctx.font = "100px Arial";
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillText(r.text, 0, 0);
                ctx.restore();
            }
        });
    };

    return (
        <div className={`relative w-full h-full overflow-hidden touch-none select-none transition-colors duration-500 ${theme === 'dark'
            ? 'bg-gradient-to-b from-gray-900 to-black'
            : 'bg-gradient-to-b from-blue-50 to-pink-50'
            }`}>
            <canvas ref={canvasRef} className="block w-full h-full" />

            {/* UI Overlay - Safe Area Aware */}
            <div className="absolute top-0 left-0 w-full p-6 pointer-events-none flex justify-between items-start pt-[env(safe-area-inset-top)] px-[env(safe-area-inset-right)] pl-[env(safe-area-inset-left)]">
                <div className="flex flex-col gap-1">
                    <span className={`text-4xl font-bold bg-clip-text text-transparent drop-shadow-sm ${theme === 'dark'
                        ? 'bg-gradient-to-r from-purple-300 to-pink-400'
                        : 'bg-gradient-to-r from-purple-400 to-pink-600'
                        }`}>
                        {score}
                    </span>
                    <span className={`text-sm font-medium tracking-wider ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                        SCORE
                    </span>
                </div>

                <div className="flex flex-col items-end gap-1">
                    <div className={`text-5xl font-black transition-all duration-100 ${combo > 2
                        ? 'scale-110 text-pink-500'
                        : (theme === 'dark' ? 'text-gray-700' : 'text-gray-300')
                        }`}>
                        x{combo}
                    </div>
                    <span className={`text-sm font-medium tracking-wider ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                        COMBO
                    </span>
                </div>
            </div>

            {/* Host Notification Box */}
            {notification && (
                <div className="absolute top-24 left-1/2 transform -translate-x-1/2 w-[90%] pointer-events-none animate-bounce-short z-40">
                    <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md px-6 py-4 rounded-xl shadow-xl border-l-4 border-purple-500 flex items-center gap-3">
                        <span className="text-2xl">👑</span>
                        <div>
                            <p className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase">Host Message</p>
                            <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{notification}</p>
                        </div>
                    </div>
                </div>
            )}

            {combo > 4 && (
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none animate-bounce-short">
                    <span className="text-4xl font-extrabold text-yellow-400 drop-shadow-md">
                        FEEL THE RHYTHM!
                    </span>
                </div>
            )}
        </div>
    );
});

export default GameCanvas;
