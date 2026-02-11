import { useState, useEffect } from 'react';

/**
 * Hook to sync Lovense User Data with Backend
 */
export function useLovenseUser() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const syncUser = async () => {
            try {
                const params = new URLSearchParams(window.location.search);
                const uid = params.get('uid');
                const uname = params.get('uname') || 'Guest';

                if (!uid) {
                    setLoading(false);
                    return;
                }

                const response = await fetch('/api/user/sync', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        lovenseUid: uid,
                        nickname: uname.substring(0, 50)
                    })
                });

                if (!response.ok) throw new Error('Sync failed');

                const userData = await response.json();
                setUser(userData);
            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        syncUser();
    }, []);

    const updateScore = async (newScore) => {
        if (!user?.lovenseUid) return;
        try {
            await fetch('/api/user/score', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ lovenseUid: user.lovenseUid, score: newScore })
            });
        } catch (err) {
            // Silently fail in production
        }
    };

    return { user, loading, error, updateScore };
}
