import { useState, useEffect, useCallback } from 'react';
import { profileApi, memoryApi } from '../api/client';
import type { UserProfile, ProfileVersion, Trait, Evidence, MemoryEntry } from '../types';

function getUserId(): string {
  return localStorage.getItem('echo_user_id') || '';
}

export function useProfile() {
  const userId = getUserId();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [narrative, setNarrative] = useState<string | null>(null);
  const [versionHistory, setVersionHistory] = useState<ProfileVersion[]>([]);
  const [summary, setSummary] = useState<{
    prominentTraits: Array<{ name: string; value: number; confidence: string }>;
    coreNarrative: string | null;
    contradictionsCount: number;
    relationshipCount: number;
    timelineEvents: number;
    latestVersion: number;
  } | null>(null);
  const [memories, setMemories] = useState<MemoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const [profileData, summaryData, memoryData] = await Promise.all([
        profileApi.getProfile(userId).catch(() => null),
        profileApi.getSummary(userId).catch(() => null),
        memoryApi.getMemories(userId).catch(() => ({ memories: [], total: 0 })),
      ]);

      if (profileData) {
        setProfile(profileData.profile);
        setNarrative(profileData.latestNarrative);
        setVersionHistory(profileData.versionHistory);
      }
      if (summaryData) {
        setSummary(summaryData);
      }
      setMemories(memoryData.memories);
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const deleteMemory = useCallback(async (memoryId: string) => {
    try {
      await memoryApi.deleteMemory(userId, memoryId);
      setMemories(prev => prev.filter(m => m.id !== memoryId));
    } catch (error) {
      console.error('Failed to delete memory:', error);
    }
  }, [userId]);

  return {
    userId,
    profile,
    narrative,
    versionHistory,
    summary,
    memories,
    loading,
    loadProfile,
    deleteMemory,
  };
}
