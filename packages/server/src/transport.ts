// Node dependencies
import { EventEmitter } from "events";

// Additional package dependencies
import { default as WebSocket } from "ws";

// Import local dependencies
import { IServerConfig } from "./server/iconfig";
import { TransportSocket } from "./transport/socket";
import { TransportWebrtc } from "./transport/webrtc";

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
   * Websocket transport instance
   *
   * @private
   * @type {TransportSocket}
   * @memberof Transport
   */
  private readonly socket: TransportSocket;

  /**
   * Webrtc transport
   *
   * @private
   * @type {TransportWebrtc}
   * @memberof Transport
   */
  private readonly webrtc: TransportWebrtc;

  /**
   * Creates an instance of Transport.
   *
   * @param {string} id
   * @param {WebSocket} socket
   * @memberof Transport
   */
  constructor(id: string, socket: WebSocket, option: IServerConfig) {
    // Call parent constructor
    super();

    // Initialize attributes
    this.id = id;

    // Setup transports
    this.socket = new TransportSocket(socket, option);
    this.webrtc = new TransportWebrtc(this.socket, option);

    // handle connection and pass instance out
    this.webrtc.on("connection", this.handle_open.bind(this));
  }

  /**
   * Open handling
   *
   * @private
   * @memberof Transport
   */
  private handle_open(): void {
    this.emit("connection", this);
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
}
