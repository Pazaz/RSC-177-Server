import fs from 'fs';
import IsaacRandom from '#util/IsaacRandom.js';
import Packet from '#util/Packet.js';

const args = process.argv.slice(2);

if (args.length === 0 || !fs.existsSync(args[0]) || !fs.statSync(args[0]).isDirectory()) {
    console.log('Usage: node rsc-replay.js <path to replay>');
    process.exit(1);
}

class ReplayReader {
    // version.bin
    #version = null;
    version = -1;
    clientVersion = -1;

    // metadata.bin
    #metadata = null;
    replayLength = -1;
    dateModified = -1;
    ip = '';
    conversionSettings = -1;
    userField = -1;

    // keys.bin
    #keys = null;
    keys = [];
    keyIndex = -1;

    // in.bin
    #server = null;
    inMetadata = -1;

    // out.bin
    #client = null;
    outMetadata = -1;

    #decryptor = null;
    packets = [];

    constructor(path) {
        this.#version = Packet.fromFile(`${path}/version.bin`);
        this.#metadata = Packet.fromFile(`${path}/metadata.bin`);
        this.#keys = Packet.fromFile(`${path}/keys.bin`);
        this.#server = Packet.fromGz(`${path}/in.bin.gz`);
        this.#client = Packet.fromGz(`${path}/out.bin.gz`);

        this.#server.toFile('dump/in.bin');
        this.#client.toFile('dump/out.bin');

        this.parse();
        this.decrypt();
    }

    toJson() {
        return {
            version: this.version,
            clientVersion: this.clientVersion,
            duration: Math.floor(this.replayLength * 20 / 1000 / 60 / 60) + 'h ' + Math.floor(this.replayLength * 20 / 1000 / 60 % 60) + 'm ' + Math.floor(this.replayLength * 20 / 1000 % 60) + 's',
            dateModified: this.dateModified,
            ip: this.ip,
            conversionSettings: this.conversionSettings,
            // userField: this.userField,
            keys: this.keys,
            // keyIndex: this.keyIndex,
            // inMetadata: this.inMetadata,
            // outMetadata: this.outMetadata,
            packets: this.packets.map(p => ({ type: p.type, timestamp: p.timestamp, flag: p.flag, opcode: p.opcode }))
        };
    }

    parse() {
        this.parseVersion();
        this.parseMetadata();
        this.parseKeys();
        this.parseServer();
        this.parseClient();

        this.packets.sort((a, b) => a.timestamp - b.timestamp);
    }

    parseVersion() {
        this.version = this.#version.g4();
        this.clientVersion = this.#version.g4();
    }

    parseMetadata() {
        this.replayLength = this.#metadata.g4();
        this.dateModified = Number(this.#metadata.g8());

        let ip1 = this.#metadata.g4(); // IPv6 (0)
        let ip2 = this.#metadata.g4(); // IPv6 (0)
        let ip3 = this.#metadata.g4(); // IPv6 (0xFFFF)
        let ip4 = this.#metadata.g4(); // IPv4 and IPv6
        if (ip1 === 0 && ip2 === 0) {
            // convert to IPv4
            this.ip = `${(ip4 >>> 24) & 0xFF}.${(ip4 >>> 16) & 0xFF}.${(ip4 >>> 8) & 0xFF}.${ip4 & 0xFF}`
        } else {
            // convert to IPv6
            this.ip = `${ip1.toString(16)}:${ip2.toString(16)}:${ip3.toString(16)}:${ip4.toString(16)}`;
        }

        this.conversionSettings = this.#metadata.g1();
        this.userField = this.#metadata.g4();
    }

    parseKeys() {
        for (let i = 0; i < this.#keys.length / 16; i++) {
            this.keys.push([
                this.#keys.g4(),
                this.#keys.g4(),
                this.#keys.g4(),
                this.#keys.g4()
            ]);
        }
    }

    parseServer() {
        while (this.#server.available > 0) {
            let timestamp = this.#server.g4();
            if (timestamp === 0xFFFFFFFF) {
                // TIMESTAMP_EOF
                break;
            }

            let rawLength = this.#server.g4();
            if (rawLength === 0xFFFFFFFF) {
                // VIRTUAL_OPCODE_CONNECT
                this.packets.push({
                    type: 'disconnect',
                    timestamp
                });
                continue;
            }

            if (rawLength === 1) {
                // VIRTUAL_OPCODE_CONNECT
                this.packets.push({
                    type: 'connect',
                    timestamp,
                    flag: this.#server.g1()
                });
                continue;
            }

            let length = this.#server.g1();
            if (length >= 160) {
                this.#server.g1(); // TODO
                length = rawLength - 2;
            } else {
                length = rawLength - 1;
            }

            if (length > this.#server.available) {
                console.log('Warning, length > available', length, this.#server.available);
                break;
            }

            let stream = this.#server.gPacket(length);
            if (stream.length < 160) {
                stream.rotateBack();
            }

            // the server runs a tick every 600ms
            // the client runs a tick every 20ms
            // so if we want to convert the client tick to the server's tick, we need to multiply by 30

            this.packets.push({
                type: 'server',
                timestamp,
                data: stream.data
            });
        }

        this.inMetadata = this.#server.g1();
    }

    parseClient() {
        while (this.#client.available > 0) {
            let timestamp = this.#client.g4();
            if (timestamp === 0xFFFFFFFF) {
                // TIMESTAMP_EOF
                break;
            }

            let rawLength = this.#client.g4();
            let length = this.#client.g1();
            if (length >= 160) {
                this.#client.g1(); // TODO
                length = rawLength - 2;
            } else {
                length = rawLength - 1;
            }

            if (length > this.#client.available) {
                console.log('Warning, length > available', length, this.#client.available);
                break;
            }

            let stream = this.#client.gPacket(length);
            if (stream.length < 160) {
                stream.rotateBack();
            }

            this.packets.push({
                type: 'client',
                timestamp,
                data: stream.data
            });
        }

        this.outMetadata = this.#client.g1();
    }

    decrypt() {
        for (let i = 0; i < this.packets.length; i++) {
            let packet = this.packets[i];

            // virtual packets
            if (packet.type === 'connect') {
                if ((packet.flag & 64) === 64) {
                    this.keyIndex++;
                    this.#decryptor = new IsaacRandom(this.keys[this.keyIndex]);
                }
                continue;
            } else if (packet.type === 'disconnect') {
                continue;
            }

            // decrypt
            packet.opcode = (packet.data[0] + this.#decryptor.nextInt()) & 0xFF;
        }
    }
}

let reader = new ReplayReader(args[0]);
fs.writeFileSync('dump/replay.json', JSON.stringify(reader.toJson(), null, 2));
