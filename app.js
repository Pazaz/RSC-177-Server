import Server from '#network/Server.js';
import WSServer from '#network/WSServer.js';

let server = new Server();
server.start();

let wsserver = new WSServer();
wsserver.start();
