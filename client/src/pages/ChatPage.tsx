import { useState } from 'react';
import { useChat } from '../hooks/useChat';
import { chatApi } from '../api/client';
import ChatBubble from '../components/ChatBubble';
import ChatInput from '../components/ChatInput';
import ProfileCard from '../components/ProfileCard';
import { Link } from 'react-router-dom';

const PHASE_LABELS: Record<string, string> = {
  greeting: '初次见面',
  foundation: '互相了解',
  initial_questions: '互相了解',
  dynamic_followup: '深入聊聊',
  mid_summary: '阶段性回顾',
  final_profile: '画像生成',
  continuous_update: '持续对话',
};

export default function ChatPage() {
  const {
    userId,
    messages,
    phase,
    loading,
    profileUpdated,
    messagesEndRef,
    sendMessage,
    resetChat,
  } = useChat();

  const [showProfilePreview, setShowProfilePreview] = useState(false);
  const [generatedNarrative, setGeneratedNarrative] = useState<string | null>(null);
  const [generatingProfile, setGeneratingProfile] = useState(false);

  const handleGenerateProfile = async () => {
    setGeneratingProfile(true);
    try {
      const result = await chatApi.generateProfile(userId);
      setGeneratedNarrative(result.narrative);
      setShowProfilePreview(true);
    } catch (error) {
      console.error('Failed to generate profile:', error);
    } finally {
      setGeneratingProfile(false);
    }
  };

  const hasMessages = messages.length > 0;

  return (
    <div className="max-w-2xl mx-auto px-4 pt-3 pb-4">
      {/* ===== Top bar ===== */}
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-[var(--color-text-primary)]">
            {PHASE_LABELS[phase] || phase}
          </span>
          {profileUpdated && (
            <span className="badge badge-primary">画像已更新</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleGenerateProfile}
            disabled={generatingProfile || messages.length < 3}
            className="text-xs btn-secondary px-3 py-1.5"
          >
            {generatingProfile ? '生成中...' : '生成画像'}
          </button>
          <button
            onClick={resetChat}
            className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] px-2 py-1.5 transition-colors duration-200"
          >
            重新开始
          </button>
        </div>
      </div>

      {/* ===== Profile preview ===== */}
      {showProfilePreview && generatedNarrative && (
        <div className="mb-5 animate-fade-in-up">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-[var(--color-text-primary)]">你的画像</span>
            <button
              onClick={() => setShowProfilePreview(false)}
              className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
            >
              收起
            </button>
          </div>
          <ProfileCard narrative={generatedNarrative} />
          <div className="mt-3 text-center">
            <Link to="/profile" className="text-sm text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] underline transition-colors">
              查看完整画像与记忆 →
            </Link>
          </div>
        </div>
      )}

      {/* ===== Chat area ===== */}
      <div
        className="rounded-2xl min-h-[60vh] max-h-[65vh] overflow-y-auto mb-4 p-5 transition-colors duration-300"
        style={{ background: 'var(--bg-chat)' }}
      >
        {/* Empty state */}
        {!hasMessages && !loading && (
          <div className="flex flex-col items-center justify-center h-64 gap-4">
            <div className="w-16 h-16 rounded-full bg-[rgba(91,158,216,0.08)] flex items-center justify-center">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="1.5" strokeLinecap="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <p className="text-[var(--color-text-muted)] text-sm">开始我们的对话吧...</p>
          </div>
        )}

        {/* Messages */}
        {hasMessages && (
          <>
            {/* Phase divider at top */}
            <div className="divider-text mb-5">
              · {PHASE_LABELS[phase] || phase} ·
            </div>
            {messages.map(msg => (
              <ChatBubble key={msg.id} message={msg} />
            ))}
          </>
        )}

        {/* Typing indicator */}
        {loading && (
          <div className="flex justify-start mb-4 animate-fade-in-up">
            <div className="message-assistant">
              <div className="typing-indicator">
                <span />
                <span />
                <span />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ===== Input ===== */}
      <ChatInput
        onSend={sendMessage}
        disabled={loading}
        placeholder={
          phase === 'greeting'
            ? '开始我们的对话...'
            : '按你的节奏来就好...'
        }
      />
    </div>
  );
}
