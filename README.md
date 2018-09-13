# coset

coset ( **CO**mmunication sock**ET** ) is a communication library for client server applications using WebRTC DataChannels.

**Note:** Project is currently in an very early state of development and not yet published to npm.

[![GitHub license](https://img.shields.io/badge/license-MIT-green.svg)](https://github.com/Dreaded-Gnu/coset/blob/master/LICENSE.md)
[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lernajs.io/)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)

## Description

WebRTC DataChannel connections are made by using internal websocket signaling server. So the client has to support normal websockets and also WebRTC DataChannels when you're going to use this library.

## Installation

```bash
npm install @coset/server --save
```

## How to use

For WebRTC especially DataChannels an SSL encryption is enforced, so you're going to need an https server. For usage examples have a look at the [example directory](example/).

## ToDo

- [ ] Add heartbeat to server with disconnect on no in-time answer
  - [x] Extend server config by attribute `server` restricted to https server
  - [x] Extend server config by ping timeout attribute as number with default of 10 seconds
  - [x] Remove not yet used config options from server config interface
  - [x] Split up transport into classes for webrtc and websocket
  - [x] Use event bus for connecting websocket and webrtc transport layer instead of passing them around
  - [x] Check and add ping ( `server` -> `client` -> `server` ) to WebSocket transport layer
  - [x] Check and add ping ( `server` -> `client` -> `server` ) to RtcDataChannel transport layer
  - [ ] Add disconnect of both transports when one or both disconnected or emitted an error
  - [x] Add disconnect with emit of disconnect event when ping doesn't receive an answer within set timeframe.
  - [x] Test heartbeat with disconnect on timeout
  - [x] Find better place for SocketClose callback within webrtc
- [x] Add verbose output activated, when setting specific environment variable by using `debug`
- [ ] Encoding/Decoding of packages with registering serialization schemes and handler
  - [x] Change data transfer for rtc to binary by using `arraybuffer`
  - [x] Add attach of listener for packet type with included message structure ( first parameter type, second callback, 3rd message structure ) used for send and receive

    ```js
    /*
     * handler will be used for encode of data
     * before send and decode of data after receive
     * before passing data out
     */
    client.Serialize(
      Message.Position, {
        a: Type.Char,
        b: Type.Int,
        c: Type.Short,
        d: Type.Float,
      }
    );

    /*
     * handler called after decode has been done
     */
    client.Handler(
      Message.Position,
      ( data ) => {
        /* ... do something with data structure ... */
      }
    );
    ```

  - [x] Support (de-)serialization of data as common helper
    - [x] Implement encoding of data before send, when scheme is set.
    - [x] Implement decoding of data after receive, when scheme is set.
    - [x] Consider following scheme types signed and unsigned
      - [x] `Byte`: 1 byte
      - [x] `UByte`: 1 byte
      - [x] `ShortInt`: 2 byte
      - [x] `UShortInt`: 2 byte
      - [x] `Int`: 4 bytes
      - [x] `UInt`: 4 bytes
      - [x] `Float`: 4 bytes
      - [x] `Double`: 8 bytes
  - [ ] Throw errors, when trying to send/receive a message type without encode/decode handler
  - [ ] Test send/receive of messages with and without data
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
- [x] Add prettier
  - [x] Include prettier within tslint for packages
  - [x] Add and include prettier to eslint for plain javascript examples
  - [x] Add and include prettier to tslint for typescript examples
- [ ] Create documentation
  - [ ] Create wiki documentation about how to use library
  - [ ] Create example projects
- [x] Add automatic documentation generation
- [x] Add automatic changelog generation
- [x] Add code of conduct file
- [x] Add content within contributing markdown
- [x] Add github issue and pull request templates
- [ ] Publish to npm
