import fs from 'fs';
import path from 'path';
import type { AppSettings } from '../../shared/types';
import { defaultSettings } from '../../shared/types';

const SETTINGS_PATH = path.join(__dirname, 'data', 'settings.json');

// Memory cache — survives file loss on ephemeral storage (Render free tier)
let memoryCache: AppSettings | null = null;

function ensureDataDir() {
  const dir = path.join(__dirname, 'data');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

export function loadSettings(): AppSettings {
  // Return memory cache if available (takes priority over file)
  if (memoryCache) return memoryCache;

  ensureDataDir();
  try {
    if (fs.existsSync(SETTINGS_PATH)) {
      const raw = fs.readFileSync(SETTINGS_PATH, 'utf-8');
      const settings = JSON.parse(raw);
      if (settings.providers?.length > 0) {
        memoryCache = settings;
        return settings;
      }
    }
  } catch {
    // File corrupted or unreadable — fall through to defaults
  }

  const def = defaultSettings();
  memoryCache = def;
  return def;
}

export function saveSettings(settings: AppSettings) {
  memoryCache = settings; // Always update memory first
  ensureDataDir();
  try {
    fs.writeFileSync(SETTINGS_PATH, JSON.stringify(settings, null, 2), 'utf-8');
  } catch {
    // File write failed — settings are safe in memoryCache
  }
}

/** Restore settings from client-provided data (e.g. after Render restart) */
export function restoreSettings(settings: AppSettings) {
  memoryCache = settings;
  ensureDataDir();
  try {
    fs.writeFileSync(SETTINGS_PATH, JSON.stringify(settings, null, 2), 'utf-8');
  } catch {
    // At minimum, memory cache is restored
  }
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
