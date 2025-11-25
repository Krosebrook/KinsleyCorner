import React, { useState, useEffect } from 'react';
import { AppMode, MeditationSession } from './types';
import { SessionBuilder } from './components/SessionBuilder';
import { MeditationPlayer } from './components/MeditationPlayer';
import { ChatBot } from './components/ChatBot';
import { LayoutDashboard, Plus, History, User, Moon, Sun, Baby } from 'lucide-react';
import { Button } from './components/Button';

// Helper to create AudioContext lazily
const getAudioContext = () => {
  const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
  return new AudioContextClass();
};

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.Adult);
  const [view, setView] = useState<'dashboard' | 'create' | 'history'>('dashboard');
  const [sessions, setSessions] = useState<MeditationSession[]>([]);
  const [activeSession, setActiveSession] = useState<MeditationSession | null>(null);
  const [audioCtx, setAudioCtx] = useState<AudioContext | null>(null);

  useEffect(() => {
    // Initialize AudioContext on first user interaction to comply with browser autoplay policies
    const initAudio = () => {
      if (!audioCtx) {
        setAudioCtx(getAudioContext());
      }
    };
    window.addEventListener('click', initAudio, { once: true });
    return () => window.removeEventListener('click', initAudio);
  }, [audioCtx]);

  const handleSessionCreated = (session: MeditationSession) => {
    setSessions(prev => [session, ...prev]);
    setActiveSession(session);
    setView('dashboard');
  };

  const isKid = mode === AppMode.Kid;

  return (
    <div className={`min-h-screen transition-colors duration-500 ${isKid ? 'bg-sky-50 font-rounded' : 'bg-slate-50 font-sans'}`}>
      
      {/* Navigation Bar */}
      <nav className={`sticky top-0 z-30 px-6 py-4 shadow-sm flex items-center justify-between transition-colors ${isKid ? 'bg-white border-b-4 border-kid-primary' : 'bg-white/80 backdrop-blur border-b border-slate-200'}`}>
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-lg ${isKid ? 'bg-kid-primary text-white' : 'bg-indigo-600 text-white'}`}>
            <Moon size={24} />
          </div>
          <span className={`text-xl font-bold ${isKid ? 'text-kid-primary tracking-wide' : 'text-slate-900'}`}>
            Mindful Mates
          </span>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => setMode(mode === AppMode.Adult ? AppMode.Kid : AppMode.Adult)}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors text-sm font-medium"
          >
            {mode === AppMode.Adult ? <><Baby size={18}/> Switch to Kids</> : <><User size={18}/> Switch to Parents</>}
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-5xl pb-24">
        
        {/* Header Section */}
        <header className="mb-10 flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h1 className={`text-4xl font-bold mb-2 ${isKid ? 'text-slate-800' : 'text-slate-900'}`}>
              {isKid ? "Welcome to your Calm Corner! 🎪" : "Good Afternoon."}
            </h1>
            <p className="text-slate-500">
              {isKid ? "Let's find some magic today." : "Ready to find your center?"}
            </p>
          </div>
          
          <div className="flex gap-3">
            {view !== 'create' && (
              <Button 
                variant={isKid ? 'kid' : 'primary'} 
                onClick={() => setView('create')}
                className="py-3 px-6 text-lg"
              >
                <Plus size={20} />
                {isKid ? "New Magic Story" : "New Session"}
              </Button>
            )}
            {view !== 'dashboard' && (
              <Button variant="ghost" onClick={() => setView('dashboard')}>
                Cancel
              </Button>
            )}
          </div>
        </header>

        {/* View Switcher */}
        {view === 'create' ? (
          <SessionBuilder 
            mode={mode} 
            onSessionCreated={handleSessionCreated} 
            audioContext={audioCtx || getAudioContext()} 
          />
        ) : (
          <div className="space-y-10">
            
            {/* Quick Stats / Mood Tracker (Simple Visualization) */}
            {!isKid && (
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">Total Sessions</h3>
                    <p className="text-4xl font-light text-slate-800">{sessions.length}</p>
                 </div>
                 <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">Current Streak</h3>
                    <p className="text-4xl font-light text-slate-800">3 Days</p>
                 </div>
                 <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">Fav Mood</h3>
                    <p className="text-4xl font-light text-slate-800">Focus</p>
                 </div>
               </div>
            )}

            {/* Recent Sessions */}
            <div className="space-y-4">
              <h2 className={`text-2xl font-bold ${isKid ? 'text-kid-primary' : 'text-slate-800'}`}>
                {isKid ? "Your Magic Journeys" : "Recent Sessions"}
              </h2>
              
              {sessions.length === 0 ? (
                <div className={`text-center py-20 rounded-2xl border-2 border-dashed ${isKid ? 'border-kid-secondary bg-white' : 'border-slate-200 bg-slate-50'}`}>
                  <p className="text-slate-400 mb-4">{isKid ? "No stories yet! Let's make one!" : "No sessions created yet."}</p>
                  <Button variant={isKid ? 'kid' : 'outline'} onClick={() => setView('create')}>Create First Session</Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {sessions.map(session => (
                    <div 
                      key={session.id} 
                      onClick={() => setActiveSession(session)}
                      className={`group cursor-pointer rounded-2xl overflow-hidden transition-all hover:shadow-xl ${
                        isKid ? 'bg-white shadow-[4px_4px_0px_#f59e0b] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_#f59e0b]' : 'bg-white shadow-md hover:shadow-lg'
                      }`}
                    >
                      <div className="h-48 bg-slate-200 relative overflow-hidden">
                        {session.imageUrl ? (
                          <img src={session.imageUrl} alt={session.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-indigo-50">
                            <Moon className="text-indigo-200" size={48} />
                          </div>
                        )}
                        <div className="absolute top-2 right-2 bg-black/50 backdrop-blur text-white text-xs px-2 py-1 rounded">
                          {session.duration}
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-bold text-lg mb-1 truncate">{session.title}</h3>
                        <div className="flex justify-between items-center text-sm text-slate-500">
                          <span>{session.mood}</span>
                          <span>{new Date(session.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Active Session Player */}
      {activeSession && (
        <MeditationPlayer 
          session={activeSession} 
          mode={mode}
          onClose={() => setActiveSession(null)}
          audioContext={audioCtx || getAudioContext()}
        />
      )}

      {/* Chat Bot */}
      <ChatBot mode={mode} />

    </div>
  );
};

export default App;