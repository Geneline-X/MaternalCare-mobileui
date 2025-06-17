import { useEffect, useState, useCallback, useRef } from 'react';
import { Alert } from 'react-native';
import { io, Socket } from 'socket.io-client';
import { ChatMessage, RoomStatus, SenderType } from '@/types';
import config from '@/config';

interface UseChatParams {
  roomId: string;
  userId: string;
  socketUrl?: string;
  callbacks?: {
    onMessage?: (message: ChatMessage) => void;
    onRoomStatus?: (status: RoomStatus) => void;
    onError?: (error: Error) => void;
    onConnect?: () => void;
    onDisconnect?: () => void;
  };
}

export const useChat = ({
  roomId,
  userId,
  socketUrl = config.SOCKET_URL,
  callbacks = {},
}: UseChatParams) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [roomStatus, setRoomStatus] = useState<RoomStatus | null>(null);
  const socketRef = useRef<Socket | null>(null);

  // Initialize socket connection
  useEffect(() => {
    if (!socketUrl) {
      setError('Socket URL is not configured');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    
    try {
      // Initialize socket connection
      const socket = io(socketUrl, {
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        autoConnect: true,
        auth: {
          token: userId, // You might want to use a proper JWT token here
        },
      });

      socketRef.current = socket;

      // Connection established
      const handleConnect = () => {
        console.log('Connected to chat server');
        setIsConnected(true);
        setError(null);
        callbacks.onConnect?.();
        
        // Join the room after connection
        socket.emit('joinRoom', { roomId, userId });
      };

      // Handle incoming messages
      const handleMessage = (message: ChatMessage) => {
        setMessages(prev => [...prev, message]);
        callbacks.onMessage?.(message);
      };

      // Handle room status updates
      const handleRoomStatus = (status: RoomStatus) => {
        setRoomStatus(status);
        callbacks.onRoomStatus?.(status);
      };

      // Handle errors
      const handleError = (error: Error) => {
        console.error('Socket error:', error);
        setError(error.message);
        callbacks.onError?.(error);
      };

      // Handle disconnection
      const handleDisconnect = () => {
        setIsConnected(false);
        callbacks.onDisconnect?.();
      };

      // Set up event listeners
      socket.on('connect', handleConnect);
      socket.on('message', handleMessage);
      socket.on('roomStatus', handleRoomStatus);
      socket.on('error', handleError);
      socket.on('disconnect', handleDisconnect);

      // Connect to the socket
      socket.connect();

      // Clean up on unmount
      return () => {
        socket.off('connect', handleConnect);
        socket.off('message', handleMessage);
        socket.off('roomStatus', handleRoomStatus);
        socket.off('error', handleError);
        socket.off('disconnect', handleDisconnect);
        
        if (socket.connected) {
          socket.disconnect();
        }
      };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to connect to chat server');
      console.error('Connection error:', error);
      setError(error.message);
      callbacks.onError?.(error);
    } finally {
      setIsLoading(false);
    }
  }, [roomId, userId, socketUrl]);

  // Send a text message
  const sendMessage = useCallback((content: string) => {
    if (!socketRef.current?.connected) {
      Alert.alert('Connection Error', 'Not connected to the chat server');
      return;
    }

    const message: Omit<ChatMessage, 'id' | 'timestamp' | 'status'> = {
      roomId,
      senderId: userId,
      senderType: 'patient',
      content,
      type: 'text',
    };

    // Optimistic update
    const tempId = Date.now().toString();
    const tempMessage: ChatMessage = {
      ...message,
      id: tempId,
      timestamp: new Date().toISOString(),
      status: 'sending',
    };
    
    setMessages(prev => [...prev, tempMessage]);
    
    // Emit the message
    socketRef.current.emit('sendMessage', message, (ack: { success: boolean; error?: string; messageId?: string }) => {
      if (!ack.success) {
        // Update message status to failed
        setMessages(prev => 
          prev.map(msg => 
            msg.id === tempId 
              ? { ...msg, status: 'failed' } 
              : msg
          )
        );
        Alert.alert('Error', ack.error || 'Failed to send message');
      } else {
        // Update message with server-generated ID and status
        setMessages(prev => 
          prev.map(msg => 
            msg.id === tempId
              ? { ...msg, id: ack.messageId || tempId, status: 'sent' }
              : msg
          )
        );
      }
    });
  }, [roomId, userId]);

  // Send a voice message
  const sendVoiceMessage = useCallback(async (audioData: string, duration: number) => {
    if (!socketRef.current?.connected) {
      Alert.alert('Connection Error', 'Not connected to the chat server');
      return;
    }

    const message: Omit<ChatMessage, 'id' | 'timestamp' | 'status'> = {
      roomId,
      senderId: userId,
      senderType: 'patient',
      content: 'Voice message',
      type: 'voice',
      metadata: {
        duration,
        mimeType: 'audio/webm',
      },
    };

    // Optimistic update
    const tempId = Date.now().toString();
    const tempMessage: ChatMessage = {
      ...message,
      id: tempId,
      timestamp: new Date().toISOString(),
      status: 'sending',
    };
    
    setMessages(prev => [...prev, tempMessage]);
    
    // Emit the voice message
    socketRef.current.emit(
      'sendVoiceMessage',
      {
        ...message,
        audioData,
        duration,
      },
      (ack: { success: boolean; error?: string; messageId?: string }) => {
        if (ack.success) {
          // Update message with server-generated ID and status
          setMessages(prev =>
            prev.map(msg =>
              msg.id === tempId
                ? { ...msg, id: ack.messageId || tempId, status: 'sent' }
                : msg
            )
          );
        } else {
          // Update message status to failed
          setMessages(prev =>
            prev.map(msg =>
              msg.id === tempId ? { ...msg, status: 'failed' } : msg
            )
          );
          Alert.alert('Error', ack.error || 'Failed to send voice message');
        }
      }
    );
  }, [roomId, userId]);

  return {
    messages,
    isConnected,
    isLoading,
    error,
    roomStatus,
    sendMessage,
    sendVoiceMessage,
  };
};