import { useState, useEffect } from 'react';

/**
 * Hook to sync Lovense User Data with Backend
 */
export function useLovenseUser() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Lovense passes uid/uname in URL query params or window.lovense object
        // Usually: ?uid=THE_UID&uname=THE_NICKNAME
        const syncUser = async () => {
            try {
                const params = new URLSearchParams(window.location.search);
                const uid = params.get('uid'); // Lovense UID
                const uname = params.get('uname') || 'Guest'; // Lovense Username

                if (!uid) {
                    console.log("[LovenseUser] No UID found in URL. Running in anonymous mode.");
                    setLoading(false);
                    return;
                }

                // Sync with backend
                const response = await fetch('/api/user/sync', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ lovenseUid: uid, nickname: uname })
                });

                if (!response.ok) {
                    throw new Error('Failed to sync user');
                }

                const userData = await response.json();
                console.log("[LovenseUser] User linked:", userData);
                setUser(userData);
            } catch (err) {
                console.error("[LovenseUser] Sync error:", err);
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        syncUser();
    }, []);

    const updateScore = async (newScore) => {
        if (!user || !user.lovenseUid) return;
        try {
            await fetch('/api/user/score', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ lovenseUid: user.lovenseUid, score: newScore })
            });
        } catch (err) {
            console.error("Failed to update score", err);
        }
    };

    return { user, loading, error, updateScore };
}
