import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Trophy, Medal, Award, TrendingUp } from 'lucide-react';

interface LeaderboardEntry {
  id: string;
  full_name: string;
  level: string;
  total_points: number;
  rank_grade: string;
  rank_position: number;
  completed_classes: number;
  avg_wpm: number;
  avg_accuracy: number;
  total_time_minutes: number;
}

const getRankBadgeColor = (grade: string) => {
  switch (grade) {
    case 'S':
      return 'from-purple-500 to-pink-500';
    case 'A':
      return 'from-blue-500 to-cyan-500';
    case 'B':
      return 'from-green-500 to-emerald-500';
    case 'C':
      return 'from-yellow-500 to-orange-500';
    case 'D':
      return 'from-gray-500 to-slate-500';
    default:
      return 'from-gray-400 to-gray-500';
  }
};

const getPositionBadge = (position: number) => {
  switch (position) {
    case 1:
      return {
        icon: <Trophy className="w-6 h-6" />,
        color: 'from-yellow-400 to-yellow-600',
        text: 'text-yellow-600',
        title: 'Gold'
      };
    case 2:
      return {
        icon: <Medal className="w-6 h-6" />,
        color: 'from-gray-300 to-gray-400',
        text: 'text-gray-600',
        title: 'Silver'
      };
    case 3:
      return {
        icon: <Award className="w-6 h-6" />,
        color: 'from-orange-400 to-orange-600',
        text: 'text-orange-600',
        title: 'Bronze'
      };
    default:
      return null;
  }
};

export const Leaderboard: React.FC = () => {
  const [leaderboard, setLeaderboard] = useState<Record<string, LeaderboardEntry[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      await supabase.rpc('update_student_rankings');

      const { data, error } = await supabase
        .from('leaderboard')
        .select('*');

      if (error) throw error;

      const groupedByLevel = (data || []).reduce((acc, entry) => {
        const level = entry.level || 'unassigned';
        if (!acc[level]) acc[level] = [];
        acc[level].push(entry);
        return acc;
      }, {} as Record<string, LeaderboardEntry[]>);

      setLeaderboard(groupedByLevel);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3 mb-6">
        <TrendingUp className="w-8 h-8 text-blue-600" />
        <h2 className="text-3xl font-bold text-gray-900">Leaderboard</h2>
      </div>

      {Object.keys(leaderboard).length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl shadow-lg">
          <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No rankings available yet</p>
          <p className="text-gray-400 text-sm mt-2">Complete lessons to see your ranking</p>
        </div>
      ) : (
        Object.entries(leaderboard).map(([level, entries]) => (
          <div key={level} className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
              <h3 className="text-xl font-bold text-white capitalize">{level} Level</h3>
            </div>

            <div className="divide-y divide-gray-100">
              {entries.map((entry, index) => {
                const positionBadge = getPositionBadge(entry.rank_position);

                return (
                  <div
                    key={entry.id}
                    className={`p-6 transition-all hover:bg-gray-50 ${
                      positionBadge ? 'bg-gradient-to-r from-yellow-50/30 to-transparent' : ''
                    }`}
                  >
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="relative">
                          {positionBadge ? (
                            <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${positionBadge.color} flex items-center justify-center text-white shadow-lg`}>
                              {positionBadge.icon}
                            </div>
                          ) : (
                            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold text-xl">
                              #{entry.rank_position}
                            </div>
                          )}
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <h4 className="text-lg font-bold text-gray-900">{entry.full_name}</h4>
                            {positionBadge && (
                              <span className={`px-3 py-1 rounded-full text-xs font-bold ${positionBadge.text} bg-white border-2 border-current`}>
                                {positionBadge.title}
                              </span>
                            )}
                            <span className={`px-3 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r ${getRankBadgeColor(entry.rank_grade)}`}>
                              {entry.rank_grade}-Rank
                            </span>
                          </div>

                          <div className="flex items-center gap-6 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Trophy className="w-4 h-4" />
                              <span className="font-semibold text-blue-600">{entry.total_points}</span> points
                            </div>
                            <div>
                              <span className="font-semibold">{entry.completed_classes}</span> lessons
                            </div>
                            <div>
                              <span className="font-semibold">{entry.avg_wpm}</span> WPM avg
                            </div>
                            <div>
                              <span className="font-semibold">{entry.avg_accuracy}%</span> accuracy
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))
      )}
    </div>
  );
};
