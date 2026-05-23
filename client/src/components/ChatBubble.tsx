import type { Message } from '../types';

interface Props {
  message: Message;
}

export default function ChatBubble({ message }: Props) {
  const { role, content, metadata } = message;
  const displayStyle = metadata?.displayStyle || 'question';

  if (role === 'user') {
    return (
      <div className="flex justify-end mb-4 animate-fade-in-up">
        <div className="message-user">
          <p className="whitespace-pre-wrap text-sm leading-relaxed">{content}</p>
        </div>
      </div>
    );
  }

  // System / transitional messages
  if (displayStyle === 'system') {
    return (
      <div className="flex justify-center mb-5 animate-fade-in-up">
        <div className="message-system text-center max-w-[75%]">
          <p>{content}</p>
        </div>
      </div>
    );
  }

  // Summary messages
  if (displayStyle === 'summary') {
    return (
      <div className="flex justify-start mb-5 animate-fade-in-up">
        <div className="message-bubble bg-[rgba(123,147,176,0.06)] border border-[var(--color-border)] text-[var(--color-text-secondary)] max-w-[90%] rounded-2xl">
          <div className="flex items-center gap-2 mb-2 text-xs text-[var(--color-text-muted)]">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            阶段性理解
          </div>
          <p className="whitespace-pre-wrap text-sm leading-relaxed">{content}</p>
        </div>
      </div>
    );
  }

  // Profile messages
  if (displayStyle === 'profile') {
    return (
      <div className="flex justify-start mb-5 animate-fade-in-up">
        <div className="message-bubble bg-[var(--color-surface-elevated)] border border-[var(--color-border)] shadow-md max-w-[90%] rounded-2xl">
          <div className="flex items-center gap-2 mb-2 text-xs text-[var(--color-text-muted)]">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            画像
          </div>
          <p className="whitespace-pre-wrap text-sm leading-relaxed">{content}</p>
        </div>
      </div>
    );
  }

  // Default assistant message (question / reflection)
  return (
    <div className="flex justify-start mb-4 animate-fade-in-up">
      <div className="message-assistant">
        <p className="whitespace-pre-wrap text-sm leading-relaxed">{content}</p>
      </div>
    </div>
  );
}
