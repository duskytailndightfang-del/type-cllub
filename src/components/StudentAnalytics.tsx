import React from 'react';
import { X, Trophy, Target, Clock, TrendingUp, Award, Zap } from 'lucide-react';
import { SpeedoMeter } from './SpeedoMeter';

interface UserRanking {
  user_id: string;
  total_score: number;
  rank_level: string;
  proficiency_level: string;
  total_lessons_completed: number;
  total_time_spent: number;
  average_accuracy: number;
  average_wpm: number;
  leaderboard_position: number;
  theme: string;
}

interface Profile {
  id: string;
  full_name: string;
  email: string;
  level?: string;
  status: string;
}

interface StudentAnalyticsProps {
  user: Profile;
  ranking?: UserRanking;
  onClose: () => void;
}

export const StudentAnalytics: React.FC<StudentAnalyticsProps> = ({ user, ranking, onClose }) => {
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const getRankColor = (rank: string) => {
    const colors: Record<string, string> = {
      'S': '#eab308',
      'A': '#10b981',
      'B': '#3b82f6',
      'C': '#f59e0b',
      'D': '#6b7280',
    };
    return colors[rank] || colors['D'];
  };

  const getProficiencyColor = (level: string) => {
    const colors: Record<string, string> = {
      'Advanced': '#10b981',
      'Intermediate': '#3b82f6',
      'Beginner': '#f59e0b',
    };
    return colors[level] || '#6b7280';
  };

  if (!ranking) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Student Analytics</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-gray-500" />
            </button>
          </div>
          <div className="text-center py-12">
            <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No ranking data available for {user.full_name}</p>
            <p className="text-sm text-gray-400 mt-2">User hasn't completed any lessons yet.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full p-8 my-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Target className="w-8 h-8" style={{ color: '#531B93' }} />
              Student Performance Analytics
            </h2>
            <p className="text-gray-600 mt-1">{user.full_name} - {user.email}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border-2 border-purple-200">
            <div className="flex items-center gap-3 mb-4">
              <Trophy className="w-8 h-8 text-yellow-600" />
              <div>
                <div className="text-sm text-gray-600">Current Rank</div>
                <div className="text-4xl font-bold" style={{ color: getRankColor(ranking.rank_level) }}>
                  {ranking.rank_level}
                </div>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Proficiency</span>
                <span className="font-semibold" style={{ color: getProficiencyColor(ranking.proficiency_level) }}>
                  {ranking.proficiency_level}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Leaderboard Position</span>
                <span className="font-bold text-purple-600">#{ranking.leaderboard_position}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Score</span>
                <span className="font-bold text-purple-600">{ranking.total_score} pts</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border-2 border-blue-200">
            <div className="flex items-center gap-3 mb-4">
              <Award className="w-8 h-8 text-blue-600" />
              <div>
                <div className="text-sm text-gray-600">Progress Overview</div>
                <div className="text-2xl font-bold text-gray-900">Learning Stats</div>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Lessons Completed</span>
                <span className="font-bold text-blue-600">{ranking.total_lessons_completed}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Practice Time</span>
                <span className="font-bold text-blue-600">{formatTime(ranking.total_time_spent)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Assessment Level</span>
                <span className="font-bold text-blue-600 capitalize">{user.level || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-8 border-2 border-gray-200">
          <div className="flex items-center gap-3 mb-8">
            <Zap className="w-8 h-8 text-orange-600" />
            <h3 className="text-2xl font-bold text-gray-900">Performance Metrics</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <SpeedoMeter
              value={Math.round(ranking.average_wpm)}
              maxValue={100}
              label="Words Per Minute"
              color="#3b82f6"
              unit=" WPM"
            />

            <SpeedoMeter
              value={Math.round(ranking.average_accuracy)}
              maxValue={100}
              label="Accuracy"
              color="#10b981"
              unit="%"
            />

            <SpeedoMeter
              value={ranking.total_score}
              maxValue={1000}
              label="Total Score"
              color="#531B93"
              unit=" pts"
            />
          </div>
        </div>

        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-4 border-2 border-gray-200 text-center">
            <Clock className="w-6 h-6 text-green-600 mx-auto mb-2" />
            <div className="text-xs text-gray-600">Avg. Time/Lesson</div>
            <div className="text-lg font-bold text-gray-900">
              {ranking.total_lessons_completed > 0
                ? Math.round(ranking.total_time_spent / ranking.total_lessons_completed / 60)
                : 0}m
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 border-2 border-gray-200 text-center">
            <TrendingUp className="w-6 h-6 text-orange-600 mx-auto mb-2" />
            <div className="text-xs text-gray-600">Completion Rate</div>
            <div className="text-lg font-bold text-gray-900">
              {ranking.total_lessons_completed > 0 ? '100' : '0'}%
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 border-2 border-gray-200 text-center">
            <Target className="w-6 h-6 text-purple-600 mx-auto mb-2" />
            <div className="text-xs text-gray-600">Avg. Score/Lesson</div>
            <div className="text-lg font-bold text-gray-900">
              {ranking.total_lessons_completed > 0
                ? Math.round(ranking.total_score / ranking.total_lessons_completed)
                : 0}
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 border-2 border-gray-200 text-center">
            <Trophy className="w-6 h-6 text-yellow-600 mx-auto mb-2" />
            <div className="text-xs text-gray-600">Next Rank At</div>
            <div className="text-lg font-bold text-gray-900">
              {ranking.rank_level === 'S' ? 'MAX' :
               ranking.rank_level === 'A' ? '900 pts' :
               ranking.rank_level === 'B' ? '700 pts' :
               ranking.rank_level === 'C' ? '500 pts' : '300 pts'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
