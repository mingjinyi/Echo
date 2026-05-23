import { useState, useMemo } from 'react';
import { useProfile } from '../hooks/useProfile';
import MemoryList from '../components/MemoryList';
import type { MemoryType, Confidence } from '../types';

export default function MemoryPage() {
  const { memories, loading, deleteMemory } = useProfile();
  const [typeFilter, setTypeFilter] = useState<MemoryType | 'all'>('all');
  const [confidenceFilter, setConfidenceFilter] = useState<Confidence | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredMemories = useMemo(() => {
    return memories.filter(m => {
      if (typeFilter !== 'all' && m.type !== typeFilter) return false;
      if (confidenceFilter !== 'all' && m.confidence !== confidenceFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const matchesContent = m.content.toLowerCase().includes(q);
        const matchesTags = m.tags.some(t => t.toLowerCase().includes(q));
        const matchesExcerpt = m.source?.excerpt?.toLowerCase().includes(q);
        if (!matchesContent && !matchesTags && !matchesExcerpt) return false;
      }
      return true;
    });
  }, [memories, typeFilter, confidenceFilter, searchQuery]);

  const types: Array<{ value: MemoryType | 'all'; label: string }> = [
    { value: 'all', label: '全部' },
    { value: 'long_term_trait', label: '长期特征' },
    { value: 'event', label: '重要事件' },
    { value: 'temporary_state', label: '临时状态' },
    { value: 'preference', label: '偏好' },
    { value: 'relationship', label: '关系' },
    { value: 'contradiction', label: '矛盾点' },
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 pt-4 space-y-5 animate-fade-in-up">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">记忆库</h2>
        <p className="text-sm text-[var(--color-text-muted)] mt-1">
          这里记录了对话中发现的重要信息。你可以查看、筛选和管理这些记忆。
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <svg
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="搜索记忆内容、标签..."
          className="input-field text-sm py-2.5 pl-10 pr-4"
        />
      </div>

      {/* Type filters */}
      <div className="flex gap-1.5 flex-wrap">
        {types.map(t => (
          <button
            key={t.value}
            onClick={() => setTypeFilter(t.value)}
            className={`text-xs px-3.5 py-1.5 rounded-full border transition-all duration-200 ${
              typeFilter === t.value
                ? 'bg-[var(--color-accent)] text-white border-[var(--color-accent)] shadow-sm'
                : 'bg-transparent text-[var(--color-text-secondary)] border-[var(--color-border)] hover:border-[var(--color-accent)] hover:text-[var(--color-text-primary)]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Confidence filters */}
      <div className="flex gap-2">
        {(['all', 'high', 'medium', 'low'] as const).map(c => (
          <button
            key={c}
            onClick={() => setConfidenceFilter(c)}
            className={`text-xs px-3 py-1.5 rounded-full border transition-all duration-200 ${
              confidenceFilter === c
                ? 'bg-[var(--color-accent)] text-white border-[var(--color-accent)] shadow-sm'
                : 'bg-transparent text-[var(--color-text-secondary)] border-[var(--color-border)] hover:border-[var(--color-accent)]'
            }`}
          >
            置信度: {c === 'all' ? '全部' : c === 'high' ? '高' : c === 'medium' ? '中' : '低'}
          </button>
        ))}
      </div>

      {/* Count */}
      <p className="text-xs text-[var(--color-text-muted)]">
        共 {filteredMemories.length} 条记忆
        {filteredMemories.length !== memories.length && ` / 共 ${memories.length} 条`}
      </p>

      {/* Memory list */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="card">
              <div className="skeleton h-4 w-24 mb-2" />
              <div className="skeleton h-3 w-full mb-1" />
              <div className="skeleton h-3 w-3/4" />
            </div>
          ))}
        </div>
      ) : (
        <MemoryList memories={filteredMemories} onDelete={deleteMemory} />
      )}
    </div>
  );
}
