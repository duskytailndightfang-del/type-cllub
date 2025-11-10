import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export type Theme = 'standard' | 'gold' | 'silver' | 'bronze';

interface ThemeConfig {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  card: string;
  text: string;
}

const themeConfigs: Record<Theme, ThemeConfig> = {
  standard: {
    primary: 'bg-blue-600 hover:bg-blue-700',
    secondary: 'bg-slate-700 hover:bg-slate-600',
    accent: 'text-blue-500',
    background: 'bg-slate-900',
    card: 'bg-slate-800 border-slate-700',
    text: 'text-white'
  },
  gold: {
    primary: 'bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700',
    secondary: 'bg-gradient-to-r from-yellow-700 to-yellow-800 hover:from-yellow-600 hover:to-yellow-700',
    accent: 'text-yellow-400',
    background: 'bg-gradient-to-br from-slate-900 via-yellow-900/20 to-slate-900',
    card: 'bg-gradient-to-br from-slate-800 to-yellow-900/30 border-yellow-600/50',
    text: 'text-yellow-50'
  },
  silver: {
    primary: 'bg-gradient-to-r from-slate-400 to-slate-500 hover:from-slate-500 hover:to-slate-600',
    secondary: 'bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-500 hover:to-slate-600',
    accent: 'text-slate-300',
    background: 'bg-gradient-to-br from-slate-900 via-slate-700/20 to-slate-900',
    card: 'bg-gradient-to-br from-slate-800 to-slate-700/30 border-slate-400/50',
    text: 'text-slate-50'
  },
  bronze: {
    primary: 'bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800',
    secondary: 'bg-gradient-to-r from-amber-800 to-amber-900 hover:from-amber-700 hover:to-amber-800',
    accent: 'text-amber-400',
    background: 'bg-gradient-to-br from-slate-900 via-amber-900/20 to-slate-900',
    card: 'bg-gradient-to-br from-slate-800 to-amber-900/30 border-amber-600/50',
    text: 'text-amber-50'
  }
};

export function useTheme(userId: string | undefined) {
  const [theme, setTheme] = useState<Theme>('standard');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setTheme('standard');
      setLoading(false);
      return;
    }

    loadUserTheme();
  }, [userId]);

  const loadUserTheme = async () => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from('user_rankings')
        .select('theme')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;

      if (data?.theme) {
        setTheme(data.theme as Theme);
      }
    } catch (error) {
      console.error('Error loading theme:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    theme,
    themeConfig: themeConfigs[theme],
    loading
  };
}