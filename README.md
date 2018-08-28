# coset

coset ( **CO**mmunication sock**ET** ) is a communication library for client server applications using WebRTC DataChannels.

[![GitHub license](https://img.shields.io/badge/license-MIT-green.svg)](https://github.com/Dreaded-Gnu/coset/blob/master/LICENSE.md)
[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lernajs.io/)

## Description

WebRTC DataChannel connections are made by using internal websocket signaling server. So the client has to support normal websockets and also WebRTC DataChannels when you're going to use this library.

## ToDo

- [ ] Add heartbeat to server with disconnect on no in-time answer
  - [ ] Extend server config by attribute `server` restricted to https server
  - [ ] Extend server config by ping timeout attribute as number with default of 10 seconds
  - [ ] Check and add ping ( `server` -> `client` -> `server` ) to WebSocket transport layer
  - [ ] Check and add ping ( `server` -> `client` -> `server` ) to RtcDataChannel transport layer
  - [ ] Add disconnect with emit of disconnect event when ping doesn't receive an answer
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
- [ ] Think about providing websocket fallback, when rtc datachannels are not supported
