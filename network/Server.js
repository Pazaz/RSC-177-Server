import net from 'net';

import Login from '#engine/Login.js';
import World from '#engine/World.js';

import Log from '#util/Log.js';
import Packet from '#util/Packet.js';
import GenericSocket from '#util/GenericSocket.js';

export default class Server {
    tcp = null;

    constructor() {
        this.tcp = net.createServer();
    }

    start() {
        this.tcp.on('connection', (s) => {
            s.setTimeout(30000);
            s.setNoDelay(true);
            s.setKeepAlive(true, 10000);

            const ip = s.remoteAddress;
            Log.info(`[Server] Connection from ${ip}`);

            let socket = new GenericSocket(s, Login.STATE, ip, GenericSocket.TCP);
            socket.write(Uint8Array.from([ Math.floor(Math.random() * 0xFF), Math.floor(Math.random() * 0xFF), Math.floor(Math.random() * 0xFF), Math.floor(Math.random() * 0xFF) ]));

            s.on('data', (data) => {
                data = new Packet(data);

                if (socket.state === Login.STATE) {
                    Login.readIn(socket, data, false);
                } else if (socket.state === World.STATE) {
                    World.readIn(socket, data, false);
                } else {
                    socket.terminate();
                }
            });

            s.on('close', () => {
                Log.info(`[Server] Disconnected from ${socket.remoteAddress}`);

                if (socket.state === World.STATE) {
                    World.removePlayerBySocket(socket);
                }
            });

            s.on('end', () => {
                socket.terminate();
            });

            s.on('error', (err) => {
                socket.terminate();
            });

            s.on('timeout', () => {
                socket.terminate();
            });
        });

        this.tcp.listen(43594, '0.0.0.0', () => {
            Log.info('[Server] Listening on :43594');
        });
    }
}
