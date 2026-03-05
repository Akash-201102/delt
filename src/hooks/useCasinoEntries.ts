import { useMutation, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type CasinoEntry = Database['public']['Tables']['casino_entries']['Insert'];

export function useSaveCasinoEntry() {
  return useMutation({
    mutationFn: async (entry: Omit<CasinoEntry, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('casino_entries')
        .insert([entry])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      console.log('Casino entry saved successfully');
    },
    onError: (error) => {
      console.error('Failed to save casino entry:', error);
    },
  });
}

export function useCasinoEntries() {
  return useQuery({
    queryKey: ['casino_entries'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('casino_entries')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });
}

export function useDeleteCasinoEntry() {
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('casino_entries')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      console.log('Casino entry deleted successfully');
    },
    onError: (error) => {
      console.error('Failed to delete casino entry:', error);
    },
  });
}
