import { useEffect, useState } from 'react';
import { Trophy, Medal, Award, TrendingUp } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface RankingData {
  id: string;
  user_id: string;
  total_points: number;
  average_wpm: number;
  average_accuracy: number;
  rank_grade: string;
  rank_category: string;
  category_position: number;
  overall_position: number;
  theme: string;
  profiles: {
    full_name: string;
  };
}

interface LeaderboardProps {
  category?: 'all' | 'Beginner' | 'Intermediate' | 'Advanced';
}

const rankColors = {
  'S-Rank': 'from-purple-600 to-pink-600',
  'A-Rank': 'from-green-600 to-emerald-600',
  'B-Rank': 'from-blue-600 to-cyan-600',
  'C-Rank': 'from-orange-600 to-amber-600',
  'D-Rank': 'from-slate-600 to-gray-600'
};

export default function Leaderboard({ category = 'all' }: LeaderboardProps) {
  const [rankings, setRankings] = useState<RankingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(category);

  useEffect(() => {
    loadRankings();
  }, [selectedCategory]);

  const loadRankings = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('user_rankings')
        .select(`
          *,
          profiles!inner(full_name)
        `)
        .order('total_points', { ascending: false })
        .limit(50);

      if (selectedCategory !== 'all') {
        query = query.eq('rank_category', selectedCategory);
      }

      const { data, error } = await query;

      if (error) throw error;
      setRankings(data || []);
    } catch (error) {
      console.error('Error loading rankings:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPositionIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Trophy className="w-8 h-8 text-yellow-400" />;
      case 2:
        return <Medal className="w-8 h-8 text-slate-400" />;
      case 3:
        return <Award className="w-8 h-8 text-amber-600" />;
      default:
        return <div className="w-8 h-8 flex items-center justify-center font-bold text-slate-400">#{position}</div>;
    }
  };

  const getPositionBg = (position: number) => {
    switch (position) {
      case 1:
        return 'bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border-yellow-500/50';
      case 2:
        return 'bg-gradient-to-r from-slate-400/20 to-slate-500/20 border-slate-400/50';
      case 3:
        return 'bg-gradient-to-r from-amber-600/20 to-amber-700/20 border-amber-600/50';
      default:
        return 'bg-slate-700/50 border-slate-600/50';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-white flex items-center gap-3">
          <TrendingUp className="w-8 h-8 text-blue-500" />
          Leaderboard
        </h2>
        <div className="flex gap-2">
          {['all', 'Beginner', 'Intermediate', 'Advanced'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat as typeof selectedCategory)}
              className={`
                px-4 py-2 rounded-lg font-semibold transition-all
                ${selectedCategory === cat
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }
              `}
            >
              {cat === 'all' ? 'All' : cat}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {rankings.map((rank) => (
          <div
            key={rank.id}
            className={`
              ${getPositionBg(rank.category_position)}
              border-2 rounded-xl p-4
              transition-all duration-300 hover:scale-[1.02]
            `}
          >
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0">
                {getPositionIcon(rank.category_position)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-bold text-white truncate">
                    {rank.profiles.full_name}
                  </h3>
                  <span className={`
                    px-3 py-1 rounded-full text-sm font-bold text-white
                    bg-gradient-to-r ${rankColors[rank.rank_grade as keyof typeof rankColors]}
                  `}>
                    {rank.rank_grade}
                  </span>
                  <span className="px-3 py-1 rounded-full text-sm font-semibold bg-slate-600 text-slate-200">
                    {rank.rank_category}
                  </span>
                </div>
              </div>

              <div className="flex gap-6 text-center">
                <div>
                  <div className="text-2xl font-bold text-white">{rank.total_points}</div>
                  <div className="text-xs text-slate-400">Points</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-400">{Math.round(rank.average_wpm)}</div>
                  <div className="text-xs text-slate-400">WPM</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-400">{rank.average_accuracy.toFixed(1)}%</div>
                  <div className="text-xs text-slate-400">Accuracy</div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {rankings.length === 0 && (
          <div className="text-center py-12 text-slate-400">
            <Trophy className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg">No rankings available yet.</p>
            <p className="text-sm mt-2">Complete some lessons to appear on the leaderboard!</p>
          </div>
        )}
      </div>
    </div>
  );
}