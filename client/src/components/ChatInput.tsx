import { useState, useRef, useEffect, KeyboardEvent } from 'react';

interface Props {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export default function ChatInput({ onSend, disabled, placeholder }: Props) {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setInput('');
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex items-end gap-3 bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-2xl p-3 shadow-md transition-all duration-300 focus-within:shadow-lg focus-within:border-[var(--color-accent)]">
      <textarea
        ref={textareaRef}
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder || '输入你的回答... (Enter 发送，Shift+Enter 换行)'}
        disabled={disabled}
        rows={1}
        className="flex-1 resize-none bg-transparent text-sm leading-relaxed max-h-[120px]
                   placeholder:text-[var(--color-text-muted)] text-[var(--color-text-primary)]
                   focus:outline-none"
      />
      <button
        onClick={handleSend}
        disabled={disabled || !input.trim()}
        className="btn-primary text-sm px-4 py-2 flex-shrink-0"
      >
        发送
      </button>
    </div>
  );
}
