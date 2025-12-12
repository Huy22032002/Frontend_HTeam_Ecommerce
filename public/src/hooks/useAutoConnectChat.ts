import { useEffect, useRef } from 'react';
import { useCustomerChat } from './useChat';
import { useSSE } from './useSSE';

/**
 * Hook để auto-connect chat stream khi customer login
 * Không cần user bấm vào ChatBox widget
 */
export const useAutoConnectChat = (customerId: number | null) => {
  const { conversation, loadMessages } = useCustomerChat(customerId);
  const { subscribe } = useSSE();
  const unsubscribeRef = useRef<(() => void) | null>(null);

  // Initialize conversation ngay khi customer login
  useEffect(() => {
    if (customerId) {
      console.log(`💬 Auto-connecting chat stream cho customer ${customerId}`);
    }
  }, [customerId]);

  // Debug: Log conversation state
  useEffect(() => {
    console.log('💬 useAutoConnectChat - Conversation state:', {
      conversationId: conversation?.id,
      conversationStatus: conversation ? 'ready' : 'not-ready',
      customerId
    });
  }, [conversation?.id, customerId]);

  // Auto-subscribe khi conversation ready
  useEffect(() => {
    if (conversation?.id && customerId) {
      console.log(`📢 Auto-subscribing to chat conversation: ${conversation.id}`);
      
      // Load messages trước
      loadMessages(0, 20).catch(e => console.error('Error loading messages:', e));

      // Subscribe để nhận real-time messages
      const unsubscribe = subscribe(
        conversation.id,
        (message: any) => {
          console.log('💬 [useAutoConnectChat] Received message:', message);
          // Dispatch custom event để các component khác có thể listen
          window.dispatchEvent(new CustomEvent('new-chat-message', {
            detail: { message, conversationId: conversation.id }
          }));
        },
        customerId,
        'customer'
      );

      unsubscribeRef.current = unsubscribe;

      return () => {
        if (unsubscribeRef.current) {
          console.log(`🔕 Auto-disconnect chat conversation: ${conversation.id}`);
          unsubscribeRef.current();
        }
      };
    }
  }, [conversation?.id, customerId, subscribe, loadMessages]);

  return {
    conversation,
  };
};

