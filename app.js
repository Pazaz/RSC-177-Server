import net from 'net';

import Packet from './util/Packet.js';
import { fromBase37 } from './util/Base37.js';
import Rsc177Encryption from './util/Rsc177Encryption.js';
import ClientProt from './util/ClientProt.js';

let server = net.createServer(socket => {
    socket.setTimeout(30000);
    socket.setKeepAlive(true, 1000);
    socket.setNoDelay(true);

    console.log('[Server]: Client connected');

    socket.state = 0;
    socket.encryption = new Rsc177Encryption();

    let hello = new Packet();
    hello.p4(Math.floor(Math.random() * 0xFFFFFFFF));
    socket.write(hello.data);

    socket.on('data', data => {
        data = new Packet(data);

        while (data.available > 0) {
            let length = data.g1();
            if (length >= 160) {
                length = ((length - 160) << 8) + data.g1();
            }

            let stream = data.gPacket(length);
            if (stream.length < 160 && stream.length > 1) {
                // in this case, the last byte of the packet is moved to the start of the packet
                let lastByte = stream.g1();
                let start = stream.pos;
                stream.pos = stream.length;
                stream.p1(lastByte);
                stream.pos = start;
            }

            let opcode = socket.encryption.g1(stream);

            switch (socket.state) {
                case 0: {
                    switch (opcode) {
                        case 0:
                        case 19: {
                            let revision = stream.g2();
                            let params = stream.g2();
                            let username = fromBase37(stream.g8());

                            let passData = new Uint8Array(21); // space for a 20-byte password + space terminator
                            for (let i = 0; i < 3; i++) {
                                let block = Packet.rsadec(stream);
                                // the first 8 bytes are random garbage, so we skip them
                                passData.set(block.slice(8), i * 7);
                            }
                            let password = Buffer.from(passData).toString().trimEnd();
                            let uid = stream.g4();

                            if (opcode === 19) {
                                console.log(`[Server]: Reconnection request for ${username}`);
                            } else {
                                console.log(`[Server]: Initial connection request for ${username}`);
                            }

                            let resp = new Packet();
                            resp.p1(0); // packet length (ignored here)
                            socket.encryption.p1(resp, 0); // 0 = success
                            socket.write(resp.data);

                            socket.state = 1;
                        } break;
                        default:
                            socket.state = -1;
                            socket.destroy();
                            return;
                    }
                } break;
                case 1: {
                    console.log('Received packet', ClientProt[opcode]);
                } break;
                case -1:
                    socket.destroy();
                    return;
            }
        }
    });

    socket.on('close', () => {
        console.log('[Server]: Client disconnected');
    });

    socket.on('end', () => {
        socket.destroy();
    });

    socket.on('error', err => {
        socket.destroy();
    });

    socket.on('timeout', () => {
        socket.destroy();
    });
});

server.listen({ port: 43594, host: '0.0.0.0' }, () => {
    console.log(`[Server]: Listening on port ${server.address().port}`);
});
