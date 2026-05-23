import type { MemoryEntry } from '../types';

interface Props {
  memories: MemoryEntry[];
  onDelete?: (id: string) => void;
}

const TYPE_LABELS: Record<string, string> = {
  long_term_trait: '长期特征',
  event: '重要事件',
  temporary_state: '临时状态',
  preference: '偏好',
  relationship: '关系',
  contradiction: '矛盾点',
};

const TYPE_ICONS: Record<string, string> = {
  long_term_trait: '◆',
  event: '○',
  temporary_state: '◇',
  preference: '☆',
  relationship: '◎',
  contradiction: '△',
};

const CONFIDENCE_STYLES: Record<string, string> = {
  high: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  medium: 'bg-amber-50 text-amber-700 border-amber-200',
  low: 'bg-stone-50 text-stone-500 border-stone-200',
};

export default function MemoryList({ memories, onDelete }: Props) {
  if (memories.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-14 h-14 rounded-full bg-[rgba(123,147,176,0.06)] flex items-center justify-center mx-auto mb-4">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="1.5" strokeLinecap="round">
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
        </div>
        <p className="text-[var(--color-text-secondary)] font-medium">还没有存储的记忆</p>
        <p className="text-sm text-[var(--color-text-muted)] mt-2">随着对话深入，重要的发现会出现在这里。</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {memories.map(mem => (
        <div key={mem.id} className="card hover:shadow-md transition-all duration-200">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              {/* Badges row */}
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-[rgba(123,147,176,0.08)] text-[var(--color-text-secondary)] border border-[var(--color-border-light)]">
                  <span>{TYPE_ICONS[mem.type] || '·'}</span>
                  {TYPE_LABELS[mem.type] || mem.type}
                </span>
                <span className={`inline-flex items-center text-xs px-2 py-0.5 rounded-full border ${CONFIDENCE_STYLES[mem.confidence]}`}>
                  {mem.confidence === 'high' ? '高置信度' : mem.confidence === 'medium' ? '中置信度' : '低置信度'}
                </span>
                {mem.needsReview && (
                  <span className="inline-flex items-center text-xs px-2 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-200">
                    待复核
                  </span>
                )}
              </div>

              {/* Content */}
              <p className="text-sm text-[var(--color-text-primary)] leading-relaxed">{mem.content}</p>

              {/* Source excerpt */}
              {mem.source?.excerpt && (
                <div className="mt-3 pl-3 border-l-2 border-[var(--color-border)]">
                  <p className="text-xs text-[var(--color-text-muted)] italic leading-relaxed">
                    "{mem.source.excerpt.slice(0, 120)}{mem.source.excerpt.length > 120 ? '...' : ''}"
                  </p>
                </div>
              )}

              {/* Footer: tags + date */}
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-[var(--color-border-light)]">
                <div className="flex items-center gap-2 flex-wrap">
                  {mem.tags.map((tag: string) => (
                    <span key={tag} className="text-xs text-[var(--color-text-muted)]">#{tag}</span>
                  ))}
                </div>
                <span className="text-xs text-[var(--color-text-muted)]">
                  {new Date(mem.createdAt).toLocaleDateString('zh-CN')}
                </span>
              </div>
            </div>

            {onDelete && (
              <button
                onClick={() => onDelete(mem.id)}
                className="text-xs text-[var(--color-text-muted)] hover:text-red-500 transition-colors flex-shrink-0 p-1"
              >
                删除
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
