import { Router, Request, Response } from 'express';
import {
  loadMemories,
  addMemory,
  updateMemory,
  deleteMemory,
  loadProfile,
  saveProfile,
} from '../memory';
import type { MemoryEntry } from '@shared/types';

const router = Router();

// GET /api/memory/:userId - Get all memories
router.get('/:userId', (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { type, confidence, tag } = req.query;

    let memories = loadMemories(userId);

    // Filter by type
    if (type && typeof type === 'string') {
      memories = memories.filter(m => m.type === type);
    }

    // Filter by confidence
    if (confidence && typeof confidence === 'string') {
      memories = memories.filter(m => m.confidence === confidence);
    }

    // Filter by tag
    if (tag && typeof tag === 'string') {
      memories = memories.filter(m => m.tags.includes(tag));
    }

    return res.json({ memories, total: memories.length });
  } catch (error: any) {
    console.error('Memory fetch error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// POST /api/memory/:userId - Add a memory
router.post('/:userId', (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const entry = req.body;

    if (!entry.content || !entry.type) {
      return res.status(400).json({ error: 'content and type are required' });
    }

    const memory = addMemory(userId, entry);
    return res.json({ memory });
  } catch (error: any) {
    console.error('Memory add error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// PUT /api/memory/:userId/:memoryId - Update a memory
router.put('/:userId/:memoryId', (req: Request, res: Response) => {
  try {
    const { userId, memoryId } = req.params;
    const updates = req.body;

    const memory = updateMemory(userId, memoryId, updates);
    if (!memory) {
      return res.status(404).json({ error: 'Memory not found' });
    }

    return res.json({ memory });
  } catch (error: any) {
    console.error('Memory update error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// DELETE /api/memory/:userId/:memoryId - Delete a memory
router.delete('/:userId/:memoryId', (req: Request, res: Response) => {
  try {
    const { userId, memoryId } = req.params;

    const success = deleteMemory(userId, memoryId);
    if (!success) {
      return res.status(404).json({ error: 'Memory not found' });
    }

    return res.json({ success: true });
  } catch (error: any) {
    console.error('Memory delete error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// POST /api/memory/:userId/merge - Suggest merging similar memories
router.post('/:userId/merge', (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { memoryIds } = req.body;

    if (!memoryIds || !Array.isArray(memoryIds) || memoryIds.length < 2) {
      return res.status(400).json({ error: 'At least 2 memoryIds are required' });
    }

    const memories = loadMemories(userId);
    const toMerge = memories.filter(m => memoryIds.includes(m.id));

    if (toMerge.length < 2) {
      return res.status(404).json({ error: 'Memories not found' });
    }

    // Create merged memory
    const mergedContent = toMerge.map(m => m.content).join(' | ');
    const mergedTags = [...new Set(toMerge.flatMap(m => m.tags))];
    const highestConfidence = toMerge.reduce((best, m) =>
      confidenceOrder(m.confidence) > confidenceOrder(best.confidence) ? m : best
    );

    // Delete originals
    for (const m of toMerge) {
      deleteMemory(userId, m.id);
    }

    // Add merged
    const merged = addMemory(userId, {
      type: highestConfidence.type,
      content: mergedContent,
      confidence: highestConfidence.confidence,
      source: highestConfidence.source,
      tags: mergedTags,
      needsReview: false,
    });

    return res.json({ merged });
  } catch (error: any) {
    console.error('Memory merge error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

function confidenceOrder(c: string): number {
  return c === 'high' ? 3 : c === 'medium' ? 2 : 1;
}

export default router;
