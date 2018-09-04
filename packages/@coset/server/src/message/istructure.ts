import * as wrtc from "wrtc";

/**
 * Message structure
 *
 * @export
 */
export interface IMessageStructure {
  /**
   * Message payload
   */
  payload?: wrtc.RTCSessionDescriptionInit | wrtc.RTCIceCandidate;

  /**
   * Message type
   */
  type?: string;
}