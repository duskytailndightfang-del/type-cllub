import React, { useState } from 'react';
import { Mic, Upload, Volume2, Loader2, Play, Pause, AlertCircle } from 'lucide-react';

interface AudioLessonCreatorProps {
  onAudioCreated: (audioData: {
    audioUrl: string;
    transcript: string;
    audioSource: 'elevenlabs' | 'upload';
    voiceId?: string;
    playbackSpeed?: number;
  }) => void;
}

const ELEVENLABS_VOICES = [
  { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Sarah (Female)' },
  { id: 'VR6AewLTigWG4xSOukaG', name: 'Arnold (Male)' },
  { id: 'pNInz6obpgDQGcFmaJgB', name: 'Adam (Male)' },
  { id: 'ErXwobaYiN019PkySvjV', name: 'Antoni (Male)' },
  { id: 'MF3mGyEYCl7XYWbV9V6O', name: 'Elli (Female)' },
];

export const AudioLessonCreator: React.FC<AudioLessonCreatorProps> = ({ onAudioCreated }) => {
  const [mode, setMode] = useState<'elevenlabs' | 'upload' | null>(null);
  const [transcript, setTranscript] = useState('');
  const [selectedVoice, setSelectedVoice] = useState(ELEVENLABS_VOICES[0].id);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [generatedAudioUrl, setGeneratedAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const handleGenerateAudio = async () => {
    if (!transcript.trim()) {
      alert('Please enter text to generate audio');
      return;
    }

    const elevenLabsApiKey = import.meta.env.VITE_ELEVENLABS_API_KEY;
    if (!elevenLabsApiKey) {
      alert('Please add your ElevenLabs API key to the .env file as VITE_ELEVENLABS_API_KEY');
      return;
    }

    setIsGenerating(true);
    try {
      console.log('Generating audio with ElevenLabs...', { text: transcript.substring(0, 50), voiceId: selectedVoice });

      const response = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${selectedVoice}`,
        {
          method: 'POST',
          headers: {
            'Accept': 'audio/mpeg',
            'Content-Type': 'application/json',
            'xi-api-key': elevenLabsApiKey,
          },
          body: JSON.stringify({
            text: transcript,
            model_id: 'eleven_monolingual_v1',
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.75,
            },
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('ElevenLabs API error:', errorText);
        throw new Error(`Failed to generate audio: ${response.status} ${response.statusText}`);
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      console.log('Audio generated successfully');
      setGeneratedAudioUrl(audioUrl);
    } catch (error) {
      console.error('Error generating audio:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert(`Failed to generate audio: ${errorMessage}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('audio/')) {
      alert('Please upload an audio file');
      return;
    }

    setUploadedFile(file);
    const audioUrl = URL.createObjectURL(file);
    setGeneratedAudioUrl(audioUrl);

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    const abacusApiKey = import.meta.env.VITE_ABACUS_AI_API_KEY;

    if (abacusApiKey && supabaseUrl && supabaseAnonKey) {
      setIsTranscribing(true);
      try {
        const formData = new FormData();
        formData.append('audio', file);

        const response = await fetch(`${supabaseUrl}/functions/v1/transcribe-audio`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${supabaseAnonKey}`,
          },
          body: formData,
        });

        if (response.ok) {
          const data = await response.json();
          if (data.transcript) {
            setTranscript(data.transcript);
            console.log('Audio transcribed successfully');
          }
        } else {
          console.error('Transcription failed:', await response.text());
        }
      } catch (error) {
        console.error('Error transcribing audio:', error);
      } finally {
        setIsTranscribing(false);
      }
    }
  };

  const togglePlayPause = () => {
    if (!generatedAudioUrl) return;

    if (!audioElement) {
      const audio = new Audio(generatedAudioUrl);
      audio.playbackRate = mode === 'elevenlabs' ? playbackSpeed : 1.0;
      audio.onended = () => setIsPlaying(false);
      setAudioElement(audio);
      audio.play();
      setIsPlaying(true);
    } else {
      if (isPlaying) {
        audioElement.pause();
        setIsPlaying(false);
      } else {
        audioElement.play();
        setIsPlaying(true);
      }
    }
  };

  const handleConfirm = async () => {
    if (!generatedAudioUrl || !transcript.trim()) {
      alert('Please ensure both audio and transcript are provided');
      return;
    }

    onAudioCreated({
      audioUrl: generatedAudioUrl,
      transcript: transcript.trim(),
      audioSource: mode!,
      voiceId: mode === 'elevenlabs' ? selectedVoice : undefined,
      playbackSpeed: mode === 'elevenlabs' ? playbackSpeed : undefined,
    });

    setMode(null);
    setTranscript('');
    setGeneratedAudioUrl(null);
    setUploadedFile(null);
    if (audioElement) {
      audioElement.pause();
      setAudioElement(null);
    }
    setIsPlaying(false);
  };

  if (!mode) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Choose Audio Input Method</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => setMode('elevenlabs')}
            className="flex items-center justify-center gap-3 p-6 border-2 border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all"
          >
            <Volume2 className="w-8 h-8 text-blue-600" />
            <div className="text-left">
              <div className="font-semibold text-gray-900">Generate Audio</div>
              <div className="text-sm text-gray-600">Use ElevenLabs AI text-to-speech</div>
            </div>
          </button>
          <button
            onClick={() => setMode('upload')}
            className="flex items-center justify-center gap-3 p-6 border-2 border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all"
          >
            <Upload className="w-8 h-8 text-green-600" />
            <div className="text-left">
              <div className="font-semibold text-gray-900">Upload Audio</div>
              <div className="text-sm text-gray-600">Upload existing audio file</div>
            </div>
          </button>
        </div>
      </div>
    );
  }

  if (mode === 'elevenlabs') {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Generate Audio with ElevenLabs</h3>
          <button
            onClick={() => {
              setMode(null);
              setTranscript('');
              setGeneratedAudioUrl(null);
            }}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Change Method
          </button>
        </div>

        {!import.meta.env.VITE_ELEVENLABS_API_KEY && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800">
              <strong>Note:</strong> Please add your ElevenLabs API key to the .env file as VITE_ELEVENLABS_API_KEY to use this feature.
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Text Transcript
          </label>
          <textarea
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            rows={6}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter the text you want to convert to speech..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Voice
            </label>
            <select
              value={selectedVoice}
              onChange={(e) => setSelectedVoice(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {ELEVENLABS_VOICES.map((voice) => (
                <option key={voice.id} value={voice.id}>
                  {voice.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Playback Speed: {playbackSpeed.toFixed(1)}x
            </label>
            <input
              type="range"
              min="0.5"
              max="2.0"
              step="0.1"
              value={playbackSpeed}
              onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleGenerateAudio}
            disabled={isGenerating || !transcript.trim()}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Mic className="w-4 h-4" />
                Generate Audio
              </>
            )}
          </button>

          {generatedAudioUrl && (
            <>
              <button
                onClick={togglePlayPause}
                className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-4 h-4" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    Play Preview
                  </>
                )}
              </button>

              <button
                onClick={handleConfirm}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Confirm & Use This Audio
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  if (mode === 'upload') {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Upload Audio File</h3>
          <button
            onClick={() => {
              setMode(null);
              setTranscript('');
              setGeneratedAudioUrl(null);
              setUploadedFile(null);
            }}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Change Method
          </button>
        </div>

        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <input
            type="file"
            accept="audio/*"
            onChange={handleFileUpload}
            className="hidden"
            id="audio-upload"
            disabled={isTranscribing}
          />
          <label
            htmlFor="audio-upload"
            className="cursor-pointer flex flex-col items-center gap-2"
          >
            {isTranscribing ? (
              <>
                <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
                <span className="text-sm text-blue-600 font-medium">
                  Transcribing audio with Abacus AI...
                </span>
              </>
            ) : (
              <>
                <Upload className="w-12 h-12 text-gray-400" />
                <span className="text-sm text-gray-600">
                  {uploadedFile ? uploadedFile.name : 'Click to upload audio file (MP3, WAV, etc.)'}
                </span>
              </>
            )}
          </label>
        </div>

        {generatedAudioUrl && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Transcript {isTranscribing && <span className="text-blue-600">(Auto-transcribing...)</span>}
                {!isTranscribing && <span className="text-xs text-gray-500 ml-2">Edit if needed or let AI transcribe</span>}
              </label>
              <textarea
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Transcript will be generated automatically using Abacus AI. You can edit it if needed."
                disabled={isTranscribing}
              />
              <p className="text-xs text-gray-500 mt-1">
                {isTranscribing
                  ? 'Please wait while we transcribe your audio...'
                  : 'Students will hear the audio and type what they hear. This transcript is used to check their accuracy.'}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={togglePlayPause}
                className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-4 h-4" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    Play Preview
                  </>
                )}
              </button>

              <button
                onClick={handleConfirm}
                disabled={!transcript.trim()}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirm & Use This Audio
              </button>
            </div>
          </>
        )}
      </div>
    );
  }

  return null;
};
