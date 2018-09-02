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
   * Webrtc message type
   */
  webrtc: IWebrtcMessageType;
}

export const messageType: IMessageType = {
  webrtc: {
    answer: "webrtc-answer",
    candidate: "webrtc-candidate",
    offer: "webrtc-offer",
  },
};
