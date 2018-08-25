
// Node dependencies
import { EventEmitter } from "events";
import { IncomingMessage as HttpIncomingMessage } from "http";
import { Server as HttpsServer } from "https";

// Additional package dependencies
import * as NodeUuid from "uuid/v4";
import * as WebSocket from "ws";

// Local dependencies
import { IServerConfig } from "./server/iconfig";
import { Transport } from "./transport";

/**
 * Server class
 *
 * @export
 * @class Server
 * @extends {EventEmitter}
 */
export class Server extends EventEmitter {
  /**
   * Websocket server
   *
   * @private
   * @type {WebSocket.Server}
   * @memberof Server
   */
  private socketServer: WebSocket.Server;

  /**
   * Transport map
   *
   * @private
   * @type {Map< string, Transport >}
   * @memberof Server
   */
  private socketMap: Map< string, Transport >;

  /**
   * Creates an instance of Server.
   *
   * @param {HttpsServer} server
   * @param {IServerConfig} option
   * @memberof Server
   */
  public constructor( server?: HttpsServer | null, option?: IServerConfig ) {
    // call parent constructor
    super();

    // handle server passed via config
    if ( server ) {
      // create socket with server only
      this.socketServer = new WebSocket.Server( { server } );
    } else {
      // create socket with option object
      this.socketServer = new WebSocket.Server( option );
    }

    // setup server
    this.socketServer
      .on( "connection", this.handle_connection.bind( this ) )
      .on( "error", this.handle_error.bind( this ) )
      .on( "listening", this.handle_listen.bind( this ) );

    // initialize socket map
    this.socketMap = new Map();
  }

  /**
   * Close server
   *
   * @returns {Promise< void >}
   * @memberof Server
   */
  public close(): void {
    this.socketServer.close();
  }

  /**
   * Handle incoming connection
   *
   * @private
   * @param {WebSocket} socket
   * @memberof Server
   */
  private handle_connection( webSocket: WebSocket, request: HttpIncomingMessage ): void {
    let socketId: string;
    do {
      socketId = NodeUuid();
    } while ( this.socketMap.has( socketId ) );

    // Create socket instance
    const socket: Transport = new Transport( socketId, webSocket );

    // Add to map
    this.socketMap.set( socketId, socket );

    // bind connection handler for passing socket out
    socket.on( "connection", this.handle_socket_connected.bind( this ) );
  }

  /**
   * Wrapper for socket connection to pass socket class out
   *
   * @private
   * @param {Socket} socket
   * @memberof Server
   */
  private handle_socket_connected( socket: Transport ): void {
    this.emit( "connection", Transport );
  }

  /**
   * Error handler passes error out
   *
   * @private
   * @param {Error} error
   * @memberof Server
   */
  private handle_error( error: Error ): void {
    this.emit( "error", Error );
  }

  /**
   * Listen handler simply passes out event
   *
   * @private
   * @memberof Server
   */
  private handle_listen(): void {
    this.emit( "listening" );
  }
}
