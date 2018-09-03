/**
 * Interface for webrtc message subtype
 */
interface IWebrtcMessageType {
  /**
   * WebRTC answer message
   */
  answer: string;

  /**
   * Webrtc candidate message
   */
  candidate: string;

  /**
   * Webrtc offer message
   */
  offer: string;
}

/**
 * Interface for export
 */
interface IMessageType {
  /**
   * Close message
   */
  close: string;

  /**
   * Webrtc message type
   */
  webrtc: IWebrtcMessageType;
}

export const messageType: IMessageType = {
  close: "close",
  webrtc: {
    answer: "webrtc-answer",
    candidate: "webrtc-candidate",
    offer: "webrtc-offer",
  },
};
