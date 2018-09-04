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
   * Method to get id
   */
  public get Id(): string {
    return this.id;
  }

  /**
   * Method to bind handler for specific message type
   * @param type message type to use
   * @param callback callback to be executed with parsed data
   * @param remove set to true for handler removal
   */
  public Handler(
    type: number,
    callback: (data: object) => void,
    remove: boolean = false,
  ): void {
    this.emit("socket::handler", type, callback, remove);
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
    this.emit("socket::serialize", type, structure, remove);
  }

  /**
   * Open handling
   */
  private HandleOpen(): void {
    this.emit("connection", this);
  }
}
