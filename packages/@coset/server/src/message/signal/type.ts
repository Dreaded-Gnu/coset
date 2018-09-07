/**
 * Interface for webrtc message subtype
 */
interface IMessageSignalWebrtcType {
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
interface IMessageSignalType {
  /**
   * Close message
   */
  close: string;

  /**
   * Webrtc message type
   */
  webrtc: IMessageSignalWebrtcType;
}

export const messageSignalType: IMessageSignalType = {
  close: "close",
  webrtc: {
    answer: "webrtc-answer",
    candidate: "webrtc-candidate",
    offer: "webrtc-offer",
  },
};
