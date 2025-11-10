import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { X, Clock, Target, TrendingUp, Award, Activity, BookOpen } from 'lucide-react';

interface UserAnalyticsProps {
  userId: string;
  onClose: () => void;
}

interface UserStats {
  full_name: string;
  email: string;
  level: string;
  total_points: number;
  rank_grade: string;
  rank_position: number;
  completed_classes: number;
  total_time_minutes: number;
  avg_wpm: number;
  avg_accuracy: number;
  assessments: Array<{
    wpm: number;
    accuracy: number;
    created_at: string;
  }>;
  recentProgress: Array<{
    class_title: string;
    wpm: number;
    accuracy: number;
    time_spent_minutes: number;
    completed_at: string;
  }>;
}

const GaugeChart: React.FC<{ value: number; max: number; label: string; color: string }> = ({
  value,
  max,
  label,
  color
}) => {
  const percentage = Math.min((value / max) * 100, 100);
  const rotation = (percentage / 100) * 180 - 90;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-32 h-16 mb-2">
        <svg viewBox="0 0 100 50" className="w-full h-full">
          <path
            d="M 10 45 A 40 40 0 0 1 90 45"
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="8"
            strokeLinecap="round"
          />
          <path
            d="M 10 45 A 40 40 0 0 1 90 45"
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${percentage * 1.26} 126`}
          />
        </svg>
        <div className="absolute inset-0 flex items-end justify-center pb-1">
          <span className="text-2xl font-bold" style={{ color }}>
            {value}
          </span>
        </div>
      </div>
      <span className="text-sm text-gray-600 font-medium">{label}</span>
      <span className="text-xs text-gray-400">Max: {max}</span>
    </div>
  );
};

export const UserAnalytics: React.FC<UserAnalyticsProps> = ({ userId, onClose }) => {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserStats();
  }, [userId]);

  const fetchUserStats = async () => {
    try {
      await supabase.rpc('update_student_rankings');

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      const { data: assessments } = await supabase
        .from('assessments')
        .select('wpm, accuracy, created_at')
        .eq('student_id', userId)
        .order('created_at', { ascending: false });

      const { data: progress } = await supabase
        .from('progress')
        .select(`
          wpm,
          accuracy,
          time_spent_minutes,
          updated_at,
          classes (
            title
          )
        `)
        .eq('student_id', userId)
        .eq('completed', true)
        .order('updated_at', { ascending: false })
        .limit(10);

      const { data: aggregates } = await supabase
        .from('progress')
        .select('wpm, accuracy, time_spent_minutes')
        .eq('student_id', userId)
        .eq('completed', true);

      const completed_classes = aggregates?.length || 0;
      const total_time_minutes = aggregates?.reduce((sum, p) => sum + (p.time_spent_minutes || 0), 0) || 0;
      const avg_wpm = completed_classes > 0
        ? Math.round(aggregates!.reduce((sum, p) => sum + p.wpm, 0) / completed_classes)
        : 0;
      const avg_accuracy = completed_classes > 0
        ? Math.round(aggregates!.reduce((sum, p) => sum + p.accuracy, 0) / completed_classes * 10) / 10
        : 0;

      const recentProgress = progress?.map(p => ({
        class_title: (p.classes as any)?.title || 'Unknown',
        wpm: p.wpm,
        accuracy: Number(p.accuracy),
        time_spent_minutes: p.time_spent_minutes,
        completed_at: p.updated_at
      })) || [];

      setStats({
        full_name: profile?.full_name || '',
        email: profile?.email || '',
        level: profile?.level || 'Not set',
        total_points: profile?.total_points || 0,
        rank_grade: profile?.rank_grade || 'D',
        rank_position: profile?.rank_position || 0,
        completed_classes,
        total_time_minutes,
        avg_wpm,
        avg_accuracy,
        assessments: assessments || [],
        recentProgress
      });
    } catch (error) {
      console.error('Error fetching user stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const getRankColor = (grade: string) => {
    switch (grade) {
      case 'S': return 'from-purple-500 to-pink-500';
      case 'A': return 'from-blue-500 to-cyan-500';
      case 'B': return 'from-green-500 to-emerald-500';
      case 'C': return 'from-yellow-500 to-orange-500';
      default: return 'from-gray-500 to-slate-500';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">{stats.full_name}</h2>
            <p className="text-blue-100 text-sm">{stats.email}</p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 text-center">
              <div className={`w-20 h-20 mx-auto mb-3 rounded-full bg-gradient-to-r ${getRankColor(stats.rank_grade)} flex items-center justify-center text-white text-2xl font-bold shadow-lg`}>
                {stats.rank_grade}
              </div>
              <div className="text-sm text-gray-600 mb-1">Rank Grade</div>
              <div className="text-xs text-gray-500">Position #{stats.rank_position}</div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6">
              <Award className="w-8 h-8 text-purple-600 mb-3" />
              <div className="text-3xl font-bold text-purple-900">{stats.total_points}</div>
              <div className="text-sm text-purple-600">Total Points</div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6">
              <BookOpen className="w-8 h-8 text-green-600 mb-3" />
              <div className="text-3xl font-bold text-green-900">{stats.completed_classes}</div>
              <div className="text-sm text-green-600">Completed Lessons</div>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6">
              <Clock className="w-8 h-8 text-orange-600 mb-3" />
              <div className="text-3xl font-bold text-orange-900">
                {Math.floor(stats.total_time_minutes / 60)}h {stats.total_time_minutes % 60}m
              </div>
              <div className="text-sm text-orange-600">Time Spent</div>
            </div>
          </div>

          <div className="bg-white border-2 border-gray-100 rounded-2xl p-8">
            <div className="flex items-center gap-2 mb-6">
              <Activity className="w-6 h-6 text-blue-600" />
              <h3 className="text-xl font-bold text-gray-900">Performance Metrics</h3>
            </div>

            <div className="grid grid-cols-3 gap-8">
              <GaugeChart
                value={stats.avg_wpm}
                max={100}
                label="Avg WPM"
                color="#3b82f6"
              />
              <GaugeChart
                value={Math.round(stats.avg_accuracy)}
                max={100}
                label="Avg Accuracy"
                color="#10b981"
              />
              <GaugeChart
                value={stats.completed_classes}
                max={50}
                label="Lessons Done"
                color="#8b5cf6"
              />
            </div>
          </div>

          {stats.assessments.length > 0 && (
            <div className="bg-white border-2 border-gray-100 rounded-2xl p-8">
              <div className="flex items-center gap-2 mb-6">
                <Target className="w-6 h-6 text-blue-600" />
                <h3 className="text-xl font-bold text-gray-900">Initial Assessments</h3>
              </div>

              <div className="space-y-3">
                {stats.assessments.map((assessment, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{assessment.wpm}</div>
                        <div className="text-xs text-gray-500">WPM</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{assessment.accuracy}%</div>
                        <div className="text-xs text-gray-500">Accuracy</div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(assessment.created_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {stats.recentProgress.length > 0 && (
            <div className="bg-white border-2 border-gray-100 rounded-2xl p-8">
              <div className="flex items-center gap-2 mb-6">
                <TrendingUp className="w-6 h-6 text-blue-600" />
                <h3 className="text-xl font-bold text-gray-900">Recent Activity</h3>
              </div>

              <div className="space-y-3">
                {stats.recentProgress.map((progress, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-900">{progress.class_title}</h4>
                      <span className="text-xs text-gray-500">
                        {new Date(progress.completed_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-6 text-sm text-gray-600">
                      <div>
                        <span className="font-semibold text-blue-600">{progress.wpm}</span> WPM
                      </div>
                      <div>
                        <span className="font-semibold text-green-600">{progress.accuracy}%</span> Accuracy
                      </div>
                      <div>
                        <span className="font-semibold text-purple-600">{progress.time_spent_minutes}</span> min
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
