## Starting the Server

Before the first run, be sure to run `npm i` to install all dependencies.  
Then, run `npm start` to start the server. It will listen on port 43594 by default. There's also a websocket server running on port 43595 to handle webclients.

## Starting the Client

There's a simple NPM script to start the client: `npm run client`. It runs the [RSC-177 client](https://github.com/Pazaz/RSC-177)  
This is configured to initialize as a members client and connect to `127.0.0.1:43594`.
