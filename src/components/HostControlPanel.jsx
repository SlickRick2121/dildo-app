import React from 'react';

export default function HostControlPanel({ theme, score, combo, onAction, status, onSwitchMode }) {
    return (
        <div className={`w-full h-full flex flex-col items-center justify-between p-6 ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>

            {/* Status Header */}
            <div className="w-full pt-8 flex justify-between items-center" style={{ paddingTop: 'calc(1.5rem + env(safe-area-inset-top))' }}>
                <div className={`text-[10px] font-black px-3 py-1 rounded-full border ${status.connected ? 'bg-green-500/10 border-green-500/30 text-green-500' : 'bg-yellow-500/10 border-yellow-500/30 text-yellow-500'}`}>
                    {status.connected ? '● LIVE CONNECTION' : '○ CONNECTING...'}
                </div>
                <button
                    onClick={onSwitchMode}
                    className="text-[10px] font-bold opacity-40 hover:opacity-100 underline underline-offset-4"
                >
                    PLAY INDEPENDENTLY
                </button>
            </div>

            {/* Live Stats Display */}
            <div className="flex flex-col items-center text-center">
                <h2 className={`text-xs font-bold tracking-[0.3em] uppercase opacity-40 mb-4`}>
                    Partner's Progress
                </h2>
                <div className="flex gap-12 items-center">
                    <div className="flex flex-col items-center">
                        <span className="text-6xl font-black tabular-nums">{score}</span>
                        <span className="text-[10px] font-bold opacity-30 tracking-widest mt-1">SCORE</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <span className={`text-5xl font-black tabular-nums ${combo > 2 ? 'text-pink-500' : ''}`}>x{combo}</span>
                        <span className="text-[10px] font-bold opacity-30 tracking-widest mt-1">COMBO</span>
                    </div>
                </div>
            </div>

            {/* Action Area */}
            <div className="w-full max-w-sm flex flex-col gap-4 pb-8" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
                <div className="grid grid-cols-2 gap-4">
                    <button
                        onClick={() => onAction('thumbsUp')}
                        className="py-10 rounded-3xl bg-green-500/10 border border-green-500/20 text-5xl hover:bg-green-500/20 active:scale-95 transition-all flex flex-col items-center justify-center"
                    >
                        👍
                        <span className="text-[10px] font-black text-green-500 mt-2">NICE!</span>
                    </button>
                    <button
                        onClick={() => onAction('thumbsDown')}
                        className="py-10 rounded-3xl bg-red-500/10 border border-red-500/20 text-5xl hover:bg-red-500/20 active:scale-95 transition-all flex flex-col items-center justify-center"
                    >
                        👎
                        <span className="text-[10px] font-black text-red-500 mt-2">OOF!</span>
                    </button>
                </div>

                <button
                    onClick={() => onAction('notification')}
                    className={`w-full py-5 rounded-2xl font-black text-xs tracking-widest uppercase border transition-all active:scale-95 ${theme === 'dark'
                        ? 'border-purple-500/30 text-purple-400 hover:bg-purple-500/10'
                        : 'border-purple-500/30 text-purple-600 hover:bg-purple-50'
                        }`}
                >
                    ⚡ SEND MOTIVATION
                </button>

                <p className="text-[10px] text-center opacity-30 font-medium px-4 leading-relaxed mt-2">
                    YOU ARE REMOTELY LINKED. YOUR REACTIONS TRIGGER VIBRATIONS ON THE PLAYER'S DEVICE.
                </p>
            </div>
        </div>
    );
}
