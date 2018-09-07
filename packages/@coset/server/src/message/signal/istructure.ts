import * as wrtc from "wrtc";

/**
 * Message structure
 */
export interface IMessageSignalStructure {
  /**
   * Message payload
   */
  payload?: wrtc.RTCSessionDescriptionInit | wrtc.RTCIceCandidate;

  /**
   * Message type
   */
  type?: string;
}
