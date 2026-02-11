import React, { useState, useRef, useEffect } from 'react';
import GameCanvas from './components/GameCanvas';
import SettingsMenu from './components/SettingsMenu';
import HostControlPanel from './components/HostControlPanel';
import { Network } from './services/network';
import { useLovenseUser } from './hooks/useLovenseUser';
import { Lovense } from './services/lan';

function App() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [theme, setTheme] = useState('dark');
  const [brightness, setBrightness] = useState(100);
  const [hostEvent, setHostEvent] = useState(null);

  // User Sync
  const { user } = useLovenseUser();

  // Game State
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);

  // Network State
  const [networkStatus, setNetworkStatus] = useState({
    connected: false,
    hosting: false,
    loading: false
  });
  const [gameId, setGameId] = useState(null);

  const gameRef = useRef(null);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const handleReset = () => {
    if (gameRef.current) {
      gameRef.current.resetGame();
    }
  };

  // Switch from Controller back to Game Mode
  const switchToGameMode = () => {
    Network.close();
    handleStartHosting();
  };

  // --- Network Logic ---

  const handleStartHosting = async () => {
    setNetworkStatus(p => ({ ...p, loading: true }));
    try {
      const id = await Network.host((data) => {
        if (data.type) {
          setHostEvent({ ...data, id: Date.now() });
        }
      });
      setGameId(id);
      setNetworkStatus({ connected: true, hosting: true, loading: false });
    } catch (err) {
      console.error("Failed to host:", err);
      setNetworkStatus(p => ({ ...p, loading: false }));
    }
  };

  const handleJoinGame = async (id) => {
    setNetworkStatus(p => ({ ...p, loading: true }));
    try {
      await Network.join(id, (data) => {
        if (data.type === 'stats') {
          setScore(data.score);
          setCombo(data.combo);
        }
        // Handle Remote Commands (Vibration on Phone)
        if (data.type === 'lovense_cmd') {
          if (Lovense[data.func]) {
            Lovense[data.func](...data.args);
          }
        }
      });
      setNetworkStatus({ connected: true, hosting: false, loading: false });
      setGameId(id);
    } catch (err) {
      alert("Failed to join game (" + id + "): " + err);
      setNetworkStatus(p => ({ ...p, loading: false }));
      // Fallback to hosting if join fails
      handleStartHosting();
    }
  };

  const handleLovenseCmd = (func, ...args) => {
    if (networkStatus.hosting && networkStatus.connected) {
      Network.send({ type: 'lovense_cmd', func, args });
    }
  };

  const handleHostAction = (type) => {
    if (networkStatus.connected && !networkStatus.hosting) {
      let payload = {};
      if (type === 'notification') {
        const msgs = ["Great Job!", "Combo Time!", "Keep it up!", "Bonus Round!"];
        const msg = msgs[Math.floor(Math.random() * msgs.length)];
        payload = { type: 'notification', message: msg };
      } else {
        payload = { type };
      }
      Network.send(payload);
    } else {
      if (type === 'notification') {
        const msgs = ["Great Job!", "Combo Time!", "Keep it up!", "Bonus Round!"];
        const msg = msgs[Math.floor(Math.random() * msgs.length)];
        setHostEvent({ type: 'notification', message: msg, id: Date.now() });
      } else {
        setHostEvent({ type, id: Date.now() });
      }
    }
  };

  // --- Auto-Start on Mount ---
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const joinId = params.get('join');

    if (joinId) {
      handleJoinGame(joinId);
    } else {
      handleStartHosting();
    }

    return () => {
      Network.close();
    };
  }, []);

  // Update URL without reloading
  useEffect(() => {
    if (gameId && networkStatus.hosting) {
      const url = new URL(window.location);
      url.searchParams.set('join', gameId);
      window.history.pushState({}, '', url);
    }
  }, [gameId, networkStatus.hosting]);

  // Broadcast Stats (Host -> Remote)
  useEffect(() => {
    if (networkStatus.hosting && networkStatus.connected) {
      Network.send({ type: 'stats', score, combo });
    }
  }, [score, combo, networkStatus.hosting, networkStatus.connected]);

  const isControllerActive = networkStatus.connected && !networkStatus.hosting;

  return (
    <div className={`relative w-full h-screen overflow-hidden ${theme === 'dark' ? 'bg-black' : 'bg-white'}`}>

      {/* Main View Switch */}
      {isControllerActive ? (
        <HostControlPanel
          theme={theme}
          score={score}
          combo={combo}
          onAction={handleHostAction}
          status={networkStatus}
          onSwitchMode={switchToGameMode}
        />
      ) : (
        <GameCanvas
          ref={gameRef}
          theme={theme}
          hostEvent={hostEvent}
          onStatsUpdate={(s, c) => {
            setScore(s);
            setCombo(c);
          }}
          onLovenseCmd={handleLovenseCmd}
        />
      )}

      {/* Menu / Settings Button */}
      {!isControllerActive && (
        <button
          onClick={() => setIsSettingsOpen(true)}
          className={`absolute top-6 right-6 z-50 p-3 rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95 ${theme === 'dark'
            ? 'bg-gray-800/80 text-white border border-gray-700'
            : 'bg-white/80 text-gray-800 border border-gray-200'
            } backdrop-blur-md`}
          style={{ marginTop: 'env(safe-area-inset-top)' }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      )}

      {/* Settings Modal (Overlay) */}
      <SettingsMenu
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        theme={theme}
        toggleTheme={toggleTheme}
        brightness={brightness}
        setBrightness={setBrightness}
        onReset={handleReset}
        onHostAction={handleHostAction}
        gameId={gameId}
      />

      {/* Brightness Overlay (Global) */}
      <div
        className="absolute inset-0 z-[60] pointer-events-none bg-black transition-opacity duration-300"
        style={{ opacity: (100 - brightness) / 100 }}
      />
    </div>
  );
}

export default App;
