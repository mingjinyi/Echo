import fs from 'fs';
import path from 'path';
import type { AppSettings } from '../../shared/types';
import { defaultSettings } from '../../shared/types';

const SETTINGS_PATH = path.join(__dirname, 'data', 'settings.json');

function ensureDataDir() {
  const dir = path.join(__dirname, 'data');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

export function loadSettings(): AppSettings {
  ensureDataDir();
  if (!fs.existsSync(SETTINGS_PATH)) {
    const def = defaultSettings();
    saveSettings(def);
    return def;
  }
  const raw = fs.readFileSync(SETTINGS_PATH, 'utf-8');
  return JSON.parse(raw);
}

export function saveSettings(settings: AppSettings) {
  ensureDataDir();
  fs.writeFileSync(SETTINGS_PATH, JSON.stringify(settings, null, 2), 'utf-8');
}

/** Get the effective LLM config for an agent: returns null if rule engine should be used */
export function getAgentLlmConfig(
  settings: AppSettings,
  agentName: keyof AppSettings['agents']
): { agentCfg: typeof settings.agents[typeof agentName]; providerCfg: typeof settings.providers[0] } | null {
  const agentCfg = settings.agents[agentName];
  if (!agentCfg.enabled) return null;

  const providerCfg = settings.providers.find((p: typeof settings.providers[0]) => p.id === agentCfg.providerId && p.enabled);
  if (!providerCfg || !providerCfg.apiKey) return null;

  return { agentCfg, providerCfg };
}
