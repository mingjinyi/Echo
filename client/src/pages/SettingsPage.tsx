import { useState, useEffect } from 'react';
import { settingsApi } from '../api/client';

interface ModelOption {
  label: string;
  model: string;
  id: string;
}

interface ProviderType {
  provider: string;
  label: string;
  models: ModelOption[];
  baseUrl: string;
}

const PROVIDER_CATALOG: ProviderType[] = [
  {
    provider: 'anthropic',
    label: 'Anthropic',
    baseUrl: 'https://api.anthropic.com/v1/messages',
    models: [
      { id: 'claude_opus', label: 'Claude Opus 4.7', model: 'claude-opus-4-7' },
      { id: 'claude_sonnet', label: 'Claude Sonnet 4.6', model: 'claude-sonnet-4-6' },
      { id: 'claude_haiku', label: 'Claude Haiku 4.5', model: 'claude-haiku-4-5-20251001' },
    ],
  },
  {
    provider: 'openai',
    label: 'OpenAI',
    baseUrl: 'https://api.openai.com/v1/chat/completions',
    models: [
      { id: 'gpt4o', label: 'GPT-4o', model: 'gpt-4o' },
      { id: 'gpt4o_mini', label: 'GPT-4o Mini', model: 'gpt-4o-mini' },
    ],
  },
  {
    provider: 'deepseek',
    label: 'DeepSeek',
    baseUrl: 'https://api.deepseek.com/v1/chat/completions',
    models: [
      { id: 'deepseek', label: 'DeepSeek Chat', model: 'deepseek-chat' },
    ],
  },
  {
    provider: 'custom',
    label: '自定义',
    baseUrl: '',
    models: [
      { id: 'custom', label: '自定义', model: '' },
    ],
  },
];

const AGENT_NAMES: Record<string, string> = {
  profiler: 'Profiler · 画像推理',
  digging: 'Digging · 深度追问',
  narrative: 'Narrative · 叙事生成',
  interview: 'Interview · 对话管理',
  contradiction: 'Contradiction · 矛盾检测',
  safety: 'Safety · 安全语气',
};

const AGENT_DESCS: Record<string, string> = {
  profiler: '从用户回答中提取人格特征，更新12维度画像',
  digging: '识别值得追问的情绪点、矛盾点、转折点',
  narrative: '将结构化画像转写成文学化人物故事',
  interview: '管理对话节奏、提问顺序、语气风格',
  contradiction: '发现言行矛盾、需求与回避的冲突',
  safety: '过滤诊断术语、柔化绝对断言、控制共情浓度',
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [testingId, setTestingId] = useState<string | null>(null);

  // "Add provider" form state
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<ModelOption | null>(null);
  const [apiKeyInput, setApiKeyInput] = useState('');

  // Dark mode
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    loadSettings();
    setDarkMode(document.documentElement.classList.contains('dark'));
  }, []);

  const toggleDarkMode = () => {
    const next = !darkMode;
    setDarkMode(next);
    if (next) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('echo_dark_mode', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('echo_dark_mode', 'light');
    }
  };

  const loadSettings = async () => {
    try {
      setLoading(true);
      const s = await settingsApi.getSettings();

      // If server has no providers (Render restart wiped them), restore from localStorage
      if ((!s.providers || s.providers.length === 0 || !s.providers.some((p: any) => p.apiKey)) && localStorage.getItem('echo_settings')) {
        try {
          const cached = JSON.parse(localStorage.getItem('echo_settings')!);
          if (cached.providers?.some((p: any) => p.apiKey)) {
            await settingsApi.restoreSettings(cached);
            Object.assign(s, cached);
            setMessage('已从本地恢复配置');
            setTimeout(() => setMessage(''), 2000);
          }
        } catch { /* localStorage corrupted, use defaults */ }
      }

      if (!s.providers) s.providers = [];
      if (!s.agents) s.agents = {};
      for (const name of Object.keys(AGENT_NAMES)) {
        if (!s.agents[name]) {
          s.agents[name] = { enabled: false, providerId: '', temperature: 0.7, maxTokens: 2000, systemPrompt: '' };
        }
      }
      setSettings(s);
    } catch (e: any) {
      setMessage('加载失败: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const persistSettings = async (updated: any) => {
    try {
      await settingsApi.saveSettings(updated);
      localStorage.setItem('echo_settings', JSON.stringify(updated));
    } catch { /* server save failed, at least localStorage is set */ }
  };

  const handleSave = async () => {
    if (!settings) return;
    try {
      setSaving(true);
      setMessage('');
      await persistSettings(settings);
      setMessage('已保存');
      setTimeout(() => setMessage(''), 2000);
    } catch (e: any) {
      setMessage('保存失败: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleAddProvider = () => {
    if (!settings || !selectedModel || !apiKeyInput.trim()) {
      setMessage('请选择模型并输入 API Key');
      return;
    }
    const type = PROVIDER_CATALOG.find(t => t.provider === selectedType);
    if (!type) return;

    const existing = settings.providers.find((p: any) => p.id === selectedModel.id);
    if (existing) {
      existing.apiKey = apiKeyInput.trim();
      existing.enabled = true;
    } else {
      settings.providers.push({
        id: selectedModel.id,
        label: selectedModel.label,
        provider: type.provider,
        model: selectedModel.model || apiKeyInput.trim().slice(0, 8),
        baseUrl: type.baseUrl,
        apiKey: apiKeyInput.trim(),
        enabled: true,
      });
    }

    setSettings({ ...settings });
    setApiKeyInput('');
    setSelectedModel(null);
    setSelectedType('');
    setMessage('供应商已添加');
    setTimeout(() => setMessage(''), 2000);
  };

  const handleRemoveProvider = (providerId: string) => {
    if (!settings) return;
    const providers = settings.providers.filter((p: any) => p.id !== providerId);
    const agents = { ...settings.agents };
    for (const [name, cfg] of Object.entries<any>(agents)) {
      if (cfg.providerId === providerId) {
        agents[name] = { ...cfg, providerId: '' };
      }
    }
    setSettings({ ...settings, providers, agents });
  };

  const handleTest = async (provider: any) => {
    if (!provider.apiKey || provider.apiKey.startsWith('••••')) {
      setMessage('请先添加并填入 API Key');
      return;
    }
    setTestingId(provider.id);
    setMessage('');
    try {
      const r = await settingsApi.testProvider(provider);
      setMessage(r.ok ? `连接成功 — ${r.message}` : `连接失败 — ${r.message}`);
    } catch (e: any) {
      setMessage('测试失败: ' + e.message);
    } finally {
      setTestingId(null);
    }
  };

  const handleAgentToggle = (agentName: string) => {
    if (!settings) return;
    const agents = { ...settings.agents };
    agents[agentName] = { ...agents[agentName], enabled: !agents[agentName].enabled };
    const updated = { ...settings, agents };
    setSettings(updated);
    persistSettings(updated);
  };

  const handleAgentProvider = (agentName: string, providerId: string) => {
    if (!settings) return;
    const agents = { ...settings.agents };
    agents[agentName] = { ...agents[agentName], providerId };
    const updated = { ...settings, agents };
    setSettings(updated);
    persistSettings(updated);
  };

  const handleReset = async () => {
    if (!confirm('确定重置吗？所有 API Key 会被清除。')) return;
    try {
      await settingsApi.resetSettings();
      await loadSettings();
      setMessage('已重置');
    } catch (e: any) {
      setMessage('重置失败: ' + e.message);
    }
  };

  const activeProviders = settings?.providers?.filter((p: any) => p.apiKey && !p.apiKey.startsWith('••••')) || [];
  const selectedTypeInfo = PROVIDER_CATALOG.find(t => t.provider === selectedType);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 pt-16 space-y-4">
        <div className="skeleton h-8 w-48" />
        <div className="skeleton h-64 w-full" />
        <div className="skeleton h-48 w-full" />
      </div>
    );
  }
  if (!settings) {
    return <div className="max-w-3xl mx-auto px-4 pt-12 text-center text-[var(--color-text-muted)]">无法加载设置</div>;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 pt-4 pb-24 space-y-8 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">模型配置</h2>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">
            配置 AI 模型供应商和 API Key，启用 LLM 驱动的对话体验。
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleReset} className="text-xs text-[var(--color-text-muted)] hover:text-red-500 transition-colors px-2 py-1">重置</button>
          <button onClick={handleSave} disabled={saving} className="btn-primary text-sm">
            {saving ? '保存中...' : '保存'}
          </button>
        </div>
      </div>

      {message && (
        <div className={`text-sm px-4 py-3 rounded-xl animate-fade-in-down ${
          message.startsWith('连接失败') || message.startsWith('保存失败') || message.startsWith('测试失败') || message.startsWith('重置失败') || message.startsWith('加载失败')
            ? 'bg-red-950/30 text-red-300 border border-red-800/30'
            : 'bg-emerald-950/30 text-emerald-300 border border-emerald-800/30'
        }`}>
          {message}
        </div>
      )}

      {/* Dark mode toggle */}
      <div className="card flex items-center justify-between">
        <div>
          <span className="text-sm font-medium text-[var(--color-text-primary)]">深色模式</span>
          <p className="text-xs text-[var(--color-text-muted)] mt-0.5">切换应用的外观主题</p>
        </div>
        <div
          onClick={toggleDarkMode}
          className="flex items-center gap-2 cursor-pointer select-none"
        >
          <span className={`text-xs ${darkMode ? 'text-[var(--color-text-primary)] font-medium' : 'text-[var(--color-text-muted)]'}`}>
            {darkMode ? '暗色' : '亮色'}
          </span>
          <div className={`w-10 h-5 rounded-full transition-colors relative ${darkMode ? 'bg-[var(--color-accent)]' : 'bg-[var(--color-border)]'}`}>
            <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-transform shadow-sm ${darkMode ? 'translate-x-5' : 'translate-x-0.5'}`} />
          </div>
        </div>
      </div>

      {/* ===== Step 1: Add Provider ===== */}
      <div className="card">
        <div className="flex items-center gap-3 mb-5">
          <span className="w-7 h-7 rounded-full bg-[var(--color-accent)] text-white text-xs flex items-center justify-center font-medium">1</span>
          <span className="section-title mb-0">添加模型供应商</span>
        </div>

        {/* Platform selector */}
        <div className="flex gap-2 flex-wrap mb-4">
          {PROVIDER_CATALOG.map(t => (
            <button
              key={t.provider}
              onClick={() => {
                setSelectedType(t.provider);
                setApiKeyInput('');
                setSelectedModel(t.models.length === 1 ? t.models[0] : null);
              }}
              className={`text-sm px-4 py-2 rounded-xl border transition-all duration-200 ${
                selectedType === t.provider
                  ? 'border-[var(--color-accent)] bg-[rgba(91,158,216,0.1)] text-[var(--color-text-primary)] shadow-sm'
                  : 'border-[var(--color-border)] bg-[var(--color-surface-elevated)] text-[var(--color-text-secondary)] hover:border-[var(--color-accent)]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Model + API Key form */}
        {selectedTypeInfo && (
          <div className="p-4 border border-[var(--color-border)] rounded-xl space-y-3 bg-[var(--color-surface)]">
            {/* Model selection */}
            {selectedTypeInfo.models.length > 1 ? (
              <div className="flex gap-2 flex-wrap">
                {selectedTypeInfo.models.map(m => (
                  <button
                    key={m.id}
                    onClick={() => setSelectedModel(m)}
                    className={`text-sm px-3 py-1.5 rounded-lg border transition-all duration-200 ${
                      selectedModel?.id === m.id
                        ? 'border-[var(--color-accent)] bg-[rgba(91,158,216,0.1)] text-[var(--color-text-primary)]'
                        : 'border-[var(--color-border)] bg-white text-[var(--color-text-secondary)] hover:border-[var(--color-accent)]'
                    }`}
                  >
                    {m.label}
                    <span className="text-xs text-[var(--color-text-muted)] ml-1.5">{m.model}</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-sm text-[var(--color-text-primary)]">
                {selectedTypeInfo.provider === 'custom' ? (
                  <div className="space-y-3">
                    <input
                      value={selectedModel?.model || ''}
                      onChange={e => setSelectedModel({ id: 'custom', label: '自定义', model: e.target.value })}
                      placeholder="模型名（如 gpt-4o）"
                      className="input-field text-sm py-2"
                    />
                    <input
                      value={selectedModel ? (settings.providers.find((p: any) => p.id === 'custom')?.baseUrl || '') : ''}
                      onChange={e => {
                        const p = settings.providers.find((p: any) => p.id === 'custom');
                        if (p) p.baseUrl = e.target.value;
                        setSettings({ ...settings });
                      }}
                      placeholder="API Endpoint URL"
                      className="input-field text-sm py-2"
                    />
                  </div>
                ) : (
                  <p className="text-sm text-[var(--color-text-primary)] py-1 font-mono">{selectedTypeInfo.models[0].model}</p>
                )}
              </div>
            )}

            {/* API Key input */}
            {selectedModel && (
              <div className="flex gap-2">
                <input
                  type="password"
                  value={apiKeyInput}
                  onChange={e => setApiKeyInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddProvider()}
                  placeholder="粘贴 API Key..."
                  className="input-field text-sm py-2 flex-1 font-mono"
                />
                <button onClick={handleAddProvider} disabled={!apiKeyInput.trim()}
                  className="btn-primary text-sm whitespace-nowrap disabled:opacity-50">
                  添加
                </button>
              </div>
            )}
          </div>
        )}

        {/* Existing providers */}
        {settings.providers.length > 0 && (
          <div className="mt-5 space-y-2">
            <span className="text-xs font-medium text-[var(--color-text-muted)]">已添加的供应商</span>
            {settings.providers.map((p: any) => (
              <div key={p.id} className="flex items-center justify-between p-3.5 border border-[var(--color-border)] rounded-xl hover:border-[var(--color-accent)] transition-colors duration-200">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-sm font-medium text-[var(--color-text-primary)]">{p.label}</span>
                  <span className="text-[11px] text-[var(--color-text-muted)] bg-[rgba(91,158,216,0.08)] px-2 py-0.5 rounded font-mono">{p.model}</span>
                  <span className="text-xs text-[var(--color-text-muted)] truncate">{p.apiKey ? '••••已保存' : '(无 Key)'}</span>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => handleTest(p)}
                    disabled={testingId === p.id || !p.apiKey}
                    className="text-xs btn-secondary px-3 py-1 disabled:opacity-50">
                    {testingId === p.id ? '测试中...' : '测试'}
                  </button>
                  <button onClick={() => handleRemoveProvider(p.id)}
                    className="text-xs text-red-400 hover:text-red-600 px-2 py-1 transition-colors">
                    移除
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ===== Step 2: Agent Assignment ===== */}
      <div className="card">
        <div className="flex items-center gap-3 mb-5">
          <span className="w-7 h-7 rounded-full bg-[var(--color-accent)] text-white text-xs flex items-center justify-center font-medium">2</span>
          <span className="section-title mb-0">Agent 分配</span>
        </div>
        <p className="text-xs text-[var(--color-text-muted)] mb-4">
          选择哪些 Agent 使用 LLM。关闭的 Agent 使用内置规则引擎，不消耗 API。
          {activeProviders.length === 0 && <span className="text-amber-600 block mt-1">先在上方添加供应商并填入 Key 后才能分配。</span>}
        </p>

        {/* Quick-apply: one-click set all agents to use the same provider */}
        {activeProviders.length > 0 && (
          <div className="flex items-center gap-3 mb-4 p-3 border border-[var(--color-border)] rounded-xl bg-[rgba(91,158,216,0.04)]">
            <span className="text-xs text-[var(--color-text-muted)] whitespace-nowrap">一键设置全部:</span>
            <select
              id="bulkProvider"
              defaultValue=""
              className="text-xs border border-[var(--color-border)] rounded-lg px-2.5 py-1.5 bg-[var(--color-surface-elevated)] text-[var(--color-text-primary)] flex-1 focus:outline-none focus:border-[var(--color-accent)]"
            >
              <option value="" disabled>选择模型...</option>
              {activeProviders.map((ap: any) => (
                <option key={ap.id} value={ap.id}>{ap.label} ({ap.model})</option>
              ))}
            </select>
            <button
              onClick={async () => {
                const sel = (document.getElementById('bulkProvider') as HTMLSelectElement)?.value;
                if (!sel) return;
                const agents = { ...settings.agents };
                for (const name of Object.keys(agents)) {
                  agents[name] = { ...agents[name], enabled: true, providerId: sel };
                }
                const updated = { ...settings, agents };
                setSettings(updated);
                try {
                  await settingsApi.saveSettings(updated);
                  localStorage.setItem('echo_settings', JSON.stringify(updated));
                  setMessage('全部 Agent 已统一设置并保存');
                } catch {
                  setMessage('已设置（保存失败，请手动点保存）');
                }
                setTimeout(() => setMessage(''), 2000);
              }}
              className="text-xs btn-primary px-4 py-1.5 whitespace-nowrap"
            >
              应用全部
            </button>
          </div>
        )}

        <div className="space-y-2">
          {Object.entries(settings.agents).map(([agentName, cfg]: [string, any]) => (
            <div key={agentName} className={`border rounded-xl p-4 transition-all duration-200 ${cfg.enabled ? 'border-[var(--color-accent)] bg-[rgba(91,158,216,0.04)]' : 'border-[var(--color-border)]'}`}>
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0 mr-4">
                  <span className="text-sm font-medium text-[var(--color-text-primary)]">{AGENT_NAMES[agentName]}</span>
                  <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{AGENT_DESCS[agentName]}</p>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  {cfg.enabled && (
                    <select
                      value={cfg.providerId}
                      onChange={e => handleAgentProvider(agentName, e.target.value)}
                      className="text-xs border border-[var(--color-border)] rounded-lg px-2.5 py-1.5 bg-[var(--color-surface-elevated)] text-[var(--color-text-primary)] max-w-[150px] focus:outline-none focus:border-[var(--color-accent)]"
                    >
                      <option value="">选择模型...</option>
                      {activeProviders.map((ap: any) => (
                        <option key={ap.id} value={ap.id}>{ap.label} ({ap.model})</option>
                      ))}
                    </select>
                  )}

                  <div
                    onClick={() => handleAgentToggle(agentName)}
                    className="flex items-center gap-1.5 cursor-pointer select-none"
                  >
                    <span className={`text-xs font-medium ${cfg.enabled ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-muted)]'}`}>
                      {cfg.enabled ? 'ON' : 'OFF'}
                    </span>
                    <div className={`w-9 h-5 rounded-full transition-colors relative ${cfg.enabled ? 'bg-[var(--color-accent)]' : 'bg-[var(--color-border)]'}`}>
                      <div className={`w-3.5 h-3.5 bg-white rounded-full absolute top-0.5 transition-transform shadow-sm ${cfg.enabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <button onClick={handleSave} disabled={saving} className="btn-primary">
          {saving ? '保存中...' : '保存'}
        </button>
      </div>
    </div>
  );
}
