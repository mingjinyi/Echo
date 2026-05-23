import { useState, useCallback, useEffect, useRef } from 'react';
import { chatApi } from '../api/client';
import type { Message, ConversationPhase } from '../types';

const USER_ID_KEY = 'echo_user_id';

function getUserId(): string {
  let id = localStorage.getItem(USER_ID_KEY);
  if (!id) {
    id = `user_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    localStorage.setItem(USER_ID_KEY, id);
  }
  return id;
}

export function useChat() {
  const [userId] = useState(getUserId);
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [phase, setPhase] = useState<ConversationPhase>('greeting');
  const [loading, setLoading] = useState(false);
  const [profileUpdated, setProfileUpdated] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load history on mount
  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const data = await chatApi.getHistory(userId);
      if (data.messages && data.messages.length > 0) {
        setMessages(data.messages);
        // Determine phase from last message
        const lastMsg = data.messages[data.messages.length - 1];
        if (lastMsg.metadata?.displayStyle === 'profile') {
          setPhase('final_profile');
        }
      } else {
        // Start a new conversation: send empty message to trigger greeting
        await sendInitialMessage();
      }
    } catch (error) {
      console.error('Failed to load history:', error);
      // Start fresh
      await sendInitialMessage();
    }
  };

  const sendInitialMessage = async () => {
    try {
      setLoading(true);
      const response = await chatApi.sendMessage(userId, '你好');
      if (response.message) {
        setMessages([response.message]);
        setPhase(response.phase as ConversationPhase);
        setConversationId(response.conversationId);
      }
    } catch (error) {
      console.error('Failed to start conversation:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = useCallback(async (content: string) => {
    // Add user message immediately
    const userMsg: Message = {
      id: `temp_${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const response = await chatApi.sendMessage(userId, content, conversationId);
      if (response.message) {
        setMessages(prev => [...prev, response.message]);
        setPhase(response.phase as ConversationPhase);
        if (!conversationId) setConversationId(response.conversationId);
        setProfileUpdated(response.profileUpdated);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      // Add error message
      const errorMsg: Message = {
        id: `error_${Date.now()}`,
        role: 'assistant',
        content: '抱歉，出了点问题。请稍后再试。',
        timestamp: new Date().toISOString(),
        metadata: { displayStyle: 'system' },
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  }, [userId, conversationId]);

  const resetChat = useCallback(async () => {
    try {
      await chatApi.resetChat(userId);
      setMessages([]);
      setConversationId(undefined);
      setPhase('greeting');
      setProfileUpdated(false);
      // Restart
      await sendInitialMessage();
    } catch (error) {
      console.error('Failed to reset:', error);
    }
  }, [userId]);

  return {
    userId,
    messages,
    phase,
    loading,
    profileUpdated,
    messagesEndRef,
    sendMessage,
    resetChat,
  };
}
