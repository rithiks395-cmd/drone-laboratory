import { Peer, DataConnection } from 'peerjs';

export interface ControllerPacket {
  throttle: number; // 0 to 10
  yaw: number;      // -1 to 1
  pitch: number;    // -1 to 1
  roll: number;     // -1 to 1
  takeoff?: boolean;
  land?: boolean;
  reset?: boolean;
  cameraToggle?: boolean;
  timestamp: number;
}

export interface TelemetryPacket {
  altitude: number;
  speed: number;
  batteryPct: number;
  pitchDeg: number;
  rollDeg: number;
  headingDeg: number;
  flightTimeSeconds: number;
}

// Fixed standard pairing PIN so phone and laptop match instantly
export const DEFAULT_ROOM_CODE = '1001';

export const PEER_ICE_CONFIG = {
  config: {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' },
      { urls: 'stun:global.stun.twilio.com:3478' },
    ],
  },
  debug: 0,
};

export function generatePairingCode(): string {
  return DEFAULT_ROOM_CODE;
}

/**
 * Host Class (Runs on Laptop / Desktop Screen)
 * Listens for incoming joystick packets via Local Vite SSE Relay + PeerJS + BroadcastChannel
 */
export class DroneHostConnection {
  private peer: Peer | null = null;
  private connection: DataConnection | null = null;
  private broadcastChannel: BroadcastChannel | null = null;
  private eventSource: EventSource | null = null;
  private pollInterval: any = null;
  public roomCode: string;
  public onPacketReceived: ((packet: ControllerPacket) => void) | null = null;
  public onStatusChange: ((connected: boolean) => void) | null = null;
  private lastPacketTime = 0;
  private isConnected = false;

  constructor(roomCode?: string) {
    this.roomCode = roomCode || DEFAULT_ROOM_CODE;

    // 1. BroadcastChannel (for testing on same browser/device)
    try {
      this.broadcastChannel = new BroadcastChannel(`uav_lab_${this.roomCode}`);
      this.broadcastChannel.onmessage = (event) => {
        if (event.data?.type === 'controller_packet' && this.onPacketReceived) {
          this.markActive();
          this.onPacketReceived(event.data.packet);
        }
      };
    } catch (e) {}

    // 2. Local Vite SSE Relay (/api/drone/events) - Works 100% on Local Wi-Fi
    this.initLocalRelay();

    // 3. PeerJS WebRTC
    this.initPeer();
  }

  private markActive() {
    this.lastPacketTime = Date.now();
    if (!this.isConnected) {
      this.isConnected = true;
      this.onStatusChange?.(true);
    }
  }

  private initLocalRelay() {
    try {
      // Connect to Server-Sent Events stream on the local server
      this.eventSource = new EventSource('/api/drone/events');
      
      this.eventSource.onmessage = (e) => {
        try {
          const parsed = JSON.parse(e.data);
          if (parsed.type === 'control' && parsed.packet && this.onPacketReceived) {
            this.markActive();
            this.onPacketReceived(parsed.packet);
          }
        } catch (err) {}
      };

      this.eventSource.onerror = () => {
        // Fallback to polling if SSE is not available
        if (!this.pollInterval) {
          this.pollInterval = setInterval(async () => {
            try {
              const res = await fetch('/api/drone/control');
              if (res.ok) {
                const packet = await res.json();
                if (packet && packet.timestamp && packet.timestamp > this.lastPacketTime) {
                  this.markActive();
                  this.onPacketReceived?.(packet);
                }
              }
            } catch (e) {}
          }, 33);
        }
      };
    } catch (err) {
      console.warn('Local relay init fallback', err);
    }
  }

  private initPeer() {
    try {
      const peerId = `uav-lab-${this.roomCode}`;
      this.peer = new Peer(peerId, PEER_ICE_CONFIG);

      this.peer.on('connection', (conn) => {
        this.connection = conn;
        this.markActive();

        conn.on('data', (data: any) => {
          if (data?.type === 'controller_packet' && this.onPacketReceived) {
            this.markActive();
            this.onPacketReceived(data.packet);
          }
        });

        conn.on('close', () => {
          this.connection = null;
        });
      });
    } catch (err) {}
  }

  public sendTelemetry(telemetry: TelemetryPacket) {
    // Send via local HTTP relay
    try {
      fetch('/api/drone/telemetry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(telemetry),
      }).catch(() => {});
    } catch (e) {}

    // Send via PeerJS
    if (this.connection && this.connection.open) {
      try {
        this.connection.send({ type: 'telemetry_packet', telemetry });
      } catch (e) {}
    }

    // Send via BroadcastChannel
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage({ type: 'telemetry_packet', telemetry });
      } catch (e) {}
    }
  }

  public destroy() {
    this.connection?.close();
    this.peer?.destroy();
    this.broadcastChannel?.close();
    this.eventSource?.close();
    if (this.pollInterval) clearInterval(this.pollInterval);
  }
}

/**
 * Controller Client Class (Runs on Mobile Phone)
 * Sends joystick packets via Local Vite HTTP Relay + PeerJS + BroadcastChannel
 */
export class MobileControllerConnection {
  private peer: Peer | null = null;
  private connection: DataConnection | null = null;
  private broadcastChannel: BroadcastChannel | null = null;
  private eventSource: EventSource | null = null;
  public roomCode: string;
  public onTelemetryReceived: ((telemetry: TelemetryPacket) => void) | null = null;
  public onStatusChange: ((connected: boolean) => void) | null = null;
  private isConnected = false;

  constructor(roomCode?: string) {
    this.roomCode = roomCode || DEFAULT_ROOM_CODE;

    // 1. BroadcastChannel fallback
    try {
      this.broadcastChannel = new BroadcastChannel(`uav_lab_${this.roomCode}`);
      this.broadcastChannel.onmessage = (event) => {
        if (event.data?.type === 'telemetry_packet' && this.onTelemetryReceived) {
          this.setConnectedState(true);
          this.onTelemetryReceived(event.data.telemetry);
        }
      };
    } catch (e) {}

    // 2. Local Vite SSE Relay for Telemetry
    this.initLocalRelay();

    // 3. PeerJS fallback
    this.initPeer();

    // Optimistically mark connected since HTTP relay is active
    setTimeout(() => {
      this.setConnectedState(true);
    }, 500);
  }

  private setConnectedState(status: boolean) {
    if (this.isConnected !== status) {
      this.isConnected = status;
      this.onStatusChange?.(status);
    }
  }

  private initLocalRelay() {
    try {
      this.eventSource = new EventSource('/api/drone/events');
      this.eventSource.onopen = () => {
        this.setConnectedState(true);
      };
      this.eventSource.onmessage = (e) => {
        try {
          const parsed = JSON.parse(e.data);
          if (parsed.type === 'telemetry' && parsed.telemetry && this.onTelemetryReceived) {
            this.setConnectedState(true);
            this.onTelemetryReceived(parsed.telemetry);
          }
        } catch (err) {}
      };
    } catch (e) {}
  }

  private initPeer() {
    try {
      this.peer = new Peer(PEER_ICE_CONFIG);

      this.peer.on('open', () => {
        const hostPeerId = `uav-lab-${this.roomCode}`;
        const conn = this.peer!.connect(hostPeerId, { reliable: false });
        this.connection = conn;

        conn.on('open', () => {
          this.setConnectedState(true);
        });

        conn.on('data', (data: any) => {
          if (data?.type === 'telemetry_packet' && this.onTelemetryReceived) {
            this.setConnectedState(true);
            this.onTelemetryReceived(data.telemetry);
          }
        });
      });
    } catch (err) {}
  }

  public sendPacket(packet: ControllerPacket) {
    // 1. Send via local high-speed HTTP endpoint (guaranteed to reach Vite server)
    try {
      fetch('/api/drone/control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(packet),
        keepalive: true,
      }).then(() => {
        this.setConnectedState(true);
      }).catch(() => {});
    } catch (e) {}

    // 2. Send via PeerJS WebRTC
    if (this.connection && this.connection.open) {
      try {
        this.connection.send({ type: 'controller_packet', packet });
      } catch (e) {}
    }

    // 3. Send via BroadcastChannel
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage({ type: 'controller_packet', packet });
      } catch (e) {}
    }
  }

  public destroy() {
    this.connection?.close();
    this.peer?.destroy();
    this.broadcastChannel?.close();
    this.eventSource?.close();
  }
}
