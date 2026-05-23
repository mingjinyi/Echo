import { Router, Request, Response } from 'express';
import { processMessage, getConversationHistory, generateFullProfile } from '../agents/orchestrator';
import { loadProfile, initUser, loadConversations } from '../memory';

const router = Router();

// POST /api/chat - Send a message and get a response
router.post('/', async (req: Request, res: Response) => {
  try {
    const { userId, message, conversationId } = req.body;

    if (!userId || !message) {
      return res.status(400).json({ error: 'userId and message are required' });
    }

    const response = await processMessage({ userId, message, conversationId });
    return res.json(response);
  } catch (error: any) {
    console.error('Chat error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// GET /api/chat/history - Get conversation history
router.get('/history', (req: Request, res: Response) => {
  try {
    const { userId, conversationId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const messages = getConversationHistory(
      userId as string,
      conversationId as string | undefined
    );
    return res.json({ messages });
  } catch (error: any) {
    console.error('History error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// GET /api/chat/conversations - Get all conversations for a user
router.get('/conversations', (req: Request, res: Response) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const conversations = loadConversations(userId as string);
    // Return summaries without full messages
    const summaries = conversations.map(c => ({
      id: c.id,
      startedAt: c.startedAt,
      lastActivity: c.lastActivity,
      phase: c.phase,
      messageCount: c.messages.length,
      preview: c.messages.slice(-1)[0]?.content?.slice(0, 100) || '',
    }));
    return res.json({ conversations: summaries });
  } catch (error: any) {
    console.error('Conversations error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// POST /api/chat/profile - Request full profile generation
router.post('/profile', (req: Request, res: Response) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const result = generateFullProfile(userId);
    return res.json(result);
  } catch (error: any) {
    console.error('Profile generation error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// POST /api/chat/reset - Reset conversation (start fresh)
router.post('/reset', (req: Request, res: Response) => {
  try {
    const { userId, nickname } = req.body;
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const profile = initUser(userId, nickname || '');
    return res.json({ success: true, userId: profile.userId });
  } catch (error: any) {
    console.error('Reset error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

export default router;
