// Additional package dependencies
import * as EventEmitter from "eventemitter3";
import * as wrtc from "wrtc";

// Import local dependencies
import { IMessageStructure } from "./../message/istructure";
import { messageType } from "./../message/itype";
import { IServerConfig } from "./../server/iconfig";

/**
 * Used sizes for transform package into array buffer
 */
enum Size {
  Integer = 4,
}

/**
 * WebRTC built in message types
 */
enum WebrtcMessageType {
  Ping = 0,
}

/**
 * WebRTC DataChannel transport wrapper
 *
 * @export
 */
export class TransportWebrtc {
  /**
   * Connected flag
   */
  private connected: boolean;

  /**
   * RTC data channel
   */
  private dataChannel: wrtc.RTCDataChannel;

  /**
   * Passed in event bus
   */
  private readonly eventBus: EventEmitter;

  /**
   * Server config
   */
  private readonly option: IServerConfig;

  /**
   * RTC peer connection
   */
  private peerConnection: wrtc.RTCPeerConnection;

  /**
   * Ping timeout
   */
  private pingTimeout: number;

  /**
   * Creates an instance of TransportWebrtc.
   *
   * @param option server config
   * @param eventBus communication event bus
   */
  public constructor(option: IServerConfig, eventBus: EventEmitter) {
    // Save parameters
    this.option = option;
    this.eventBus = eventBus;

    this.eventBus
      .on("signal::close", this.SocketClose.bind(this))
      .on(`signal::${messageType.webrtc.answer}`, this.WebrtcAnswer.bind(this))
      .on(`signal::${messageType.webrtc.offer}`, this.WebrtcOffer.bind(this))
      .on(
        `signal::${messageType.webrtc.candidate}`,
        this.WebrtcIceCandidate.bind(this),
      )
      .on("socket::send", this.Send.bind(this));

    // Initialize peer
    try {
      // Create peer connection and data channel
      this.peerConnection = new wrtc.RTCPeerConnection();
      this.dataChannel = this.peerConnection.createDataChannel("data", {
        maxRetransmits: 0,
        ordered: false,
      });

      // Bind on data event listener
      this.peerConnection.addEventListener(
        "datachannel",
        this.DatachannelAdded.bind(this),
      );

      // Bind ice candidate listener
      this.peerConnection.addEventListener(
        "icecandidate",
        this.IceCandidate.bind(this),
      );
    } catch (e) {
      throw new Error("WebRTC DataChannel are not supported!");
    }
  }

  /**
   * Handle datachannel listener
   *
   * @param event event data
   */
  private DatachannelAdded(event: wrtc.RTCDataChannelEvent): void {
    // Get data channel
    const dataChannel: wrtc.RTCDataChannel = event.channel;

    // Set array buffer binary type
    dataChannel.binaryType = "arraybuffer";

    // Add event handler
    dataChannel.addEventListener(
      "close",
      this.HandleClose.bind(this, dataChannel),
    );
    dataChannel.addEventListener("open", this.HandleOpen.bind(this));
    dataChannel.addEventListener("message", this.HandleMessage.bind(this));
    dataChannel.addEventListener("error", this.HandleError.bind(this));
  }

  /**
   * Execute ping
   */
  private DoPing(): void {
    // Send ping
    this.eventBus.emit("socket::send", WebrtcMessageType.Ping);

    // Set timeout
    this.pingTimeout = setTimeout(
      this.HandleTimeout.bind(this),
      this.option.pingTimeout,
    );
  }

  /**
   * Datachannel close event
   *
   * @param event event data
   */
  private HandleClose(channel: wrtc.RTCDataChannel, event: Event): void {
    // Reset handler
    channel.removeEventListener("close", this.HandleClose.bind(this));
    channel.removeEventListener("open", this.HandleOpen.bind(this));
    channel.removeEventListener("message", this.HandleMessage.bind(this));
    channel.removeEventListener("error", this.HandleError.bind(this));

    // Close channel
    channel.close();
  }

  /**
   * Handle datachannel error
   *
   * @todo add error handling
   *
   * @param event error event
   */
  private HandleError(event: Event): void {
    this.eventBus.emit("socket::error", event);
  }

  /**
   * Handle data channel message
   *
   * @todo add message parsing
   * @todo add error handling
   *
   * @param event message event
   */
  private HandleMessage(event: MessageEvent): void {
    this.eventBus.emit("socket::message", event.data);
  }

  /**
   * Handle datachannel open
   *
   * @param event event data
   */
  private HandleOpen(event: MessageEvent): void {
    // Set connection flag
    this.connected = true;

    // Start heartbeat
    this.Hearbeat();

    // Emit connection success
    this.eventBus.emit("socket::connection", this);
  }

  /**
   * Handle timeout
   *
   * @todo add timeout handling
   */
  private HandleTimeout(): void {
    // Reset connected flag
    this.connected = false;
    throw new Error("Timeout handling to be added!");
  }

  /**
   * Ping message handling
   */
  private Hearbeat(): void {
    // Skip if not connected
    if (!this.connected) {
      return;
    }

    // Clear timeout
    clearTimeout(this.pingTimeout);

    // Send ping with delay
    setTimeout(this.DoPing.bind(this), this.option.pingInterval);
  }

  /**
   * Handle ice candidate and send to remote
   *
   * @param event event data containing candidae
   */
  private IceCandidate(event: wrtc.RTCPeerConnectionIceEvent): void {
    // Skip when event or event candidate is invalid
    if (
      this.connected ||
      typeof event === "undefined" ||
      event === null ||
      typeof event.candidate === "undefined" ||
      event.candidate === null
    ) {
      return;
    }

    // Send candidate back
    this.eventBus.emit(
      "signal::send",
      JSON.stringify({
        payload: event.candidate,
        type: messageType.webrtc.candidate,
      }),
    );
  }

  /**
   * Send message callback
   *
   * @todo use registered structure for transfer to array buffer
   * @todo Calculate correct size of array buffer
   *
   * @param type message type to send necessary for binary transfer
   * @param data data to send with registered structure
   */
  private Send(type: number, data: object): void {
    // Do nothing on connection
    if (!this.connected) {
      return;
    }

    // Allocate buffer
    const buffer: ArrayBuffer = new ArrayBuffer(Size.Integer);

    // TODO: transform data to buffer

    // Send data
    this.dataChannel.send(buffer);
  }

  /**
   * Handler for socket close to kickstart datachannel close
   */
  private SocketClose(): void {
    // Close rtc peer connection if existing
    if (typeof this.peerConnection === "undefined") {
      return;
    }

    // Remove channel callback
    this.peerConnection.removeEventListener(
      "datachannel",
      this.DatachannelAdded.bind(this),
    );

    // Close connection
    this.peerConnection.close();

    // Unset peer connection and connection flag
    this.peerConnection = undefined;
    this.dataChannel = undefined;
    this.connected = false;
  }

  /**
   * Answer webrtc answer
   *
   * @param msg message received from socket transport
   */
  private async WebrtcAnswer(msg: IMessageStructure): Promise<void> {
    // Check connected
    if (this.connected) {
      return;
    }

    // Extract payload
    const payload: wrtc.RTCSessionDescriptionInit = msg.payload as wrtc.RTCSessionDescriptionInit;

    // Set remote description
    await this.peerConnection.setRemoteDescription(
      new wrtc.RTCSessionDescription(payload),
    );
  }

  /**
   * Answer webrtc ice candidate
   *
   * @param msg message received from socket transport
   */
  private async WebrtcIceCandidate(msg: IMessageStructure): Promise<void> {
    // Check connected
    if (this.connected) {
      return;
    }

    // Get payload
    const payload: wrtc.RTCIceCandidateInit = msg.payload as wrtc.RTCIceCandidate;

    // Create rtc ice candidate
    const candidate: wrtc.RTCIceCandidate = new wrtc.RTCIceCandidate(payload);

    // Wait for add of ice candidate
    await this.peerConnection.addIceCandidate(candidate);

    // Return candidate
    this.eventBus.emit(
      "signal::send",
      JSON.stringify({
        payload: candidate,
        type: messageType.webrtc.candidate,
      }),
    );
  }

  /**
   * Answer webrtc offer
   *
   * @param msg message received from socket transport
   */
  private async WebrtcOffer(msg: IMessageStructure): Promise<void> {
    // Check connected
    if (this.connected) {
      return;
    }

    // Extract payload
    const payload: wrtc.RTCSessionDescriptionInit = msg.payload as wrtc.RTCSessionDescriptionInit;

    // Set remote description
    await this.peerConnection.setRemoteDescription(payload);

    // Create answer
    const answer: wrtc.RTCSessionDescriptionInit = await this.peerConnection.createAnswer(
      {
        offerToReceiveAudio: false,
        offerToReceiveVideo: false,
      },
    );

    // Add answer as local description
    await this.peerConnection.setLocalDescription(answer);

    // Send answer back
    this.eventBus.emit(
      "signal::send",
      JSON.stringify({
        payload: answer,
        type: messageType.webrtc.answer,
      }),
    );
  }
}
