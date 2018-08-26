
// Node dependencies
import { EventEmitter } from "events";

// Additional package dependencies
import "webrtc-adapter";
import * as wrtc from "wrtc";
import { default as WebSocket  } from "ws";

// Import local dependencies
import { IMessageStructure } from "./message/istructure";
import MessageType from "./message/itype";

/**
 * Transport class
 *
 * @export
 * @class Transport
 * @extends {EventEmitter}
 */
export class Transport extends EventEmitter {
  /**
   * Transport id
   *
   * @private
   * @type {string}
   * @memberof Transport
   */
  private readonly id: string;

  /**
   * Websocket instance
   *
   * @private
   * @type {WebSocket}
   * @memberof Transport
   */
  private readonly socket: WebSocket;

  /**
   * Connection flag
   *
   * @private
   * @type {boolean}
   * @memberof Transport
   */
  private connected: boolean;

  /**
   * RTC peer connection
   *
   * @private
   * @type {RTCPeerConnection}
   * @memberof Transport
   */
  private peerConnection: wrtc.RTCPeerConnection;

  /**
   * RTC data channel
   *
   * @private
   * @type {RTCDataChannel}
   * @memberof Transport
   */
  private dataChannel: wrtc.RTCDataChannel;

  /**
   * Creates an instance of Transport.
   *
   * @param {string} id
   * @param {WebSocket} socket
   * @memberof Transport
   */
  constructor( id: string, socket: WebSocket ) {
    // Call parent constructor
    super();

    // Initialize attributes
    this.id = id;
    this.socket = socket;
    this.connected = false;
    this.peerConnection = null;
    this.dataChannel = null;

    // Prepare webrtc
    this.initialize_webrtc();

    // Bind handler
    this.socket
      .on( "message", this.handle_socket_message.bind( this ) )
      .on( "close", this.handle_socket_close.bind( this ) )
      .on( "error", this.handle_socket_error.bind( this ) )
      .on( "unexpected-response", this.handle_socket_unexpected.bind( this ) );
  }

  /**
   * Method to get id
   *
   * @readonly
   * @type {string}
   * @memberof Transport
   */
  public get Id(): string {
    return this.id;
  }

  /**
   * Method to get websocket
   *
   * @readonly
   * @type {WebSocket}
   * @memberof Transport
   */
  public get Socket(): WebSocket {
    return this.socket;
  }

  /**
   * Method to get connected flag
   *
   * @readonly
   * @type {boolean}
   * @memberof Transport
   */
  public get Connected(): boolean {
    return this.connected;
  }

  /**
   * Initialize webrtc itself
   *
   * @private
   * @memberof Transport
   */
  private initialize_webrtc(): void {
    try {
      const rtcPeer: typeof RTCPeerConnection =
        wrtc.RTCPeerConnection
        || ( window as any ).RTCPeerConnection
        || RTCPeerConnection;

      // create peer connection and data channel
      this.peerConnection = new rtcPeer();
      this.dataChannel = this.peerConnection.createDataChannel(
        "data", {
          maxRetransmits: 0,
          ordered: false,
        } );

      // bind on data event listener
      this.peerConnection.addEventListener( "datachannel", this.handle_connection_datachannel.bind( this ) );

      // bind ice candidate listener
      this.peerConnection.addEventListener( "icecandidate", this.handle_connection_ice_candidate.bind( this ) );
    } catch ( e ) {
      throw new Error( "WebRTC DataChannel are not supported!" );
    }
  }

  /**
   * Answer webrtc ice candidate
   *
   * @private
   * @param {RTCIceCandidateInit} payload
   * @memberof Transport
   */
  private async answer_webrtc_ice_candidate( payload: RTCIceCandidateInit ) {
    // create rtc ice candidate
    const candidate: RTCIceCandidate = new wrtc.RTCIceCandidate( payload );

    // wait for add of ice candidate
    await this.peerConnection.addIceCandidate( candidate );

    // return candidate
    this.socket.send( JSON.stringify( {
      payload: candidate,
      type: MessageType.webrtc.candidate,
    } ) );
  }

  /**
   * Answer webrtc answer
   *
   * @private
   * @param {RTCSessionDescriptionInit} payload
   * @returns {Promise< void >}
   * @memberof Transport
   */
  private async answer_webrtc_answer( payload: RTCSessionDescriptionInit ): Promise< void > {
    await this.peerConnection.setRemoteDescription( new RTCSessionDescription( payload ) );
  }

  /**
   * Answer webrtc offer
   *
   * @private
   * @param {RTCSessionDescriptionInit} payload
   * @returns {Promise< void >}
   * @memberof Transport
   */
  private async answer_webrtc_offer( payload: RTCSessionDescriptionInit ): Promise< void > {
    // set remote description
    await this.peerConnection.setRemoteDescription( payload );

    // create answer
    const answer: RTCSessionDescriptionInit = await this.peerConnection.createAnswer( {
      offerToReceiveAudio: false,
      offerToReceiveVideo: false,
    } );

    // add answer as local description
    await this.peerConnection.setLocalDescription( answer );

    // send answer back
    this.socket.send( JSON.stringify( {
      payload: answer,
      type: MessageType.webrtc.answer,
    } ) );
  }

  /**
   * Handle ice candidate
   *
   * @private
   * @param {RTCPeerConnectionIceEvent} event
   * @memberof Transport
   */
  private handle_connection_ice_candidate( event: RTCPeerConnectionIceEvent ) {
    // Skip when event or event candidate is invalid
    if ( ! event || ! event.candidate || this.connected ) {
      return;
    }

    // send candidate back
    this.socket.send( JSON.stringify( {
      payload: event.candidate,
      type: MessageType.webrtc.candidate,
    } ) );
  }

  /**
   * Handle datachannel listener
   *
   * @private
   * @param {RTCDataChannelEvent} event
   * @memberof Transport
   */
  private handle_connection_datachannel( event: RTCDataChannelEvent ) {
    // get data channel
    const dataChannel: RTCDataChannel = event.channel;

    // add event handler
    dataChannel.addEventListener( "close", this.handle_datachannel_close.bind( this, dataChannel ) );
    dataChannel.addEventListener( "open", this.handle_datachannel_open.bind( this ) );
    dataChannel.addEventListener( "message", this.handle_datachannel_message.bind( this ) );
    dataChannel.addEventListener( "error", this.handle_datachannel_error.bind( this ) );
  }

  /**
   * Handle datachannel open
   *
   * @private
   * @param {MessageEvent} event
   * @memberof Transport
   */
  private handle_datachannel_open( event: MessageEvent ): void {
    this.connected = true;
    this.emit( "connection", this );
  }

  /**
   * Datachannel close event
   *
   * @private
   * @param {Event} event
   * @memberof Transport
   */
  private handle_datachannel_close( channel: RTCDataChannel, event: Event ): void {
    // reset handler
    channel.removeEventListener( "close", this.handle_datachannel_close.bind( this ) );
    channel.removeEventListener( "open", this.handle_datachannel_open.bind( this ) );
    channel.removeEventListener( "message", this.handle_datachannel_message.bind( this ) );
    channel.removeEventListener( "error", this.handle_datachannel_error.bind( this ) );

    // close channel
    channel.close();
  }

  /**
   * Handle data channel message
   *
   * @private
   * @param {MessageEvent} event
   * @memberof Transport
   */
  private handle_datachannel_message( event: MessageEvent ): void {
    // TODO: parse message
  }

  /**
   * Handle datachannel error
   *
   * @private
   * @param {Event} event
   * @memberof Transport
   */
  private handle_datachannel_error( event: Event ): void {
    // TODO: Add error handling
    this.emit( "error", event );
  }

  /**
   * Initialize webrtc
   *
   * @private
   * @param {IMessageStructure} msg
   * @memberof Transport
   */
  private async handle_socket_initialize_webrtc( msg: IMessageStructure ): Promise< void > {
    if (
      this.connected
      || "undefined" === typeof msg.type
    ) {
      return;
    }

    // try to open rtc connection if not connected
    switch ( msg.type ) {
      case MessageType.nowebrtc:
        this.handle_datachannel_open( null );
        break;

      case MessageType.webrtc.offer:
        await this.answer_webrtc_offer( msg.payload );
        break;

      case MessageType.webrtc.answer:
        this.answer_webrtc_answer( msg.payload );
        break;

      case MessageType.webrtc.candidate:
        await this.answer_webrtc_ice_candidate( msg.payload );
        break;

      default:
        throw new Error( "Unallowed package type for webrtc init" );
    }
  }

  /**
   * Message handling
   *
   * @private
   * @param {string} [msg]
   * @returns {void}
   * @memberof Transport
   */
  private async handle_socket_message( data: string ): Promise< void > {
    let msg: any;

    // try to decode message
    try {
      msg = JSON.parse( data );
    } catch ( e ) {
      msg = null;
    }

    // already connected or msg type not set?
    if (
      ! this.connected
      && "undefined" !== typeof msg.type
    ) {
      await this.handle_socket_initialize_webrtc( msg );
      return;
    }

    // emit events
    try {
      // pre message handling
      this.emit( "message:pre", msg );

      // message handling
      this.emit( "message", msg );

      // post message handling
      this.emit( "message:post", msg );
    } catch ( e ) {
      // TODO: Add error handling
      return;
    }
  }

  /**
   * Close handling
   *
   * @private
   * @memberof Transport
   */
  private handle_socket_close(): void {
    // close rtc peer connection if existing
    if ( this.peerConnection ) {
      // remove channel callback
      this.peerConnection.removeEventListener( "datachannel", this.handle_connection_datachannel.bind( this ) );

      // close connection
      this.peerConnection.close();

      // unset peer connection
      this.peerConnection = null;
      this.dataChannel = null;
    }

    // emit event
    this.emit( "close" );
  }

  /**
   * Error handling
   *
   * @private
   * @memberof Transport
   */
  private handle_socket_error(): void {
    // TODO: Add error handling
  }

  /**
   * Unexpected handling
   *
   * @private
   * @memberof Transport
   */
  private handle_socket_unexpected(): void {
    // TODO: Add unexpected handling
  }
}
