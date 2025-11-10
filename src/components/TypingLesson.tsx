import React, { useState, useEffect, useRef } from 'react';
import { supabase, Class } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft, Clock, Target, Volume2 } from 'lucide-react';
import VirtualKeyboard from './VirtualKeyboard';
import { useTheme } from '../hooks/useTheme';

interface TypingLessonProps {
  classData: Class;
  onComplete: () => void;
  onBack: () => void;
}

export const TypingLesson: React.FC<TypingLessonProps> = ({ classData, onComplete, onBack }) => {
  const { profile } = useAuth();
  const { theme } = useTheme(profile?.id);
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [startTime, setStartTime] = useState<number | null>(null);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(0);
  const [errors, setErrors] = useState(0);
  const [timeSpent, setTimeSpent] = useState(0);
  const [lastKey, setLastKey] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleStart = () => {
    setStarted(true);
    setStartTime(Date.now());
    inputRef.current?.focus();

    timerRef.current = setInterval(() => {
      setTimeSpent(prev => prev + 1);
    }, 1000);
  };

  const speakText = () => {
    if ('speechSynthesis' in window) {
      const healthcareText = `Medical terminology practice: ${classData.content}`;
      const utterance = new SpeechSynthesisUtterance(healthcareText);
      utterance.rate = 0.8;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  const calculateResults = () => {
    if (!startTime) return;

    const timeInMinutes = (Date.now() - startTime) / 60000;
    const wordsTyped = userInput.trim().split(/\s+/).length;
    const calculatedWpm = Math.round(wordsTyped / timeInMinutes);

    let correctChars = 0;
    let errorCount = 0;
    for (let i = 0; i < Math.min(userInput.length, classData.content.length); i++) {
      if (userInput[i] === classData.content[i]) {
        correctChars++;
      } else {
        errorCount++;
      }
    }
    const calculatedAccuracy = Math.round((correctChars / classData.content.length) * 100);

    setWpm(calculatedWpm);
    setAccuracy(calculatedAccuracy);
    setErrors(errorCount);
    setFinished(true);

    if (timerRef.current) clearInterval(timerRef.current);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setUserInput(value);

    if (value.length >= classData.content.length) {
      calculateResults();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    setLastKey(e.key);
  };

  const saveProgress = async () => {
    try {
      const { data: existingProgress } = await supabase
        .from('progress')
        .select('*')
        .eq('student_id', profile?.id)
        .eq('class_id', classData.id)
        .maybeSingle();

      const progressData = {
        student_id: profile?.id,
        class_id: classData.id,
        completed: true,
        time_spent_minutes: Math.floor(timeSpent / 60),
        wpm,
        accuracy,
        updated_at: new Date().toISOString(),
      };

      if (existingProgress) {
        const { error } = await supabase
          .from('progress')
          .update(progressData)
          .eq('id', existingProgress.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('progress')
          .insert(progressData);

        if (error) throw error;
      }

      await supabase.from('activity_logs').insert({
        user_id: profile?.id,
        activity_type: 'lesson',
        duration_seconds: timeSpent,
        wpm,
        accuracy,
        errors,
        text_content: classData.content
      });

      onComplete();
    } catch (error) {
      console.error('Error saving progress:', error);
      alert('Failed to save progress');
    }
  };

  const getCharacterClass = (index: number) => {
    if (index >= userInput.length) return 'text-gray-400';
    if (userInput[index] === classData.content[index]) return 'text-green-600 bg-green-50';
    return 'text-red-600 bg-red-50';
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!started) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-3xl w-full">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </button>

          <h2 className="text-3xl font-bold text-gray-900 mb-4">{classData.title}</h2>

          <div className="bg-blue-50 rounded-lg p-6 mb-6">
            <p className="text-gray-700 leading-relaxed">{classData.content}</p>
          </div>

          <div className="flex gap-4 mb-6">
            <div className="flex-1 bg-white border border-gray-200 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">Level</div>
              <div className="font-semibold text-gray-900 capitalize">{classData.level}</div>
            </div>
            <div className="flex-1 bg-white border border-gray-200 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">Type</div>
              <div className="font-semibold text-gray-900 capitalize">
                {classData.module_type.replace('_', ' ')}
              </div>
            </div>
          </div>

          {(classData.module_type === 'audio_sentence' || classData.module_type === 'audio_paragraph') && (
            <button
              onClick={speakText}
              className="w-full mb-4 flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Volume2 className="w-5 h-5" />
              Play Audio
            </button>
          )}

          <button
            onClick={handleStart}
            className="w-full px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-lg font-medium"
          >
            Start Lesson
          </button>
        </div>
      </div>
    );
  }

  if (finished) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Target className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Lesson Complete!</h2>

          <div className="grid grid-cols-3 gap-6 mb-6">
            <div className="bg-blue-50 rounded-lg p-6">
              <div className="text-3xl font-bold text-blue-600 mb-2">{wpm}</div>
              <div className="text-sm text-gray-600">WPM</div>
            </div>
            <div className="bg-green-50 rounded-lg p-6">
              <div className="text-3xl font-bold text-green-600 mb-2">{accuracy}%</div>
              <div className="text-sm text-gray-600">Accuracy</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-6">
              <div className="text-3xl font-bold text-purple-600 mb-2">{formatTime(timeSpent)}</div>
              <div className="text-sm text-gray-600">Time</div>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={onBack}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Back to Dashboard
            </button>
            <button
              onClick={saveProgress}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Save Progress
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-5xl w-full">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">{classData.title}</h2>
          <div className="flex items-center gap-4">
            {(classData.module_type === 'audio_sentence' || classData.module_type === 'audio_paragraph') && (
              <button
                onClick={speakText}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Volume2 className="w-4 h-4" />
                Play
              </button>
            )}
            <div className="flex items-center gap-2 text-gray-600 bg-gray-100 px-4 py-2 rounded-lg">
              <Clock className="w-5 h-5" />
              <span className="font-mono font-medium">{formatTime(timeSpent)}</span>
            </div>
          </div>
        </div>

        {classData.module_type === 'text' && (
          <div className="bg-gray-50 rounded-lg p-6 mb-6 font-mono text-lg leading-relaxed">
            {classData.content.split('').map((char, index) => (
              <span key={index} className={getCharacterClass(index)}>
                {char}
              </span>
            ))}
          </div>
        )}

        <textarea
          ref={inputRef}
          value={userInput}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          className="w-full px-6 py-4 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-lg resize-none"
          rows={8}
          placeholder="Start typing here..."
          autoFocus
        />

        <div className="mt-4 flex justify-between items-center text-sm text-gray-600">
          <div>Progress: {userInput.length} / {classData.content.length} characters</div>
          <button
            onClick={calculateResults}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Finish Early
          </button>
        </div>

        <div className="mt-6">
          <VirtualKeyboard pressedKey={lastKey} theme={theme} />
        </div>
      </div>
    </div>
  );
};
