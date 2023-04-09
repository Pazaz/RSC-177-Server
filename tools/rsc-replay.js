import IsaacRandom from '#util/IsaacRandom.js';
import Packet from '#util/Packet.js';

function ipToStr(ip) {
    return `${(ip >> 24) & 0xFF}.${(ip >> 16) & 0xFF}.${(ip >> 8) & 0xFF}.${ip & 0xFF}`;
}

const ClientProt = {
};

const ServerProt = {
};

let path = 'D:/rscplus-supplemental-replays/flying sno/flying sno (redacted chat) replays/06-17-2018 15.46.11';

let version = Packet.fromFile(`${path}/version.bin`);
let metadata = Packet.fromFile(`${path}/metadata.bin`);
let keys = Packet.fromFile(`${path}/keys.bin`);
let server = Packet.fromGz(`${path}/in.bin.gz`);
let client = Packet.fromGz(`${path}/out.bin.gz`);
server.toFile('dump/in.bin');
client.toFile('dump/out.bin');

let replay = {
    version: version.g4(),
    clientVersion: version.g4(),

    replayLength: metadata.g4(),
    dateModified: Number(metadata.g8()),
    ipAddress: '',
    ip1: metadata.g4(), // IPv6 (0 if IPv4)
    ip2: metadata.g4(), // IPv6 (0 if IPv4)
    ip3: metadata.g4(), // IPv6 (0xFFFF if IPv4)
    ip4: metadata.g4(), // IPv4 or IPv6
    conversionSettings: metadata.g1(),
    userField: metadata.g4(),

    keys: [],
    keyIndex: -1,
    decryptor: null,

    packets: []
};

if (replay.ip1 === 0 && replay.ip3 === 0xFFFF) {
    replay.ipAddress = ipToStr(replay.ip4);
    delete replay.ip1;
    delete replay.ip2;
    delete replay.ip3;
    delete replay.ip4;
}

for (let i = 0; i < keys.length / 16; i++) {
    replay.keys.push([
        keys.g4(),
        keys.g4(),
        keys.g4(),
        keys.g4()
    ]);
}

while (server.available > 0) {
    let timestamp = server.g4();
    if (timestamp === 0xFFFFFFFF) {
        // TIMESTAMP_EOF
        break;
    }

    let rawLength = server.g4();
    if (rawLength === 0xFFFFFFFF) {
        // VIRTUAL_OPCODE_CONNECT
        replay.packets.push({
            type: 'disconnect',
            timestamp
        });
        continue;
    }

    if (rawLength === 1) {
        // VIRTUAL_OPCODE_CONNECT
        replay.packets.push({
            type: 'connect',
            timestamp,
            flag: server.g1()
        });
        continue;
    }

    let length = server.g1();
    if (length >= 160) {
        server.g1(); // TODO
        length = rawLength - 2;
    } else {
        length = rawLength - 1;
    }

    if (length > server.available) {
        console.log('Warning, length > available', length, server.available);
        break;
    }

    let stream = server.gPacket(length);
    stream.rotateBack();

    // the server runs a tick every 600ms
    // the client runs a tick every 20ms
    // so if we want to convert the client tick to the server's tick, we need to multiply by 30

    replay.packets.push({
        type: 'server',
        timestamp,
        timestampMs: timestamp * 20,
        timestampSeconds: (timestamp * 20) + (replay.dateModified / 1000),
        data: stream.data
    });
}

replay.inMetadata = server.g1();

while (client.available > 0) {
    let timestamp = client.g4();
    if (timestamp === 0xFFFFFFFF) {
        // TIMESTAMP_EOF
        break;
    }

    let rawLength = client.g4();

    let length = client.g1();
    if (length >= 160) {
        length = ((length - 160) << 8) | client.g1();
    }

    if (length > client.available) {
        console.log('Warning, length > available', length, client.available);
        break;
    }

    let stream = client.gPacket(length);
    stream.rotateBack();

    replay.packets.push({
        type: 'client',
        timestamp,
        data: stream.data
    });
}

replay.outMetadata = client.g1();

replay.packets.sort((a, b) => a.timestamp - b.timestamp);

// now read it in order so we can decrypt opcodes

for (let i = 0; i < replay.packets.length; i++) {
    let packet = replay.packets[i];

    // virtual packets
    if (packet.type === 'connect') {
        if ((packet.flag & 64) === 64) {
            replay.keyIndex++;
            replay.decryptor = new IsaacRandom(replay.keys[replay.keyIndex]);
        }
        continue;
    } else if (packet.type === 'disconnect') {
        continue;
    }

    // decrypt
    packet.data[0] = (packet.data[0] + replay.decryptor.nextInt()) & 0xFF;

    // make opcode human readable
    packet.opcode = packet.data[0];
    if (packet.type === 'server' && ServerProt[packet.opcode]) {
        packet.opcode = ServerProt[packet.opcode];
    } else if (packet.type === 'client' && ClientProt[packet.opcode]) {
        packet.opcode = ClientProt[packet.opcode];
    }
}

delete replay.decryptor;

import fs from 'fs';
fs.writeFileSync('dump/packets.json', JSON.stringify(replay.packets.map(p => ({ type: p.type, timestamp: p.timestamp, flag: p.flag, opcode: p.opcode })), null, 2));

console.log(replay);
