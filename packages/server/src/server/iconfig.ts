
import { Server } from "https";

/**
 * Server config
 *
 * @export
 * @interface IServerConfig
 */
export interface IServerConfig {
  /**
   * HTTPS server instance
   *
   * @type {Server}
   * @memberof IServerConfig
   */
  server?: Server;

  /**
   * Ping timeout (default: 10000ms -> 10s)
   *
   * @type {number}
   * @memberof IServerConfig
   */
  pingTimeout?: number;
}
