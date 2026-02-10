import React from 'react';

export default function HostControlPanel({ theme, score, combo, onAction, status }) {
    return (
        <div className={`w-full h-full flex flex-col items-center justify-center p-6 ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>

            {/* Status Header */}
            <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-center bg-opacity-50 backdrop-blur-sm">
                <div className={`text-xs font-bold px-2 py-1 rounded ${status.connected ? 'bg-green-500/20 text-green-500' : 'bg-yellow-500/20 text-yellow-500'}`}>
                    {status.connected ? 'CONNECTED' : 'CONNECTING...'}
                </div>
            </div>

            {/* Live Stats Display */}
            <div className="mb-10 text-center space-y-2">
                <h2 className={`text-sm font-bold tracking-widest uppercase ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                    Player Stats
                </h2>
                <div className="flex gap-8 justify-center items-end">
                    <div className="flex flex-col">
                        <span className="text-5xl font-black">{score}</span>
                        <span className="text-xs font-medium opacity-50">SCORE</span>
                    </div>
                    <div className="flex flex-col">
                        <span className={`text-4xl font-bold ${combo > 2 ? 'text-pink-500' : ''}`}>x{combo}</span>
                        <span className="text-xs font-medium opacity-50">COMBO</span>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="w-full max-w-sm space-y-4">
                <h3 className="text-center text-sm font-bold opacity-50 mb-4">SEND REACTION</h3>

                <div className="grid grid-cols-2 gap-4">
                    <button
                        onClick={() => onAction('thumbsUp')}
                        className="h-32 rounded-2xl bg-green-500/10 border-2 border-green-500/20 text-4xl hover:bg-green-500/20 active:scale-95 transition-all flex flex-col items-center justify-center gap-2"
                    >
                        👍
                        <span className="text-xs font-bold text-green-500">GOOD!</span>
                    </button>
                    <button
                        onClick={() => onAction('thumbsDown')}
                        className="h-32 rounded-2xl bg-red-500/10 border-2 border-red-500/20 text-4xl hover:bg-red-500/20 active:scale-95 transition-all flex flex-col items-center justify-center gap-2"
                    >
                        👎
                        <span className="text-xs font-bold text-red-500">BAD!</span>
                    </button>
                </div>

                <button
                    onClick={() => onAction('notification')}
                    className={`w-full py-4 rounded-xl font-bold text-base border-2 transition-all active:scale-95 ${theme === 'dark'
                        ? 'border-purple-500/30 text-purple-400 hover:bg-purple-500/10'
                        : 'border-purple-500/30 text-purple-600 hover:bg-purple-50'
                        }`}
                >
                    🔔 Send Motivation
                </button>
            </div>

            <div className="mt-8 text-center px-6">
                <p className="text-xs opacity-40">
                    You are controlling the game remotely. Your actions will trigger vibrations and visuals on the Player's device.
                </p>
            </div>

        </div>
    );
}
