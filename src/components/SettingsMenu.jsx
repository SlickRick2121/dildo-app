import { QRCodeSVG } from 'qrcode.react';

export default function SettingsMenu({
    isOpen,
    onClose,
    theme,
    toggleTheme,
    brightness,
    setBrightness,
    onReset,
    onHostAction,
    gameId
}) {
    if (!isOpen) return null;

    const joyLink = gameId ? `${window.location.protocol}//${window.location.host}/?join=${gameId}` : '';

    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className={`w-[90%] max-w-sm p-6 rounded-2xl shadow-2xl border ${theme === 'dark' ? 'bg-gray-900 border-gray-700' : 'bg-white border-white'} max-h-[90vh] overflow-y-auto`}>

                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                        Game Menu
                    </h2>
                    <button
                        onClick={onClose}
                        className={`p-2 rounded-full hover:bg-gray-500/20 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}
                    >
                        ✕
                    </button>
                </div>

                {/* QR Code Section */}
                {gameId && (
                    <div className="mb-8 flex flex-col items-center p-4 bg-white rounded-xl">
                        <QRCodeSVG value={joyLink} size={160} />
                        <p className="mt-3 text-sm font-bold text-gray-900 text-center">
                            Scan to Play on Mobile
                        </p>
                        <p className="text-xs text-gray-500 mt-1 break-all max-w-[200px] text-center">
                            {joyLink}
                        </p>
                    </div>
                )}

                {/* Controls */}
                <div className="space-y-6">

                    {/* Theme Toggle */}
                    <div className="flex justify-between items-center">
                        <span className={`font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>Theme</span>
                        <button
                            onClick={toggleTheme}
                            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${theme === 'dark'
                                ? 'bg-gray-700 text-white'
                                : 'bg-gray-200 text-gray-800'
                                }`}
                        >
                            {theme === 'dark' ? '🌙 Dark' : '☀️ Light'}
                        </button>
                    </div>

                    {/* Brightness Slider */}
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <span className={`font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>Brightness</span>
                            <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{brightness}%</span>
                        </div>
                        <input
                            type="range"
                            min="20"
                            max="100"
                            value={brightness}
                            onChange={(e) => setBrightness(parseInt(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-purple-500"
                        />
                    </div>

                    {/* Reset Game */}
                    <button
                        onClick={() => { onReset(); onClose(); }}
                        className="w-full py-3 rounded-lg font-bold text-white bg-red-500 hover:bg-red-600 active:scale-95 transition-transform"
                    >
                        🔄 Reset Game
                    </button>

                    <hr className={`border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`} />

                    {/* Toy Controls */}
                    <div>
                        <h3 className={`text-xs font-bold uppercase tracking-wider mb-3 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                            Toy Controls
                        </h3>
                        <div className="grid grid-cols-2 gap-3 mb-3">
                            <button
                                onClick={() => onHostAction('thumbsUp')}
                                className={`py-3 rounded-xl text-2xl bg-green-500/10 border-2 border-green-500/20 hover:bg-green-500/20 active:scale-95 transition-transform`}
                            >
                                👍
                            </button>
                            <button
                                onClick={() => onHostAction('thumbsDown')}
                                className={`py-3 rounded-xl text-2xl bg-red-500/10 border-2 border-red-500/20 hover:bg-red-500/20 active:scale-95 transition-transform`}
                            >
                                👎
                            </button>
                        </div>
                        <button
                            onClick={() => onHostAction('notification')}
                            className={`w-full py-2 rounded-lg font-medium text-sm border-2 transition-colors ${theme === 'dark'
                                ? 'border-gray-700 text-gray-300 hover:bg-gray-800'
                                : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            🔔 Send Notification
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}
