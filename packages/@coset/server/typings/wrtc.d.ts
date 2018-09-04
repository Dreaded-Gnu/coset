
declare module "wrtc" {
  export interface RTCCertificate {
    readonly expires: number;
    getFingerprints(): RTCDtlsFingerprint[];
  }

  export let RTCCertificate: {
    prototype: RTCCertificate;
    new(): RTCCertificate;
    getSupportedAlgorithms(): AlgorithmIdentifier[];
  };

  export interface RTCDTMFSenderEventMap {
    "tonechange": RTCDTMFToneChangeEvent;
  }

  export interface RTCDTMFSender extends EventTarget {
    readonly canInsertDTMF: boolean;
    ontonechange: ((this: RTCDTMFSender, ev: RTCDTMFToneChangeEvent) => any) | null;
    readonly toneBuffer: string;
    insertDTMF(tones: string, duration?: number, interToneGap?: number): void;
    addEventListener<K extends keyof RTCDTMFSenderEventMap>(type: K, listener: (this: RTCDTMFSender, ev: RTCDTMFSenderEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
    addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
    removeEventListener<K extends keyof RTCDTMFSenderEventMap>(type: K, listener: (this: RTCDTMFSender, ev: RTCDTMFSenderEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
    removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
  }

  export let RTCDTMFSender: {
    prototype: RTCDTMFSender;
    new(): RTCDTMFSender;
  };

  export interface RTCDTMFToneChangeEvent extends Event {
    readonly tone: string;
  }

  export let RTCDTMFToneChangeEvent: {
    prototype: RTCDTMFToneChangeEvent;
    new(type: string, eventInitDict: RTCDTMFToneChangeEventInit): RTCDTMFToneChangeEvent;
  };

  export interface RTCDataChannelEventMap {
    "bufferedamountlow": Event;
    "close": Event;
    "error": RTCErrorEvent;
    "message": MessageEvent;
    "open": Event;
  }

  export interface RTCDataChannel extends EventTarget {
    binaryType: string;
    readonly bufferedAmount: number;
    bufferedAmountLowThreshold: number;
    readonly id: number | null;
    readonly label: string;
    readonly maxPacketLifeTime: number | null;
    readonly maxRetransmits: number | null;
    readonly negotiated: boolean;
    onbufferedamountlow: ((this: RTCDataChannel, ev: Event) => any) | null;
    onclose: ((this: RTCDataChannel, ev: Event) => any) | null;
    onerror: ((this: RTCDataChannel, ev: RTCErrorEvent) => any) | null;
    onmessage: ((this: RTCDataChannel, ev: MessageEvent) => any) | null;
    onopen: ((this: RTCDataChannel, ev: Event) => any) | null;
    readonly ordered: boolean;
    readonly priority: RTCPriorityType;
    readonly protocol: string;
    readonly readyState: RTCDataChannelState;
    close(): void;
    send(data: string): void;
    send(data: Blob): void;
    send(data: ArrayBuffer): void;
    send(data: ArrayBufferView): void;
    addEventListener<K extends keyof RTCDataChannelEventMap>(type: K, listener: (this: RTCDataChannel, ev: RTCDataChannelEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
    addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
    removeEventListener<K extends keyof RTCDataChannelEventMap>(type: K, listener: (this: RTCDataChannel, ev: RTCDataChannelEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
    removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
  }

  export let RTCDataChannel: {
    prototype: RTCDataChannel;
    new(): RTCDataChannel;
  };

  export interface RTCDataChannelEvent extends Event {
    readonly channel: RTCDataChannel;
  }

  export let RTCDataChannelEvent: {
    prototype: RTCDataChannelEvent;
    new(type: string, eventInitDict: RTCDataChannelEventInit): RTCDataChannelEvent;
  };

  export interface RTCDtlsTransportEventMap {
    "error": RTCErrorEvent;
    "statechange": Event;
  }

  export interface RTCDtlsTransport extends EventTarget {
    onerror: ((this: RTCDtlsTransport, ev: RTCErrorEvent) => any) | null;
    onstatechange: ((this: RTCDtlsTransport, ev: Event) => any) | null;
    readonly state: RTCDtlsTransportState;
    readonly transport: RTCIceTransport;
    getRemoteCertificates(): ArrayBuffer[];
    addEventListener<K extends keyof RTCDtlsTransportEventMap>(type: K, listener: (this: RTCDtlsTransport, ev: RTCDtlsTransportEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
    addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
    removeEventListener<K extends keyof RTCDtlsTransportEventMap>(type: K, listener: (this: RTCDtlsTransport, ev: RTCDtlsTransportEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
    removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
  }

  export let RTCDtlsTransport: {
    prototype: RTCDtlsTransport;
    new(): RTCDtlsTransport;
  };

  export interface RTCDtlsTransportStateChangedEvent extends Event {
    readonly state: RTCDtlsTransportState;
  }

  export let RTCDtlsTransportStateChangedEvent: {
    prototype: RTCDtlsTransportStateChangedEvent;
    new(): RTCDtlsTransportStateChangedEvent;
  };

  export interface RTCDtmfSenderEventMap {
    "tonechange": RTCDTMFToneChangeEvent;
  }

  export interface RTCDtmfSender extends EventTarget {
    readonly canInsertDTMF: boolean;
    readonly duration: number;
    readonly interToneGap: number;
    ontonechange: ((this: RTCDtmfSender, ev: RTCDTMFToneChangeEvent) => any) | null;
    readonly sender: RTCRtpSender;
    readonly toneBuffer: string;
    insertDTMF(tones: string, duration?: number, interToneGap?: number): void;
    addEventListener<K extends keyof RTCDtmfSenderEventMap>(type: K, listener: (this: RTCDtmfSender, ev: RTCDtmfSenderEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
    addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
    removeEventListener<K extends keyof RTCDtmfSenderEventMap>(type: K, listener: (this: RTCDtmfSender, ev: RTCDtmfSenderEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
    removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
  }

  export let RTCDtmfSender: {
    prototype: RTCDtmfSender;
    new(sender: RTCRtpSender): RTCDtmfSender;
  };

  export interface RTCError extends Error {
    errorDetail: string;
    httpRequestStatusCode: number;
    message: string;
    name: string;
    receivedAlert: number | null;
    sctpCauseCode: number;
    sdpLineNumber: number;
    sentAlert: number | null;
  }

  export let RTCError: {
    prototype: RTCError;
    new(errorDetail?: string, message?: string): RTCError;
  };

  export interface RTCErrorEvent extends Event {
    readonly error: RTCError | null;
  }

  export let RTCErrorEvent: {
    prototype: RTCErrorEvent;
    new(type: string, eventInitDict: RTCErrorEventInit): RTCErrorEvent;
  };

  export interface RTCIceCandidate {
    readonly candidate: string;
    readonly component: RTCIceComponent | null;
    readonly foundation: string | null;
    readonly ip: string | null;
    readonly port: number | null;
    readonly priority: number | null;
    readonly protocol: RTCIceProtocol | null;
    readonly relatedAddress: string | null;
    readonly relatedPort: number | null;
    readonly sdpMLineIndex: number | null;
    readonly sdpMid: string | null;
    readonly tcpType: RTCIceTcpCandidateType | null;
    readonly type: RTCIceCandidateType | null;
    readonly usernameFragment: string | null;
    toJSON(): RTCIceCandidateInit;
  }

  export let RTCIceCandidate: {
    prototype: RTCIceCandidate;
    new(candidateInitDict?: RTCIceCandidateInit): RTCIceCandidate;
  };

  export interface RTCIceCandidatePairChangedEvent extends Event {
    readonly pair: RTCIceCandidatePair;
  }

  export let RTCIceCandidatePairChangedEvent: {
    prototype: RTCIceCandidatePairChangedEvent;
    new(): RTCIceCandidatePairChangedEvent;
  };

  export interface RTCIceGathererEventMap {
    "error": Event;
    "localcandidate": RTCIceGathererEvent;
  }

  export interface RTCIceGatherer extends RTCStatsProvider {
    readonly component: RTCIceComponent;
    onerror: ((this: RTCIceGatherer, ev: Event) => any) | null;
    onlocalcandidate: ((this: RTCIceGatherer, ev: RTCIceGathererEvent) => any) | null;
    createAssociatedGatherer(): RTCIceGatherer;
    getLocalCandidates(): RTCIceCandidateDictionary[];
    getLocalParameters(): RTCIceParameters;
    addEventListener<K extends keyof RTCIceGathererEventMap>(type: K, listener: (this: RTCIceGatherer, ev: RTCIceGathererEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
    addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
    removeEventListener<K extends keyof RTCIceGathererEventMap>(type: K, listener: (this: RTCIceGatherer, ev: RTCIceGathererEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
    removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
  }

  export let RTCIceGatherer: {
    prototype: RTCIceGatherer;
    new(options: RTCIceGatherOptions): RTCIceGatherer;
  };

  export interface RTCIceGathererEvent extends Event {
    readonly candidate: RTCIceCandidateDictionary | RTCIceCandidateComplete;
  }

  export let RTCIceGathererEvent: {
    prototype: RTCIceGathererEvent;
    new(): RTCIceGathererEvent;
  };

  export interface RTCIceTransportEventMap {
    "gatheringstatechange": Event;
    "selectedcandidatepairchange": Event;
    "statechange": Event;
  }

  export interface RTCIceTransport extends EventTarget {
    readonly component: RTCIceComponent;
    readonly gatheringState: RTCIceGathererState;
    ongatheringstatechange: ((this: RTCIceTransport, ev: Event) => any) | null;
    onselectedcandidatepairchange: ((this: RTCIceTransport, ev: Event) => any) | null;
    onstatechange: ((this: RTCIceTransport, ev: Event) => any) | null;
    readonly role: RTCIceRole;
    readonly state: RTCIceTransportState;
    getLocalCandidates(): RTCIceCandidate[];
    getLocalParameters(): RTCIceParameters | null;
    getRemoteCandidates(): RTCIceCandidate[];
    getRemoteParameters(): RTCIceParameters | null;
    getSelectedCandidatePair(): RTCIceCandidatePair | null;
    addEventListener<K extends keyof RTCIceTransportEventMap>(type: K, listener: (this: RTCIceTransport, ev: RTCIceTransportEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
    addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
    removeEventListener<K extends keyof RTCIceTransportEventMap>(type: K, listener: (this: RTCIceTransport, ev: RTCIceTransportEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
    removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
  }

  export let RTCIceTransport: {
    prototype: RTCIceTransport;
    new(): RTCIceTransport;
  };

  export interface RTCIceTransportStateChangedEvent extends Event {
    readonly state: RTCIceTransportState;
  }

  export let RTCIceTransportStateChangedEvent: {
    prototype: RTCIceTransportStateChangedEvent;
    new(): RTCIceTransportStateChangedEvent;
  };

  export interface RTCIdentityAssertion {
    idp: string;
    name: string;
  }

  export let RTCIdentityAssertion: {
    prototype: RTCIdentityAssertion;
    new(idp: string, name: string): RTCIdentityAssertion;
  };

  export interface RTCPeerConnectionEventMap {
    "connectionstatechange": Event;
    "datachannel": RTCDataChannelEvent;
    "icecandidate": RTCPeerConnectionIceEvent;
    "icecandidateerror": RTCPeerConnectionIceErrorEvent;
    "iceconnectionstatechange": Event;
    "icegatheringstatechange": Event;
    "negotiationneeded": Event;
    "signalingstatechange": Event;
    "statsended": RTCStatsEvent;
    "track": RTCTrackEvent;
  }

  export interface RTCPeerConnection extends EventTarget {
    readonly canTrickleIceCandidates: boolean | null;
    readonly connectionState: RTCPeerConnectionState;
    readonly currentLocalDescription: RTCSessionDescription | null;
    readonly currentRemoteDescription: RTCSessionDescription | null;
    readonly iceConnectionState: RTCIceConnectionState;
    readonly iceGatheringState: RTCIceGatheringState;
    readonly idpErrorInfo: string | null;
    readonly idpLoginUrl: string | null;
    readonly localDescription: RTCSessionDescription | null;
    onconnectionstatechange: ((this: RTCPeerConnection, ev: Event) => any) | null;
    ondatachannel: ((this: RTCPeerConnection, ev: RTCDataChannelEvent) => any) | null;
    onicecandidate: ((this: RTCPeerConnection, ev: RTCPeerConnectionIceEvent) => any) | null;
    onicecandidateerror: ((this: RTCPeerConnection, ev: RTCPeerConnectionIceErrorEvent) => any) | null;
    oniceconnectionstatechange: ((this: RTCPeerConnection, ev: Event) => any) | null;
    onicegatheringstatechange: ((this: RTCPeerConnection, ev: Event) => any) | null;
    onnegotiationneeded: ((this: RTCPeerConnection, ev: Event) => any) | null;
    onsignalingstatechange: ((this: RTCPeerConnection, ev: Event) => any) | null;
    onstatsended: ((this: RTCPeerConnection, ev: RTCStatsEvent) => any) | null;
    ontrack: ((this: RTCPeerConnection, ev: RTCTrackEvent) => any) | null;
    readonly peerIdentity: Promise<RTCIdentityAssertion>;
    readonly pendingLocalDescription: RTCSessionDescription | null;
    readonly pendingRemoteDescription: RTCSessionDescription | null;
    readonly remoteDescription: RTCSessionDescription | null;
    readonly sctp: RTCSctpTransport | null;
    readonly signalingState: RTCSignalingState;
    addIceCandidate(candidate: RTCIceCandidateInit | RTCIceCandidate): Promise<void>;
    addTrack(track: MediaStreamTrack, ...streams: MediaStream[]): RTCRtpSender;
    addTransceiver(trackOrKind: MediaStreamTrack | string, init?: RTCRtpTransceiverInit): RTCRtpTransceiver;
    close(): void;
    createAnswer(options?: RTCOfferOptions): Promise<RTCSessionDescriptionInit>;
    createDataChannel(label: string, dataChannelDict?: RTCDataChannelInit): RTCDataChannel;
    createOffer(options?: RTCOfferOptions): Promise<RTCSessionDescriptionInit>;
    getConfiguration(): RTCConfiguration;
    getIdentityAssertion(): Promise<string>;
    getReceivers(): RTCRtpReceiver[];
    getSenders(): RTCRtpSender[];
    getStats(selector?: MediaStreamTrack | null): Promise<RTCStatsReport>;
    getTransceivers(): RTCRtpTransceiver[];
    removeTrack(sender: RTCRtpSender): void;
    setConfiguration(configuration: RTCConfiguration): void;
    setIdentityProvider(provider: string, options?: RTCIdentityProviderOptions): void;
    setLocalDescription(description: RTCSessionDescriptionInit): Promise<void>;
    setRemoteDescription(description: RTCSessionDescriptionInit): Promise<void>;
    addEventListener<K extends keyof RTCPeerConnectionEventMap>(type: K, listener: (this: RTCPeerConnection, ev: RTCPeerConnectionEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
    addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
    removeEventListener<K extends keyof RTCPeerConnectionEventMap>(type: K, listener: (this: RTCPeerConnection, ev: RTCPeerConnectionEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
    removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
  }

  export let RTCPeerConnection: {
    prototype: RTCPeerConnection;
    new(configuration?: RTCConfiguration): RTCPeerConnection;
    generateCertificate(keygenAlgorithm: AlgorithmIdentifier): Promise<RTCCertificate>;
    getDefaultIceServers(): RTCIceServer[];
  };

  export interface RTCPeerConnectionIceErrorEvent extends Event {
    readonly errorCode: number;
    readonly errorText: string;
    readonly hostCandidate: string;
    readonly url: string;
  }

  export let RTCPeerConnectionIceErrorEvent: {
    prototype: RTCPeerConnectionIceErrorEvent;
    new(type: string, eventInitDict: RTCPeerConnectionIceErrorEventInit): RTCPeerConnectionIceErrorEvent;
  };

  export interface RTCPeerConnectionIceEvent extends Event {
    readonly candidate: RTCIceCandidate | null;
    readonly url: string | null;
  }

  export let RTCPeerConnectionIceEvent: {
    prototype: RTCPeerConnectionIceEvent;
    new(type: string, eventInitDict?: RTCPeerConnectionIceEventInit): RTCPeerConnectionIceEvent;
  };

  export interface RTCRtpReceiver {
    readonly rtcpTransport: RTCDtlsTransport | null;
    readonly track: MediaStreamTrack;
    readonly transport: RTCDtlsTransport | null;
    getContributingSources(): RTCRtpContributingSource[];
    getParameters(): RTCRtpReceiveParameters;
    getStats(): Promise<RTCStatsReport>;
    getSynchronizationSources(): RTCRtpSynchronizationSource[];
  }

  export let RTCRtpReceiver: {
    prototype: RTCRtpReceiver;
    new(): RTCRtpReceiver;
    getCapabilities(kind: string): RTCRtpCapabilities;
  };

  export interface RTCRtpSender {
    readonly dtmf: RTCDTMFSender | null;
    readonly rtcpTransport: RTCDtlsTransport | null;
    readonly track: MediaStreamTrack | null;
    readonly transport: RTCDtlsTransport | null;
    getParameters(): RTCRtpSendParameters;
    getStats(): Promise<RTCStatsReport>;
    replaceTrack(withTrack: MediaStreamTrack | null): Promise<void>;
    setParameters(parameters: RTCRtpSendParameters): Promise<void>;
    setStreams(...streams: MediaStream[]): void;
  }

  export let RTCRtpSender: {
    prototype: RTCRtpSender;
    new(): RTCRtpSender;
    getCapabilities(kind: string): RTCRtpCapabilities;
  };

  export interface RTCRtpTransceiver {
    readonly currentDirection: RTCRtpTransceiverDirection | null;
    direction: RTCRtpTransceiverDirection;
    readonly mid: string | null;
    readonly receiver: RTCRtpReceiver;
    readonly sender: RTCRtpSender;
    readonly stopped: boolean;
    setCodecPreferences(codecs: RTCRtpCodecCapability[]): void;
    stop(): void;
  }

  export let RTCRtpTransceiver: {
    prototype: RTCRtpTransceiver;
    new(): RTCRtpTransceiver;
  };

  export interface RTCSctpTransportEventMap {
    "statechange": Event;
  }

  export interface RTCSctpTransport {
    readonly maxChannels: number | null;
    readonly maxMessageSize: number;
    onstatechange: ((this: RTCSctpTransport, ev: Event) => any) | null;
    readonly state: RTCSctpTransportState;
    readonly transport: RTCDtlsTransport;
    addEventListener<K extends keyof RTCSctpTransportEventMap>(type: K, listener: (this: RTCSctpTransport, ev: RTCSctpTransportEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
    addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
    removeEventListener<K extends keyof RTCSctpTransportEventMap>(type: K, listener: (this: RTCSctpTransport, ev: RTCSctpTransportEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
    removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
  }

  export let RTCSctpTransport: {
    prototype: RTCSctpTransport;
    new(): RTCSctpTransport;
  };

  export interface RTCSessionDescription {
    readonly sdp: string;
    readonly type: RTCSdpType;
    toJSON(): any;
  }

  export let RTCSessionDescription: {
    prototype: RTCSessionDescription;
    new(descriptionInitDict: RTCSessionDescriptionInit): RTCSessionDescription;
  };

  export interface RTCSrtpSdesTransportEventMap {
    "error": Event;
  }

  export interface RTCSrtpSdesTransport extends EventTarget {
    onerror: ((this: RTCSrtpSdesTransport, ev: Event) => any) | null;
    readonly transport: RTCIceTransport;
    addEventListener<K extends keyof RTCSrtpSdesTransportEventMap>(type: K, listener: (this: RTCSrtpSdesTransport, ev: RTCSrtpSdesTransportEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
    addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
    removeEventListener<K extends keyof RTCSrtpSdesTransportEventMap>(type: K, listener: (this: RTCSrtpSdesTransport, ev: RTCSrtpSdesTransportEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
    removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
  }

  export let RTCSrtpSdesTransport: {
    prototype: RTCSrtpSdesTransport;
    new(transport: RTCIceTransport, encryptParameters: RTCSrtpSdesParameters, decryptParameters: RTCSrtpSdesParameters): RTCSrtpSdesTransport;
    getLocalParameters(): RTCSrtpSdesParameters[];
  };

  export interface RTCSsrcConflictEvent extends Event {
    readonly ssrc: number;
  }

  export let RTCSsrcConflictEvent: {
    prototype: RTCSsrcConflictEvent;
    new(): RTCSsrcConflictEvent;
  };

  export interface RTCStatsEvent extends Event {
    readonly report: RTCStatsReport;
  }

  export let RTCStatsEvent: {
    prototype: RTCStatsEvent;
    new(type: string, eventInitDict: RTCStatsEventInit): RTCStatsEvent;
  };

  export interface RTCStatsProvider extends EventTarget {
    getStats(): Promise<RTCStatsReport>;
    msGetStats(): Promise<RTCStatsReport>;
  }

  export let RTCStatsProvider: {
    prototype: RTCStatsProvider;
    new(): RTCStatsProvider;
  };

  export interface RTCStatsReport {
    forEach(callbackfn: (value: any, key: string, parent: RTCStatsReport) => void, thisArg?: any): void;
  }

  export let RTCStatsReport: {
    prototype: RTCStatsReport;
    new(): RTCStatsReport;
  };

  export interface RTCTrackEvent extends Event {
    readonly receiver: RTCRtpReceiver;
    readonly streams: ReadonlyArray<MediaStream>;
    readonly track: MediaStreamTrack;
    readonly transceiver: RTCRtpTransceiver;
  }

  export let RTCTrackEvent: {
    prototype: RTCTrackEvent;
    new(type: string, eventInitDict: RTCTrackEventInit): RTCTrackEvent;
  };

  export interface RTCSessionDescriptionInit {
    sdp?: string;
    type: RTCSdpType;
  }

  export interface RTCIceCandidateInit {
      candidate?: string;
      sdpMLineIndex?: number | null;
      sdpMid?: string | null;
      usernameFragment?: string;
  }
}
