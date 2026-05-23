// ============================================================
// Echo (回声) - Shared Type Definitions
// ============================================================

// --------------- Basic Info ---------------
export interface BasicInfo {
  nickname: string;
  firstVisit: string;   // ISO timestamp
  lastActive: string;
  language: string;
  expressionStyle: string; // e.g. "简洁", "细腻", "幽默", "自省"
}

// --------------- Personality Traits ---------------
export type TraitValue = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
export type Confidence = 'high' | 'medium' | 'low';

export interface Trait {
  value: TraitValue;
  confidence: Confidence;
  evidence: string[];       // excerpts from conversations
  notes: string;            // inference reasoning
  lastUpdated: string;
}

export interface PersonalityDimensions {
  emotionalStability: Trait;
  socialEnergy: Trait;
  selfExpressionTendency: Trait;
  selfDisclosureTendency: Trait;
  dependencyIndependence: Trait;
  riskAversion: Trait;
  relationshipSensitivity: Trait;
  controlNeed: Trait;
  reflectionAbility: Trait;
  empathyTendency: Trait;
  actionPreference: Trait;
  decisionStyle: Trait;
}

// --------------- Narrative Dimensions ---------------
export interface NarrativeDimensions {
  coreNarrative: string;               // "我是什么样的人" 的核心句子
  selfExplanationPatterns: string[];   // 常见的自我解释方式
  defenseMechanisms: string[];         // 常见的防御方式
  topicShiftingPatterns: string[];     // 常见转移话题方式
  humorStyles: string[];               // 自嘲/幽默方式
  emotionalExpressionPatterns: string[];
}

// --------------- Relationship Map ---------------
export interface RelationPerson {
  id: string;
  label: string;           // e.g. "妈妈", "大学室友", "同事L"
  relationType: string;    // e.g. "家人", "朋友", "伴侣", "同事"
  significance: number;    // 0-10
  emotionalTone: string;   // e.g. "温暖但复杂", "疏远", "依赖"
  keyEvents: string[];
  userAttitude: string;    // 用户对这个人的情绪态度
  lastMentioned: string;
}

// --------------- Timeline ---------------
export interface TimelineEvent {
  id: string;
  phase: 'past' | 'recent' | 'present' | 'future';
  label: string;
  description: string;
  impact: number;          // 0-10
  year?: string;
  category: 'relationship' | 'career' | 'growth' | 'loss' | 'realization' | 'transition' | 'other';
}

// --------------- Contradictions ---------------
export interface Contradiction {
  id: string;
  statementA: string;      // what user says/thinks
  statementB: string;      // what user does/shows
  category: 'say_vs_do' | 'self_vs_other' | 'need_vs_avoid' | 'past_vs_present';
  resolution: string;      // analysis of the contradiction
  confidence: Confidence;
}

// --------------- Evidence ---------------
export interface Evidence {
  id: string;
  targetTrait: string;     // which trait/claim this supports
  conversationId: string;
  messageId: string;
  excerpt: string;
  inference: string;       // how this excerpt supports the claim
  timestamp: string;
}

// --------------- Memory ---------------
export type MemoryType =
  | 'long_term_trait'
  | 'event'
  | 'temporary_state'
  | 'preference'
  | 'relationship'
  | 'contradiction';

export interface MemoryEntry {
  id: string;
  type: MemoryType;
  content: string;
  confidence: Confidence;
  source: {
    conversationId: string;
    messageId: string;
    excerpt: string;
  };
  tags: string[];
  createdAt: string;
  updatedAt: string;
  needsReview: boolean;
}

// --------------- Profile Version ---------------
export interface ProfileVersion {
  version: number;
  generatedAt: string;
  conversationCount: number;
  majorChanges: string[];  // what changed since last version
  narrative: string;       // the full narrative text
  snapshot: UserProfile;   // full profile snapshot
}

// --------------- User Profile (complete) ---------------
export interface UserProfile {
  userId: string;
  basicInfo: BasicInfo;
  personalityDimensions: PersonalityDimensions;
  narrativeDimensions: NarrativeDimensions;
  relationshipMap: RelationPerson[];
  timeline: TimelineEvent[];
  contradictions: Contradiction[];
  evidenceSources: Evidence[];
  memories: MemoryEntry[];
  profileVersionHistory: ProfileVersion[];
  currentPhase: ConversationPhase;
  completedDimensions: string[];
  pendingDimensions: string[];
}

// --------------- Conversation ---------------
export type ConversationPhase =
  | 'greeting'
  | 'foundation'
  | 'initial_questions'
  | 'dynamic_followup'
  | 'mid_summary'
  | 'final_profile'
  | 'continuous_update';

export interface Message {
  id: string;
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp: string;
  metadata?: MessageMetadata;
}

export interface MessageMetadata {
  internalAnalysis?: InternalAnalysis;
  displayStyle?: 'question' | 'reflection' | 'summary' | 'profile' | 'system';
}

export interface InternalAnalysis {
  personalityInferences: PersonalityInference[];
  detectedContradictions: DetectedContradiction[];
  followUpSuggestions: FollowUpSuggestion[];
  riskFlags: RiskFlag[];
}

export interface PersonalityInference {
  dimension: string;
  direction: string;       // e.g. "偏高", "偏低", "矛盾"
  confidence: Confidence;
  evidence: string;
}

export interface DetectedContradiction {
  description: string;
  category: Contradiction['category'];
  confidence: Confidence;
}

export interface FollowUpSuggestion {
  topic: string;
  priority: number;        // 0-10
  reason: string;
  suggestedQuestion: string;
}

export interface RiskFlag {
  type: 'boundary' | 'distress' | 'avoidance' | 'over_disclosure';
  severity: 'low' | 'medium' | 'high';
  note: string;
}

// --------------- Conversation ---------------
export interface Conversation {
  id: string;
  userId: string;
  messages: Message[];
  startedAt: string;
  lastActivity: string;
  phase: ConversationPhase;
  questionIndex: number;              // which base question we're on
  foundationQuestionsAsked: string[]; // IDs of foundation questions already asked
}

// --------------- API Request/Response ---------------
export interface ChatRequest {
  userId: string;
  message: string;
  conversationId?: string;
}

export interface ChatResponse {
  message: Message;
  conversationId: string;
  profileUpdated: boolean;
  phase: ConversationPhase;
}

export interface ProfileResponse {
  profile: UserProfile;
  latestNarrative: string;
  versionHistory: ProfileVersion[];
}

export interface MemoryUpdateRequest {
  userId: string;
  memoryId: string;
  action: 'update' | 'delete' | 'add';
  data?: Partial<MemoryEntry>;
}

// --------------- Agent Interfaces ---------------
export interface AgentContext {
  userId: string;
  conversation: Conversation;
  profile: UserProfile;
}

export interface AgentResult<T = void> {
  success: boolean;
  data?: T;
  error?: string;
}

// --------------- Model & Settings ---------------
export type ModelProvider = 'anthropic' | 'openai' | 'deepseek' | 'custom';

export interface ProviderConfig {
  id: string;                    // unique key, e.g. "claude_opus", "gpt4o"
  label: string;                 // display name
  provider: ModelProvider;
  apiKey: string;
  model: string;                 // e.g. "claude-opus-4-7", "gpt-4o"
  baseUrl: string;               // API endpoint (auto-filled for known providers)
  enabled: boolean;
}

export interface AgentLlmConfig {
  enabled: boolean;              // false = use rule engine
  providerId: string;            // which ProviderConfig to use
  temperature: number;
  maxTokens: number;
  systemPrompt: string;          // agent-specific system prompt
}

export interface AppSettings {
  providers: ProviderConfig[];
  agents: {
    profiler: AgentLlmConfig;
    digging: AgentLlmConfig;
    narrative: AgentLlmConfig;
    interview: AgentLlmConfig;
    contradiction: AgentLlmConfig;
    safety: AgentLlmConfig;
  };
}

export const DEFAULT_PROVIDER_URLS: Record<ModelProvider, string> = {
  anthropic: 'https://api.anthropic.com/v1/messages',
  openai: 'https://api.openai.com/v1/chat/completions',
  deepseek: 'https://api.deepseek.com/v1/chat/completions',
  custom: '',
};

export function defaultAgentLlmConfig(): AgentLlmConfig {
  return {
    enabled: false,
    providerId: '',
    temperature: 0.7,
    maxTokens: 2000,
    systemPrompt: '',
  };
}

export function defaultSettings(): AppSettings {
  return {
    providers: [
      { id: 'claude_opus',    label: 'Claude Opus 4.7',        provider: 'anthropic', model: 'claude-opus-4-7',               baseUrl: 'https://api.anthropic.com/v1/messages',         apiKey: '', enabled: true },
      { id: 'claude_sonnet',  label: 'Claude Sonnet 4.6',      provider: 'anthropic', model: 'claude-sonnet-4-6',              baseUrl: 'https://api.anthropic.com/v1/messages',         apiKey: '', enabled: true },
      { id: 'claude_haiku',   label: 'Claude Haiku 4.5',       provider: 'anthropic', model: 'claude-haiku-4-5-20251001',      baseUrl: 'https://api.anthropic.com/v1/messages',         apiKey: '', enabled: true },
      { id: 'gpt4o',          label: 'GPT-4o',                  provider: 'openai',    model: 'gpt-4o',                         baseUrl: 'https://api.openai.com/v1/chat/completions',    apiKey: '', enabled: true },
      { id: 'deepseek',       label: 'DeepSeek',                provider: 'deepseek',  model: 'deepseek-chat',                  baseUrl: 'https://api.deepseek.com/v1/chat/completions',  apiKey: '', enabled: true },
    ],
    agents: {
      profiler: defaultAgentLlmConfig(),
      digging: defaultAgentLlmConfig(),
      narrative: { ...defaultAgentLlmConfig(), maxTokens: 3000 },
      interview: defaultAgentLlmConfig(),
      contradiction: defaultAgentLlmConfig(),
      safety: defaultAgentLlmConfig(),
    },
  };
}
