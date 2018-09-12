// Additional package dependencies
import * as Debug from "debug";
import * as EventEmitter from "eventemitter3";
import * as wrtc from "wrtc";

// Internal dependencies
import { Serialize, Size } from "@coset/common";

// Import local dependencies
import { constant } from "./../constant";
import { IMessageSignalStructure } from "./../message/signal/istructure";
import { messageSignalType } from "./../message/signal/type";
import { MessageSocketType } from "./../message/socket/type";
import { IServerConfig } from "./../server/iconfig";

/**
 * Callback map function type
 */
type CallbackMapFunction = (data?: object) => void;

/**
 * WebRTC DataChannel transport wrapper
 */
export class TransportWebrtc {
  /**
   * Callback map
   */
  private readonly callbackMap: Map<number, Map<CallbackMapFunction, object>>;

  /**
   * Connected flag
   */
  private connected: boolean;

  /**
   * RTC data channel
   */
  private dataChannel: wrtc.RTCDataChannel;

  /**
   * Debugging instance
   */
  private readonly debug: Debug.IDebugger;

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
   * Serialize utility
   */
  private readonly serialize: Serialize;

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
    this.debug = Debug(`${constant.packageName}:webrtc`);
    this.serialize = new Serialize();

    // Setup necessary event handler
    this.debug("Setup event handler!");
    this.eventBus
      .on(
        `signal::${messageSignalType.webrtc.answer}`,
        this.WebrtcAnswer.bind(this),
      )
      .on(
        `signal::${messageSignalType.webrtc.offer}`,
        this.WebrtcOffer.bind(this),
      )
      .on(
        `signal::${messageSignalType.webrtc.candidate}`,
        this.WebrtcIceCandidate.bind(this),
      )
      .on("socket::send", this.Send.bind(this))
      .on("socket::serialize", this.RegisterSerialize.bind(this))
      .on("socket::handler", this.RegisterHandler.bind(this));

    // Setup reserved messages and initialize maps
    this.debug("Setup maps and reserved message types!");
    this.reservedMessageTypes = [
      MessageSocketType.Ping,
      MessageSocketType.Pong,
    ];
    this.serializeMap = new Map();
    this.callbackMap = new Map();

    // Setup internal message handlers
    this.debug("Register pong handler!");
    this.RegisterHandler(
      MessageSocketType.Pong,
      this.Hearbeat.bind(this),
      false,
      true,
    );

    // Initialize peer
    try {
      // Create peer connection and data channel
      this.debug("Create rtc peer connection!");
      this.peerConnection = new wrtc.RTCPeerConnection();

      this.debug("Create rtc data channel!");
      this.dataChannel = this.peerConnection.createDataChannel("data", {
        maxRetransmits: 0,
        ordered: false,
      });

      // Bind on data event listener
      this.debug("Bind datachannel ready handler!");
      this.peerConnection.addEventListener(
        "datachannel",
        this.DatachannelAdded.bind(this),
      );

      // Bind ice candidate listener
      this.debug("Bind ice candidate handler!");
      this.peerConnection.addEventListener(
        "icecandidate",
        this.IceCandidate.bind(this),
      );
    } catch (e) {
      this.debug("WebRTC not supported!");
      throw new Error("WebRTC DataChannel not supported!");
    }
  }

  /**
   * Handler for socket close to kickstart datachannel close
   */
  public Close(): void {
    // Close rtc peer connection if existing
    if (typeof this.peerConnection === "undefined") {
      return;
    }
    this.debug("Signal close handler called");

    // Remove channel callback
    this.debug("Remove datachannel event listener");
    this.peerConnection.removeEventListener(
      "datachannel",
      this.DatachannelAdded.bind(this),
    );

    // Close connection
    this.debug("Starting close of datachannel");
    this.dataChannel.close();
    this.peerConnection.close();

    // Unset peer connection and connection flag
    this.debug("Unset internal attributes");
    this.peerConnection = undefined;
    this.dataChannel = undefined;
    this.connected = false;
  }

  /**
   * Handle datachannel listener
   *
   * @param event event data
   */
  private DatachannelAdded(event: wrtc.RTCDataChannelEvent): void {
    this.debug("Data channel ready!");
    // Get data channel
    const dataChannel: wrtc.RTCDataChannel = event.channel;

    // Set array buffer binary type
    this.debug("Set data channel binary type to arraybuffer!");
    dataChannel.binaryType = "arraybuffer";

    // Add event handler
    this.debug("Add data channel event listener!");
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
    this.debug("Send ping!");
    this.Send(MessageSocketType.Ping);

    // Set timeout
    this.debug("Set ping timeout!");
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
    this.debug("Close data channel emitted!");
    this.connected = false;

    // Reset handler
    this.debug("Remove event listener!");
    channel.removeEventListener("close", this.HandleClose.bind(this));
    channel.removeEventListener("open", this.HandleOpen.bind(this));
    channel.removeEventListener("message", this.HandleMessage.bind(this));
    channel.removeEventListener("error", this.HandleError.bind(this));

    // Clear timeouts
    this.debug("Clear ping timeout!");
    clearTimeout(this.pingTimeout);

    // Close channel
    this.debug("Close data channel!");
    channel.close();

    // Emit connection shutdown
    this.eventBus.emit("socket::close");
  }

  /**
   * Handle datachannel error
   *
   * @todo add error handling
   *
   * @param event error event
   */
  private HandleError(event: Event): void {
    this.debug("Error event emitted %o", event);
    this.eventBus.emit("socket::error", event);
  }

  /**
   * Handle data channel message
   *
   * @todo add message parsing
   * @todo add error handling
   * @todo switch to DataView instead of typed array
   *
   * @param event message event
   */
  private HandleMessage(event: MessageEvent): void {
    this.debug("Incoming message");

    // Build views
    const typeView: DataView = new DataView(event.data, 0, Size.UInt);
    const dataView: DataView = new DataView(event.data, Size.UInt);

    // Extract message type
    this.debug("Decode message type");
    const msgType: number = typeView.getUint32(0);

    // Get serialization information
    this.debug("Get serialize object");
    const serialize: object = this.serializeMap.get(msgType);

    // Transform data to object
    const data: object = this.serialize.ToObject(serialize, dataView.buffer);

    // Get bound callbacks
    this.debug("Retrieving bound callbacks to execute");
    const callbackList: Map<CallbackMapFunction, object> = this.callbackMap.get(
      msgType,
    );

    // Handle no callback
    if (typeof callbackList === "undefined") {
      this.debug("No callback found for message type");
      throw new Error(`No callback bound for type ${msgType}!`);
    }

    // Iterate over callbacks and execute them
    this.debug("Executing callback list with data");
    callbackList.forEach(
      (context: object, cb: CallbackMapFunction): void => {
        if (typeof context !== "undefined") {
          cb.call(context, data);
        } else {
          cb(data);
        }
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
    this.debug("WebRtc connection opened");
    this.connected = true;

    // Start heartbeat
    this.debug("Start heartbeat");
    this.Hearbeat();

    // Emit connection success
    this.debug("Emit connection success");
    this.eventBus.emit("socket::connection", this);
  }

  /**
   * Handle timeout
   */
  private HandleTimeout(): void {
    // Reset connected flag
    this.debug("Connection timed out");
    this.connected = false;

    // Close peer connection
    this.peerConnection.close();
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
    this.debug("Reset ping timeout");
    clearTimeout(this.pingTimeout);

    // Send ping with delay
    this.debug("Add ping timeout");
    this.pingTimeout = setTimeout(
      this.DoPing.bind(this),
      this.option.pingInterval,
    );
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
    this.debug("IceCandidate event triggered");
    this.eventBus.emit(
      "signal::send",
      JSON.stringify({
        payload: event.candidate,
        type: messageSignalType.webrtc.candidate,
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
    context?: object,
  ): void {
    this.debug("%s handler for type %d", remove ? "Unbind" : "Bind", type);
    // Handle invalid data
    if (typeof type === "undefined" || typeof callback === "undefined") {
      this.debug("RegisterHandler called with invalid data");
      throw new Error("Invalid parameter passed to RegisterHandler!");
    }

    // Check for reserve message type
    if (!internal && this.reservedMessageTypes.indexOf(type) !== -1) {
      this.debug(
        "Tried to %s internal message type %d",
        remove ? "Unbind" : "Bind",
        type,
      );
      throw new Error(
        `Message type ${type} used internally, removal or add not possible!`,
      );
    }

    // Setup callbacks to insert
    this.debug("Get existing bound callbacks");
    let callbackList: Map<CallbackMapFunction, object> = this.callbackMap.get(
      type,
    );

    // Initialize if not existing
    if (typeof callbackList === "undefined") {
      callbackList = new Map();
    }

    // Get callback index
    const callbackBound: boolean = callbackList.has(callback);

    // Check for existance before removal
    if (remove && !callbackBound) {
      this.debug("Try to remove not bound handler");

      return;
    }

    // Handle remove
    if (remove) {
      this.debug("Removing debug handler at %o", callback);
      callbackList.delete(callback);

      return;
    }

    // Handle already added
    if (callbackBound) {
      this.debug("Callback for type %o already registered", callback);
      throw new Error(`Callback for message type ${type} already registered!`);
    }

    // Push callback and overwrite map entry
    this.debug("Push back callback");
    callbackList.set(callback, context);
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
    this.debug("%s serializaion for type %d", remove ? "Unbind" : "Bind", type);

    // Check for reserve message type
    if (this.reservedMessageTypes.indexOf(type) !== -1) {
      this.debug("Message type reserved for internal");
      throw new Error(`Message type ${type} only for internal usage!`);
    }

    // Handle already set serialize
    if (!remove && this.serializeMap.has(type)) {
      this.debug("Serialization to add already existing");
      throw new Error(
        `Register serialize for type ${type} already registered!`,
      );
    }

    // Handle remove
    if (remove) {
      this.debug("Remove serialization for type %d", type);
      this.serializeMap.delete(type);

      return;
    }

    // Set serialize structure
    this.debug("Add serialization");
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

    // Debug output
    this.debug("Send message with type %d and data %o", type, data);
    const offset: number = Size.UInt;

    // Get serialization information
    this.debug("Gather serialization strategy");
    const serialize: object = this.serializeMap.get(type);

    // Handle passed data but no serialize object
    if (typeof serialize === "undefined" && typeof data !== "undefined") {
      this.debug("Error missing data for type %d", type);
      throw new Error(`No serialization for message type ${type} existing`);
    }

    // Initialize DateView
    this.debug("Generating data view");
    const dataView: DataView = new DataView(
      this.serialize.ToBuffer(serialize, data),
    );

    // Generate view for final packet
    this.debug("Generating view for merging data view and message type");
    const bufferView: DataView = new DataView(
      new ArrayBuffer(offset + dataView.byteLength),
    );

    // Push message type
    this.debug("Saving message type as undefined");
    bufferView.setUint32(0, type);

    // Transfer buffer byte by byte
    this.debug("Merging data view into buffer view");
    for (let i: number = offset; i < dataView.byteLength + offset; i++) {
      bufferView.setInt8(i, dataView.getInt8(i - offset));
    }

    // Send package
    this.debug("Transmit merged view buffer via rtc");
    this.dataChannel.send(bufferView.buffer);
  }

  /**
   * Answer webrtc answer
   *
   * @param msg message received from socket transport
   */
  private async WebrtcAnswer(msg: IMessageSignalStructure): Promise<void> {
    this.debug("Incomming webrtc answer");
    // Check connected
    if (this.connected) {
      return;
    }

    // Extract payload
    this.debug("Extracting webrtc payload");
    const payload: wrtc.RTCSessionDescriptionInit = msg.payload as wrtc.RTCSessionDescriptionInit;

    // Set remote description
    this.debug("Set payload as remote description");
    await this.peerConnection.setRemoteDescription(
      new wrtc.RTCSessionDescription(payload),
    );
  }

  /**
   * Answer webrtc ice candidate
   *
   * @param msg message received from socket transport
   */
  private async WebrtcIceCandidate(
    msg: IMessageSignalStructure,
  ): Promise<void> {
    this.debug("Incomming webrtc ice candidate");
    // Check connected
    if (this.connected) {
      return;
    }

    // Get payload
    this.debug("Extracting webrtc payload");
    const payload: wrtc.RTCIceCandidateInit = msg.payload as wrtc.RTCIceCandidate;

    // Create rtc ice candidate
    this.debug("Create rtc ice candidate");
    const candidate: wrtc.RTCIceCandidate = new wrtc.RTCIceCandidate(payload);

    // Wait for add of ice candidate
    this.debug("Add ice candidate to peerConnection");
    await this.peerConnection.addIceCandidate(candidate);

    // Return candidate
    this.debug("Send back rtc candidate to client");
    this.eventBus.emit(
      "signal::send",
      JSON.stringify({
        payload: candidate,
        type: messageSignalType.webrtc.candidate,
      }),
    );
  }

  /**
   * Answer webrtc offer
   *
   * @param msg message received from socket transport
   */
  private async WebrtcOffer(msg: IMessageSignalStructure): Promise<void> {
    this.debug("Incomming webrtc offer");
    // Check connected
    if (this.connected) {
      return;
    }

    // Extract payload
    this.debug("Extracting webrtc payload");
    const payload: wrtc.RTCSessionDescriptionInit = msg.payload as wrtc.RTCSessionDescriptionInit;

    // Set remote description
    this.debug("Set rtc remote description");
    await this.peerConnection.setRemoteDescription(payload);

    // Create answer
    this.debug("Creating answer");
    const answer: wrtc.RTCSessionDescriptionInit = await this.peerConnection.createAnswer(
      {
        offerToReceiveAudio: false,
        offerToReceiveVideo: false,
      },
    );

    // Add answer as local description
    this.debug("Set answer as local description");
    await this.peerConnection.setLocalDescription(answer);

    // Send answer back
    this.debug("Send back answer");
    this.eventBus.emit(
      "signal::send",
      JSON.stringify({
        payload: answer,
        type: messageSignalType.webrtc.answer,
      }),
    );
  }
}
