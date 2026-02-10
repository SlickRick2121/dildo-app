export const Lovense = {
    isReady: () => {
        return !!(window.Lovense || window.lovense);
    },

    getToys: () => {
        const api = window.Lovense || window.lovense;
        if (!api || !api.getOnlineToys) return [];
        return api.getOnlineToys();
    },

    sendCommandToAll: (cmd) => {
        const api = window.Lovense || window.lovense;
        if (!api) {
            console.warn("No Lovense API found (window.Lovense/window.lovense)");
            return;
        }

        const toys = api.getOnlineToys ? api.getOnlineToys() : [];

        if (toys.length === 0) {
            // Attempt broadcast if supported or fallback
            if (api.sendCommand) {
                api.sendCommand(cmd);
            }
            return;
        }

        toys.forEach(toy => {
            const payload = { ...cmd, toy: toy.id };
            api.sendCommand(payload);
        });
    },

    vibrate: (level) => {
        // Level 0-20
        const strength = Math.min(20, Math.max(0, level));
        Lovense.sendCommandToAll({ command: "Vibrate", strength });
    },

    pulse: (strength, duration) => {
        Lovense.vibrate(strength);
        setTimeout(() => Lovense.vibrate(0), duration);
    },

    pattern: (type, duration, strength = 10) => {
        // Simple manual pattern implementation
        if (type === 'wave') {
            let i = 0;
            const interval = setInterval(() => {
                const s = Math.abs(Math.sin(i)) * strength;
                Lovense.vibrate(Math.floor(s));
                i += 0.5;
            }, 100);
            setTimeout(() => {
                clearInterval(interval);
                Lovense.vibrate(0);
            }, duration);
        }
    }
};
