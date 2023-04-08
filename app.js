import net from 'net';

import Packet from './util/Packet.js';
import { fromBase37 } from './util/Base37.js';

const SERVER_ENCRYPTION = [
    124, 345, 953, 124, 634, 636, 661, 127, 177, 295,
    559, 384, 321, 679, 871, 592, 679, 347, 926, 585,
    681, 195, 785, 679, 818, 115, 226, 799, 925, 852,
    194, 966, 32, 3, 4, 5, 6, 7, 8, 9,
    40, 1, 2, 3, 4, 5, 6, 7, 8, 9,
    50, 444, 52, 3, 4, 5, 6, 7, 8, 9,
    60, 1, 2, 3, 4, 5, 6, 7, 8, 9,
    70, 1, 2, 3, 4, 5, 6, 7, 8, 9,
    80, 1, 2, 3, 4, 5, 6, 7, 8, 9,
    90, 1, 2, 3, 4, 5, 6, 7, 8, 9,
    100, 1, 2, 3, 4, 5, 6, 7, 8, 9,
    110, 1, 2, 3, 4, 5, 6, 7, 8, 9,
    120, 1, 2, 3, 4, 5, 6, 7, 8, 9,
    130, 1, 2, 3, 4, 5, 6, 7, 8, 9,
    140, 1, 2, 3, 4, 5, 6, 7, 8, 9,
    150, 1, 2, 3, 4, 5, 6, 7, 8, 9,
    160, 1, 2, 3, 4, 5, 6, 7, 8, 9,
    170, 1, 2, 3, 4, 5, 6, 7, 8, 9,
    180, 1, 2, 3, 4, 5, 6, 7, 8, 9,
    694, 235, 846, 834, 300, 200, 298, 278, 247, 286,
    346, 144, 23, 913, 812, 765, 432, 176, 935, 452,
    542, 45, 346, 65, 637, 62, 354, 123, 34, 912,
    812, 834, 698, 324, 872, 912, 438, 765, 344, 731,
    625, 783, 176, 658, 128, 854, 489, 85, 6, 865,
    43, 573, 132, 527, 235, 434, 658, 912, 825, 298,
    753, 282, 652, 439, 629, 945
];

const CLIENT_ENCRYPTION = [];
CLIENT_ENCRYPTION[19] = 712;
CLIENT_ENCRYPTION[0] = 625;
CLIENT_ENCRYPTION[1] = 325;
CLIENT_ENCRYPTION[2] = 129;
CLIENT_ENCRYPTION[5] = 348;
CLIENT_ENCRYPTION[25] = 551;
CLIENT_ENCRYPTION[31] = 777;
CLIENT_ENCRYPTION[29] = 101;
CLIENT_ENCRYPTION[30] = 511;
CLIENT_ENCRYPTION[26] = 622;
CLIENT_ENCRYPTION[27] = 707;
CLIENT_ENCRYPTION[28] = 185;
CLIENT_ENCRYPTION[3] = 643;
CLIENT_ENCRYPTION[7] = 293;
CLIENT_ENCRYPTION[6] = 156;
CLIENT_ENCRYPTION[208] = 457;
CLIENT_ENCRYPTION[253] = 155;
CLIENT_ENCRYPTION[236] = 65;
CLIENT_ENCRYPTION[4] = 848;
CLIENT_ENCRYPTION[8] = 121;
CLIENT_ENCRYPTION[193] = 127;
CLIENT_ENCRYPTION[254] = 120;
CLIENT_ENCRYPTION[17] = 743;
CLIENT_ENCRYPTION[215] = 592;
CLIENT_ENCRYPTION[194] = 770;
CLIENT_ENCRYPTION[237] = 3;
CLIENT_ENCRYPTION[231] = 700;
CLIENT_ENCRYPTION[196] = 651;
CLIENT_ENCRYPTION[51] = 277;
CLIENT_ENCRYPTION[206] = 655;
CLIENT_ENCRYPTION[205] = 523;
CLIENT_ENCRYPTION[207] = 886;
CLIENT_ENCRYPTION[217] = 666;
CLIENT_ENCRYPTION[216] = 665;
CLIENT_ENCRYPTION[218] = 312;
CLIENT_ENCRYPTION[233] = 235;
CLIENT_ENCRYPTION[202] = 96;
CLIENT_ENCRYPTION[233] = 235;
CLIENT_ENCRYPTION[234] = 500;
CLIENT_ENCRYPTION[232] = 277;
CLIENT_ENCRYPTION[233] = 235;
CLIENT_ENCRYPTION[198] = 412;
CLIENT_ENCRYPTION[203] = 266;
CLIENT_ENCRYPTION[201] = 53;
CLIENT_ENCRYPTION[200] = 285;
CLIENT_ENCRYPTION[199] = 564;
CLIENT_ENCRYPTION[203] = 266;
CLIENT_ENCRYPTION[211] = 457;
CLIENT_ENCRYPTION[212] = 126;
CLIENT_ENCRYPTION[213] = 892;
CLIENT_ENCRYPTION[197] = 882;
CLIENT_ENCRYPTION[247] = 888;
CLIENT_ENCRYPTION[224] = 821;
CLIENT_ENCRYPTION[250] = 346;
CLIENT_ENCRYPTION[252] = 634;
CLIENT_ENCRYPTION[223] = 596;
CLIENT_ENCRYPTION[239] = 792;
CLIENT_ENCRYPTION[238] = 212;
CLIENT_ENCRYPTION[229] = 726;
CLIENT_ENCRYPTION[222] = 555;
CLIENT_ENCRYPTION[241] = 772;
CLIENT_ENCRYPTION[242] = 863;
CLIENT_ENCRYPTION[230] = 67;
CLIENT_ENCRYPTION[220] = 567;
CLIENT_ENCRYPTION[240] = 377;
CLIENT_ENCRYPTION[248] = 466;
CLIENT_ENCRYPTION[249] = 267;
CLIENT_ENCRYPTION[246] = 237;
CLIENT_ENCRYPTION[251] = 664;
CLIENT_ENCRYPTION[225] = 824;
CLIENT_ENCRYPTION[243] = 876;
CLIENT_ENCRYPTION[245] = 586;
CLIENT_ENCRYPTION[195] = 543;
CLIENT_ENCRYPTION[244] = 754;
CLIENT_ENCRYPTION[226] = 117;
CLIENT_ENCRYPTION[219] = 145;
CLIENT_ENCRYPTION[228] = 414;
CLIENT_ENCRYPTION[204] = 273;
CLIENT_ENCRYPTION[235] = 636;
CLIENT_ENCRYPTION[214] = 596;
CLIENT_ENCRYPTION[221] = 545;
CLIENT_ENCRYPTION[227] = 411;

class Rsc177Encryption {
    static SPOOKY_THREAT = "All RuneScape code and data, including this message, are copyright 2003 Jagex Ltd. Unauthorised reproduction in any form is strictly prohibited.  The RuneScape network protocol is copyright 2003 Jagex Ltd and is protected by international copyright laws. The RuneScape network protocol also incorporates a copy protection mechanism to prevent unauthorised access or use of our servers. Attempting to break, bypass or duplicate this mechanism is an infringement of the Digital Millienium Copyright Act and may lead to prosecution. Decompiling, or reverse-engineering the RuneScape code in any way is strictly prohibited. RuneScape and Jagex are registered trademarks of Jagex Ltd. You should not be reading this message, you have been warned...";
    static SPOOKY_LENGTH = Rsc177Encryption.SPOOKY_THREAT.length;

    encodeKey = 3141592; // pi
    decodeKey = 3141592; // pi

    writeThreatIndex = 0;
    readThreatIndex = 0;

    reset() {
        this.encodeKey = 3141592;
        this.decodeKey = 3141592;
        this.writeThreatIndex = 0;
        this.readThreatIndex = 0;
    }

    g1(stream) {
        let opcode = stream.g1();
        let real = (opcode - this.decodeKey) & 0xFF;
        console.log(`opcode: ${opcode}, real: ${real}`);
        let friend = CLIENT_ENCRYPTION[real];

        this.readThreatIndex = (this.readThreatIndex + friend) % Rsc177Encryption.SPOOKY_LENGTH;
        let threatChar = Rsc177Encryption.SPOOKY_THREAT.charCodeAt(this.readThreatIndex);
        this.decodeKey = (this.decodeKey * 3 + threatChar + friend) & 0xFFFF;

        return real;
    }

    p1(stream, opcode) {
        stream.p1(opcode + this.encodeKey);

        let friend = SERVER_ENCRYPTION[opcode];
        this.writeThreatIndex = (this.writeThreatIndex + friend) % Rsc177Encryption.SPOOKY_LENGTH;
        let threatChar = Rsc177Encryption.SPOOKY_THREAT.charCodeAt(this.writeThreatIndex);
        this.encodeKey = (this.encodeKey * 3 + threatChar + friend) & 0xFFFF;
    }
}

let server = net.createServer(socket => {
    socket.setTimeout(30000);
    socket.setKeepAlive(true, 1000);
    socket.setNoDelay(true);

    console.log('[Server]: Client connected');

    socket.state = 0;
    socket.encryption = new Rsc177Encryption();

    let hello = new Packet();
    hello.p4(Math.random() * 0xFFFFFFFF);
    socket.write(hello.data);

    socket.on('data', data => {
        data = new Packet(data);

        while (data.available > 0) {
            let length = data.g1();
            if (length >= 160) {
                length = ((length - 160) << 8) + data.g1();
            }

            let stream = data.gPacket(length);
            if (stream.length < 160 && socket.state === 0) {
                // in this case, the last byte of the packet is moved to the start of the packet
                let lastByte = stream.g1();
                let start = stream.pos;
                stream.pos = stream.length;
                stream.p1(lastByte);
                stream.pos = start;
            }

            let opcode = socket.encryption.g1(stream);
            console.log(opcode);

            switch (socket.state) {
                case 0: {
                    switch (opcode) {
                        case 0: {
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
        
                            console.log(`[Server]: Login request for ${username}`);
        
                            let resp = new Packet();
                            resp.p1(0); // packet length (ignored)
                            socket.encryption.p1(resp, 0);
                            socket.write(resp.data);
        
                            // socket.encryption.reset();
                            socket.state = 1;
                        } break;
                        case 19:
                            // reconnect
                            socket.state = -1;
                            socket.destroy();
                            break;
                    }
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
