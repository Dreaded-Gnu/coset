# coset

coset ( **CO**mmunication sock**ET** ) is a communication library for client server applications using WebRTC DataChannels.

**Note:** Project is currently in an very early state of development and not yet published to npm.

[![GitHub license](https://img.shields.io/badge/license-MIT-green.svg)](https://github.com/Dreaded-Gnu/coset/blob/master/LICENSE.md)
[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lernajs.io/)

## Description

WebRTC DataChannel connections are made by using internal websocket signaling server. So the client has to support normal websockets and also WebRTC DataChannels when you're going to use this library.

## Installation

```bash
npm install @coset/server --save
```

## How to use

For WebRTC especially DataChannels an SSL encryption is enforced. The following example attaches `@coset/server` to a plain Node.JS HTTPS server:

```js
const httpsServer = require( 'https' ).createServer( {
  "cert": readFileSync( "cert.pem" ),
  "key": readFileSync( "key.pem" ),
  "passphrase": "top-secret",
} );

const cosetServer = new require( '@coset/server' ).Server( httpsServer );
cosetServer.on('connection', ( socket ) => {
  client.on( 'message', () => {} );
  client.on( 'disconnect', () => {} );
});

server.listen(3000);
```

## ToDo

- [ ] Add heartbeat to server with disconnect on no in-time answer
  - [x] Extend server config by attribute `server` restricted to https server
  - [x] Extend server config by ping timeout attribute as number with default of 10 seconds
  - [x] Remove not yet used config options from server config interface
  - [ ] Check and add ping ( `server` -> `client` -> `server` ) to WebSocket transport layer
  - [ ] Check and add ping ( `server` -> `client` -> `server` ) to RtcDataChannel transport layer
  - [ ] Add disconnect with emit of disconnect event when ping doesn't receive an answer within set timeframe ( timeout interval )
- [ ] Add verbose output activated, when setting specific environment variable
- [ ] Change data transfer for websockets and rtc to binary
  - [ ] Support encoding of data
  - [ ] Support decoding of data
- [ ] Add message queue for enqueing messages before sending it and to not overload datachannel
- [ ] Implement kind of protocol on top of rtc
  - [ ] Support packet fragmentation
  - [ ] Support message chunking
  - [ ] Support reliable-ordered messages
- [ ] Add client library and move common parts from server to common library
- [ ] Add unit testing at server and client
- [ ] Add browser based end to end tests
- [ ] Add ci test suite for executing unit tests and browser based tests
  - [ ] OS X
  - [ ] Linux
  - [ ] Windows
- [ ] Add ci test suite for windows based testing
- [ ] Add greenkeeper dependency management
- [ ] Create documentation
  - [ ] Create wiki documentation about how to use library
  - [ ] Create example projects
- [ ] Add automatic changelog generation
- [x] Add code of conduct file
- [ ] Add content within contributing markdown
- [ ] Add github issue templates
- [ ] Publish to npm
