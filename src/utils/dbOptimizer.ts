/**
 * Database Performance Optimizer
 */

import { supabase } from '../utils/supabase/client';

class DatabaseOptimizer {
  private queryCache = new Map<string, { data: any; timestamp: number; ttl: number }>();

  // Query with caching
  async cachedQuery(
    table: string,
    query: any,
    ttlMs: number = 300000 // 5 minutes default
  ): Promise<any> {
    const cacheKey = `${table}_${JSON.stringify(query)}`;
    const cached = this.queryCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.data;
    }

    const { data, error } = await supabase.from(table).select(query.select || '*');
    
    if (error) throw error;
    
    this.queryCache.set(cacheKey, {
      data,
      timestamp: Date.now(),
      ttl: ttlMs
    });
    
    return data;
  }

  // Batch operations
  async batchInsert(table: string, records: any[]): Promise<void> {
    const batchSize = 100;
    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);
      const { error } = await supabase.from(table).insert(batch);
      if (error) throw error;
    }
  }

  // Connection health check
  async healthCheck(): Promise<boolean> {
    try {
      const { error } = await supabase.from('profiles').select('id').limit(1);
      return !error;
    } catch {
      return false;
    }
  }

  // Clear cache
  clearCache(): void {
    this.queryCache.clear();
  }
}

export const dbOptimizer = new DatabaseOptimizer();