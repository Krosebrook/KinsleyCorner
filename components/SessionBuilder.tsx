import React, { useState, useContext } from 'react';
import { AppMode, ImageSize, VoiceName } from '../types';
import { Button } from './Button';
import { generateMeditationScript, generateMeditationImage, generateMeditationAudio } from '../services/geminiService';
import { Wand2, Image as ImageIcon, Music, Sparkles } from 'lucide-react';

interface SessionBuilderProps {
  mode: AppMode;
  onSessionCreated: (session: any) => void;
  audioContext: AudioContext;
}

export const SessionBuilder: React.FC<SessionBuilderProps> = ({ mode, onSessionCreated, audioContext }) => {
  const isKid = mode === AppMode.Kid;
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');

  const [formData, setFormData] = useState({
    mood: '',
    visualStyle: '',
    imageSize: ImageSize.Size_1K,
    voice: isKid ? VoiceName.Puck : VoiceName.Kore,
    duration: 'Short'
  });

  const moods = isKid 
    ? ['Sleepy Time 😴', 'Calm Down 🧘', 'Happy Thoughts 🌟', 'Focus Power 🧠']
    : ['Stress Relief', 'Better Sleep', 'Morning Energy', 'Deep Focus', 'Anxiety Release'];

  const visualStyles = isKid
    ? ['Magic Forest 🌳', 'Space Adventure 🚀', 'Underwater World 🐠', 'Cartoon Animals 🦊']
    : ['Zen Garden', 'Abstract Geometry', 'Misty Mountains', 'Cosmic Nebula', 'Surrealist Dream'];

  const voices = isKid
    ? [VoiceName.Puck, VoiceName.Zephyr]
    : [VoiceName.Kore, VoiceName.Fenrir, VoiceName.Charon, VoiceName.Puck];

  const handleGenerate = async () => {
    setLoading(true);
    setStatus('Writing your meditation script...');
    try {
      // 1. Generate Script
      const { title, script, visualPrompt } = await generateMeditationScript(
        isKid ? "6-9" : "Adult",
        formData.mood,
        formData.visualStyle,
        formData.duration
      );

      setStatus('Painting your unique visual...');
      // 2. Generate Image
      const imageUrl = await generateMeditationImage(visualPrompt, formData.imageSize);

      setStatus('Recording the voiceover...');
      // 3. Generate Audio
      const audioBuffer = await generateMeditationAudio(script, formData.voice, audioContext);

      onSessionCreated({
        id: Date.now().toString(),
        title,
        script,
        mood: formData.mood,
        duration: formData.duration,
        visualStyle: formData.visualStyle,
        visualPrompt,
        imageUrl,
        audioBuffer,
        createdAt: Date.now()
      });

    } catch (error) {
      console.error(error);
      alert('Something went wrong creating your session. Please try again.');
    } finally {
      setLoading(false);
      setStatus('');
    }
  };

  const StepIndicator = ({ num, icon: Icon }: any) => (
    <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${step >= num ? (isKid ? 'bg-kid-primary border-kid-primary text-white' : 'bg-indigo-600 border-indigo-600 text-white') : 'border-slate-300 text-slate-300'}`}>
      <Icon size={20} />
    </div>
  );

  return (
    <div className={`max-w-2xl mx-auto p-6 rounded-2xl ${isKid ? 'bg-white border-4 border-kid-secondary shadow-[8px_8px_0px_rgba(245,158,11,0.5)]' : 'bg-white shadow-xl'}`}>
      
      {!loading && (
        <div className="flex justify-between mb-8 px-8 relative">
          <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 -z-10" />
          <StepIndicator num={1} icon={Sparkles} />
          <StepIndicator num={2} icon={ImageIcon} />
          <StepIndicator num={3} icon={Music} />
        </div>
      )}

      {loading ? (
        <div className="text-center py-20">
          <div className={`w-20 h-20 mx-auto mb-6 rounded-full border-4 border-t-transparent animate-spin ${isKid ? 'border-kid-primary' : 'border-indigo-600'}`} />
          <h3 className={`text-2xl font-bold mb-2 ${isKid ? 'font-rounded text-kid-primary' : 'text-slate-800'}`}>{isKid ? "Magic happening..." : "Generating Session"}</h3>
          <p className="text-slate-500">{status}</p>
        </div>
      ) : (
        <>
          {step === 1 && (
            <div className="space-y-6">
              <h2 className={`text-2xl font-bold text-center ${isKid ? 'font-rounded text-kid-primary' : 'text-slate-800'}`}>
                {isKid ? "How are you feeling today?" : "What is your goal for this session?"}
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {moods.map(m => (
                  <button
                    key={m}
                    onClick={() => setFormData({ ...formData, mood: m })}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      formData.mood === m
                        ? (isKid ? 'border-kid-primary bg-sky-50' : 'border-indigo-600 bg-indigo-50')
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
              <div className="flex justify-end pt-4">
                <Button variant={isKid ? 'kid' : 'primary'} onClick={() => setStep(2)} disabled={!formData.mood}>Next</Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <h2 className={`text-2xl font-bold text-center ${isKid ? 'font-rounded text-kid-primary' : 'text-slate-800'}`}>
                {isKid ? "Pick a magical place!" : "Choose a visual environment"}
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {visualStyles.map(v => (
                  <button
                    key={v}
                    onClick={() => setFormData({ ...formData, visualStyle: v })}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      formData.visualStyle === v
                        ? (isKid ? 'border-kid-primary bg-sky-50' : 'border-indigo-600 bg-indigo-50')
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
              
              <div className="mt-4">
                 <label className="block text-sm font-medium text-slate-700 mb-2">Image Quality</label>
                 <div className="flex gap-2">
                    {Object.values(ImageSize).map(size => (
                      <button
                        key={size}
                        onClick={() => setFormData({ ...formData, imageSize: size })}
                        className={`px-3 py-1 rounded border text-sm ${
                           formData.imageSize === size 
                           ? (isKid ? 'bg-kid-primary text-white border-kid-primary' : 'bg-indigo-600 text-white border-indigo-600')
                           : 'bg-white border-slate-300 text-slate-600'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                 </div>
              </div>

              <div className="flex justify-between pt-4">
                <Button variant="ghost" onClick={() => setStep(1)}>Back</Button>
                <Button variant={isKid ? 'kid' : 'primary'} onClick={() => setStep(3)} disabled={!formData.visualStyle}>Next</Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <h2 className={`text-2xl font-bold text-center ${isKid ? 'font-rounded text-kid-primary' : 'text-slate-800'}`}>
                {isKid ? "Who should read the story?" : "Select a voice guide"}
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {voices.map(v => (
                  <button
                    key={v}
                    onClick={() => setFormData({ ...formData, voice: v })}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      formData.voice === v
                        ? (isKid ? 'border-kid-primary bg-sky-50' : 'border-indigo-600 bg-indigo-50')
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="font-semibold">{v}</div>
                    <div className="text-xs text-slate-500">AI Voice</div>
                  </button>
                ))}
              </div>
              
              <div className="bg-slate-50 p-4 rounded-lg text-sm text-slate-600">
                <h4 className="font-semibold mb-1">Summary</h4>
                <p>Mood: {formData.mood}</p>
                <p>Visual: {formData.visualStyle} ({formData.imageSize})</p>
                <p>Voice: {formData.voice}</p>
              </div>

              <div className="flex justify-between pt-4">
                <Button variant="ghost" onClick={() => setStep(2)}>Back</Button>
                <Button variant={isKid ? 'kid' : 'primary'} onClick={handleGenerate}>
                  <Wand2 size={18} className="mr-2" />
                  {isKid ? "Create Magic!" : "Generate Session"}
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};