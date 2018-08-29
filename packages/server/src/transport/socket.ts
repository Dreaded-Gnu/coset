// Node dependencies
import { notStrictEqual } from "assert";
import { EventEmitter } from "events";

// Additional package dependencies
import { default as WebSocket } from "ws";

/**
 * Socket transport wrapper
 *
 * @export
 * @class TransportSocket
 * @extends {EventEmitter}
 */
export class TransportSocket extends EventEmitter {
  /**
   * Websocket instance
   *
   * @private
   * @type {WebSocket}
   * @memberof TransportSocket
   */
  private socket: WebSocket;

  /**
   * Creates an instance of TransportSocket.
   *
   * @param {WebSocket} socket
   * @memberof TransportSocket
   */
  constructor(socket: WebSocket) {
    // parent constructor
    super();

    // save socket
    this.socket = socket;

    // bind handler
    this.socket
      .on("message", this.handle_message.bind(this))
      .on("close", this.handle_close.bind(this))
      .on("error", this.handle_error.bind(this))
      .on("unexpected-response", this.handle_unexpected.bind(this));
  }

  /**
   * Encapsulated send message
   *
   * @param {string} msg
   * @memberof TransportSocket
   */
  public send(msg: string): void {
    this.socket.send(msg);
  }

  /**
   * Close socket
   *
   * @memberof TransportSocket
   */
  public close(): void {
    this.socket.close();
  }

  /**
   * Message handling
   *
   * @private
   * @param {string} [msg]
   * @returns {void}
   * @memberof Transport
   */
  private async handle_message(data: string): Promise<void> {
    // try to decode message
    try {
      // parse message
      const msg = JSON.parse(data);

      // check for not equal
      notStrictEqual(msg.type, undefined);

      // emit message
      this.emit(msg.type, msg);
    } catch (e) {
      throw Error("Invalid message request");
    }
  }

  /**
   * Close handling
   *
   * @private
   * @memberof Transport
   */
  private handle_close(): void {
    this.emit("close");
  }

  /**
   * Error handling
   *
   * @private
   * @memberof Transport
   */
  private handle_error(): void {
    // TODO: Add error handling
  }

  /**
   * Unexpected handling
   *
   * @private
   * @memberof Transport
   */
  private handle_unexpected(): void {
    // TODO: Add unexpected handling
  }
}
