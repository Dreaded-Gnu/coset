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
  Empty = 0,
  Integer = 4,
}

/**
 * WebRTC built in message types
 */
enum WebrtcMessageType {
  Ping = 0,
  Pong = 1,
}

/**
 * Callback map function type
 */
type CallbackMapFunction = (data?: object) => void;

/**
 * Internal count helper
 *
 * @param obj serialize object to count bytes of
 * @return amount of bytes for array buffer
 */
const countObjectLength: (obj: object) => number = (obj: object): number => {
  // Initialize initial length with empty
  let byteLength: number = Size.Empty;

  // Loop recursively through object
  for (const key in obj) {
    // Skip invalid
    if (!obj.hasOwnProperty(key)) {
      continue;
    }

    // Handle object in object
    if (typeof obj[key] !== "number") {
      byteLength += countObjectLength(obj[key]);
      continue;
    }

    // Normal byte amount
    byteLength += parseInt(obj[key], 10);
  }

  return byteLength;
};

/**
 * Object to array buffer converter
 *
 * @todo Throw error when object doesn't match structure
 *
 * @param serialize serialize object
 * @param data data object
 * @param byteLength byte length for array buffer
 */
const objectToBuffer: (
  serialize: object,
  data: object,
  byteLength: number,
) => ArrayBuffer = (
  serialize: object,
  data: object,
  byteLength: number,
): ArrayBuffer => {
  throw new Error("Object to buffer helper not yet written!");
};

/**
 * WebRTC DataChannel transport wrapper
 *
 * @export
 */
export class TransportWebrtc {
  /**
   * Callback map
   */
  private readonly callbackMap: Map<number, CallbackMapFunction[]>;

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
   * Array of reserved message types
   */
  private readonly reservedMessageTypes: number[];

  /**
   * Serialize map
   */
  private readonly serializeMap: Map<number, object>;

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

    // Setup necessary event handler
    this.eventBus
      .on(`signal::${messageType.close}`, this.SignalClose.bind(this))
      .on(`signal::${messageType.webrtc.answer}`, this.WebrtcAnswer.bind(this))
      .on(`signal::${messageType.webrtc.offer}`, this.WebrtcOffer.bind(this))
      .on(
        `signal::${messageType.webrtc.candidate}`,
        this.WebrtcIceCandidate.bind(this),
      )
      .on("socket::send", this.Send.bind(this))
      .on("socket::serialize", this.RegisterSerialize.bind(this))
      .on("socket::handler", this.RegisterHandler.bind(this));

    // Setup reserved messages and initialize maps
    this.reservedMessageTypes = [
      WebrtcMessageType.Ping,
      WebrtcMessageType.Pong,
    ];
    this.serializeMap = new Map();
    this.callbackMap = new Map();

    // Setup internal message handlers
    this.RegisterHandler(
      WebrtcMessageType.Pong,
      this.Hearbeat.bind(this),
      false,
      true,
    );

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
      throw new Error("WebRTC DataChannel not supported!");
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
    this.Send(WebrtcMessageType.Ping);

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
    // Extract message type
    const msgType: number = new Int32Array(
      event.data.slice(Size.Empty, Size.Integer),
    )[0];

    // Initial length is only size for type number
    let checkLength: number = Size.Integer;
    const messageLength: number = event.data.byteLength;

    // Get serialization information
    const serialize: object = this.serializeMap.get(msgType);

    // Extend check length by expected message size
    if (typeof serialize !== "undefined") {
      checkLength += countObjectLength(serialize);
    }

    // Check array buffer length
    if (event.data.byteLength !== checkLength) {
      throw new Error(
        `Invalid message size, expected ${checkLength} got ${messageLength}`,
      );
    }

    // Handle deserialization
    if (typeof serialize !== "undefined") {
      throw new Error("Deserialize of message not yet supported!");
    }

    // Serialize map if some strategy is existing
    if (this.serializeMap.has(msgType)) {
      throw new Error("Message deserialize not yet implemented!");
    }

    // Get bound callbacks
    const callbackList: CallbackMapFunction[] = this.callbackMap.get(msgType);

    // Handle no callback
    if (typeof callbackList === "undefined") {
      throw new Error(`No callback bound for type ${msgType}!`);
    }

    // Iterate over callbacks and execute them
    callbackList.forEach(
      (cb: CallbackMapFunction): void => {
        cb(event.data);
      },
    );
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
   * Method to register handler
   *
   * @todo check whether handler removal works or not
   *
   * @param type message type
   * @param callback callback to use
   * @param remove removal flag
   */
  private RegisterHandler(
    type: number,
    callback: CallbackMapFunction,
    remove: boolean = false,
    internal: boolean = false,
  ): void {
    // Handle invalid data
    if (typeof type === "undefined" || typeof callback === "undefined") {
      throw new Error("Invalid parameter passed to RegisterHandler!");
    }

    // Check for reserve message type
    if (!internal && this.reservedMessageTypes.indexOf(type) !== -1) {
      throw new Error(
        `Message type ${type} used internally, removal or add not possible!`,
      );
    }

    // Setup callbacks to insert
    let callbackList: CallbackMapFunction[] = [];

    // Overwrite if existing
    if (this.callbackMap.has(type)) {
      callbackList = this.callbackMap.get(type);
    }

    // Get callback index
    const currentCallbackIndex: number = callbackList.indexOf(callback);

    // Check for existance before removal
    if (remove && currentCallbackIndex !== -1) {
      return;
    }

    // Handle remove
    if (remove) {
      callbackList.splice(currentCallbackIndex, 1);

      return;
    }

    // Handle already added
    if (currentCallbackIndex !== -1) {
      throw new Error(`Callback for message type ${type} already registered!`);
    }

    // Push callback and overwrite map entry
    callbackList.push(callback);
    this.callbackMap.set(type, callbackList);
  }

  /**
   * Method to register serialization strategy
   *
   * @param type message type
   * @param structure structure information to cache
   * @param remove flag set to true for removal
   */
  private RegisterSerialize(
    type: number,
    structure?: object,
    remove: boolean = false,
  ): void {
    // Check for reserve message type
    if (this.reservedMessageTypes.indexOf(type) !== -1) {
      throw new Error(`Message type ${type} only for internal usage!`);
    }

    // Handle already set serialize
    if (!remove && this.serializeMap.has(type)) {
      throw new Error(
        `Register serialize for type ${type} already registered!`,
      );
    }

    // Handle remove
    if (remove) {
      this.serializeMap.delete(type);

      return;
    }

    // Set serialize structure
    this.serializeMap.set(type, structure);
  }

  /**
   * Send message callback
   *
   * @param type message type to send necessary for binary transfer
   * @param data optional data to send with registered structure
   */
  private Send(type: number, data?: object): void {
    // Do nothing on connection
    if (!this.connected) {
      return;
    }

    // Initial length is only size for type number
    let len: number = Size.Integer;

    // Get serialization information
    const serialize: object = this.serializeMap.get(type);

    // Handle passed data but no serialize object
    if (typeof serialize === "undefined" && typeof data !== "undefined") {
      throw new Error(`No serialization for message type ${type} existing`);
    }

    // Increase necessary length for packet to serialize
    if (typeof data !== "undefined") {
      len += countObjectLength(serialize);
    }

    // Create typed arrays for later transport
    const typeBuffer: Uint32Array = new Uint32Array([type]);
    let objectBuffer: ArrayBuffer;

    // Allocate buffer
    const buffer: Uint8Array = new Uint8Array(len);

    // Add message type
    buffer.set(new Uint8Array(typeBuffer.buffer), 0);

    // Append object buffer data
    if (typeof data !== "undefined") {
      // Translate object into array buffer
      objectBuffer = objectToBuffer(serialize, data, len - Size.Integer);

      // Add data to transfer
      buffer.set(new Uint8Array(objectBuffer), objectBuffer.byteLength);
    }

    // Send package
    this.dataChannel.send(buffer);
  }

  /**
   * Handler for socket close to kickstart datachannel close
   */
  private SignalClose(): void {
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
