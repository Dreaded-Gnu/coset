// Package dependencies
import * as Debug from "debug";
import * as EventEmitter from "eventemitter3";
import { default as WebSocket } from "ws";

// Import local dependencies
import { constant } from "./constant";
import { IServerConfig } from "./server/iconfig";
import { TransportSocket } from "./transport/socket";
import { TransportWebrtc } from "./transport/webrtc";

import { messageSignalType } from "./message/signal/type";

/**
 * Transport class
 */
export class Transport extends EventEmitter {
  /**
   * Debugging instance
   */
  private readonly debug: Debug.IDebugger;

  /**
   * Communication eventbus between socket and rtc transport
   */
  private readonly eventBus: EventEmitter;

  /**
   * Transport id
   */
  private readonly id: string;

  /**
   * Websocket transport instance
   */
  // @ts-ignore
  private readonly socket: TransportSocket;

  /**
   * Webrtc transport
   */
  // @ts-ignore
  private readonly webrtc: TransportWebrtc;

  /**
   * Creates an instance of Transport.
   *
   * @param id Transport id
   * @param socket incoming websocket connection
   */
  public constructor(id: string, socket: WebSocket, option: IServerConfig) {
    // Call parent constructor
    super();

    // Initialize attributes
    this.debug = Debug(`${constant.packageName}:transport`);
    this.id = id;
    this.eventBus = new EventEmitter<string>();

    // Setup transports
    this.debug("Setup transport instances");
    this.socket = new TransportSocket(socket, option, this.eventBus);
    this.webrtc = new TransportWebrtc(option, this.eventBus);

    // Setup event handler
    this.debug("Setup event handlers");
    this.eventBus
      .on("socket::connection", this.HandleOpen.bind(this))
      .on("socket::close", this.SocketClose.bind(this))
      .on("socket::error", this.SocketError.bind(this))
      .on(`signal::${messageSignalType.close}`, this.SignalClose.bind(this))
      .on("signal::error", this.SignalError.bind(this));
  }

  /**
   * Method to get id
   */
  public get Id(): string {
    this.debug("Transport id requested");

    return this.id;
  }

  /**
   * Method to bind handler for specific message type
   * @param type message type to use
   * @param callback callback to be executed with parsed data
   * @param context object used for binding, during execution
   * @param remove set to true for handler removal
   */
  public Handler(
    type: number,
    callback: (data: object) => void,
    context?: object,
    remove: boolean = false,
  ): void {
    this.debug("%s handler to type %d", remove ? "Unbind" : "Bind", type);
    this.emit("socket::handler", type, callback, remove, false, context);
  }

  /**
   * Method to bind data serialize structure
   *
   * @param type message type
   * @param structure message data structure
   * @param remove set to trye ti renive serialize structure
   */
  public Serialize(
    type: number,
    structure?: object,
    remove: boolean = false,
  ): void {
    this.debug("%s serialization to type %d", remove ? "Unbind" : "Bind", type);
    this.emit("socket::serialize", type, structure, remove);
  }

  /**
   * Open handling
   */
  private HandleOpen(): void {
    this.debug("Connection has been successful established!");
    this.emit("connection", this);
  }

  /**
   * Callback for signal close
   */
  private SignalClose(): void {
    this.debug("SignalClose triggered!");
    this.webrtc.Close();
    this.emit("close");
  }

  /**
   * Signal error handler
   * @param event error event
   */
  private SignalError(event: Event): void {
    this.debug("SignalError triggered");
    this.socket.Close();
    this.SocketError(event);
  }

  /**
   * Callback for rtc close
   */
  private SocketClose(): void {
    this.debug("SocketClose triggered!");
    this.socket.Close();
  }

  /**
   * Socket error handler
   *
   * @param event error event
   */
  private SocketError(event: Event): void {
    this.debug("SocketError triggered");
    this.webrtc.Close();
    this.emit("error", event);
  }
}
