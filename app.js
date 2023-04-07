import net from 'net';

import Packet from './util/Packet.js';
import { fromBase37 } from './util/Base37.js';

let server = net.createServer(socket => {
    socket.setTimeout(30000);
    socket.setKeepAlive(true, 1000);
    socket.setNoDelay(true);

    console.log('[Server]: Client connected');
    let hello = new Packet();
    hello.p4(0);
    socket.write(hello.data);

    socket.on('data', data => {
        data = new Packet(data);

        while (data.available > 0) {
            let length = data.g1();
            let stream = data.gPacket(length);

            if (stream.length < 160) {
                // in this case, the last byte of the packet is moved to the start of the packet
                let lastByte = stream.g1();
                let start = stream.pos;
                stream.pos = stream.length;
                stream.p1(lastByte);
                stream.pos = start;
            }

            let opcode = stream.g1(); // TODO opcode decryption

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

            console.log(username, password, uid, revision);

            let resp = new Packet();
            resp.p1(0);
            resp.p1(3 - 40); // TODO opcode encryption
            socket.write(resp.data);

            socket.destroy();
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
