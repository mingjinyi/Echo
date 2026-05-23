import type {
  ChatRequest,
  ChatResponse,
  Message,
  InternalAnalysis,
  UserProfile,
  Conversation,
  Confidence,
} from '../../../shared/types';
import { v4 as uuidv4 } from 'uuid';

import {
  loadProfile,
  initUser,
  saveProfile,
  getOrCreateConversation,
  updateConversation,
  addMemory,
  addEvidence,
} from '../memory';

import { analyzeResponse, extractNarrativePatterns, extractRelationships, extractTimelineEvents } from './profiler-agent';
import { analyzeForDigging } from './digging-agent';
import { detectContradictions, mergeContradictions } from './contradiction-agent';
import { generateNarrative } from './narrative-agent';
import { sanitizeOutput, detectUserDiscomfort, generateComfortResponse } from './safety-tone-agent';
import {
  generateGreeting,
  generateTransition,
  generateMidSummary,
  generateNextQuestion,
  shouldGenerateProfile,
  determinePhase,
  buildChatMessage,
  getFoundationContext,
} from './interview-agent';
import { getNextFoundationQuestion } from '../data/questions/base-questions';
import {
  llmProfiler,
  llmDigging,
  llmNarrative,
  llmInterview,
  llmContradiction,
  llmSafety,
} from './llm-agent-calls';

/**
 * Main orchestrator: coordinates all 6 agents through the conversation pipeline.
 *
 * Pipeline per user message:
 * 1. Parse & safety check user input
 * 2. Profiler Agent: analyze response → update dimensions
 * 3. Digging Agent: identify follow-up signals
 * 4. Contradiction Agent: detect contradictions
 * 5. Memory Layer: write new findings
 * 6. Interview Agent: decide what to say next
 * 7. Safety & Tone Agent: sanitize output
 * 8. Return response to user
 */
export async function processMessage(request: ChatRequest): Promise<ChatResponse> {
  const { userId, message: userMessage, conversationId } = request;

  // Load or init user
  let profile = loadProfile(userId);
  if (!profile) {
    profile = initUser(userId, '');
  }

  // Get or create conversation
  const conversation = getOrCreateConversation(userId, conversationId);

  // Add user message to conversation
  const userMsg: Message = {
    id: uuidv4(),
    role: 'user',
    content: userMessage,
    timestamp: new Date().toISOString(),
  };
  conversation.messages.push(userMsg);
  conversation.lastActivity = new Date().toISOString();

  // --- Step 1: Check user discomfort ---
  const discomfort = detectUserDiscomfort(userMessage);
  if (discomfort.uncomfortable && discomfort.severity !== 'low') {
    const comfortMsg = generateComfortResponse(discomfort.severity);
    const assistantMsg = buildChatMessage(comfortMsg, 'system');
    conversation.messages.push(assistantMsg);
    updateConversation(userId, conversation);
    return {
      message: assistantMsg,
      conversationId: conversation.id,
      profileUpdated: false,
      phase: conversation.phase,
    };
  }

  // --- Step 2: Profiler Agent (LLM first, fallback to rules) ---
  let profileUpdates = await llmProfiler(userMessage, profile.personalityDimensions);
  const usedLlmProfiler = profileUpdates !== null;
  if (!profileUpdates) {
    profileUpdates = analyzeResponse(userMessage, profile.personalityDimensions);
  }
  const narrativePatterns = extractNarrativePatterns(userMessage);
  const relationships = extractRelationships(userMessage);

  // Apply profile updates
  for (const update of profileUpdates) {
    const dim = update.dimension as keyof typeof profile.personalityDimensions;

    // Deduplicate evidence — skip if this excerpt already exists for this trait
    const existingEvidence = profile.personalityDimensions[dim].evidence;
    const isDuplicate = existingEvidence.some(e => e === update.evidence);

    profile.personalityDimensions[dim] = {
      value: update.newValue as any,
      confidence: (update.confidence as Confidence) || 'low',
      evidence: isDuplicate ? existingEvidence : [...existingEvidence, update.evidence],
      notes: profile.personalityDimensions[dim].notes,
      lastUpdated: new Date().toISOString(),
    };

    // Track evidence — skip if the same excerpt+trait already recorded
    if (!isDuplicate) {
      addEvidence(userId, {
        targetTrait: update.dimension,
        conversationId: conversation.id,
        messageId: userMsg.id,
        excerpt: userMessage.slice(0, 150),
        inference: update.evidence,
        timestamp: new Date().toISOString(),
      });
    }
  }

  // Update pending/completed dimensions
  profile.completedDimensions = profileUpdates
    .filter(u => u.confidence !== 'low')
    .map(u => u.dimension);
  profile.pendingDimensions = profile.pendingDimensions.filter(
    d => !profile.completedDimensions.includes(d as any)
  );

  // Update narrative dimensions
  if (narrativePatterns.selfExplanations.length > 0) {
    profile.narrativeDimensions.selfExplanationPatterns = [
      ...new Set([
        ...profile.narrativeDimensions.selfExplanationPatterns,
        ...narrativePatterns.selfExplanations,
      ]),
    ];
  }
  if (narrativePatterns.defenseMechanisms.length > 0) {
    profile.narrativeDimensions.defenseMechanisms = [
      ...new Set([
        ...profile.narrativeDimensions.defenseMechanisms,
        ...narrativePatterns.defenseMechanisms,
      ]),
    ];
  }
  if (narrativePatterns.emotionalPatterns.length > 0) {
    profile.narrativeDimensions.emotionalExpressionPatterns = [
      ...new Set([
        ...profile.narrativeDimensions.emotionalExpressionPatterns,
        ...narrativePatterns.emotionalPatterns,
      ]),
    ];
  }
  if (narrativePatterns.humorStyles.length > 0) {
    profile.narrativeDimensions.humorStyles = [
      ...new Set([...profile.narrativeDimensions.humorStyles, ...narrativePatterns.humorStyles]),
    ];
  }

  // Update relationship map
  for (const rel of relationships) {
    const existing = profile.relationshipMap.find(
      r => r.label === rel.label && r.relationType === rel.relationType
    );
    if (!existing) {
      // Significance based on: emotional weight (tone) + mention count
      let sig = 4; // base significance for first mention
      if (rel.emotionalTone === '复杂/负面') sig += 2;
      if (rel.emotionalTone === '温暖' || rel.emotionalTone === '感恩') sig += 1;
      profile.relationshipMap.push({
        id: uuidv4(),
        label: rel.label,
        relationType: rel.relationType,
        significance: Math.min(10, sig),
        emotionalTone: rel.emotionalTone,
        keyEvents: [],
        userAttitude: '',
        lastMentioned: new Date().toISOString(),
      });
    } else {
      existing.lastMentioned = new Date().toISOString();
      existing.emotionalTone = rel.emotionalTone || existing.emotionalTone;
      // Increase significance on repeated mentions (capped at 10)
      existing.significance = Math.min(10, existing.significance + 1);
    }
  }

  // Extract timeline events from the user's message
  const timelineEvents = extractTimelineEvents(userMessage, conversation.messages.length);
  for (const event of timelineEvents) {
    const existing = profile.timeline.find(
      t => t.label === event.label && t.phase === event.phase
    );
    if (!existing) {
      profile.timeline.push(event);
    }
  }

  // --- Step 3: Digging Agent (LLM first, fallback to rules) ---
  const historyMessages = conversation.messages
    .filter(m => m.role === 'user')
    .slice(-5)
    .map(m => m.content);
  let followUpSuggestions = await llmDigging(userMessage, historyMessages);
  if (!followUpSuggestions) {
    followUpSuggestions = analyzeForDigging(userMessage, historyMessages, {
      completedDimensions: profile.completedDimensions,
      pendingDimensions: profile.pendingDimensions,
    });
  }

  // --- Step 4: Contradiction Agent (LLM first, fallback to rules) ---
  let newContradictions = await llmContradiction(userMessage, profile);
  if (newContradictions === null) {
    newContradictions = detectContradictions(userMessage, profile);
  }
  profile.contradictions = mergeContradictions(profile.contradictions, newContradictions);

  // --- Step 5: Memory Layer ---
  // Store significant findings as memories
  if (profileUpdates.length > 0) {
    for (const update of profileUpdates.slice(0, 3)) {
      addMemory(userId, {
        type: 'long_term_trait',
        content: `${update.dimension}: ${update.newValue}/10 (${update.direction})`,
        confidence: (update.confidence as Confidence) || 'low',
        source: {
          conversationId: conversation.id,
          messageId: userMsg.id,
          excerpt: userMessage.slice(0, 200),
        },
        tags: ['trait_update', update.dimension],
        needsReview: update.confidence === 'low',
      });
    }
  }

  if (newContradictions.length > 0) {
    for (const c of newContradictions) {
      addMemory(userId, {
        type: 'contradiction',
        content: `${c.statementA} ↔ ${c.statementB}: ${c.resolution}`,
        confidence: c.confidence,
        source: {
          conversationId: conversation.id,
          messageId: userMsg.id,
          excerpt: userMessage.slice(0, 200),
        },
        tags: ['contradiction', c.category],
        needsReview: c.confidence === 'low',
      });
    }
  }

  if (narrativePatterns.defenseMechanisms.length > 0) {
    addMemory(userId, {
      type: 'temporary_state',
      content: `防御方式: ${narrativePatterns.defenseMechanisms.join('、')}`,
      confidence: 'medium',
      source: {
        conversationId: conversation.id,
        messageId: userMsg.id,
        excerpt: userMessage.slice(0, 200),
      },
      tags: ['defense', 'narrative'],
      needsReview: false,
    });
  }

  // --- Step 6: Internal Analysis (for system records) ---
  const internalAnalysis: InternalAnalysis = {
    personalityInferences: profileUpdates.map(u => ({
      dimension: u.dimension,
      direction: u.direction === 'increased' ? '偏高' : u.direction === 'decreased' ? '偏低' : '不变',
      confidence: (u.confidence as Confidence) || 'low',
      evidence: u.evidence,
    })),
    detectedContradictions: newContradictions.map(c => ({
      description: `${c.statementA} vs ${c.statementB}`,
      category: c.category,
      confidence: (c.confidence as Confidence) || 'medium',
    })),
    followUpSuggestions,
    riskFlags: discomfort.uncomfortable ? [{
      type: 'avoidance' as const,
      severity: discomfort.severity,
      note: discomfort.reason,
    }] : [],
  };

  // --- Step 7: Determine phase & generate response ---
  profile.currentPhase = determinePhase(profile, conversation);
  conversation.phase = profile.currentPhase;

  let responseContent: string;
  let displayStyle: NonNullable<Message['metadata']>['displayStyle'] = 'question';

  // Build conversation context for LLM interview agent
  const convHistory = conversation.messages
    .filter(m => m.role === 'user' || m.role === 'assistant')
    .slice(-6)
    .map(m => `${m.role === 'user' ? '用户' : '回声'}: ${m.content}`)
    .join('\n');
  const profileSummary = `${profile.completedDimensions.length}/${profile.pendingDimensions.length + profile.completedDimensions.length} 维度已覆盖`;

  // Check if we should offer the profile
  if (profile.currentPhase === 'final_profile') {
    // Try LLM narrative first
    const llmNarr = await llmNarrative(profile);
    const narrative = llmNarr || generateNarrative(profile);
    responseContent = `谢谢你跟我聊了这么多。\n\n我觉得现在可以试着为你写一份画像了。不过，我还想确认一下——你愿意现在看到它吗？还是想再聊一会儿？`;
    displayStyle = 'profile';
  } else if (conversation.phase === 'foundation') {
    // FOUNDATION PHASE: always use structured questions, even if LLM is configured.
    // This ensures every user gets consistent baseline coverage.
    const nextFnd = getNextFoundationQuestion(conversation.foundationQuestionsAsked || []);
    if (nextFnd) {
      const askedCount = (conversation.foundationQuestionsAsked || []).length;
      const totalCount = 8;
      if (askedCount === 0 && conversation.messages.filter(m => m.role === 'user').length === 1) {
        // First exchange: greeting + first foundation question
        const greeting = generateGreeting(profile);
        responseContent = `${greeting}\n\n那么，先问一个简单的问题：\n\n${nextFnd.text}`;
        displayStyle = 'system';
      } else if (askedCount === 0) {
        responseContent = nextFnd.text;
      } else {
        responseContent = generateNextQuestion(profile, conversation, followUpSuggestions);
      }
      // Track this foundation question as asked
      if (!conversation.foundationQuestionsAsked) {
        conversation.foundationQuestionsAsked = [];
      }
      conversation.foundationQuestionsAsked.push(nextFnd.id);
    } else {
      // Foundation complete but phase didn't update — force transition
      profile.currentPhase = 'dynamic_followup';
      conversation.phase = 'dynamic_followup';
      responseContent = '好的，这些基本的问题我大概都问到了。现在我们可以更自由地聊聊——你有什么想跟我说的吗？或者我们也可以继续深入刚才聊过的某个话题。';
      displayStyle = 'system';
    }
  } else {
    // POST-FOUNDATION: Try LLM interview agent for natural conversation
    const foundationCtx = getFoundationContext(conversation);
    const llmResp = await llmInterview(convHistory, profileSummary, profile.currentPhase, foundationCtx);
    if (llmResp) {
      responseContent = llmResp;
      displayStyle = 'question';
    } else if (conversation.messages.filter(m => m.role === 'user').length === 1 && conversation.questionIndex === 0) {
      // First exchange fallback
      const greeting = generateGreeting(profile);
      const firstQ = generateNextQuestion(profile, conversation, followUpSuggestions);
      responseContent = `${greeting}\n\n那么，先问一个简单的问题：\n\n${firstQ}`;
      displayStyle = 'system';
    } else if (conversation.questionIndex > 0 && conversation.questionIndex % 4 === 0) {
      const summary = generateMidSummary(profile);
      responseContent = summary;
      displayStyle = 'summary';
    } else {
      const transition = generateTransition(profile, conversation);
      const nextQ = generateNextQuestion(profile, conversation, followUpSuggestions);
      responseContent = `${transition}\n\n${nextQ}`;
    }
  }

  // --- Step 8: Safety & Tone Agent (LLM first, fallback to rules) ---
  const llmSafe = await llmSafety(responseContent);
  if (llmSafe) {
    responseContent = llmSafe;
  } else {
    const safetyCheck = sanitizeOutput(responseContent);
    if (!safetyCheck.passed) {
      responseContent = safetyCheck.sanitized;
    }
  }

  // Build assistant message
  const assistantMsg = buildChatMessage(responseContent, displayStyle);
  assistantMsg.metadata = {
    ...assistantMsg.metadata,
    internalAnalysis,
  };

  conversation.messages.push(assistantMsg);
  conversation.questionIndex++;

  // Save everything
  saveProfile(userId, profile);
  updateConversation(userId, conversation);

  const profileUpdated = profileUpdates.length > 0 || newContradictions.length > 0;

  return {
    message: assistantMsg,
    conversationId: conversation.id,
    profileUpdated,
    phase: profile.currentPhase,
  };
}

/**
 * Generate a full profile narrative for the user
 */
export function generateFullProfile(userId: string): {
  narrative: string;
  version: number;
  changes: string[];
} {
  const profile = loadProfile(userId);
  if (!profile) throw new Error('User not found');

  const narrative = generateNarrative(profile);

  // Determine what changed
  const prevVersion = profile.profileVersionHistory.slice(-1)[0];
  const changes: string[] = [];
  if (prevVersion) {
    changes.push('新增了人格维度数据');
    if (profile.contradictions.length > (prevVersion.snapshot.contradictions?.length || 0)) {
      changes.push('发现了新的矛盾点');
    }
    if (profile.relationshipMap.length > (prevVersion.snapshot.relationshipMap?.length || 0)) {
      changes.push('更新了人际关系图谱');
    }
  } else {
    changes.push('首次生成完整画像');
  }

  // Save version
  const { saveProfileVersion } = require('../memory');
  const version = saveProfileVersion(userId, narrative, changes);

  return { narrative, version: version.version, changes };
}

/**
 * Get conversation history formatted for the client
 */
export function getConversationHistory(userId: string, conversationId?: string): Message[] {
  const { loadConversations } = require('../memory');
  const conversations = loadConversations(userId);

  if (conversationId) {
    const conv = conversations.find((c: Conversation) => c.id === conversationId);
    return conv?.messages || [];
  }

  // Return the most recent conversation
  const sorted = conversations.sort(
    (a: Conversation, b: Conversation) =>
      new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime()
  );
  return sorted[0]?.messages || [];
}
