import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Profile, Class } from '../lib/supabase';
import { LogOut, Users, BookOpen, CheckCircle, XCircle, Plus, Trophy, BarChart3, Clock, Target, TrendingUp, Medal, Trash2 } from 'lucide-react';
import { CreateClassModal } from '../components/CreateClassModal';

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

interface UserWithRanking extends Profile {
  ranking?: UserRanking;
}

export const AdminDashboard: React.FC = () => {
  const { signOut, profile } = useAuth();
  const [users, setUsers] = useState<UserWithRanking[]>([]);
  const [lessons, setLessons] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'users' | 'lessons' | 'leaderboard'>('users');
  const [selectedUser, setSelectedUser] = useState<UserWithRanking | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: usersData } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'student')
        .order('created_at', { ascending: false });

      const { data: rankingsData } = await supabase
        .from('user_rankings')
        .select('*');

      const { data: lessonsData } = await supabase
        .from('classes')
        .select('*')
        .order('created_at', { ascending: false });

      if (usersData && rankingsData) {
        const usersWithRankings = usersData.map(user => ({
          ...user,
          ranking: rankingsData.find((r: UserRanking) => r.user_id === user.id)
        }));
        setUsers(usersWithRankings);
      }

      if (lessonsData) setLessons(lessonsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateUserStatus = async (userId: string, status: 'approved' | 'denied') => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', userId);

      if (error) throw error;
      fetchData();
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  };

  const deleteLesson = async (lessonId: string) => {
    if (!confirm('Are you sure you want to delete this lesson? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('classes')
        .delete()
        .eq('id', lessonId);

      if (error) throw error;
      fetchData();
    } catch (error) {
      console.error('Error deleting lesson:', error);
      alert('Failed to delete lesson');
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      denied: 'bg-red-100 text-red-800',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getLevelBadge = (level?: string) => {
    if (!level) return <span className="text-gray-400 text-sm">Not assessed</span>;
    const styles = {
      beginner: 'bg-blue-100 text-blue-800',
      intermediate: 'bg-orange-100 text-orange-800',
      advanced: 'bg-purple-100 text-purple-800',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[level as keyof typeof styles]}`}>
        {level.charAt(0).toUpperCase() + level.slice(1)}
      </span>
    );
  };

  const getRankBadge = (rank: string) => {
    const colors: Record<string, string> = {
      'S': 'bg-yellow-100 text-yellow-800',
      'A': 'bg-green-100 text-green-800',
      'B': 'bg-blue-100 text-blue-800',
      'C': 'bg-orange-100 text-orange-800',
      'D': 'bg-gray-100 text-gray-800',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-bold ${colors[rank] || colors['D']}`}>
        Rank {rank}
      </span>
    );
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const getLeaderboardUsers = () => {
    return [...users]
      .filter(u => u.ranking)
      .sort((a, b) => (b.ranking?.leaderboard_position || 999) - (a.ranking?.leaderboard_position || 999))
      .sort((a, b) => (a.ranking?.leaderboard_position || 999) - (b.ranking?.leaderboard_position || 999));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100 flex items-center justify-center">
        <div className="text-purple-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100">
      <nav className="bg-white/80 backdrop-blur-sm shadow-lg border-b-2 border-purple-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <img src="/og logo 512.png" alt="TypeMind AI" className="w-12 h-12" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">TypeMind AI - Admin Panel</h1>
                <p className="text-sm text-gray-600">Welcome, {profile?.full_name}</p>
              </div>
            </div>
            <button
              onClick={signOut}
              className="flex items-center gap-2 px-4 py-2 text-white rounded-lg transition-colors"
              style={{ backgroundColor: '#531B93' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#42166f'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#531B93'}
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-4 mb-6 flex-wrap">
          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'users'
                ? 'text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-purple-50'
            }`}
            style={activeTab === 'users' ? { backgroundColor: '#531B93' } : {}}
          >
            <Users className="w-5 h-5" />
            Users ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('lessons')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'lessons'
                ? 'text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-purple-50'
            }`}
            style={activeTab === 'lessons' ? { backgroundColor: '#531B93' } : {}}
          >
            <BookOpen className="w-5 h-5" />
            Lessons ({lessons.length})
          </button>
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'leaderboard'
                ? 'text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-purple-50'
            }`}
            style={activeTab === 'leaderboard' ? { backgroundColor: '#531B93' } : {}}
          >
            <Trophy className="w-5 h-5" />
            Leaderboard
          </button>
        </div>

        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden border-2 border-purple-200">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-purple-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Level</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Rank</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-purple-50 transition-colors cursor-pointer" onClick={() => setSelectedUser(user)}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{user.full_name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600">{user.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">{getLevelBadge(user.level)}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {user.ranking ? getRankBadge(user.ranking.rank_level) : <span className="text-gray-400 text-sm">No rank</span>}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(user.status)}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {user.status === 'pending' && (
                            <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                              <button
                                onClick={() => updateUserStatus(user.id, 'approved')}
                                className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                                title="Approve"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => updateUserStatus(user.id, 'denied')}
                                className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                                title="Deny"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {selectedUser && selectedUser.ranking && (
              <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-purple-200">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                    <BarChart3 className="w-6 h-6 text-purple-600" />
                    Analytics - {selectedUser.full_name}
                  </h3>
                  <button
                    onClick={() => setSelectedUser(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    Close
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-purple-50 rounded-lg p-4 border-2 border-purple-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Trophy className="w-5 h-5 text-purple-600" />
                      <span className="text-sm text-gray-600">Total Score</span>
                    </div>
                    <div className="text-2xl font-bold text-purple-600">{selectedUser.ranking.total_score}</div>
                    <div className="text-xs text-gray-500 mt-1">Rank {selectedUser.ranking.rank_level}</div>
                  </div>

                  <div className="bg-blue-50 rounded-lg p-4 border-2 border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="w-5 h-5 text-blue-600" />
                      <span className="text-sm text-gray-600">Average WPM</span>
                    </div>
                    <div className="text-2xl font-bold text-blue-600">{Math.round(selectedUser.ranking.average_wpm)}</div>
                    <div className="text-xs text-gray-500 mt-1">{selectedUser.ranking.average_accuracy.toFixed(1)}% Accuracy</div>
                  </div>

                  <div className="bg-green-50 rounded-lg p-4 border-2 border-green-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-5 h-5 text-green-600" />
                      <span className="text-sm text-gray-600">Time Spent</span>
                    </div>
                    <div className="text-2xl font-bold text-green-600">{formatTime(selectedUser.ranking.total_time_spent)}</div>
                    <div className="text-xs text-gray-500 mt-1">Total practice time</div>
                  </div>

                  <div className="bg-orange-50 rounded-lg p-4 border-2 border-orange-200">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-5 h-5 text-orange-600" />
                      <span className="text-sm text-gray-600">Lessons Completed</span>
                    </div>
                    <div className="text-2xl font-bold text-orange-600">{selectedUser.ranking.total_lessons_completed}</div>
                    <div className="text-xs text-gray-500 mt-1">{selectedUser.ranking.proficiency_level}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'lessons' && (
          <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-purple-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Lesson Management</h2>
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 px-4 py-2 text-white rounded-lg transition-colors"
                style={{ backgroundColor: '#531B93' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#42166f'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#531B93'}
              >
                <Plus className="w-5 h-5" />
                Create Lesson
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {lessons.map((lesson) => (
                <div key={lesson.id} className="border-2 border-gray-200 rounded-lg p-6 hover:border-purple-400 hover:shadow-lg transition-all relative">
                  <button
                    onClick={() => deleteLesson(lesson.id)}
                    className="absolute top-4 right-4 p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                    title="Delete Lesson"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <h3 className="font-bold text-lg text-gray-900 mb-2 pr-10">{lesson.title}</h3>
                  <div className="flex gap-2 mb-3">
                    <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs rounded-full font-medium capitalize">
                      {lesson.level}
                    </span>
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium capitalize">
                      {lesson.module_type.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm line-clamp-3">{lesson.content}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'leaderboard' && (
          <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-purple-200">
            <div className="flex items-center gap-3 mb-6">
              <Trophy className="w-8 h-8 text-yellow-600" />
              <h2 className="text-2xl font-bold text-gray-900">Global Leaderboard</h2>
            </div>

            <div className="space-y-4">
              {getLeaderboardUsers().map((user, index) => {
                const position = user.ranking?.leaderboard_position || index + 1;
                const isTop3 = position <= 3;
                const medalColor = position === 1 ? 'text-yellow-500' : position === 2 ? 'text-gray-400' : 'text-orange-500';

                return (
                  <div
                    key={user.id}
                    className={`flex items-center gap-4 p-4 rounded-lg border-2 transition-all ${
                      isTop3
                        ? position === 1
                          ? 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-300'
                          : position === 2
                          ? 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-300'
                          : 'bg-gradient-to-r from-orange-50 to-orange-100 border-orange-300'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex-shrink-0 w-12 text-center">
                      {isTop3 ? (
                        <Medal className={`w-8 h-8 mx-auto ${medalColor}`} />
                      ) : (
                        <span className="text-2xl font-bold text-gray-500">#{position}</span>
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="font-bold text-lg text-gray-900">{user.full_name}</div>
                      <div className="text-sm text-gray-600">{user.email}</div>
                    </div>

                    {user.ranking && (
                      <>
                        <div className="text-center px-4">
                          <div className="text-xs text-gray-600">Rank</div>
                          <div className="text-xl font-bold">{user.ranking.rank_level}</div>
                        </div>

                        <div className="text-center px-4">
                          <div className="text-xs text-gray-600">Score</div>
                          <div className="text-xl font-bold text-purple-600">{user.ranking.total_score}</div>
                        </div>

                        <div className="text-center px-4">
                          <div className="text-xs text-gray-600">WPM</div>
                          <div className="text-xl font-bold text-blue-600">{Math.round(user.ranking.average_wpm)}</div>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}

              {getLeaderboardUsers().length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  No users have completed lessons yet.
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {showCreateModal && (
        <CreateClassModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchData();
          }}
        />
      )}
    </div>
  );
};
