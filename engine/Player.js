import World from '#engine/World.js';
import { toBase37 } from '#util/Base37.js';
import ClientProt from '#util/ClientProt.js';
import Log from '#util/Log.js';
import Packet from '#util/Packet.js';
import ServerProt from '#util/ServerProt.js';
import { titleCase } from '#util/String.js';

function NoOp() {
}

export default class Player {
    static DECODERS = {
        [ClientProt.NO_TIMEOUT]: NoOp,

        [ClientProt.CLOSE_CONNECTION]: (player, stream) => {
            player.socket.terminate();
        },

        [ClientProt.LOGOUT]: (player, stream) => {
            player.logout();
        },

        [ClientProt.CLIENT_CHEAT]: (player, stream) => {
            let command = stream.gstr();
            let args = command.split(' ');
            command = args.shift().toLowerCase();

            switch (command) {
                case 'serverdrop': {
                    player.socket.terminate();
                } break;
                case 'logout': {
                    player.logout();
                } break;
                case 'test': {
                    player.message('yo');
                } break;
                default:
                    Log.info(`[World]: ${player.username} Unhandled command: ${command} ${args.join(' ')}`);
                    break;
            }
        },

        [ClientProt.DEBUG_INFO]: (player, stream) => {
            Log.warn(stream.gstr());
        },
    };

    socket = null;

    in = new Uint8Array(5000);
    inOffset = 0;
    // out = new Uint8Array(5000); // TODO: batching packets
    // outOffset = 0;
    outQueue = [];
    idleCount = 0;

    pid = -1;
    username = '';
    displayName = '';
    username37 = '';
    webClient = false;

    // coordinates are flipped?
    pos = { x: 124, y: 655, dir: 0 };

    firstLoad = true;
    reconnecting = false;
    loaded = false;
    loading = false;

    delay = 0;
    scriptQueue = [];

    observed = {
        players: [],
        objects: [],
        wallObjects: []
    };

    constructor(socket, reconnecting, username, webClient) {
        this.socket = socket;
        this.reconnecting = reconnecting;
        this.webClient = webClient;
        this.username = username;
        this.username37 = toBase37(username);
        this.displayName = titleCase(username);
    }

    tick() {
        this.process();

        if (this.firstLoad) {
            this.firstLoad = false;
            this.onFirstLoad();
        }

        this.regionPlayers();
        this.regionObjects();
        this.regionWallObjects();
    }

    onFirstLoad() {
        this.rebuildNormal();
    }

    regionPlayers() {
        let packet = new Packet();
        packet.p1(ServerProt.PLAYER_INFO);

        packet.accessBits();
        packet.pBit(11, this.pos.x);
        packet.pBit(13, this.pos.y);
        packet.pBit(4, this.pos.dir);

        // TODO: player list
        packet.pBit(8, 0);

        packet.accessBytes();
        this.queue(packet);
    }

    regionObjects() {
        let nearby = World.objects.filter(o => Math.abs(o.x - this.pos.x) < 16 && Math.abs(o.y - this.pos.y) < 16);

        let added = nearby.filter(o => !this.observed.objects.includes(o));
        let removed = this.observed.objects.filter(o => !nearby.includes(o));

        if (added.length === 0 && removed.length === 0) {
            return;
        }

        let packet = new Packet();
        packet.p1(ServerProt.REGION_OBJECTS);

        for (let i = 0; i < removed.length; i++) {
            let object = removed[i];
            packet.p2(0xFFFF);
            packet.p1(object.x - this.pos.x);
            packet.p1(object.y - this.pos.y);
        }

        for (let i = 0; i < added.length; i++) {
            let object = added[i];
            packet.p2(object.id);
            packet.p1(object.x - this.pos.x);
            packet.p1(object.y - this.pos.y);
        }

        this.queue(packet);

        this.observed.objects = nearby;
    }

    regionWallObjects() {
        let nearby = World.wallObjects.filter(o => Math.abs(o.x - this.pos.x) < 16 && Math.abs(o.y - this.pos.y) < 16);

        let added = nearby.filter(o => !this.observed.wallObjects.includes(o));
        let removed = this.observed.wallObjects.filter(o => !nearby.includes(o));

        if (added.length === 0 && removed.length === 0) {
            return;
        }

        let packet = new Packet();
        packet.p1(ServerProt.REGION_WALL_OBJECTS);

        for (let i = 0; i < removed.length; i++) {
            let object = removed[i];
            packet.p2(0xFFFF);
            packet.p1(object.x - this.pos.x);
            packet.p1(object.y - this.pos.y);
            packet.p1(object.direction);
        }

        for (let i = 0; i < added.length; i++) {
            let object = added[i];
            packet.p2(object.id);
            packet.p1(object.x - this.pos.x);
            packet.p1(object.y - this.pos.y);
            packet.p1(object.direction);
        }

        this.queue(packet);

        this.observed.wallObjects = nearby;
    }

    // ----

    getHeight() {
        return Math.floor(this.pos.y / World.distanceBetweenFloors);
    }

    // ---- script logic ----

    delayed() {
        return this.delay > 0;
    }

    process() {
    }

    // ---- network protocol ----

    decodeIn() {
        let offset = 0;
        while (offset < this.inOffset) {
            let length = this.in[offset++] & 0xFF;
            if (length >= 160) {
                length = ((length - 160) << 8) | (this.in[offset++] & 0xFF);
            }

            let stream = new Packet(this.in.subarray(offset, offset + length));
            offset += length;
            if (stream.length < 160) {
                stream.rotateBack();
            }

            let opcode = this.socket.spooky.g1(stream);

            if (Player.DECODERS[opcode]) {
                Player.DECODERS[opcode](this, stream);
            } else {
                Log.warn(`Unhandled packet: ${ClientProt[opcode] ?? opcode} (${stream.available} bytes)`);
            }
        }
    }

    flushOut() {
        for (let i = 0; i < this.outQueue.length; i++) {
            let packet = this.outQueue[i];
            this.socket.write(packet.data);
        }

        this.outQueue = [];
    }

    queue(stream) {
        let packet = new Packet();
        if (stream.length >= 160) {
            packet.p1((stream.length >> 8) + 160);
            packet.p1(stream.length);
        } else {
            packet.p1(stream.length);
        }

        // encrypt opcode
        stream.pos = 0;
        this.socket.spooky.p1(stream, stream.data[0]);
        if (stream.length < 160) {
            stream.rotate();
        }

        packet.pdata(stream);
        this.outQueue.push(packet);
    }

    // ---- packet encoders ----

    message(str) {
        let packet = new Packet();
        packet.p1(ServerProt.MESSAGE_GAME);
        packet.pstr(str);
        this.queue(packet);
    }

    rebuildNormal() {
        let packet = new Packet();
        packet.p1(ServerProt.REBUILD_NORMAL);
        packet.p2(this.pid);
        packet.p2(World.planeWidth);
        packet.p2(World.planeHeight);
        packet.p2(this.getHeight());
        packet.p2(World.distanceBetweenFloors);
        this.queue(packet);
    }

    logout() {
        let packet = new Packet();
        packet.p1(ServerProt.LOGOUT);
        this.queue(packet);
    }
}
