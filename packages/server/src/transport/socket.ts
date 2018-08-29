// Node dependencies
import { notStrictEqual } from "assert";
import { EventEmitter } from "events";

// Additional package dependencies
import { default as WebSocket } from "ws";

// server configs
import { IServerConfig } from "./../server/iconfig";

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
   * Ping timeout
   *
   * @private
   * @type {number}
   * @memberof TransportSocket
   */
  private pingTimeout: number;

  /**
   * Connection flag
   *
   * @private
   * @type {boolean}
   * @memberof TransportSocket
   */
  private connected: boolean;

  /**
   * Server configs
   *
   * @private
   * @type {IServerConfig}
   * @memberof TransportSocket
   */
  private option: IServerConfig;

  /**
   * Creates an instance of TransportSocket.
   *
   * @param {WebSocket} socket
   * @param {IServerConfig} option
   * @memberof TransportSocket
   */
  constructor(socket: WebSocket, option: IServerConfig) {
    // parent constructor
    super();

    // save socket
    this.socket = socket;

    // bind handler
    this.socket
      .on("message", this.handle_message.bind(this))
      .on("close", this.handle_close.bind(this))
      .on("error", this.handle_error.bind(this))
      .on("unexpected-response", this.handle_unexpected.bind(this))
      .on("pong", this.hearbeat.bind(this));

    // set connected flag
    this.connected = true;

    // cache option
    this.option = option;

    // start heartbeat
    this.hearbeat();
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
   * Ping message handling
   *
   * @private
   * @memberof TransportSocket
   */
  private hearbeat(): void {
    // skip if not connected
    if (!this.connected) {
      return;
    }

    // clear timeout
    clearTimeout(this.pingTimeout);

    // send ping with delay
    setTimeout(this.do_ping.bind(this), 10000);
  }

  /**
   * Execute ping
   *
   * @private
   * @memberof TransportSocket
   */
  private do_ping(): void {
    // send ping
    this.socket.ping("ping");

    // set timeout
    this.pingTimeout = setTimeout(
      this.handle_timeout.bind(this),
      this.option.pingTimeout,
    );
  }

  /**
   * Handle timeout
   *
   * @private
   * @memberof TransportSocket
   */
  private handle_timeout(): void {
    // reset connected flag
    this.connected = false;

    // close socket
    this.close();
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
