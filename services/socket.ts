import { io, Socket } from 'socket.io-client';
import { Message, RoomStatus, SocketConfig } from '../types/index';

class ChatService {
  public socket: Socket | null = null;
  public static instance: ChatService;
  public messageListeners: ((message: Message) => void)[] = [];
  public roomStatusListeners: ((status: RoomStatus) => void)[] = [];
  public errorListeners: ((error: Error) => void)[] = [];

  public constructor() {}

  public static getInstance(): ChatService {
    if (!ChatService.instance) {
      ChatService.instance = new ChatService();
    }
    return ChatService.instance;
  }

  public initialize(config: SocketConfig): void {
    if (this.socket) {
      this.disconnect();
    }

    this.socket = io(config.url, {
      reconnectionAttempts: config.options?.reconnectionAttempts || 5,
      reconnectionDelay: config.options?.reconnectionDelay || 1000,
      autoConnect: config.options?.autoConnect ?? true,
      transports: ['websocket'],
    });

    this.setupEventListeners();
  }

  public setupEventListeners(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Connected to chat server');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from chat server');
    });

    this.socket.on('connect_error', (error: Error) => {
      console.error('Connection error:', error);
      this.errorListeners.forEach(listener => listener(error));
    });

    this.socket.on('message', (message: Message) => {
      this.messageListeners.forEach(listener => listener(message));
    });

    this.socket.on('roomStatus', (status: RoomStatus) => {
      this.roomStatusListeners.forEach(listener => listener(status));
    });

    this.socket.on('error', (error: Error) => {
      console.error('Socket error:', error);
      this.errorListeners.forEach(listener => listener(error));
    });
  }

  // Room Management
  public joinRoom(roomId: string, patientId: string, patientName?: string): void {
    this.socket?.emit('patientJoin', { roomId, patientId, patientName });
  }

  public getRoomStatus(roomId: string): void {
    this.socket?.emit('getRoomStatus', { roomId });
  }

  // Message Handling
  public sendMessage(roomId: string, patientId: string, content: string): void {
    this.socket?.emit('patientMessage', { roomId, patientId, content });
  }

  public sendVoiceMessage(
    roomId: string,
    patientId: string,
    audioData: string, // Base64 encoded audio
    duration: number
  ): void {
    this.socket?.emit('voiceMessage', {
      roomId,
      senderId: patientId,
      senderType: 'patient',
      audioData,
      duration,
    });
  }

  // Event Listeners
  public onMessage(listener: (message: Message) => void): () => void {
    this.messageListeners.push(listener);
    return () => {
      this.messageListeners = this.messageListeners.filter(l => l !== listener);
    };
  }

  public onRoomStatus(listener: (status: RoomStatus) => void): () => void {
    this.roomStatusListeners.push(listener);
    return () => {
      this.roomStatusListeners = this.roomStatusListeners.filter(l => l !== listener);
    };
  }

  public onError(listener: (error: Error) => void): () => void {
    this.errorListeners.push(listener);
    return () => {
      this.errorListeners = this.errorListeners.filter(l => l !== listener);
    };
  }

  // Cleanup
  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.messageListeners = [];
      this.roomStatusListeners = [];
      this.errorListeners = [];
    }
  }
}

export const chatService = ChatService.getInstance();