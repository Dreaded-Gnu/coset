// Node dependencies
import { notStrictEqual } from "assert";

// Additional package dependencies
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

    // Bind handler
    this.socket
      .on("message", this.HandleMessage.bind(this))
      .on("close", this.HandleClose.bind(this))
      .on("error", this.HandleError.bind(this))
      .on("pong", this.Hearbeat.bind(this));

    // Bind send handler
    this.eventBus.on("signal::send", this.Send.bind(this));

    // Set connected flag
    this.connected = true;

    // Start heartbeat
    this.Hearbeat();
  }

  /**
   * Close socket
   */
  public Close(): void {
    this.socket.close();
  }

  /**
   * Execute ping
   */
  private DoPing(): void {
    // Send ping
    this.socket.ping();

    // Set timeout
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
    this.eventBus.emit("signal::close", code, reason);
  }

  /**
   * Error handling
   *
   * @param err error event data
   */
  private HandleError(err: Error): void {
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
    this.connected = false;

    // Close socket
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
    clearTimeout(this.pingTimeout);

    // Send ping with delay
    setTimeout(this.DoPing.bind(this), this.option.pingInterval);
  }

  /**
   * Encapsulated send message
   *
   * @param msg message to send via socket
   */
  private Send(msg: string): void {
    this.socket.send(msg);
  }
}
