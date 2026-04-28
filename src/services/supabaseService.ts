import { supabase } from '../lib/supabase.ts';

export const supabaseService = {
  async list<T>(table: string): Promise<T[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from(table)
      .select('*')
      .eq('userId', user.id);
    
    if (error) {
       // Silently handle table not found or other errors during migration
      console.error(`Error listing ${table}:`, error);
      return [];
    }
    return data as T[];
  },

  async get<T>(table: string, id: string): Promise<T | null> {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error(`Error getting ${table}:${id}:`, error);
      return null;
    }
    return data as T;
  },

  async create<T extends Record<string, any>>(table: string, data: T): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const id = (data as any).id || crypto.randomUUID();
    const { data: inserted, error } = await supabase
      .from(table)
      .insert([{
        ...data,
        id,
        userId: user.id,
        created_at: (data as any).created_at || new Date().toISOString()
      }])
      .select()
      .single();
    
    if (error) {
      console.error(`Error creating in ${table}:`, error);
      throw error;
    }
    return inserted.id;
  },

  async update<T>(table: string, id: string, data: Partial<T>): Promise<void> {
    const { error } = await supabase
      .from(table)
      .update({
        ...(data as any),
        updated_at: new Date().toISOString()
      })
      .eq('id', id);
    
    if (error) {
      console.error(`Error updating ${table}:${id}:`, error);
      throw error;
    }
  },

  async delete(table: string, id: string): Promise<void> {
    const { error } = await supabase
      .from(table)
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error(`Error deleting from ${table}:${id}:`, error);
      throw error;
    }
  },

  subscribe<T>(table: string, callback: (data: T[]) => void) {
    // Standard Supabase subscription pattern: initial fetch + realtime listen
    supabaseService.list<T>(table).then(callback);

    const channel = supabase
      .channel(`${table}_changes`)
      .on('postgres_changes', { event: '*', schema: 'public', table: table }, async () => {
        const data = await supabaseService.list<T>(table);
        callback(data);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }
};
