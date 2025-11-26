import { useEffect, useRef, useCallback, useState } from 'react';
import { Client } from '@stomp/stompjs';
import type { IFrame, StompSubscription } from '@stomp/stompjs';

const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:8080/ws/chat';

export const useWebSocket = () => {
  const clientRef = useRef<Client | null>(null);
  const subscriptionsRef = useRef<Map<string, StompSubscription | any>>(new Map());
  const [isConnected, setIsConnected] = useState(false);
  const connectingRef = useRef(false);

  // Initialize WebSocket connection
  const connect = useCallback(() => {
    // Prevent multiple concurrent connection attempts
    if (connectingRef.current || clientRef.current?.active) {
      console.log('WebSocket already connecting or connected');
      return;
    }

    connectingRef.current = true;

    const client = new Client({
      brokerURL: WS_URL,
      connectHeaders: {},
      debug: (str: string) => console.log('STOMP DEBUG:', str),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    client.onConnect = () => {
      console.log('WebSocket connected');
      connectingRef.current = false;
      setIsConnected(true);
    };

    client.onDisconnect = () => {
      console.log('WebSocket disconnected');
      connectingRef.current = false;
      setIsConnected(false);
    };

    client.onStompError = (frame: IFrame) => {
      console.error('STOMP error:', frame);
      connectingRef.current = false;
      setIsConnected(false);
    };

    client.activate();
    clientRef.current = client;
  }, []);

  // Disconnect WebSocket
  const disconnect = useCallback(() => {
    if (clientRef.current?.active) {
      clientRef.current.deactivate();
      subscriptionsRef.current.clear();
      connectingRef.current = false;
      setIsConnected(false);
      console.log('WebSocket disconnected');
    }
  }, []);

  // Subscribe to topic
  const subscribe = useCallback(
    (topic: string, callback: (message: any) => void, subscriptionKey?: string) => {
      if (!clientRef.current?.active) {
        console.warn('WebSocket not connected, cannot subscribe');
        return null;
      }

      const key = subscriptionKey || topic;
      
      // Unsubscribe from previous subscription if exists
      if (subscriptionsRef.current.has(key)) {
        subscriptionsRef.current.get(key)?.unsubscribe();
      }

      const subscription = clientRef.current.subscribe(topic, (message: any) => {
        try {
          const body = JSON.parse(message.body);
          callback(body);
        } catch (e) {
          console.error('Error parsing message:', e);
        }
      });

      subscriptionsRef.current.set(key, subscription);
      console.log('Subscribed to topic:', topic);
      return subscription;
    },
    []
  );

  // Unsubscribe from topic
  const unsubscribe = useCallback((subscriptionKey: string) => {
    const subscription = subscriptionsRef.current.get(subscriptionKey);
    if (subscription) {
      subscription.unsubscribe();
      subscriptionsRef.current.delete(subscriptionKey);
      console.log('Unsubscribed from:', subscriptionKey);
    }
  }, []);

  // Send message
  const send = useCallback(
    (destination: string, body: any) => {
      if (!clientRef.current?.active) {
        console.warn('WebSocket not connected, cannot send message');
        return;
      }

      clientRef.current.publish({
        destination,
        body: JSON.stringify(body),
      });
      console.log('Message sent to:', destination);
    },
    []
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (clientRef.current?.active) {
        clientRef.current.deactivate();
      }
    };
  }, []);

  return {
    connect,
    disconnect,
    subscribe,
    unsubscribe,
    send,
    isConnected,
  };
};
