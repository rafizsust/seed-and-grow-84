import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { getTopicsForModule } from '@/lib/ieltsTopics';

export type ModuleType = 'reading' | 'listening' | 'writing' | 'speaking';

interface TopicCompletionData {
  topic: string;
  completed_count: number;
}

interface SmartTopicCycleResult {
  /** The next topic that should be practiced (based on round-robin algorithm) */
  nextTopic: string | null;
  /** Current cycle count (minimum completions across all topics) */
  cycleCount: number;
  /** Map of topic -> completion count */
  completions: Record<string, number>;
  /** Whether data is loading */
  loading: boolean;
  /** Refresh completions from database */
  refetch: () => Promise<void>;
  /** Get display label with completion count */
  getTopicLabel: (topic: string) => string;
  /** Increment completion count for a topic (call after test completion) */
  incrementCompletion: (topic: string) => Promise<void>;
}

/**
 * Smart-Cycle Topic Rotation Hook
 * 
 * Implements a balanced round-robin system that:
 * 1. Tracks completion count for each topic per module
 * 2. Calculates the current cycle (min completions across all topics)
 * 3. Selects the next "due" topic (where usage == cycle_count)
 * 4. Respects manual selections (increments usage but doesn't reset loop)
 * 
 * @param module - The IELTS module (reading, listening, writing, speaking)
 * @param subtype - Optional subtype for writing/speaking (e.g., 'TASK_1', 'PART_1')
 */
export function useSmartTopicCycle(
  module: ModuleType,
  subtype?: string
): SmartTopicCycleResult {
  const { user } = useAuth();
  const [completions, setCompletions] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  // Get the list of all available topics for this module/subtype
  const allTopics = useMemo(() => {
    return [...getTopicsForModule(module, subtype)];
  }, [module, subtype]);

  // Fetch completions from database
  const fetchCompletions = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('ai_practice_topic_completions')
        .select('topic, completed_count')
        .eq('user_id', user.id)
        .eq('module', module);

      if (error) {
        console.error('Error fetching topic completions:', error);
        setLoading(false);
        return;
      }

      const counts: Record<string, number> = {};
      data?.forEach((row: TopicCompletionData) => {
        counts[row.topic] = row.completed_count;
      });
      setCompletions(counts);
    } catch (err) {
      console.error('Error fetching topic completions:', err);
    } finally {
      setLoading(false);
    }
  }, [user, module]);

  useEffect(() => {
    fetchCompletions();
  }, [fetchCompletions]);

  // Calculate current cycle count (minimum completions across all topics)
  const cycleCount = useMemo(() => {
    if (allTopics.length === 0) return 0;
    
    // Get completion counts for all topics (default to 0 if not in DB)
    const counts = allTopics.map(topic => completions[topic] || 0);
    return Math.min(...counts);
  }, [allTopics, completions]);

  // Find the next topic to practice using the Smart-Cycle algorithm
  const nextTopic = useMemo(() => {
    if (allTopics.length === 0) return null;

    // Iterate through topics in order
    for (const topic of allTopics) {
      const usageCount = completions[topic] || 0;
      
      // Select condition: usage == current_cycle_count
      if (usageCount === cycleCount) {
        return topic;
      }
      // Skip condition: usage > current_cycle_count (already practiced in this cycle)
    }

    // Fallback: if somehow all topics are ahead, return first topic
    // This shouldn't happen with correct logic, but provides safety
    return allTopics[0];
  }, [allTopics, completions, cycleCount]);

  // Increment completion count for a topic
  const incrementCompletion = useCallback(async (topic: string) => {
    if (!user) return;

    try {
      const { error } = await supabase.rpc('increment_topic_completion', {
        p_user_id: user.id,
        p_module: module,
        p_topic: topic,
      });

      if (error) {
        console.error('Error incrementing topic completion:', error);
        return;
      }

      // Update local state optimistically
      setCompletions(prev => ({
        ...prev,
        [topic]: (prev[topic] || 0) + 1,
      }));
    } catch (err) {
      console.error('Error incrementing topic completion:', err);
    }
  }, [user, module]);

  // Get display label with completion count
  const getTopicLabel = useCallback((topic: string): string => {
    const count = completions[topic];
    if (count && count > 0) {
      return `${topic} (${count} completed)`;
    }
    return topic;
  }, [completions]);

  return {
    nextTopic,
    cycleCount,
    completions,
    loading,
    refetch: fetchCompletions,
    getTopicLabel,
    incrementCompletion,
  };
}

export default useSmartTopicCycle;
