import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface EntryItem {
  description: string;
  price: string;
}

export interface Entry {
  id: string;
  name: string;
  amount: string; // legacy column
  total?: string;
  items?: EntryItem[];
  date: string;
  raw_ocr_text: string | null;
  confidence: number | null;
  created_at: string;
}

export function useEntries() {
  return useQuery({
    queryKey: ['entries'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('entries')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Entry[];
    },
  });
}

export function useSaveEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (entry: {
      name: string;
      date: string;
      total?: string;
      items?: any[];
      raw_ocr_text?: string;
      confidence?: number;
    }) => {
      const { data, error } = await supabase.from('entries').insert(entry).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entries'] });
      toast.success('Entry saved successfully!');
    },
    onError: () => {
      toast.error('Failed to save entry');
    },
  });
}

export function useDeleteEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('entries').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entries'] });
      toast.success('Entry deleted');
    },
  });
}
