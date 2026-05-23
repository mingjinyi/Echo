import { Router, Request, Response } from 'express';
import { loadProfile, saveProfile, saveProfileVersion } from '../memory';
import { generateNarrative } from '../agents/narrative-agent';
import type { UserProfile, MemoryEntry } from '@shared/types';

const router = Router();

// GET /api/profile/:userId - Get full profile
router.get('/:userId', (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const profile = loadProfile(userId);

    if (!profile) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Generate latest narrative
    const narrative = profile.profileVersionHistory.length > 0
      ? profile.profileVersionHistory[profile.profileVersionHistory.length - 1].narrative
      : null;

    return res.json({
      profile,
      latestNarrative: narrative,
      versionHistory: profile.profileVersionHistory,
    });
  } catch (error: any) {
    console.error('Profile error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// GET /api/profile/:userId/summary - Get concise profile summary
router.get('/:userId/summary', (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const profile = loadProfile(userId);

    if (!profile) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Build a concise summary
    const dims = profile.personalityDimensions;
    const highConfidenceTraits = Object.entries(dims)
      .filter(([_, t]) => t.confidence !== 'low')
      .map(([key, t]) => ({
        name: traitDisplayName(key),
        value: t.value,
        confidence: t.confidence,
      }))
      .sort((a, b) => Math.abs(b.value - 5) - Math.abs(a.value - 5));

    const summary = {
      nickname: profile.basicInfo.nickname,
      firstVisit: profile.basicInfo.firstVisit,
      lastActive: profile.basicInfo.lastActive,
      conversationCount: profile.profileVersionHistory.length,
      prominentTraits: highConfidenceTraits.slice(0, 5),
      coreNarrative: profile.narrativeDimensions.coreNarrative || null,
      contradictionsCount: profile.contradictions.length,
      relationshipCount: profile.relationshipMap.length,
      timelineEvents: profile.timeline.length,
      latestVersion: profile.profileVersionHistory.length,
    };

    return res.json(summary);
  } catch (error: any) {
    console.error('Profile summary error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// GET /api/profile/:userId/dimension/:dimension - Get a single dimension detail
router.get('/:userId/dimension/:dimension', (req: Request, res: Response) => {
  try {
    const { userId, dimension } = req.params;
    const profile = loadProfile(userId);

    if (!profile) {
      return res.status(404).json({ error: 'User not found' });
    }

    const dim = profile.personalityDimensions[dimension as keyof typeof profile.personalityDimensions];
    if (!dim) {
      return res.status(404).json({ error: 'Dimension not found' });
    }

    const relatedEvidence = profile.evidenceSources.filter(e => e.targetTrait === dimension);

    return res.json({
      dimension,
      trait: dim,
      evidence: relatedEvidence,
    });
  } catch (error: any) {
    console.error('Dimension error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// PUT /api/profile/:userId - Update profile (user edits)
router.put('/:userId', (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const updates = req.body;
    const profile = loadProfile(userId);

    if (!profile) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Apply allowed updates
    if (updates.basicInfo) {
      profile.basicInfo = { ...profile.basicInfo, ...updates.basicInfo };
    }
    if (updates.narrativeDimensions) {
      profile.narrativeDimensions = { ...profile.narrativeDimensions, ...updates.narrativeDimensions };
    }

    saveProfile(userId, profile);
    return res.json({ success: true, profile });
  } catch (error: any) {
    console.error('Profile update error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

function traitDisplayName(key: string): string {
  const names: Record<string, string> = {
    emotionalStability: '情绪稳定性',
    socialEnergy: '社交能量',
    selfExpressionTendency: '表达倾向',
    selfDisclosureTendency: '自我暴露',
    dependencyIndependence: '依赖与独立',
    riskAversion: '风险规避',
    relationshipSensitivity: '关系敏感度',
    controlNeed: '掌控感需求',
    reflectionAbility: '反思能力',
    empathyTendency: '共情倾向',
    actionPreference: '行动偏好',
    decisionStyle: '决策风格',
  };
  return names[key] || key;
}

export default router;
