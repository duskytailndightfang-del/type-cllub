import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Class, Progress } from '../lib/supabase';
import { LogOut, Trophy, Clock, Target } from 'lucide-react';
import { InitialAssessment } from '../components/InitialAssessment';
import { TypingLesson } from '../components/TypingLesson';

export const StudentDashboard: React.FC = () => {
  const { signOut, profile } = useAuth();
  const [needsAssessment, setNeedsAssessment] = useState(false);
  const [classes, setClasses] = useState<Class[]>([]);
  const [progress, setProgress] = useState<Progress[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);

  useEffect(() => {
    checkAssessmentStatus();
    if (profile?.level) {
      fetchClasses();
      fetchProgress();
    }
  }, [profile]);

  const checkAssessmentStatus = async () => {
    setLoading(true);
    if (!profile?.level) {
      setNeedsAssessment(true);
    }
    setLoading(false);
  };

  const fetchClasses = async () => {
    const { data } = await supabase
      .from('classes')
      .select('*')
      .or(`level.eq.${profile?.level},level.eq.all`)
      .order('created_at', { ascending: false });

    if (data) setClasses(data);
  };

  const fetchProgress = async () => {
    const { data } = await supabase
      .from('progress')
      .select('*')
      .eq('student_id', profile?.id || '');

    if (data) setProgress(data);
  };

  const getTotalHours = () => {
    return Math.floor(progress.reduce((sum, p) => sum + p.time_spent_minutes, 0) / 60);
  };

  const getCompletedLessons = () => {
    return progress.filter(p => p.completed).length;
  };

  const getAverageWPM = () => {
    if (progress.length === 0) return 0;
    const total = progress.reduce((sum, p) => sum + p.wpm, 0);
    return Math.round(total / progress.length);
  };

  const handleAssessmentComplete = () => {
    setNeedsAssessment(false);
    window.location.reload();
  };

  if (profile?.status === 'pending') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8 text-yellow-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Approval Pending</h2>
          <p className="text-gray-600 mb-6">
            Your account is awaiting admin approval. Please check back later.
          </p>
          <button
            onClick={signOut}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  if (profile?.status === 'denied') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Target className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-6">
            Your account request has been denied. Please contact the administrator.
          </p>
          <button
            onClick={signOut}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  if (needsAssessment) {
    return <InitialAssessment onComplete={handleAssessmentComplete} />;
  }

  if (selectedClass) {
    return (
      <TypingLesson
        classData={selectedClass}
        onComplete={() => {
          setSelectedClass(null);
          fetchProgress();
        }}
        onBack={() => setSelectedClass(null)}
      />
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Student Dashboard</h1>
              <p className="text-sm text-gray-600">Welcome back, {profile?.full_name}</p>
            </div>
            <button
              onClick={signOut}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Total Hours</h3>
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{getTotalHours()}h</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Lessons Completed</h3>
              <Trophy className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{getCompletedLessons()}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Average WPM</h3>
              <Target className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{getAverageWPM()}</p>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Your Level</h2>
            <span className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
              {profile?.level?.charAt(0).toUpperCase() + profile?.level?.slice(1)}
            </span>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Available Lessons</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {classes.map((cls) => {
              const classProgress = progress.find(p => p.class_id === cls.id);
              return (
                <div
                  key={cls.id}
                  className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{cls.title}</h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{cls.content}</p>

                  {classProgress && (
                    <div className="mb-4">
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>Progress</span>
                        <span>{classProgress.completed ? '100%' : '0%'}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: classProgress.completed ? '100%' : '0%' }}
                        />
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => setSelectedClass(cls)}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {classProgress?.completed ? 'Practice Again' : 'Start Lesson'}
                  </button>
                </div>
              );
            })}
          </div>

          {classes.length === 0 && (
            <div className="bg-white rounded-lg shadow p-12 text-center text-gray-500">
              No lessons available yet. Check back soon!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
