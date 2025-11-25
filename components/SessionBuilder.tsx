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

  // Enhanced visual styles with separated data for better UI rendering
  const visualStyleOptions = isKid
    ? [
        { name: 'Enchanted Forest', emoji: '🌳' }, 
        { name: 'Outer Space', emoji: '🚀' }, 
        { name: 'Underwater Kingdom', emoji: '🐠' }, 
        { name: 'Animal Village', emoji: '🦊' },
        { name: 'Cloud Castle', emoji: '🏰' },
        { name: 'Secret Garden', emoji: '🌸' },
        { name: 'Dinosaur Land', emoji: '🦕' },
        { name: 'Candy Kingdom', emoji: '🍭' },
        { name: 'Pirate Ship', emoji: '🏴‍☠️' },
        { name: 'Superhero City', emoji: '🏙️' }
      ]
    : [
        { name: 'Geometric Patterns', emoji: '📐' }, 
        { name: 'Celestial Nebula', emoji: '🌌' }, 
        { name: 'Water Ripples', emoji: '💧' }, 
        { name: 'Light Forms', emoji: '✨' },
        { name: 'Zen Garden', emoji: '🎋' },
        { name: 'Misty Mountains', emoji: '🏔️' },
        { name: 'Aurora Borealis', emoji: '🌠' },
        { name: 'Desert Dunes', emoji: '🏜️' },
        { name: 'Deep Ocean', emoji: '🌊' },
        { name: 'Rainforest Rain', emoji: '🌧️' }
      ];

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
    <div className={`max-w-3xl mx-auto p-6 rounded-2xl ${isKid ? 'bg-white border-4 border-kid-secondary shadow-[8px_8px_0px_rgba(245,158,11,0.5)]' : 'bg-white shadow-xl'}`}>
      
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
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {moods.map(m => (
                  <button
                    key={m}
                    onClick={() => setFormData({ ...formData, mood: m })}
                    className={`p-4 rounded-xl border-2 transition-all font-medium h-24 flex items-center justify-center text-center ${
                      formData.mood === m
                        ? (isKid ? 'border-kid-primary bg-sky-50 shadow-md transform scale-105' : 'border-indigo-600 bg-indigo-50 shadow-md')
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
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
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {visualStyleOptions.map(option => {
                  const fullValue = `${option.name} ${option.emoji}`;
                  const isSelected = formData.visualStyle === fullValue;
                  
                  return (
                    <button
                      key={option.name}
                      onClick={() => setFormData({ ...formData, visualStyle: fullValue })}
                      className={`p-2 rounded-xl border-2 transition-all text-center flex flex-col items-center justify-center min-h-[110px] ${
                        isSelected
                          ? (isKid ? 'border-kid-primary bg-sky-50 shadow-lg scale-105 ring-2 ring-kid-primary/20' : 'border-indigo-600 bg-indigo-50 shadow-lg scale-105')
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 hover:scale-105'
                      }`}
                    >
                      <span className="text-3xl mb-2 filter drop-shadow-sm">{option.emoji}</span>
                      <span className={`text-xs font-bold leading-tight ${isKid ? 'text-slate-700' : 'text-slate-600'}`}>
                        {option.name}
                      </span>
                    </button>
                  );
                })}
              </div>
              
              <div className="mt-8 border-t border-slate-100 pt-6">
                 <label className={`block text-sm font-bold mb-3 ${isKid ? 'text-slate-600' : 'text-slate-700'}`}>
                    {isKid ? "Picture Quality 🎨" : "Resolution"}
                 </label>
                 <div className="flex gap-3">
                    {Object.values(ImageSize).map(size => (
                      <button
                        key={size}
                        onClick={() => setFormData({ ...formData, imageSize: size })}
                        className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-colors ${
                           formData.imageSize === size 
                           ? (isKid ? 'bg-kid-primary text-white border-kid-primary shadow-sm' : 'bg-indigo-600 text-white border-indigo-600 shadow-sm')
                           : 'bg-white border-slate-300 text-slate-600 hover:border-slate-400'
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
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {voices.map(v => (
                  <button
                    key={v}
                    onClick={() => setFormData({ ...formData, voice: v })}
                    className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-2 min-h-[120px] ${
                      formData.voice === v
                        ? (isKid ? 'border-kid-primary bg-sky-50 shadow-md' : 'border-indigo-600 bg-indigo-50 shadow-md')
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className={`p-3 rounded-full ${isKid ? 'bg-white' : 'bg-slate-100'}`}>
                      {isKid ? '🦜' : '🎙️'}
                    </div>
                    <div className="text-center">
                      <div className="font-bold">{v}</div>
                      <div className="text-xs text-slate-400 mt-1">AI Voice</div>
                    </div>
                  </button>
                ))}
              </div>
              
              <div className="bg-slate-50 p-4 rounded-lg text-sm text-slate-600 border border-slate-100">
                <h4 className="font-bold mb-2 uppercase text-xs tracking-wider text-slate-400">Session Summary</h4>
                <div className="space-y-1">
                    <p><span className="font-semibold text-slate-700">Mood:</span> {formData.mood}</p>
                    <p><span className="font-semibold text-slate-700">Visual:</span> {formData.visualStyle} ({formData.imageSize})</p>
                    <p><span className="font-semibold text-slate-700">Voice:</span> {formData.voice}</p>
                </div>
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