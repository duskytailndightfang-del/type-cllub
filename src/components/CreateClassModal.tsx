import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { X, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import {
  healthcareSampleTexts,
  getHealthcareSampleByLevel,
  getHealthcareAudioSentence,
  getHealthcareAudioParagraph
} from '../data/healthcareContent';

interface CreateClassModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateClassModal: React.FC<CreateClassModalProps> = ({ onClose, onSuccess }) => {
  const { profile } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [level, setLevel] = useState<'beginner' | 'intermediate' | 'advanced' | 'all'>('beginner');
  const [moduleType, setModuleType] = useState<'text' | 'audio_sentence' | 'audio_paragraph'>('text');
  const [loading, setLoading] = useState(false);

  const generateContent = () => {
    if (moduleType === 'audio_sentence') {
      setContent(getHealthcareAudioSentence());
    } else if (moduleType === 'audio_paragraph') {
      setContent(getHealthcareAudioParagraph());
    } else {
      if (level === 'all') {
        const allTexts = [
          ...healthcareSampleTexts.beginner,
          ...healthcareSampleTexts.intermediate,
          ...healthcareSampleTexts.advanced
        ];
        const randomText = allTexts[Math.floor(Math.random() * allTexts.length)];
        setContent(randomText);
      } else {
        setContent(getHealthcareSampleByLevel(level));
      }
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
                className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
              >
                <Sparkles className="w-4 h-4" />
                Generate
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
