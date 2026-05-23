import { useState } from 'react';
import { useProfile } from '../hooks/useProfile';
import ProfileCard from '../components/ProfileCard';
import type { ProfileVersion } from '../types';

export default function ProfilePage() {
  const {
    narrative,
    versionHistory,
    summary,
    loading,
  } = useProfile();

  const [selectedVersion, setSelectedVersion] = useState<number | null>(null);

  const displayNarrative = selectedVersion && versionHistory
    ? versionHistory.find(v => v.version === selectedVersion)?.narrative || narrative
    : narrative;

  const displayVersion = selectedVersion || (versionHistory.length > 0 ? versionHistory.length : undefined);

  const displayGeneratedAt = selectedVersion && versionHistory
    ? versionHistory.find(v => v.version === selectedVersion)?.generatedAt
    : versionHistory[versionHistory.length - 1]?.generatedAt;

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 pt-16 text-center">
        <div className="skeleton h-48 w-full mb-4" />
        <div className="skeleton h-6 w-48 mx-auto" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 pt-4 space-y-8 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">人物画像</h2>
        {summary && (
          <span className="badge badge-primary">
            第 {summary.latestVersion || 0} 版
          </span>
        )}
      </div>

      {/* Main Profile */}
      <ProfileCard
        narrative={displayNarrative}
        traits={summary?.prominentTraits}
        version={displayVersion}
        generatedAt={displayGeneratedAt}
      />

      {/* Version history timeline */}
      {versionHistory.length > 0 && (
        <div className="card">
          <span className="section-title">画像版本历史</span>
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-[11px] top-2 bottom-2 w-px bg-[var(--color-border)]" />

            <div className="space-y-1">
              {[...versionHistory].reverse().map((version, idx) => (
                <button
                  key={version.version}
                  onClick={() =>
                    setSelectedVersion(
                      selectedVersion === version.version ? null : version.version
                    )
                  }
                  className={`w-full text-left p-4 pl-9 rounded-xl transition-all duration-200 relative ${
                    selectedVersion === version.version
                      ? 'bg-[rgba(123,147,176,0.08)]'
                      : 'hover:bg-[rgba(123,147,176,0.04)]'
                  }`}
                >
                  {/* Timeline dot */}
                  <div
                    className={`absolute left-[6px] top-[22px] w-[11px] h-[11px] rounded-full border-2 transition-all duration-200 ${
                      selectedVersion === version.version
                        ? 'bg-[var(--color-accent)] border-[var(--color-accent)]'
                        : 'bg-[var(--color-surface-elevated)] border-[var(--color-border)]'
                    }`}
                  />

                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-[var(--color-text-primary)]">
                      版本 {version.version}
                    </span>
                    <span className="text-xs text-[var(--color-text-muted)]">
                      {new Date(version.generatedAt).toLocaleDateString('zh-CN')}
                    </span>
                  </div>
                  {version.majorChanges.length > 0 && (
                    <div className="flex gap-1.5 flex-wrap mt-2">
                      {version.majorChanges.map((change: string, i: number) => (
                        <span
                          key={i}
                          className="text-xs px-2.5 py-1 rounded-full bg-[rgba(123,147,176,0.08)] text-[var(--color-text-secondary)]"
                        >
                          {change}
                        </span>
                      ))}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Quick stats */}
      {summary && (
        <div className="card">
          <span className="section-title">画像概览</span>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {[
              { value: summary.prominentTraits.length, label: '已确认特质', icon: '◆' },
              { value: summary.contradictionsCount, label: '发现矛盾', icon: '◇' },
              { value: summary.relationshipCount, label: '关系人物', icon: '○' },
              { value: summary.timelineEvents, label: '时间节点', icon: '→' },
              { value: summary.latestVersion, label: '画像版本', icon: '#' },
            ].map(({ value, label, icon }) => (
              <div key={label} className="p-3 rounded-xl bg-[rgba(123,147,176,0.04)] text-center hover:bg-[rgba(123,147,176,0.08)] transition-colors duration-200">
                <div className="text-xs text-[var(--color-text-muted)] mb-1">{icon}</div>
                <div className="text-2xl font-semibold text-[var(--color-text-primary)] tabular-nums">
                  {value}
                </div>
                <div className="text-xs text-[var(--color-text-muted)] mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
