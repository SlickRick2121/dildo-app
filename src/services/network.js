import Peer from 'peerjs';

// Generate a random ID (simpler for URL)
const generateId = () => Math.random().toString(36).substr(2, 6).toUpperCase();

let peer = null;
let conn = null;

export const Network = {
    // Start hosting a game session
    host: (onData) => {
        const id = generateId();
        peer = new Peer(id, {
            debug: 1
        });

        return new Promise((resolve, reject) => {
            peer.on('open', (id) => {
                console.log('[Network] Hosting with ID:', id);
                resolve(id);
            });

            peer.on('connection', (c) => {
                console.log('[Network] Incoming connection');
                if (conn) {
                    conn.close();
                }
                conn = c;
                conn.on('data', (data) => {
                    console.log('[Network] Received:', data);
                    if (onData) onData(data);
                });
            });

            peer.on('error', (err) => {
                console.error('[Network] Error:', err);
            });
        });
    },

    // Join an existing game session as a remote controller
    join: (hostId, onData) => {
        const myId = 'CTRL-' + generateId();
        peer = new Peer(myId);

        return new Promise((resolve, reject) => {
            peer.on('open', () => {
                console.log('[Network] Connecting to host:', hostId);
                conn = peer.connect(hostId);

                if (!conn) {
                    reject("Connection failed to initialize");
                    return;
                }

                conn.on('open', () => {
                    console.log('[Network] Connected!');
                    resolve(true);

                    // Listen for data from host
                    conn.on('data', (data) => {
                        if (onData) onData(data);
                    });
                });

                conn.on('error', (err) => {
                    console.error('[Network] Connection Error:', err);
                    reject(err);
                });
            });

            peer.on('error', (err) => {
                console.error('[Network] Peer Error:', err);
                reject(err);
            });
        });
    },

    // Send data
    send: (data) => {
        if (conn && conn.open) {
            conn.send(data);
        }
    },

    close: () => {
        if (conn) conn.close();
        if (peer) peer.destroy();
        conn = null;
        peer = null;
    }
};
