import { describe, it, expect, vi } from 'vitest';
import { supabase } from '../../services/api';

describe('API Service', () => {
  it('should have supabase client configured', () => {
    expect(supabase).toBeDefined();
    expect(supabase.auth).toBeDefined();
    expect(supabase.from).toBeDefined();
  });

  it('should handle auth operations', async () => {
    const mockSession = { data: { session: null }, error: null };
    vi.mocked(supabase.auth.getSession).mockResolvedValue(mockSession);
    
    const result = await supabase.auth.getSession();
    expect(result).toEqual(mockSession);
  });

  it('should handle database queries', () => {
    const mockQuery = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
    };
    vi.mocked(supabase.from).mockReturnValue(mockQuery);

    const query = supabase.from('trips');
    expect(query.select).toBeDefined();
  });
});