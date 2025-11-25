import React, { useEffect, useRef, useState } from 'react';
import { MeditationSession, AppMode } from '../types';
import { Play, Pause, X, RefreshCw } from 'lucide-react';
import { Button } from './Button';

interface MeditationPlayerProps {
  session: MeditationSession;
  mode: AppMode;
  onClose: () => void;
  audioContext: AudioContext;
}

export const MeditationPlayer: React.FC<MeditationPlayerProps> = ({ session, mode, onClose, audioContext }) => {
  const isKid = mode === AppMode.Kid;
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const startTimeRef = useRef<number>(0);
  const pauseTimeRef = useRef<number>(0);
  const animationFrameRef = useRef<number>(0);

  // Initialize playback duration
  useEffect(() => {
    if (session.audioBuffer) {
      setDuration(session.audioBuffer.duration);
    }
  }, [session.audioBuffer]);

  const stopAudio = () => {
    if (sourceRef.current) {
      try {
        sourceRef.current.stop();
        sourceRef.current.disconnect();
      } catch (e) {
        // ignore if already stopped
      }
      sourceRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  };

  const updateProgress = () => {
    const elapsed = audioContext.currentTime - startTimeRef.current + pauseTimeRef.current;
    setProgress(Math.min(elapsed, duration));
    
    if (elapsed < duration && isPlaying) {
      animationFrameRef.current = requestAnimationFrame(updateProgress);
    } else if (elapsed >= duration) {
      setIsPlaying(false);
      setProgress(0);
      pauseTimeRef.current = 0;
    }
  };

  const togglePlay = () => {
    if (isPlaying) {
      // Pause
      stopAudio();
      pauseTimeRef.current += audioContext.currentTime - startTimeRef.current;
      setIsPlaying(false);
    } else {
      // Play
      if (!session.audioBuffer) return;
      
      const source = audioContext.createBufferSource();
      source.buffer = session.audioBuffer;
      source.connect(audioContext.destination);
      
      startTimeRef.current = audioContext.currentTime;
      source.start(0, pauseTimeRef.current);
      sourceRef.current = source;
      
      setIsPlaying(true);
      
      // Start progress loop
      const loop = () => {
        const elapsed = audioContext.currentTime - startTimeRef.current + pauseTimeRef.current;
        setProgress(Math.min(elapsed, session.audioBuffer!.duration));
        if (elapsed < session.audioBuffer!.duration) {
          animationFrameRef.current = requestAnimationFrame(loop);
        } else {
          setIsPlaying(false);
          pauseTimeRef.current = 0;
          setProgress(0);
        }
      };
      loop();
    }
  };

  useEffect(() => {
    // Cleanup on unmount
    return () => stopAudio();
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className={`relative w-full max-w-4xl h-[85vh] overflow-hidden rounded-2xl flex flex-col md:flex-row shadow-2xl ${isKid ? 'bg-amber-50' : 'bg-slate-900'}`}>
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-black/20 hover:bg-black/40 rounded-full text-white backdrop-blur transition-all"
        >
          <X size={24} />
        </button>

        {/* Visual Side */}
        <div className="w-full md:w-1/2 h-1/2 md:h-full relative bg-black">
          {session.imageUrl && (
            <img 
              src={session.imageUrl} 
              alt={session.visualPrompt} 
              className="w-full h-full object-cover opacity-90"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-8">
             <h2 className="text-white text-3xl font-bold mb-2 shadow-black drop-shadow-md">{session.title}</h2>
             <p className="text-white/80 text-sm">{session.visualStyle} • {session.mood}</p>
          </div>
        </div>

        {/* Controls Side */}
        <div className={`w-full md:w-1/2 h-1/2 md:h-full flex flex-col p-8 ${isKid ? 'bg-amber-50' : 'bg-white'}`}>
           
           <div className="flex-1 overflow-y-auto mb-6 pr-2">
             <h3 className={`text-lg font-bold mb-4 ${isKid ? 'text-amber-800 font-rounded' : 'text-slate-800'}`}>Transcript</h3>
             <p className={`text-lg leading-relaxed ${isKid ? 'text-slate-700 font-rounded' : 'text-slate-600'}`}>
               {session.script}
             </p>
           </div>

           <div className="mt-auto">
             {/* Progress Bar */}
             <div className="w-full h-2 bg-slate-200 rounded-full mb-6 overflow-hidden">
               <div 
                  className={`h-full transition-all duration-100 ${isKid ? 'bg-kid-primary' : 'bg-indigo-600'}`} 
                  style={{ width: `${(progress / (duration || 1)) * 100}%` }} 
               />
             </div>

             <div className="flex justify-center items-center gap-6">
                <Button 
                   variant={isKid ? 'kid' : 'primary'} 
                   className="rounded-full w-16 h-16 p-0 flex items-center justify-center"
                   onClick={togglePlay}
                >
                   {isPlaying ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
                </Button>
                
                <button 
                  onClick={() => {
                    stopAudio();
                    pauseTimeRef.current = 0;
                    setProgress(0);
                    setIsPlaying(false);
                  }}
                  className={`p-4 rounded-full transition-colors ${isKid ? 'text-amber-600 hover:bg-amber-100' : 'text-slate-500 hover:bg-slate-100'}`}
                >
                  <RefreshCw size={24} />
                </button>
             </div>
           </div>
        </div>

      </div>
    </div>
  );
};