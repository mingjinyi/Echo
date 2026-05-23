import type { Trait } from '../types';

interface Props {
  narrative: string | null;
  traits?: Array<{ name: string; value: number; confidence: string }>;
  version?: number;
  generatedAt?: string;
}

const TRAIT_LABELS: Record<string, string> = {
  emotionalStability: '情绪稳定性',
  socialEnergy: '社交能量',
  selfExpressionTendency: '自我表达',
  selfDisclosureTendency: '自我表露',
  dependencyIndependence: '依赖-独立',
  riskAversion: '风险规避',
  relationshipSensitivity: '关系敏感度',
  controlNeed: '控制需求',
  reflectionAbility: '反思能力',
  empathyTendency: '共情倾向',
  actionPreference: '行动偏好',
  decisionStyle: '决策风格',
};

function confidenceColor(confidence: string) {
  if (confidence === 'high') return { bar: 'from-emerald-500 to-emerald-400', bg: 'bg-emerald-50 text-emerald-700' };
  if (confidence === 'medium') return { bar: 'from-amber-500 to-amber-400', bg: 'bg-amber-50 text-amber-700' };
  return { bar: 'from-stone-300 to-stone-200', bg: 'bg-stone-50 text-stone-600' };
}

function TraitBar({ name, value, confidence }: { name: string; value: number; confidence: string }) {
  const colors = confidenceColor(confidence);
  return (
    <div className="group">
      <div className="flex justify-between text-sm mb-1.5">
        <span className="text-[var(--color-text-secondary)] font-medium text-xs">
          {TRAIT_LABELS[name] || name}
        </span>
        <div className="flex items-center gap-2">
          <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${colors.bg}`}>
            {confidence === 'high' ? '高置信度' : confidence === 'medium' ? '中' : '低'}
          </span>
          <span className="text-xs text-[var(--color-text-muted)] tabular-nums w-6 text-right">
            {value}
          </span>
        </div>
      </div>
      <div className="w-full h-2 bg-[var(--color-border-light)] rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${colors.bar} transition-all duration-700 ease-out group-hover:brightness-110`}
          style={{ width: `${value * 10}%` }}
        />
      </div>
    </div>
  );
}

export default function ProfileCard({ narrative, traits, version, generatedAt }: Props) {
  if (!narrative && (!traits || traits.length === 0)) {
    return (
      <div className="card text-center py-16">
        <div className="w-14 h-14 rounded-full bg-[rgba(123,147,176,0.08)] flex items-center justify-center mx-auto mb-4">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="1.5" strokeLinecap="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
        </div>
        <p className="text-[var(--color-text-secondary)] font-medium">还没有生成画像</p>
        <p className="text-sm text-[var(--color-text-muted)] mt-2">先去聊一聊，让我慢慢了解你。</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Narrative */}
      {narrative && (
        <div className="card-elevated">
          <div className="flex items-center justify-between mb-5">
            <span className="section-title">人物画像</span>
            {version && (
              <span className="badge badge-primary">版本 {version}</span>
            )}
          </div>
          <div className="profile-narrative">
            {narrative.split('\n\n').map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
          {generatedAt && (
            <p className="text-xs text-[var(--color-text-muted)] mt-5 pt-4 border-t border-[var(--color-border-light)]">
              生成于 {new Date(generatedAt).toLocaleString('zh-CN')}
            </p>
          )}
        </div>
      )}

      {/* Traits */}
      {traits && traits.length > 0 && (
        <div className="card">
          <span className="section-title">人格维度</span>
          <div className="space-y-4">
            {traits.map(trait => (
              <TraitBar key={trait.name} {...trait} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
