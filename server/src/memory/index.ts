import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import type {
  UserProfile,
  MemoryEntry,
  ProfileVersion,
  Evidence,
  Conversation,
  Confidence,
  MemoryType,
} from '@shared/types';

const DATA_DIR = path.join(__dirname, '..', 'data', 'users');

// Ensure data directory exists
function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function userPath(userId: string): string {
  return path.join(DATA_DIR, userId);
}

function profilePath(userId: string): string {
  return path.join(userPath(userId), 'profile.json');
}

function conversationsPath(userId: string): string {
  return path.join(userPath(userId), 'conversations.json');
}

function memoriesPath(userId: string): string {
  return path.join(userPath(userId), 'memories.json');
}

// --------------- User Management ---------------

export function userExists(userId: string): boolean {
  return fs.existsSync(profilePath(userId));
}

export function initUser(userId: string, nickname: string): UserProfile {
  ensureDir(userPath(userId));

  const profile: UserProfile = {
    userId,
    basicInfo: {
      nickname,
      firstVisit: new Date().toISOString(),
      lastActive: new Date().toISOString(),
      language: 'zh-CN',
      expressionStyle: '',
    },
    personalityDimensions: createEmptyDimensions(),
    narrativeDimensions: {
      coreNarrative: '',
      selfExplanationPatterns: [],
      defenseMechanisms: [],
      topicShiftingPatterns: [],
      humorStyles: [],
      emotionalExpressionPatterns: [],
    },
    relationshipMap: [],
    timeline: [],
    contradictions: [],
    evidenceSources: [],
    memories: [],
    profileVersionHistory: [],
    currentPhase: 'greeting',
    completedDimensions: [],
    pendingDimensions: getAllDimensionKeys(),
  };

  saveProfile(userId, profile);
  saveConversations(userId, []);
  saveMemories(userId, []);

  return profile;
}

export function loadProfile(userId: string): UserProfile | null {
  const p = profilePath(userId);
  if (!fs.existsSync(p)) return null;
  return JSON.parse(fs.readFileSync(p, 'utf-8'));
}

export function saveProfile(userId: string, profile: UserProfile) {
  ensureDir(userPath(userId));
  profile.basicInfo.lastActive = new Date().toISOString();
  fs.writeFileSync(profilePath(userId), JSON.stringify(profile, null, 2), 'utf-8');
}

// --------------- Conversation Management ---------------

export function loadConversations(userId: string): Conversation[] {
  const p = conversationsPath(userId);
  if (!fs.existsSync(p)) return [];
  return JSON.parse(fs.readFileSync(p, 'utf-8'));
}

export function saveConversations(userId: string, conversations: Conversation[]) {
  ensureDir(userPath(userId));
  fs.writeFileSync(conversationsPath(userId), JSON.stringify(conversations, null, 2), 'utf-8');
}

export function getOrCreateConversation(userId: string, conversationId?: string): Conversation {
  const conversations = loadConversations(userId);
  if (conversationId) {
    const existing = conversations.find(c => c.id === conversationId);
    if (existing) return existing;
  }

  const conv: Conversation = {
    id: uuidv4(),
    userId,
    messages: [],
    startedAt: new Date().toISOString(),
    lastActivity: new Date().toISOString(),
    phase: 'greeting',
    questionIndex: 0,
    foundationQuestionsAsked: [],
  };

  conversations.push(conv);
  saveConversations(userId, conversations);
  return conv;
}

export function updateConversation(userId: string, conversation: Conversation) {
  const conversations = loadConversations(userId);
  const idx = conversations.findIndex(c => c.id === conversation.id);
  if (idx >= 0) {
    conversations[idx] = conversation;
  } else {
    conversations.push(conversation);
  }
  saveConversations(userId, conversations);
}

// --------------- Memory Management ---------------

export function loadMemories(userId: string): MemoryEntry[] {
  const p = memoriesPath(userId);
  if (!fs.existsSync(p)) return [];
  return JSON.parse(fs.readFileSync(p, 'utf-8'));
}

export function saveMemories(userId: string, memories: MemoryEntry[]) {
  ensureDir(userPath(userId));
  fs.writeFileSync(memoriesPath(userId), JSON.stringify(memories, null, 2), 'utf-8');
}

export function addMemory(
  userId: string,
  entry: Omit<MemoryEntry, 'id' | 'createdAt' | 'updatedAt'>
): MemoryEntry {
  const memories = loadMemories(userId);
  const now = new Date().toISOString();
  const mem: MemoryEntry = {
    ...entry,
    id: uuidv4(),
    createdAt: now,
    updatedAt: now,
  };
  memories.push(mem);
  saveMemories(userId, memories);
  return mem;
}

export function updateMemory(
  userId: string,
  memoryId: string,
  updates: Partial<MemoryEntry>
): MemoryEntry | null {
  const memories = loadMemories(userId);
  const idx = memories.findIndex(m => m.id === memoryId);
  if (idx < 0) return null;
  memories[idx] = { ...memories[idx], ...updates, updatedAt: new Date().toISOString() };
  saveMemories(userId, memories);
  return memories[idx];
}

export function deleteMemory(userId: string, memoryId: string): boolean {
  const memories = loadMemories(userId);
  const filtered = memories.filter(m => m.id !== memoryId);
  if (filtered.length === memories.length) return false;
  saveMemories(userId, filtered);
  return true;
}

// --------------- Profile Versioning ---------------

export function saveProfileVersion(
  userId: string,
  narrative: string,
  majorChanges: string[]
): ProfileVersion {
  const profile = loadProfile(userId);
  if (!profile) throw new Error('User not found');

  const conversations = loadConversations(userId);
  const totalMessages = conversations.reduce((sum, c) => sum + c.messages.length, 0);

  const version: ProfileVersion = {
    version: profile.profileVersionHistory.length + 1,
    generatedAt: new Date().toISOString(),
    conversationCount: conversations.length,
    majorChanges,
    narrative,
    snapshot: JSON.parse(JSON.stringify(profile)),
  };

  profile.profileVersionHistory.push(version);
  saveProfile(userId, profile);
  return version;
}

// --------------- Evidence Tracking ---------------

export function addEvidence(
  userId: string,
  evidence: Omit<Evidence, 'id'>
): Evidence {
  const profile = loadProfile(userId);
  if (!profile) throw new Error('User not found');

  const ev: Evidence = {
    ...evidence,
    id: uuidv4(),
  };
  profile.evidenceSources.push(ev);
  saveProfile(userId, profile);
  return ev;
}

// --------------- Helpers ---------------

function createEmptyDimensions(): UserProfile['personalityDimensions'] {
  const emptyTrait = { value: 5 as const, confidence: 'low' as Confidence, evidence: [], notes: '', lastUpdated: '' };
  return {
    emotionalStability: { ...emptyTrait },
    socialEnergy: { ...emptyTrait },
    selfExpressionTendency: { ...emptyTrait },
    selfDisclosureTendency: { ...emptyTrait },
    dependencyIndependence: { ...emptyTrait },
    riskAversion: { ...emptyTrait },
    relationshipSensitivity: { ...emptyTrait },
    controlNeed: { ...emptyTrait },
    reflectionAbility: { ...emptyTrait },
    empathyTendency: { ...emptyTrait },
    actionPreference: { ...emptyTrait },
    decisionStyle: { ...emptyTrait },
  };
}

export function getAllDimensionKeys(): string[] {
  return Object.keys(createEmptyDimensions());
}
