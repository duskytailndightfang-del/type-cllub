import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { X, Sparkles, Upload } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface CreateClassModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const healthcareTexts = {
  beginner: [
    'The patient needs vital signs checked. Blood pressure is measured in the exam room. Take temperature readings carefully.',
    'Medical records must be kept secure. Patient privacy is very important. HIPAA rules protect health information.',
    'Nurses wear scrubs to work. They check patient charts daily. Medicine is given at specific times.',
    'The doctor orders lab tests. Results come back quickly. Technicians process blood samples carefully.',
    'Hospital beds are cleaned often. Hand washing prevents infection. Sterile gloves must be worn.',
  ],
  intermediate: [
    'Healthcare professionals must document patient assessments accurately in electronic health records. Proper documentation ensures continuity of care and legal compliance.',
    'Medication administration requires careful verification using the five rights protocol. Nurses must check dosage, route, time, patient identity, and medication name before each administration.',
    'Infection control protocols include proper hand hygiene, use of personal protective equipment, and environmental cleaning. These measures reduce hospital-acquired infections significantly.',
    'Diagnostic imaging techniques such as X-rays, CT scans, and MRI provide valuable information for treatment planning. Radiologic technologists operate sophisticated medical equipment.',
    'Patient education improves health outcomes and medication adherence. Healthcare providers explain treatment plans, potential side effects, and lifestyle modifications clearly.',
  ],
  advanced: [
    'Comprehensive patient assessment involves systematic evaluation of physiological, psychological, and social factors affecting health outcomes. Healthcare providers utilize evidence-based clinical guidelines to formulate appropriate differential diagnoses and treatment protocols while considering individual patient circumstances, comorbidities, and contraindications.',
    'Pharmacological interventions require thorough understanding of drug mechanisms, therapeutic indices, adverse reactions, and potential drug interactions. Clinical pharmacists collaborate with physicians to optimize medication regimens, monitor therapeutic efficacy, and prevent adverse drug events through comprehensive medication reconciliation processes.',
    'Electronic health record systems facilitate interdisciplinary communication, clinical decision support, and quality improvement initiatives within healthcare organizations. Implementation of standardized terminology, interoperability standards, and data security measures ensures accurate information exchange while maintaining patient confidentiality.',
    'Evidence-based practice integrates current research findings, clinical expertise, and patient preferences to deliver high-quality healthcare. Systematic literature reviews, meta-analyses, and randomized controlled trials provide the foundation for clinical practice guidelines that standardize care delivery.',
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
  const [audioSource, setAudioSource] = useState<'ai' | 'upload'>('ai');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const generateContent = async () => {
    setGenerating(true);

    setTimeout(() => {
      const selectedLevel = level === 'all' ? 'intermediate' : level;
      const texts = healthcareTexts[selectedLevel];
      const randomText = texts[Math.floor(Math.random() * texts.length)];
      setContent(randomText);
      setGenerating(false);
    }, 500);
  };

  const handleAudioFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = ['audio/mpeg', 'audio/wav', 'audio/mp4', 'audio/x-m4a'];
      if (!validTypes.includes(file.type)) {
        alert('Please upload a valid audio file (.mp3, .wav, or .m4a)');
        return;
      }
      setAudioFile(file);
    }
  };

  const uploadAudioFile = async (): Promise<string | null> => {
    if (!audioFile) return null;

    setUploading(true);
    try {
      const fileExt = audioFile.name.split('.').pop();
      const fileName = `${profile?.id}-${Date.now()}.${fileExt}`;
      const filePath = `audio/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('class-audio')
        .upload(filePath, audioFile);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('class-audio')
        .getPublicUrl(filePath);

      return urlData.publicUrl;
    } catch (error) {
      console.error('Error uploading audio:', error);
      alert('Failed to upload audio file');
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!content.trim() && (moduleType === 'text' || ((moduleType === 'audio_sentence' || moduleType === 'audio_paragraph') && audioSource === 'ai'))) {
        alert('Content is required for this lesson type');
        setLoading(false);
        return;
      }

      let audioUrl: string | null = null;

      if ((moduleType === 'audio_sentence' || moduleType === 'audio_paragraph') && audioSource === 'upload') {
        if (!audioFile) {
          alert('Please select an audio file to upload');
          setLoading(false);
          return;
        }
        audioUrl = await uploadAudioFile();
        if (!audioUrl) {
          setLoading(false);
          return;
        }
      }

      const { error } = await supabase.from('classes').insert({
        title,
        content: content.trim() || null,
        level,
        module_type: moduleType,
        audio_url: audioUrl,
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

          {(moduleType === 'audio_sentence' || moduleType === 'audio_paragraph') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Audio Source
              </label>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <button
                  type="button"
                  onClick={() => setAudioSource('ai')}
                  className={`px-4 py-3 border-2 rounded-lg transition-all ${
                    audioSource === 'ai'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                  }`}
                >
                  <Sparkles className="w-5 h-5 mx-auto mb-1" />
                  <div className="text-sm font-medium">AI-Generated</div>
                </button>
                <button
                  type="button"
                  onClick={() => setAudioSource('upload')}
                  className={`px-4 py-3 border-2 rounded-lg transition-all ${
                    audioSource === 'upload'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                  }`}
                >
                  <Upload className="w-5 h-5 mx-auto mb-1" />
                  <div className="text-sm font-medium">Upload Audio</div>
                </button>
              </div>

              {audioSource === 'upload' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Audio File (.mp3, .wav, .m4a)
                  </label>
                  <input
                    type="file"
                    accept=".mp3,.wav,.m4a,audio/mpeg,audio/wav,audio/mp4,audio/x-m4a"
                    onChange={handleAudioFileChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {audioFile && (
                    <p className="text-sm text-green-600 mt-2">
                      Selected: {audioFile.name}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Content {(moduleType === 'audio_sentence' || moduleType === 'audio_paragraph') && '(Transcript)'}
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
              placeholder={
                moduleType === 'audio_sentence' || moduleType === 'audio_paragraph'
                  ? audioSource === 'upload'
                    ? 'Optional: Enter the transcript/text that students will type...'
                    : 'Enter the transcript/text that students will type...'
                  : 'Enter the text content for this class...'
              }
              required={
                moduleType === 'text' ||
                (moduleType === 'audio_sentence' && audioSource === 'ai') ||
                (moduleType === 'audio_paragraph' && audioSource === 'ai')
              }
            />
            {(moduleType === 'audio_sentence' || moduleType === 'audio_paragraph') && audioSource === 'ai' && (
              <p className="text-xs text-gray-500 mt-1">
                This text will be hidden from students during the lesson. They will only hear the audio.
              </p>
            )}
            {(moduleType === 'audio_sentence' || moduleType === 'audio_paragraph') && audioSource === 'upload' && (
              <p className="text-xs text-green-600 mt-1">
                Transcript is optional when uploading audio. Students will type what they hear.
              </p>
            )}
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
