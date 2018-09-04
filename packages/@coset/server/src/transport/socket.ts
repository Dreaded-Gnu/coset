// Node dependencies
import { notStrictEqual } from "assert";

// Additional package dependencies
import * as Debug from "debug";
import * as EventEmitter from "eventemitter3";
import { default as WebSocket } from "ws";

// Server configs
import { IMessageStructure } from "./../message/istructure";
import { IServerConfig } from "./../server/iconfig";

/**
 * Socket transport wrapper
 *
 * @export
 */
export class TransportSocket {
  /**
   * Connection flag
   */
  private connected: boolean;

  /**
   * Debugging instance
   */
  private readonly debug: Debug.IDebugger;

  /**
   * Passed in event bus
   */
  private readonly eventBus: EventEmitter;

  /**
   * Server configs
   *
   */
  private readonly option: IServerConfig;

  /**
   * Ping timeout
   */
  private pingTimeout: number;

  /**
   * Websocket instance
   */
  private readonly socket: WebSocket;

  /**
   * Creates an instance of TransportSocket.
   *
   * @param socket Incoming websocket connection
   * @param option Server configs
   * @param eventBus Communication event bus
   */
  public constructor(
    socket: WebSocket,
    option: IServerConfig,
    eventBus: EventEmitter,
  ) {
    // Save parameters
    this.socket = socket;
    this.option = option;
    this.eventBus = eventBus;
    this.debug = Debug("@coset/server:signal");

    // Bind handler
    this.debug("Bind socket signal handler");
    this.socket
      .on("message", this.HandleMessage.bind(this))
      .on("close", this.HandleClose.bind(this))
      .on("error", this.HandleError.bind(this))
      .on("pong", this.Hearbeat.bind(this));

    // Bind send handler
    this.debug("Bind signal send event used for decoupled sending");
    this.eventBus.on("signal::send", this.Send.bind(this));

    // Set connected flag
    this.connected = true;

    // Start heartbeat
    this.debug("Starting heartbeat");
    this.Hearbeat();
  }

  /**
   * Close socket
   */
  public Close(): void {
    this.debug("Socket close event");
    this.socket.close();
  }

  /**
   * Execute ping
   */
  private DoPing(): void {
    // Send ping
    this.debug("Send ping");
    this.socket.ping();

    // Set timeout
    this.debug("Send disconnect timeout");
    this.pingTimeout = setTimeout(
      this.HandleTimeout.bind(this),
      this.option.pingTimeout,
    );
  }

  /**
   * Close handling
   *
   * @param code close code
   * @param reason close reason
   */
  private HandleClose(code: number, reason: string): void {
    this.debug("Close event fired with %d and %s", code, reason);
    this.eventBus.emit("signal::close", code, reason);
  }

  /**
   * Error handling
   *
   * @param err error event data
   */
  private HandleError(err: Error): void {
    this.debug("Error event triggered %o", err);
    this.eventBus.emit("signal::error", err);
  }

  /**
   * Message handling
   *
   * @param msg incoming message string
   */
  private async HandleMessage(data: WebSocket.Data): Promise<void> {
    // Try to decode message
    try {
      // Parse message
      const msg: IMessageStructure = JSON.parse(data.toString());

      // Check for not equal
      notStrictEqual(msg.type, undefined);

      // Emit message
      this.debug("%s message incomming, data: %o", msg.type, msg);
      this.eventBus.emit(`signal::${msg.type}`, msg);
    } catch (e) {
      throw Error("Invalid message request");
    }
  }

  /**
   * Handle timeout
   */
  private HandleTimeout(): void {
    // Reset connected flag
    this.debug("Ping timed out");
    this.connected = false;

    // Close socket
    this.debug("Closing socket");
    this.Close();
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
   * Encapsulated send message
   *
   * @param msg message to send via socket
   */
  private Send(msg: string): void {
    this.debug("Send message %s", msg);
    this.socket.send(msg);
  }
}
