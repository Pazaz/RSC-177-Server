import SpookyCrypt from '#util/SpookyCrypt.js';

export default class GenericSocket {
    static TCP = 0;
    static WEBSOCKET = 1;

    socket = null;
    type = -1;
    state = -1;
    remoteAddress = null;
    spooky = new SpookyCrypt();

    constructor(socket, state = -1, remoteAddress = null, type = GenericSocket.TCP) {
        this.socket = socket;
        this.state = state;
        this.remoteAddress = remoteAddress;
        this.type = type;
    }
    
    isTCP() {
        return this.type === GenericSocket.TCP;
    }

    isWebSocket() {
        return this.type === GenericSocket.WEBSOCKET;
    }

    write(data) {
        if (this.isTCP()) {
            this.socket.write(data);
        } else if (this.isWebSocket()) {
            this.socket.send(data);
        }
    }

    // close the connection gracefully
    close() {
        this.state = -1;

        // TODO: revisit this to make sure no connection overflow attacks can be done
        setTimeout(() => {
            if (this.isTCP()) {
                this.socket.end();
            } else if (this.isWebSocket()) {
                this.socket.close();
            }
        }, 10);
    }

    // terminate the connection immediately
    terminate() {
        this.state = -1;

        if (this.isTCP()) {
            this.socket.destroy();
        } else if (this.isWebSocket()) {
            this.socket.terminate();
        }
    }
}