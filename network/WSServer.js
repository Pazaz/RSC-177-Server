import { WebSocketServer } from 'ws';

import Login from '#engine/Login.js';
import World from '#engine/World.js';

import Log from '#util/Log.js';
import Packet from '#util/Packet.js';
import GenericSocket from '#util/GenericSocket.js';

// TODO: websocket keepalive
export default class WSServer {
    wss = null;

    start() {
        this.wss = new WebSocketServer({ port: 43595, host: '0.0.0.0' }, () => {
            Log.info('[WSServer] Listening on :43595');
        });

        this.wss.on('connection', (ws, req) => {
            const ip = req.headers['x-forwarded-for'] ? req.headers['x-forwarded-for'].split(',')[0].trim() : req.connection.remoteAddress;
            Log.info(`[WSServer] Connection from ${ip}`);

            let socket = new GenericSocket(ws, Login.STATE, ip, GenericSocket.WEBSOCKET);
            socket.write(Uint8Array.from([ Math.floor(Math.random() * 0xFF), Math.floor(Math.random() * 0xFF), Math.floor(Math.random() * 0xFF), Math.floor(Math.random() * 0xFF) ]));

            ws.on('message', (data) => {
                data = new Packet(data);

                if (socket.state === Login.STATE) {
                    Login.readIn(socket, data, true);
                } else if (socket.state === World.STATE) {
                    World.readIn(socket, data, true);
                } else {
                    socket.terminate();
                }
            });

            ws.on('close', () => {
                Log.info(`[WSServer] Disconnected from ${ip}`);

                if (socket.state === World.STATE) {
                    World.removePlayerBySocket(socket);
                }
            });
        });
    }
}
