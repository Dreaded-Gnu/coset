// Additional package dependencies
import { notStrictEqual } from "assert";
import * as Debug from "debug";
import * as EventEmitter from "eventemitter3";
import * as WebSocket from "ws";

// Server configs
import { constant } from "./../constant";
import { IMessageSignalStructure } from "./../message/signal/istructure";
import { IServerConfig } from "./../server/iconfig";

/**
 * Socket transport wrapper
 */
export class TransportSocket {
  /**
   * Connection flag
   */
  private connected: boolean;

  /**
   * Connection timeout
   */
  private connectTimeout: NodeJS.Timer;

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
  private pingTimeout: NodeJS.Timer;

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
    this.debug = Debug(`${constant.packageName}:signal`);

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
    this.socket.terminate();
  }

  /**
   * Execute ping
   */
  private DoPing(): void {
    // Clear timeout
    this.debug("Clear timeouts");
    clearTimeout(this.connectTimeout);
    clearTimeout(this.pingTimeout);

    // Set timeout
    this.debug("Set disconnect timeout");
    this.connectTimeout = setTimeout(
      this.HandleTimeout.bind(this),
      this.option.pingTimeout,
    );

    // Check connection state
    if (this.socket.readyState !== WebSocket.OPEN) {
      return;
    }

    // Send ping
    this.debug("Send ping");
    this.socket.ping();
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
      const msg: IMessageSignalStructure = JSON.parse(data.toString());

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

    // Reset timeout
    this.debug("Reset timeout");
    clearTimeout(this.connectTimeout);
    clearTimeout(this.pingTimeout);

    // Emit error
    this.eventBus.emit("signal::error", new Event("HandleTimeout"));
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
