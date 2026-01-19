import { useEffect, useState, useCallback } from 'react';
import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';

export interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  conversation_id: string;
  text: string;
  read: boolean;
  created_at: string;
  sender?: { id: string; name: string; avatar?: string };
}

/**
 * Real-time messages hook using Supabase Realtime
 * Instant message delivery with WebSocket
 */
export function useRealtimeMessages(conversationId: string) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  // Fetch initial messages
  const fetchMessages = useCallback(async () => {
    if (!conversationId) return;

    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('messages')
        .select(`
          *,
          sender:users(id, name, avatar)
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })
        .limit(100);

      if (fetchError) throw fetchError;

      setMessages(data as Message[]);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError(err instanceof Error ? err : new Error('Unknown error'));
      setLoading(false);
    }
  }, [conversationId]);

  // Subscribe to real-time messages
  useEffect(() => {
    if (!conversationId || !user?.id) return;

    fetchMessages();

    // Subscribe to new messages
    const messagesChannel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const newMessage = payload.new as Message;
          setMessages((prev) => [...prev, newMessage]);

          // Mark as read if sent to current user
          if (newMessage.recipient_id === user.id && !newMessage.read) {
            markAsRead(newMessage.id);
          }
        }
      )
      .subscribe((status) => {
        console.log(`Messages subscription: ${status}`);
        if (status === 'SUBSCRIBED') {
          setChannel(messagesChannel);
        }
      });

    return () => {
      messagesChannel.unsubscribe();
    };
  }, [conversationId, user?.id, fetchMessages]);

  const sendMessage = useCallback(
    async (text: string, recipientId: string) => {
      if (!user?.id) return;

      try {
        const { data, error: insertError } = await supabase
          .from('messages')
          .insert({
            sender_id: user.id,
            recipient_id: recipientId,
            conversation_id: conversationId,
            text,
            read: false,
          })
          .select();

        if (insertError) throw insertError;

        // Message will be added via subscription
        return data?.[0];
      } catch (err) {
        console.error('Error sending message:', err);
        throw err;
      }
    },
    [conversationId, user?.id]
  );

  const markAsRead = useCallback(async (messageId: string) => {
    try {
      const { error: updateError } = await supabase
        .from('messages')
        .update({ read: true })
        .eq('id', messageId);

      if (updateError) throw updateError;

      setMessages((prev) =>
        prev.map((m) => (m.id === messageId ? { ...m, read: true } : m))
      );
    } catch (err) {
      console.error('Error marking message as read:', err);
    }
  }, []);

  const deleteMessage = useCallback(async (messageId: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('messages')
        .delete()
        .eq('id', messageId)
        .eq('sender_id', user?.id);

      if (deleteError) throw deleteError;

      setMessages((prev) => prev.filter((m) => m.id !== messageId));
    } catch (err) {
      console.error('Error deleting message:', err);
    }
  }, [user?.id]);

  return {
    messages,
    loading,
    error,
    sendMessage,
    markAsRead,
    deleteMessage,
    channel,
  };
}
