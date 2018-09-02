// Node dependencies
import { EventEmitter } from "events";
import { IncomingMessage as HttpIncomingMessage } from "http";
import { Server as HttpsServer } from "https";

// Additional package dependencies
import * as NodeUuid from "uuid";
import * as WebSocket from "ws";

// Local dependencies
import { IServerConfig } from "./server/iconfig";
import { Transport } from "./transport";

/**
 * Server class
 *
 * @export
 * @extends {EventEmitter}
 */
export class Server extends EventEmitter {
  /**
   * Server config options
   */
  private readonly option: IServerConfig;

  /**
   * Transport map
   */
  private readonly socketMap: Map<string, Transport>;

  /**
   * Websocket server
   */
  private readonly socketServer: WebSocket.Server;

  /**
   * Creates an instance of Server.
   *
   * @param [server] server to use
   * @param [option] more options to be set
   */
  public constructor(server?: HttpsServer | null, option?: IServerConfig) {
    // Call parent constructor
    super();

    // Build server config
    let serverOption: IServerConfig = {
      pingInterval: 3000,
      pingTimeout: 10000,
      server,
    };

    // Merge options
    if (typeof option !== "undefined") {
      serverOption = { ...serverOption, ...option };
    }

    // Set server
    if (typeof serverOption.server === "undefined") {
      throw new Error("No server passed existing!");
    }

    // Create socket server
    this.socketServer = new WebSocket.Server(serverOption);

    // Setup server
    this.socketServer
      .on("connection", this.HandleConnection.bind(this))
      .on("error", this.HandleError.bind(this))
      .on("listening", this.HandleListen.bind(this));

    // Initialize socket map
    this.socketMap = new Map();
    this.option = serverOption;
  }

  /**
   * Close server
   */
  public Close(): void {
    this.socketServer.close();
  }

  /**
   * Handle incoming connection
   *
   * @param webSocket incoming websocket connection object
   * @param request incoming http request message
   */
  private HandleConnection(
    webSocket: WebSocket,
    request: HttpIncomingMessage,
  ): void {
    let socketId: string;
    do {
      socketId = NodeUuid.v4();
    } while (this.socketMap.has(socketId));

    // Create socket instance
    const socket: Transport = new Transport(socketId, webSocket, this.option);

    // Add to map
    this.socketMap.set(socketId, socket);

    // Bind connection handler for passing socket out
    socket.on("connection", this.HandleSocketConnected.bind(this));
  }

  /**
   * Error handler passes error out
   *
   * @param error Error to be bubbled up
   */
  private HandleError(error: Error): void {
    this.emit("error", Error);
  }

  /**
   * Listen handler simply passes out event
   */
  private HandleListen(): void {
    this.emit("listening");
  }

  /**
   * Wrapper for socket connection to pass socket class out
   *
   * @param socket transport to be bubbled up
   */
  private HandleSocketConnected(socket: Transport): void {
    this.emit("connection", Transport);
  }
}
