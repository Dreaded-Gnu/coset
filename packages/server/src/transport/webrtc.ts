// Node dependencies
import { EventEmitter } from "events";

// Additional package dependencies
import "webrtc-adapter";
import * as wrtc from "wrtc";

// Import local dependencies
import { IMessageStructure } from "./../message/istructure";
import MessageType from "./../message/itype";
import { IServerConfig } from "./../server/iconfig";
import { TransportSocket } from "./socket";

/**
 * WebRTC DataChannel transport wrapper
 *
 * @export
 * @class TransportWebrtc
 * @extends {EventEmitter}
 */
export class TransportWebrtc extends EventEmitter {
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
   * Connected flag
   *
   * @private
   * @type {boolean}
   * @memberof TransportWebrtc
   */
  private connected: boolean;

  /**
   * Socket transport used for connection establish
   *
   * @private
   * @type {TransportSocket}
   * @memberof TransportWebrtc
   */
  private socket: TransportSocket;

  /**
   * Server config
   *
   * @private
   * @type {IServerConfig}
   * @memberof TransportWebrtc
   */
  private option: IServerConfig;

  /**
   * Creates an instance of TransportWebrtc.
   *
   * @param {TransportSocket} socket
   * @param {IServerConfig} option
   * @memberof TransportWebrtc
   */
  constructor(socket: TransportSocket, option: IServerConfig) {
    // parent constructor
    super();

    // save socket transport
    this.socket = socket;
    // cache option
    this.option = option;

    // bind necessary socket handlers
    this.socket
      .on("close", this.socket_close.bind(this))
      .on(MessageType.webrtc.answer, this.webrtc_answer.bind(this))
      .on(MessageType.webrtc.offer, this.webrtc_offer.bind(this))
      .on(MessageType.webrtc.candidate, this.webrtc_ice_candidate.bind(this));

    // initialize peer
    try {
      const rtcPeer: typeof RTCPeerConnection =
        wrtc.RTCPeerConnection ||
        (window as any).RTCPeerConnection ||
        RTCPeerConnection;

      // create peer connection and data channel
      this.peerConnection = new rtcPeer();
      this.dataChannel = this.peerConnection.createDataChannel("data", {
        maxRetransmits: 0,
        ordered: false,
      });

      // bind on data event listener
      this.peerConnection.addEventListener(
        "datachannel",
        this.handle_datachannel.bind(this),
      );

      // bind ice candidate listener
      this.peerConnection.addEventListener(
        "icecandidate",
        this.handle_ice_candidate.bind(this),
      );
    } catch (e) {
      throw new Error("WebRTC DataChannel are not supported!");
    }
  }

  /**
   * Answer webrtc ice candidate
   *
   * @private
   * @param {IMessageStructure} msg
   * @returns {Promise<void>}
   * @memberof TransportWebrtc
   */
  private async webrtc_ice_candidate(msg: IMessageStructure): Promise<void> {
    // check connected
    if (this.connected) {
      return;
    }

    // get payload
    const payload: RTCIceCandidateInit = msg.payload;

    // create rtc ice candidate
    const candidate: RTCIceCandidate = new wrtc.RTCIceCandidate(payload);

    // wait for add of ice candidate
    await this.peerConnection.addIceCandidate(candidate);

    // return candidate
    this.socket.send(
      JSON.stringify({
        payload: candidate,
        type: MessageType.webrtc.candidate,
      }),
    );
  }

  /**
   * Answer webrtc answer
   *
   * @private
   * @param {IMessageStructure} msg
   * @returns {Promise<void>}
   * @memberof Transport
   */
  private async webrtc_answer(msg: IMessageStructure): Promise<void> {
    // check connected
    if (this.connected) {
      return;
    }

    // extract payload
    const payload: RTCSessionDescriptionInit = msg.payload;

    // set remote description
    await this.peerConnection.setRemoteDescription(
      new RTCSessionDescription(payload),
    );
  }

  /**
   * Answer webrtc offer
   *
   * @private
   * @param {IMessageStructure} msg
   * @returns {Promise<void>}
   * @memberof Transport
   */
  private async webrtc_offer(msg: IMessageStructure): Promise<void> {
    // check connected
    if (this.connected) {
      return;
    }

    // extract payload
    const payload: RTCSessionDescriptionInit = msg.payload;

    // set remote description
    await this.peerConnection.setRemoteDescription(payload);

    // create answer
    const answer: RTCSessionDescriptionInit = await this.peerConnection.createAnswer(
      {
        offerToReceiveAudio: false,
        offerToReceiveVideo: false,
      },
    );

    // add answer as local description
    await this.peerConnection.setLocalDescription(answer);

    // send answer back
    this.socket.send(
      JSON.stringify({
        payload: answer,
        type: MessageType.webrtc.answer,
      }),
    );
  }

  /**
   * Handle ice candidate
   *
   * @private
   * @param {RTCPeerConnectionIceEvent} event
   * @memberof Transport
   */
  private handle_ice_candidate(event: RTCPeerConnectionIceEvent): void {
    // Skip when event or event candidate is invalid
    if (!event || !event.candidate || this.connected) {
      return;
    }

    // send candidate back
    this.socket.send(
      JSON.stringify({
        payload: event.candidate,
        type: MessageType.webrtc.candidate,
      }),
    );
  }

  /**
   * Handler for socket close to kickstart datachannel close
   *
   * @private
   * @memberof TransportWebrtc
   */
  private socket_close(): void {
    // close rtc peer connection if existing
    if (!this.peerConnection) {
      return;
    }

    // remove channel callback
    this.peerConnection.removeEventListener(
      "datachannel",
      this.handle_datachannel.bind(this),
    );

    // close connection
    this.peerConnection.close();

    // unset peer connection
    this.peerConnection = null;
    this.dataChannel = null;
  }

  /**
   * Handle datachannel listener
   *
   * @private
   * @param {RTCDataChannelEvent} event
   * @memberof Transport
   */
  private handle_datachannel(event: RTCDataChannelEvent): void {
    // get data channel
    const dataChannel: RTCDataChannel = event.channel;

    // set array buffer binary type
    dataChannel.binaryType = "arraybuffer";

    // add event handler
    dataChannel.addEventListener(
      "close",
      this.handle_close.bind(this, dataChannel),
    );
    dataChannel.addEventListener("open", this.handle_open.bind(this));
    dataChannel.addEventListener("message", this.handle_message.bind(this));
    dataChannel.addEventListener("error", this.handle_error.bind(this));
  }

  /**
   * Handle datachannel open
   *
   * @private
   * @param {MessageEvent} event
   * @memberof Transport
   */
  private handle_open(event: MessageEvent): void {
    this.connected = true;
    this.emit("connection", this);
  }

  /**
   * Datachannel close event
   *
   * @private
   * @param {Event} event
   * @memberof Transport
   */
  private handle_close(channel: RTCDataChannel, event: Event): void {
    // reset handler
    channel.removeEventListener("close", this.handle_close.bind(this));
    channel.removeEventListener("open", this.handle_open.bind(this));
    channel.removeEventListener("message", this.handle_message.bind(this));
    channel.removeEventListener("error", this.handle_error.bind(this));

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
  private handle_message(event: MessageEvent): void {
    /*// emit events
    try {
      // pre message handling
      this.emit("message:pre", msg);

      // message handling
      this.emit("message", msg);

      // post message handling
      this.emit("message:post", msg);
    } catch (e) {
      // TODO: Add error handling
      return;
    }*/
    // TODO: parse message
  }

  /**
   * Handle datachannel error
   *
   * @private
   * @param {Event} event
   * @memberof Transport
   */
  private handle_error(event: Event): void {
    // TODO: Add error handling
  }
}
