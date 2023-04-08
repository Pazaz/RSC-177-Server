import World from '#engine/World.js';
import { fromBase37 } from '#util/Base37.js';
import Log from '#util/Log.js';
import Packet from '#util/Packet.js';

class Login {
    STATE = 0;

    static CONNECT = 0;
    static INVALID_CREDENTIALS = 3;
    static USER_LOGGED_IN = 4;
    static CLIENT_UPDATED = 5;
    static IP_ADDRESS_IN_USE = 6;
    static LOGIN_ATTEMPTS_EXCEEDED = 7;
    static TEMPORARILY_DISABLED = 11;
    static PERMANENTLY_DISABLED = 12;
    static USERNAME_TAKEN = 12;
    static SERVER_FULL = 14;

    readIn(socket, data, webClient) {
        while (data.available > 0) {
            let length = data.g1();
            if (length >= 160) {
                length = ((length - 160) << 8) | data.g1();
            }

            let stream = data.gPacket(length);
            stream.rotateBack();

            let opcode = socket.spooky.g1(stream);

            switch (opcode) {
                case 0:
                case 19: {
                    let resp = new Packet();
                    resp.p1(0); // packet length

                    let revision = stream.g2();
                    if (revision !== 177) {
                        socket.spooky.p1(resp, Login.CLIENT_UPDATED);
                        socket.write(resp.data);
                        socket.terminate();
                        return;
                    }

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

                    if (!username.length || username.length > 12 || !password.length || password.length > 20) {
                        socket.spooky.p1(resp, Login.INVALID_CREDENTIALS);
                        socket.write(resp.data);
                        socket.terminate();
                        return;
                    }

                    let reconnecting = opcode === 19;
                    if (reconnecting) {
                        Log.info(`[Login] User ${username} is reconnecting...`);
                    } else {
                        Log.info(`[Login] User ${username} is logging in...`);
                    }

                    if (World.getNextPid() === -1) {
                        socket.spooky.p1(resp, Login.SERVER_FULL);
                        socket.write(resp.data);
                        socket.terminate();
                        return;
                    }

                    socket.spooky.p1(resp, Login.CONNECT);
                    socket.write(resp.data);

                    World.addPlayer(socket, reconnecting, username, webClient);
                } break;
                default:
                    socket.terminate();
                    break;
            }
        }
    }
}

export default new Login();
