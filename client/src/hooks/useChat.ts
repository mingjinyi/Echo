import { useState, useCallback, useEffect, useRef } from 'react';
import { chatApi } from '../api/client';
import type { Message, ConversationPhase } from '../types';

const USER_ID_KEY = 'echo_user_id';
const CONV_ID_KEY = 'echo_conv_id';

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
  const [conversationId, setConversationId] = useState<string | undefined>(
    () => localStorage.getItem(CONV_ID_KEY) || undefined
  );
  const [phase, setPhase] = useState<ConversationPhase>('greeting');
  const [loading, setLoading] = useState(false);
  const [profileUpdated, setProfileUpdated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load history on mount — never auto-start a new conversation
  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      setError(null);
      const data = await chatApi.getHistory(userId);
      if (data.messages && data.messages.length > 0) {
        setMessages(data.messages);
        const lastMsg = data.messages[data.messages.length - 1];
        if (lastMsg.metadata?.displayStyle === 'profile') {
          setPhase('final_profile');
        } else if (lastMsg.role === 'assistant') {
          setPhase('dynamic_followup');
        }
      }
    } catch (err: any) {
      setError(err.message || '加载失败');
    }
  };

  const sendMessage = useCallback(async (content: string) => {
    setError(null);
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
        if (!conversationId && response.conversationId) {
          setConversationId(response.conversationId);
          localStorage.setItem(CONV_ID_KEY, response.conversationId);
        }
        setProfileUpdated(response.profileUpdated);
      }
    } catch (err: any) {
      setError(err.message || '请求失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  }, [userId, conversationId]);

  const resetChat = useCallback(async () => {
    try {
      await chatApi.resetChat(userId);
      setMessages([]);
      setConversationId(undefined);
      localStorage.removeItem(CONV_ID_KEY);
      setPhase('greeting');
      setProfileUpdated(false);
      setError(null);
    } catch (err: any) {
      setError('重置失败');
    }
  }, [userId]);

  return {
    userId,
    messages,
    phase,
    loading,
    profileUpdated,
    error,
    messagesEndRef,
    sendMessage,
    resetChat,
    loadHistory,
  };
}
