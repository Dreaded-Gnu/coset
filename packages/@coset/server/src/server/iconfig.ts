import { Server } from "https";

/**
 * Server config
 */
export interface IServerConfig {
  /**
   * Ping interval
   */
  pingInterval?: number;

  /**
   * Ping timeout (default: 10000ms -> 10s)
   */
  pingTimeout?: number;

  /**
   * HTTPS server instance
   */
  server?: Server;
}
