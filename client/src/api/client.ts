// In Capacitor (Android/iOS), use the Render cloud server.
const isCapacitor = !!(window as any).Capacitor;
const API_BASE = isCapacitor
  ? 'https://echo-p0on.onrender.com/api'
  : '/api';

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(error.error || `Request failed: ${res.status}`);
  }

  return res.json();
}

// Chat API
export const chatApi = {
  sendMessage: (userId: string, message: string, conversationId?: string) =>
    request<{
      message: import('../types').Message;
      conversationId: string;
      profileUpdated: boolean;
      phase: string;
    }>('/chat', {
      method: 'POST',
      body: JSON.stringify({ userId, message, conversationId }),
    }),

  getHistory: (userId: string, conversationId?: string) =>
    request<{ messages: import('../types').Message[] }>(
      `/chat/history?userId=${userId}${conversationId ? `&conversationId=${conversationId}` : ''}`
    ),

  getConversations: (userId: string) =>
    request<{ conversations: Array<{ id: string; startedAt: string; lastActivity: string; phase: string; messageCount: number; preview: string }> }>(
      `/chat/conversations?userId=${userId}`
    ),

  generateProfile: (userId: string) =>
    request<{ narrative: string; version: number; changes: string[] }>('/chat/profile', {
      method: 'POST',
      body: JSON.stringify({ userId }),
    }),

  resetChat: (userId: string, nickname?: string) =>
    request<{ success: boolean; userId: string }>('/chat/reset', {
      method: 'POST',
      body: JSON.stringify({ userId, nickname }),
    }),
};

// Profile API
export const profileApi = {
  getProfile: (userId: string) =>
    request<{
      profile: import('../types').UserProfile;
      latestNarrative: string | null;
      versionHistory: import('../types').ProfileVersion[];
    }>(`/profile/${userId}`),

  getSummary: (userId: string) =>
    request<{
      nickname: string;
      prominentTraits: Array<{ name: string; value: number; confidence: string }>;
      coreNarrative: string | null;
      contradictionsCount: number;
      relationshipCount: number;
      timelineEvents: number;
      latestVersion: number;
    }>(`/profile/${userId}/summary`),

  getDimension: (userId: string, dimension: string) =>
    request<{
      dimension: string;
      trait: import('../types').Trait;
      evidence: import('../types').Evidence[];
    }>(`/profile/${userId}/dimension/${dimension}`),

  updateProfile: (userId: string, updates: any) =>
    request<{ success: boolean; profile: import('../types').UserProfile }>(
      `/profile/${userId}`,
      { method: 'PUT', body: JSON.stringify(updates) }
    ),
};

// Memory API
export const memoryApi = {
  getMemories: (userId: string, filters?: { type?: string; confidence?: string; tag?: string }) => {
    const params = new URLSearchParams();
    if (filters?.type) params.set('type', filters.type);
    if (filters?.confidence) params.set('confidence', filters.confidence);
    if (filters?.tag) params.set('tag', filters.tag);
    const qs = params.toString();
    return request<{ memories: import('../types').MemoryEntry[]; total: number }>(
      `/memory/${userId}${qs ? `?${qs}` : ''}`
    );
  },

  addMemory: (userId: string, entry: any) =>
    request<{ memory: import('../types').MemoryEntry }>(`/memory/${userId}`, {
      method: 'POST',
      body: JSON.stringify(entry),
    }),

  updateMemory: (userId: string, memoryId: string, updates: any) =>
    request<{ memory: import('../types').MemoryEntry }>(
      `/memory/${userId}/${memoryId}`,
      { method: 'PUT', body: JSON.stringify(updates) }
    ),

  deleteMemory: (userId: string, memoryId: string) =>
    request<{ success: boolean }>(`/memory/${userId}/${memoryId}`, {
      method: 'DELETE',
    }),
};

// Settings API
export const settingsApi = {
  getSettings: () =>
    request<any>('/settings'),

  saveSettings: (settings: any, providerKeyOverrides?: Record<string, string>) =>
    request<any>('/settings', {
      method: 'PUT',
      body: JSON.stringify({ ...settings, _providerKeyOverrides: providerKeyOverrides }),
    }),

  testProvider: (provider: any) =>
    request<{ ok: boolean; message: string }>('/settings/test-provider', {
      method: 'POST',
      body: JSON.stringify({ provider }),
    }),

  resetSettings: () =>
    request<any>('/settings/reset', { method: 'POST' }),
};
