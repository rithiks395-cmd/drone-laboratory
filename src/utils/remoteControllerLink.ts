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

// Standard default fallback room code
export const DEFAULT_ROOM_CODE = '1001';

// Generate random 4-digit room code for unique session pairing
export function generatePairingCode(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

export const PEER_ICE_CONFIG = {
  config: {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' },
      { urls: 'stun:stun3.l.google.com:19302' },
      { urls: 'stun:stun4.l.google.com:19302' },
      { urls: 'stun:global.stun.twilio.com:3478' },
    ],
  },
  debug: 1,
};

/**
 * Host Class (Runs on Laptop / Desktop Screen)
 * Listens for incoming joystick packets via PeerJS WebRTC + BroadcastChannel + Local SSE
 */
export class DroneHostConnection {
  private peer: Peer | null = null;
  private connection: DataConnection | null = null;
  private broadcastChannel: BroadcastChannel | null = null;
  private eventSource: EventSource | null = null;
  public roomCode: string;
  public actualPeerId: string;
  public onPacketReceived: ((packet: ControllerPacket) => void) | null = null;
  public onStatusChange: ((connected: boolean) => void) | null = null;
  public onRoomCodeUpdated: ((newCode: string) => void) | null = null;
  private isConnected = false;

  constructor(roomCode?: string) {
    this.roomCode = roomCode || generatePairingCode();
    this.actualPeerId = `uav-lab-${this.roomCode}`;

    // 1. BroadcastChannel (for testing in multi-window on same computer)
    try {
      this.broadcastChannel = new BroadcastChannel(`uav_lab_${this.roomCode}`);
      this.broadcastChannel.onmessage = (event) => {
        if (event.data?.type === 'controller_packet' && this.onPacketReceived) {
          this.markActive();
          this.onPacketReceived(event.data.packet);
        }
      };
    } catch (e) {}

    // 2. Local Vite SSE Relay (only when running locally on dev server)
    this.initLocalRelay();

    // 3. Cloud WebRTC PeerJS with auto-retry
    this.initPeer(this.actualPeerId);
  }

  private markActive() {
    if (!this.isConnected) {
      this.isConnected = true;
      this.onStatusChange?.(true);
    }
  }

  private initLocalRelay() {
    // Only attempt on localhost / local IP
    if (typeof window === 'undefined') return;
    const isLocal = window.location.hostname === 'localhost' || 
                    window.location.hostname === '127.0.0.1' || 
                    window.location.hostname.startsWith('192.168.') || 
                    window.location.hostname.startsWith('10.');
    if (!isLocal) return;

    try {
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
    } catch (err) {}
  }

  private initPeer(targetId: string) {
    try {
      this.peer = new Peer(targetId, PEER_ICE_CONFIG);

      this.peer.on('open', (id) => {
        console.log('[DroneHost] PeerJS Host Listening on ID:', id);
        this.actualPeerId = id;
      });

      this.peer.on('connection', (conn) => {
        console.log('[DroneHost] Smartphone Connected!', conn.peer);
        this.connection = conn;
        this.markActive();

        conn.on('open', () => {
          this.markActive();
          // Send handshake confirmation
          conn.send({ type: 'handshake_ack' });
        });

        conn.on('data', (data: any) => {
          this.markActive();
          if (data?.type === 'controller_packet' && this.onPacketReceived) {
            this.onPacketReceived(data.packet);
          }
        });

        conn.on('close', () => {
          console.log('[DroneHost] Smartphone disconnected');
          this.isConnected = false;
          this.onStatusChange?.(false);
          this.connection = null;
        });

        conn.on('error', (err) => {
          console.warn('[DroneHost] Connection error:', err);
          this.isConnected = false;
          this.onStatusChange?.(false);
          this.connection = null;
        });
      });

      this.peer.on('error', (err: any) => {
        console.warn('[DroneHost] Peer error:', err?.type, err);
        // If ID is already taken on cloud broker, generate unique code with timestamp
        if (err?.type === 'unavailable-id') {
          const newCode = `${Math.floor(1000 + Math.random() * 9000)}`;
          const newId = `uav-lab-${newCode}`;
          this.roomCode = newCode;
          this.actualPeerId = newId;
          this.onRoomCodeUpdated?.(newCode);
          this.peer?.destroy();
          setTimeout(() => this.initPeer(newId), 500);
        }
      });
    } catch (err) {
      console.error('[DroneHost] PeerJS init error', err);
    }
  }

  public sendTelemetry(telemetry: TelemetryPacket) {
    // Send via WebRTC DataChannel
    if (this.connection && this.connection.open) {
      try {
        this.connection.send({ type: 'telemetry_packet', telemetry });
      } catch (e) {}
    }

    // BroadcastChannel fallback
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
  }
}

/**
 * Controller Client Class (Runs on Mobile Phone)
 * Sends joystick packets to Host Laptop via PeerJS WebRTC + BroadcastChannel + Local HTTP
 */
export class MobileControllerConnection {
  private peer: Peer | null = null;
  private connection: DataConnection | null = null;
  private broadcastChannel: BroadcastChannel | null = null;
  public roomCode: string;
  public onTelemetryReceived: ((telemetry: TelemetryPacket) => void) | null = null;
  public onStatusChange: ((connected: boolean, statusText?: string) => void) | null = null;
  private isConnected = false;
  private reconnectTimer: any = null;
  private isDestroyed = false;

  constructor(roomCode: string) {
    this.roomCode = roomCode;

    // 1. BroadcastChannel fallback
    try {
      this.broadcastChannel = new BroadcastChannel(`uav_lab_${this.roomCode}`);
      this.broadcastChannel.onmessage = (event) => {
        if (event.data?.type === 'telemetry_packet' && this.onTelemetryReceived) {
          this.setConnectedState(true, 'Connected via Broadcast');
          this.onTelemetryReceived(event.data.telemetry);
        }
      };
    } catch (e) {}

    // 2. WebRTC PeerJS
    this.initPeer();
  }

  private setConnectedState(status: boolean, statusText?: string) {
    if (this.isConnected !== status || statusText) {
      this.isConnected = status;
      this.onStatusChange?.(status, statusText);
    }
  }

  private initPeer() {
    if (this.isDestroyed) return;
    this.setConnectedState(false, 'Connecting to Cloud Relay...');

    try {
      this.peer = new Peer(PEER_ICE_CONFIG);

      this.peer.on('open', (myId) => {
        console.log('[MobileController] Peer open, ID:', myId);
        this.setConnectedState(false, 'Pairing with Laptop screen...');
        this.connectToHost();
      });

      this.peer.on('error', (err) => {
        console.warn('[MobileController] Peer error:', err?.type, err);
        this.setConnectedState(false, `Pairing: ${err?.type || 'Searching for PC...'}`);
        this.scheduleReconnect();
      });
    } catch (err) {
      console.error('[MobileController] Init peer failed', err);
      this.scheduleReconnect();
    }
  }

  private connectToHost() {
    if (!this.peer || this.peer.destroyed || this.isDestroyed) return;

    const hostPeerId = `uav-lab-${this.roomCode}`;
    console.log('[MobileController] Connecting to host:', hostPeerId);

    try {
      const conn = this.peer.connect(hostPeerId, {
        reliable: true,
      });

      this.connection = conn;

      conn.on('open', () => {
        console.log('[MobileController] WebRTC DataChannel OPEN with Laptop!');
        this.setConnectedState(true, 'ONLINE • PAIRED WITH LAPTOP');
        if (this.reconnectTimer) clearInterval(this.reconnectTimer);

        // Send handshake ping
        conn.send({ type: 'handshake_ping', time: Date.now() });
      });

      conn.on('data', (data: any) => {
        this.setConnectedState(true, 'ONLINE • PAIRED WITH LAPTOP');
        if (data?.type === 'telemetry_packet' && this.onTelemetryReceived) {
          this.onTelemetryReceived(data.telemetry);
        }
      });

      conn.on('close', () => {
        console.log('[MobileController] WebRTC DataChannel closed');
        this.setConnectedState(false, 'Disconnected. Reconnecting...');
        this.scheduleReconnect();
      });

      conn.on('error', (err) => {
        console.warn('[MobileController] Connection error:', err);
        this.setConnectedState(false, 'Retrying connection...');
        this.scheduleReconnect();
      });
    } catch (err) {
      console.warn('[MobileController] connectToHost failed', err);
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect() {
    if (this.isDestroyed || this.isConnected) return;
    if (this.reconnectTimer) return;

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      if (!this.isConnected && !this.isDestroyed) {
        if (this.peer && !this.peer.destroyed && this.peer.open) {
          this.connectToHost();
        } else {
          this.peer?.destroy();
          this.initPeer();
        }
      }
    }, 2000);
  }

  public sendPacket(packet: ControllerPacket) {
    // 1. Send via WebRTC DataChannel
    if (this.connection && this.connection.open) {
      try {
        this.connection.send({ type: 'controller_packet', packet });
      } catch (e) {}
    }

    // 2. BroadcastChannel fallback (same machine)
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage({ type: 'controller_packet', packet });
      } catch (e) {}
    }

    // 3. Local HTTP endpoint (if running on local dev server)
    if (typeof window !== 'undefined') {
      const isLocal = window.location.hostname === 'localhost' || 
                      window.location.hostname === '127.0.0.1' || 
                      window.location.hostname.startsWith('192.168.') || 
                      window.location.hostname.startsWith('10.');
      if (isLocal) {
        try {
          fetch('/api/drone/control', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(packet),
            keepalive: true,
          }).catch(() => {});
        } catch (e) {}
      }
    }
  }

  public destroy() {
    this.isDestroyed = true;
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.connection?.close();
    this.peer?.destroy();
    this.broadcastChannel?.close();
  }
}
