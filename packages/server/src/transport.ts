// Package dependencies
import * as EventEmitter from "eventemitter3";
import { default as WebSocket } from "ws";

// Import local dependencies
import { IServerConfig } from "./server/iconfig";
import { TransportSocket } from "./transport/socket";
import { TransportWebrtc } from "./transport/webrtc";

/**
 * Transport class
 *
 * @export
 * @extends {EventEmitter}
 */
export class Transport extends EventEmitter {
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
    this.id = id;
    this.eventBus = new EventEmitter<string>();

    // Setup transports
    this.socket = new TransportSocket(socket, option, this.eventBus);
    this.webrtc = new TransportWebrtc(option, this.eventBus);

    // Treat rtc connection as successful establish of connection
    this.eventBus.on("socket::connection", this.HandleOpen.bind(this));
  }

  /**
   * Open handling
   */
  private HandleOpen(): void {
    this.emit("connection", this);
  }

  /**
   * Method to get id
   */
  public get Id(): string {
    return this.id;
  }
}
