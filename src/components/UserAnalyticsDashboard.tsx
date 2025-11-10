import { useEffect, useState } from 'react';
import { Clock, Target, TrendingUp, Activity, Award, Calendar } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface ActivityLog {
  id: string;
  activity_type: string;
  duration_seconds: number;
  wpm: number;
  accuracy: number;
  errors: number;
  created_at: string;
}

interface UserRanking {
  total_points: number;
  total_time_hours: number;
  average_wpm: number;
  average_accuracy: number;
  rank_grade: string;
  rank_category: string;
  category_position: number;
  theme: string;
}

interface UserProfile {
  full_name: string;
  role: string;
}

interface UserAnalyticsProps {
  userId: string;
}

export default function UserAnalyticsDashboard({ userId }: UserAnalyticsProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [ranking, setRanking] = useState<UserRanking | null>(null);
  const [recentActivities, setRecentActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, [userId]);

  const loadUserData = async () => {
    setLoading(true);
    try {
      const [profileResult, rankingResult, activitiesResult] = await Promise.all([
        supabase.from('profiles').select('full_name, role').eq('id', userId).single(),
        supabase.from('user_rankings').select('*').eq('user_id', userId).maybeSingle(),
        supabase.from('activity_logs').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(20)
      ]);

      if (profileResult.error) throw profileResult.error;
      if (activitiesResult.error) throw activitiesResult.error;

      setProfile(profileResult.data);
      setRanking(rankingResult.data);
      setRecentActivities(activitiesResult.data || []);
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSpeedometerRotation = (value: number, max: number) => {
    const percentage = Math.min((value / max) * 100, 100);
    return (percentage / 100) * 180 - 90;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!profile) {
    return <div className="text-white">User not found</div>;
  }

  const wpmRotation = getSpeedometerRotation(ranking?.average_wpm || 0, 100);
  const accuracyRotation = getSpeedometerRotation(ranking?.average_accuracy || 0, 100);

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold">{profile.full_name}</h2>
            <p className="text-blue-100 mt-1 capitalize">{profile.role}</p>
          </div>
          {ranking && (
            <div className="text-right">
              <div className="text-4xl font-bold">{ranking.rank_grade}</div>
              <div className="text-blue-100">{ranking.rank_category}</div>
              <div className="text-sm text-blue-200 mt-1">Position #{ranking.category_position}</div>
            </div>
          )}
        </div>
      </div>

      {ranking ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <div className="flex items-center gap-3 mb-2">
                <Award className="w-6 h-6 text-yellow-400" />
                <h3 className="text-slate-400 text-sm font-semibold">Total Points</h3>
              </div>
              <p className="text-3xl font-bold text-white">{ranking.total_points}</p>
            </div>

            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <div className="flex items-center gap-3 mb-2">
                <Clock className="w-6 h-6 text-blue-400" />
                <h3 className="text-slate-400 text-sm font-semibold">Practice Time</h3>
              </div>
              <p className="text-3xl font-bold text-white">{ranking.total_time_hours.toFixed(1)}<span className="text-lg text-slate-400">hrs</span></p>
            </div>

            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="w-6 h-6 text-green-400" />
                <h3 className="text-slate-400 text-sm font-semibold">Avg Speed</h3>
              </div>
              <p className="text-3xl font-bold text-white">{Math.round(ranking.average_wpm)}<span className="text-lg text-slate-400">wpm</span></p>
            </div>

            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <div className="flex items-center gap-3 mb-2">
                <Target className="w-6 h-6 text-purple-400" />
                <h3 className="text-slate-400 text-sm font-semibold">Avg Accuracy</h3>
              </div>
              <p className="text-3xl font-bold text-white">{ranking.average_accuracy.toFixed(1)}<span className="text-lg text-slate-400">%</span></p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-blue-400" />
                Speed Gauge
              </h3>
              <div className="relative w-48 h-48 mx-auto">
                <svg viewBox="0 0 200 120" className="w-full h-full">
                  <path
                    d="M 20 100 A 80 80 0 0 1 180 100"
                    fill="none"
                    stroke="#334155"
                    strokeWidth="20"
                    strokeLinecap="round"
                  />
                  <path
                    d="M 20 100 A 80 80 0 0 1 180 100"
                    fill="none"
                    stroke="url(#speedGradient)"
                    strokeWidth="20"
                    strokeLinecap="round"
                    strokeDasharray={`${(ranking.average_wpm / 100) * 251} 251`}
                  />
                  <line
                    x1="100"
                    y1="100"
                    x2="100"
                    y2="40"
                    stroke="#3B82F6"
                    strokeWidth="4"
                    strokeLinecap="round"
                    transform={`rotate(${wpmRotation} 100 100)`}
                  />
                  <circle cx="100" cy="100" r="8" fill="#3B82F6" />
                  <defs>
                    <linearGradient id="speedGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#EF4444" />
                      <stop offset="50%" stopColor="#F59E0B" />
                      <stop offset="100%" stopColor="#10B981" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute bottom-0 left-0 right-0 text-center">
                  <div className="text-3xl font-bold text-white">{Math.round(ranking.average_wpm)}</div>
                  <div className="text-sm text-slate-400">WPM</div>
                </div>
              </div>
            </div>

            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Target className="w-6 h-6 text-purple-400" />
                Accuracy Gauge
              </h3>
              <div className="relative w-48 h-48 mx-auto">
                <svg viewBox="0 0 200 120" className="w-full h-full">
                  <path
                    d="M 20 100 A 80 80 0 0 1 180 100"
                    fill="none"
                    stroke="#334155"
                    strokeWidth="20"
                    strokeLinecap="round"
                  />
                  <path
                    d="M 20 100 A 80 80 0 0 1 180 100"
                    fill="none"
                    stroke="url(#accuracyGradient)"
                    strokeWidth="20"
                    strokeLinecap="round"
                    strokeDasharray={`${(ranking.average_accuracy / 100) * 251} 251`}
                  />
                  <line
                    x1="100"
                    y1="100"
                    x2="100"
                    y2="40"
                    stroke="#A855F7"
                    strokeWidth="4"
                    strokeLinecap="round"
                    transform={`rotate(${accuracyRotation} 100 100)`}
                  />
                  <circle cx="100" cy="100" r="8" fill="#A855F7" />
                  <defs>
                    <linearGradient id="accuracyGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#EF4444" />
                      <stop offset="50%" stopColor="#F59E0B" />
                      <stop offset="100%" stopColor="#10B981" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute bottom-0 left-0 right-0 text-center">
                  <div className="text-3xl font-bold text-white">{ranking.average_accuracy.toFixed(1)}%</div>
                  <div className="text-sm text-slate-400">Accuracy</div>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="bg-slate-800 rounded-xl p-8 border border-slate-700 text-center">
          <Activity className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400">No ranking data available yet.</p>
          <p className="text-sm text-slate-500 mt-2">User needs to complete activities to generate statistics.</p>
        </div>
      )}

      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Calendar className="w-6 h-6 text-green-400" />
          Recent Activity
        </h3>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {recentActivities.length > 0 ? (
            recentActivities.map((activity) => (
              <div key={activity.id} className="bg-slate-700/50 rounded-lg p-4 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-1 bg-blue-600 text-white text-xs font-semibold rounded capitalize">
                      {activity.activity_type}
                    </span>
                    <span className="text-slate-400 text-sm">{formatDate(activity.created_at)}</span>
                  </div>
                  <div className="text-sm text-slate-500 mt-1">Duration: {formatDuration(activity.duration_seconds)}</div>
                </div>
                <div className="flex gap-4 text-right">
                  <div>
                    <div className="text-lg font-bold text-blue-400">{activity.wpm}</div>
                    <div className="text-xs text-slate-500">WPM</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-green-400">{activity.accuracy.toFixed(1)}%</div>
                    <div className="text-xs text-slate-500">Accuracy</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-red-400">{activity.errors}</div>
                    <div className="text-xs text-slate-500">Errors</div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-slate-500">
              <Activity className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No recent activity</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}