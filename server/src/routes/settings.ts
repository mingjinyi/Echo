import { Router, Request, Response } from 'express';
import { loadSettings, saveSettings } from '../settings';
import { testConnection } from '../services/llm';
import type { AppSettings } from '@shared/types';

const router = Router();

// GET /api/settings — get all settings
router.get('/', (_req: Request, res: Response) => {
  try {
    const settings = loadSettings();
    // Mask API keys for security
    const masked = {
      ...settings,
      providers: settings.providers.map((p: any) => ({
        ...p,
        apiKey: p.apiKey ? `••••${p.apiKey.slice(-4)}` : '',
      })),
    };
    res.json(masked);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// PUT /api/settings — save full settings
router.put('/', (req: Request, res: Response) => {
  try {
    const incoming = req.body as AppSettings & { _providerKeyOverrides?: Record<string, string> };

    // Merge in unmasked API keys from existing settings
    const existing = loadSettings();
    const keyOverrides = incoming._providerKeyOverrides || {};

    const merged: AppSettings = {
      ...incoming,
      providers: incoming.providers.map((p: any) => {
        // If user sent a new full key, use it
        if (keyOverrides[p.id]) {
          return { ...p, apiKey: keyOverrides[p.id] };
        }
        // If the key looks masked, keep the existing key
        if (p.apiKey && p.apiKey.startsWith('••••')) {
          const existingProvider = existing.providers.find((ep: any) => ep.id === p.id);
          return { ...p, apiKey: existingProvider?.apiKey || '' };
        }
        return p;
      }),
    };

    saveSettings(merged);

    // Return masked version
    const masked = {
      ...merged,
      providers: merged.providers.map((p: any) => ({
        ...p,
        apiKey: p.apiKey ? `••••${p.apiKey.slice(-4)}` : '',
      })),
    };
    res.json(masked);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/settings/test-provider — test a provider connection
router.post('/test-provider', async (req: Request, res: Response) => {
  try {
    const { provider } = req.body;
    if (!provider) {
      return res.status(400).json({ error: 'provider config required' });
    }

    const result = await testConnection(provider);
    res.json(result);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/settings/reset — reset to defaults
router.post('/reset', (_req: Request, res: Response) => {
  try {
    const { defaultSettings } = require('../../shared/types');
    const def = defaultSettings();
    saveSettings(def);
    res.json(def);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
