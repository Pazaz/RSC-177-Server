import fs from 'fs';
import Player from '#engine/Player.js';
import Log from '#util/Log.js';

class World {
    STATE = 1;

    players = [];
    locs = [];
    bounds = [];

    id = 1;
    members = true;
    clocks = {
        map: 0
    };

    planeWidth = 48 * 48;
    planeHeight = 48 * 37;
    planeFloor = 0;
    distanceBetweenFloors = 944;

    constructor() {
        for (let i = 0; i < 1250; i++) {
            this.players[i] = null;
        }

        this.locs = JSON.parse(fs.readFileSync('data/map/loc.json'));
        this.bounds = JSON.parse(fs.readFileSync('data/map/boundary.json'));

        this.tick();
    }

    tick() {
        let start = Date.now();

        // 1) process packets
        for (let i = 0; i < this.players.length; i++) {
            if (this.players[i] === null) {
                continue;
            }

            let player = this.players[i];

            if (player.inOffset > 0) {
                player.idleCount = 0;
            } else {
                player.idleCount++;
            }

            if (player.idleCount > 30) {
                player.socket.terminate();
                continue;
            }

            player.outOffset = 0;

            if (player.inOffset > 0) {
                player.decodeIn();
                player.inOffset = 0;
            }
        }

        // 2) update npcs

        // 3) update players
        for (let i = 0; i < this.players.length; i++) {
            if (this.players[i] === null) {
                continue;
            }

            let player = this.players[i];

            player.tick();
        }

        // 4) send packets
        for (let i = 0; i < this.players.length; i++) {
            if (this.players[i] === null) {
                continue;
            }

            let player = this.players[i];

            if (player.outQueue.length) {
                player.flushOut();
            }
        }

        let delta = Date.now() - start;
        if (delta > 600) {
            delta = 600;
        }
        Log.debug(`World tick ${this.clocks.map} took ${delta}ms`);

        this.clocks.map++;
        setTimeout(this.tick.bind(this), 600 - delta);
    }

    readIn(socket, data) {
        const { player } = socket;

        while (data.available > 0) {
            // read ahead to get the packet length
            let start = data.pos;
            let length = data.g1();
            if (length >= 160) {
                length = ((length - 160) << 8) | data.g1();
            }
            data.pos += length;
            let fullLength = data.pos - start;

            // TODO: consider TCP fragmentation

            player.in.set(data.gdata(fullLength, start, false), player.inOffset);
            player.inOffset += fullLength;
        }
    }

    getTotalPlayers() {
        return this.players.filter(p => p !== null).length;
    }

    getNextPid() {
        return this.players.indexOf(null);
    }

    addPlayer(socket, reconnecting, username, webClient) {
        let pid = this.getNextPid();
        if (pid === -1) {
            return false;
        }

        this.players[pid] = new Player(socket, reconnecting, username, webClient);
        this.players[pid].pid = pid;

        socket.state = this.STATE;
        socket.player = this.players[pid];
        return true;
    }

    removePlayerBySocket(socket) {
        let pid = socket.player.pid;
        this.players[pid] = null;
    }
}

export default new World();
