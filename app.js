import Server from '#network/Server.js';
import WSServer from '#network/WSServer.js';

import Config from '#cache/Config.js';

Config.load('release/config85.jag');

let server = new Server();
server.start();

let wsserver = new WSServer();
wsserver.start();
