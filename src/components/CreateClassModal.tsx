import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { X, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface CreateClassModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const sampleTexts = {
  beginner: [
    'The quick brown fox jumps over the lazy dog. Practice makes perfect. Keep your fingers on the home row.',
    'Learning to type is fun and easy. Start slow and build your speed over time. Focus on accuracy first.',
    'Hello world. Welcome to typing class. The keyboard is your friend. Practice daily for best results.',
  ],
  intermediate: [
    'Developing good typing habits requires consistent practice and attention to proper finger placement. Remember to take breaks.',
    'Professional communication often depends on quick and accurate typing skills in the modern workplace.',
    'The advancement of technology has made typing an essential skill for students and professionals alike.',
  ],
  advanced: [
    'Mastering the art of touch typing involves developing muscle memory through repetitive practice, maintaining proper posture, and gradually increasing your speed while ensuring accuracy remains consistently high throughout extended typing sessions.',
    'Contemporary digital communication necessitates proficiency in rapid text input, which can significantly enhance productivity and professional capabilities across diverse industries and technological platforms.',
    'The integration of artificial intelligence and machine learning technologies has revolutionized how we interact with computers, yet fundamental typing skills remain crucial for effective human-computer interaction.',
  ],
};

export const CreateClassModal: React.FC<CreateClassModalProps> = ({ onClose, onSuccess }) => {
  const { profile } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [level, setLevel] = useState<'beginner' | 'intermediate' | 'advanced' | 'all'>('beginner');
  const [moduleType, setModuleType] = useState<'text' | 'audio_sentence' | 'audio_paragraph'>('text');
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  const generateContent = async () => {
    setGenerating(true);
    try {
      const apiKey = import.meta.env.VITE_ABACUS_AI_API_KEY;

      if (!apiKey || apiKey === 'your_abacus_ai_api_key_here') {
        const texts = sampleTexts[level === 'all' ? 'intermediate' : level];
        const randomText = texts[Math.floor(Math.random() * texts.length)];
        setContent(randomText);
        setGenerating(false);
        return;
      }

      const lengthGuide = {
        beginner: 'short sentence (10-15 words)',
        intermediate: 'medium paragraph (30-50 words)',
        advanced: 'long paragraph (60-100 words)',
        all: 'medium paragraph (30-50 words)'
      };

      const prompt = `Generate a ${lengthGuide[level]} about healthcare terminology and medical procedures. The text should be suitable for typing practice and include proper medical vocabulary. Make it educational and professionally written.`;

      const response = await fetch('https://api.abacus.ai/v0/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          model: 'gpt-4',
          max_tokens: 200,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        throw new Error('API request failed');
      }

      const data = await response.json();
      const generatedText = data.choices?.[0]?.message?.content?.trim() || '';

      if (generatedText) {
        setContent(generatedText);
      } else {
        throw new Error('No content generated');
      }
    } catch (error) {
      console.error('Error generating content:', error);
      const texts = sampleTexts[level === 'all' ? 'intermediate' : level];
      const randomText = texts[Math.floor(Math.random() * texts.length)];
      setContent(randomText);
      alert('Failed to generate content from API. Using sample text instead.');
    } finally {
      setGenerating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from('classes').insert({
        title,
        content,
        level,
        module_type: moduleType,
        created_by: profile?.id,
      });

      if (error) throw error;
      onSuccess();
    } catch (error) {
      console.error('Error creating class:', error);
      alert('Failed to create class');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Create New Class</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Class Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Introduction to Home Row Keys"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Level
            </label>
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value as any)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
              <option value="all">All Levels</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Module Type
            </label>
            <select
              value={moduleType}
              onChange={(e) => setModuleType(e.target.value as any)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="text">Text Typing</option>
              <option value="audio_sentence">Audio Sentence</option>
              <option value="audio_paragraph">Audio Paragraph</option>
            </select>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Content
              </label>
              <button
                type="button"
                onClick={generateContent}
                disabled={generating}
                className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors disabled:opacity-50"
              >
                <Sparkles className={`w-4 h-4 ${generating ? 'animate-spin' : ''}`} />
                {generating ? 'Generating...' : 'Generate'}
              </button>
            </div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={6}
              placeholder="Enter the text content for this class..."
              required
            />
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Class'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
