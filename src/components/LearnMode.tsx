import { useState } from 'react';
import { educationalContent } from '../gameData';
import { GameScreen } from '../types';

interface Props {
  onNavigate: (screen: GameScreen) => void;
}

export default function LearnMode({ onNavigate }: Props) {
  const [expandedId, setExpandedId] = useState<number | null>(0);
  const [quizMode, setQuizMode] = useState(false);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [quizDone, setQuizDone] = useState(false);

  const quizQuestions = [
    {
      q: 'What are the three elements of the Fire Triangle?',
      options: ['Heat, Fuel, Oxygen', 'Water, Fire, Air', 'Smoke, Flame, Gas', 'Heat, Water, Fuel'],
      correct: 0,
    },
    {
      q: 'What does the "P" in PASS stand for?',
      options: ['Push', 'Point', 'Pull', 'Press'],
      correct: 2,
    },
    {
      q: 'Which extinguisher should you use on an electrical fire?',
      options: ['Water', 'Foam', 'CO₂', 'None — run away'],
      correct: 2,
    },
    {
      q: 'What should you NEVER use on a grease fire?',
      options: ['Foam extinguisher', 'Water', 'Fire blanket', 'Baking soda'],
      correct: 1,
    },
    {
      q: 'During a fire, should you use the elevator?',
      options: ['Yes, it\'s faster', 'Only going down', 'Never', 'Only if alone'],
      correct: 2,
    },
    {
      q: 'What should you do before opening a door during a fire?',
      options: ['Kick it open', 'Feel it for heat', 'Look under it', 'Open it slowly'],
      correct: 1,
    },
    {
      q: 'How often should smoke alarm batteries be replaced?',
      options: ['Every month', 'Every 5 years', 'At least once a year', 'When they beep'],
      correct: 2,
    },
    {
      q: 'What is a BLEVE?',
      options: ['A type of fire hose', 'Boiling Liquid Expanding Vapor Explosion', 'A rescue technique', 'A fire rating'],
      correct: 1,
    },
  ];

  const currentQ = quizQuestions[quizIndex];

  const handleAnswer = (idx: number) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(idx);
    if (idx === currentQ.correct) setQuizScore(prev => prev + 1);

    setTimeout(() => {
      if (quizIndex + 1 >= quizQuestions.length) {
        setQuizDone(true);
      } else {
        setQuizIndex(prev => prev + 1);
        setSelectedAnswer(null);
      }
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="relative h-44 md:h-52 overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center opacity-15" style={{ backgroundImage: 'url(/images/city-map.jpg)' }} />
        <div className="absolute inset-0 bg-gradient-to-b from-gray-950/50 to-gray-950" />
        <div className="relative z-10 flex items-end h-full px-4 pb-5 max-w-6xl mx-auto">
          <div className="flex items-center gap-4 w-full">
            <button onClick={() => onNavigate('menu')} className="w-10 h-10 rounded-xl bg-gray-800/80 hover:bg-gray-700/80 flex items-center justify-center transition-colors flex-shrink-0 hover:scale-105 active:scale-95">
              ←
            </button>
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-black flex items-center gap-3">
                📚 <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">ISA FIRE ACADEMY</span>
              </h1>
              <p className="text-gray-500 text-xs mt-1">Master essential fire safety knowledge</p>
            </div>
            <button
              onClick={() => { setQuizMode(!quizMode); setQuizIndex(0); setQuizScore(0); setSelectedAnswer(null); setQuizDone(false); }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 ${
                quizMode
                  ? 'bg-blue-500/20 border-blue-500/40 text-blue-400'
                  : 'bg-gray-800/80 border-gray-700/50 text-gray-400 hover:text-blue-400 hover:border-blue-500/40'
              }`}
            >
              {quizMode ? '📖 Lessons' : '🧠 Quiz Mode'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* QUIZ MODE */}
        {quizMode ? (
          <div className="max-w-2xl mx-auto">
            {quizDone ? (
              <div className="bg-gray-900/80 rounded-2xl border border-gray-700/50 p-8 text-center" style={{ animation: 'fadeIn 0.4s ease' }}>
                <span className="text-6xl block mb-4">{quizScore >= 7 ? '🏆' : quizScore >= 5 ? '🎉' : '📚'}</span>
                <h2 className="text-3xl font-black mb-2">Quiz Complete!</h2>
                <p className="text-5xl font-black my-4">
                  <span className={quizScore >= 7 ? 'text-yellow-400' : quizScore >= 5 ? 'text-green-400' : 'text-orange-400'}>
                    {quizScore}
                  </span>
                  <span className="text-gray-600 text-2xl"> / {quizQuestions.length}</span>
                </p>
                <p className="text-gray-400 text-sm mb-6">
                  {quizScore >= 7 ? 'Outstanding! You\'re a fire safety expert! 🔥' :
                   quizScore >= 5 ? 'Good job! Keep learning to improve! 💪' :
                   'Keep studying! Lives depend on this knowledge! 📖'}
                </p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => { setQuizIndex(0); setQuizScore(0); setSelectedAnswer(null); setQuizDone(false); }}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold transition-all hover:scale-105 active:scale-95"
                  >
                    Retry Quiz 🔄
                  </button>
                  <button
                    onClick={() => setQuizMode(false)}
                    className="px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-xl transition-colors"
                  >
                    Back to Lessons
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-gray-900/80 rounded-2xl border border-gray-700/50 overflow-hidden" style={{ animation: 'fadeIn 0.3s ease' }}>
                {/* Quiz header */}
                <div className="bg-blue-500/10 border-b border-blue-500/20 p-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🧠</span>
                    <span className="text-xs text-blue-400 font-mono">QUESTION {quizIndex + 1}/{quizQuestions.length}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">Score:</span>
                    <span className="text-sm font-bold text-yellow-400">{quizScore}</span>
                  </div>
                </div>

                {/* Progress */}
                <div className="h-1 bg-gray-800">
                  <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${((quizIndex + 1) / quizQuestions.length) * 100}%` }} />
                </div>

                <div className="p-6">
                  <h3 className="text-lg font-bold mb-5">{currentQ.q}</h3>
                  <div className="space-y-2.5">
                    {currentQ.options.map((opt, idx) => {
                      const isSelected = selectedAnswer === idx;
                      const isCorrect = idx === currentQ.correct;
                      const showResult = selectedAnswer !== null;

                      return (
                        <button
                          key={idx}
                          onClick={() => handleAnswer(idx)}
                          disabled={selectedAnswer !== null}
                          className={`w-full rounded-xl border p-4 text-left transition-all duration-200 flex items-center gap-3
                            ${showResult
                              ? isCorrect
                                ? 'border-green-500 bg-green-500/10'
                                : isSelected
                                  ? 'border-red-500 bg-red-500/10'
                                  : 'border-gray-800 bg-gray-900/50 opacity-40'
                              : 'border-gray-700/50 bg-gray-800/50 hover:border-blue-500/50 hover:bg-gray-800/80 hover:scale-[1.01] active:scale-[0.99]'
                            }`}
                        >
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                            showResult
                              ? isCorrect ? 'bg-green-500 text-white' : isSelected ? 'bg-red-500 text-white' : 'bg-gray-700/50 text-gray-500'
                              : 'bg-gray-700/80 text-gray-300'
                          }`}>
                            {showResult ? (isCorrect ? '✓' : isSelected ? '✗' : String.fromCharCode(65 + idx)) : String.fromCharCode(65 + idx)}
                          </div>
                          <span className="text-sm">{opt}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* LESSONS MODE */
          <>
            <div className="space-y-3">
              {educationalContent.map((item, idx) => {
                const isExpanded = expandedId === idx;
                return (
                  <div
                    key={idx}
                    className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                      isExpanded
                        ? 'border-blue-500/30 bg-gray-900/90 shadow-xl shadow-blue-500/5'
                        : 'border-gray-700/50 bg-gray-900/40 hover:border-gray-600/50 hover:bg-gray-900/60'
                    }`}
                    style={{ animation: `fadeIn ${0.2 + idx * 0.05}s ease` }}
                  >
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : idx)}
                      className="w-full p-4 md:p-5 text-left flex items-center gap-3"
                    >
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 transition-colors ${
                        isExpanded ? 'bg-blue-500/15' : 'bg-gray-800/50'
                      }`}>
                        {item.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-sm">{item.title}</h3>
                        <p className="text-gray-500 text-xs mt-0.5 line-clamp-1">{item.content}</p>
                      </div>
                      <span className={`text-sm transition-transform duration-200 text-gray-600 ${isExpanded ? 'rotate-180' : ''}`}>▼</span>
                    </button>

                    {isExpanded && (
                      <div className="px-4 pb-4 md:px-5 md:pb-5" style={{ animation: 'fadeIn 0.3s ease' }}>
                        <div className="border-t border-gray-700/30 pt-3">
                          <p className="text-gray-300 text-sm mb-3">{item.content}</p>
                          <div className="bg-gray-800/40 rounded-xl p-3.5 space-y-2">
                            {item.details.map((detail, dIdx) => (
                              <div key={dIdx} className="flex items-start gap-2 text-sm" style={{ animation: `fadeIn ${0.2 + dIdx * 0.05}s ease` }}>
                                <span className="text-blue-400 mt-0.5 flex-shrink-0 text-xs">▸</span>
                                <span className="text-gray-300">{detail}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Quick Reference Cards */}
            <div className="mt-8">
              <h2 className="text-lg font-black mb-4 text-gray-300">🎯 Quick Reference</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="rounded-2xl bg-gradient-to-br from-red-600/8 to-orange-600/8 border border-red-500/20 p-5 hover:border-red-500/40 transition-colors">
                  <h3 className="font-bold text-red-400 mb-3 text-sm">🔺 Fire Triangle</h3>
                  <div className="flex justify-center mb-3">
                    <div className="relative w-28 h-24">
                      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 120 100">
                        <polygon points="60,8 8,92 112,92" fill="none" stroke="rgba(239,68,68,0.3)" strokeWidth="2" />
                      </svg>
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 text-xs text-red-400 font-bold">🌡️ Heat</div>
                      <div className="absolute bottom-0 left-1 text-xs text-orange-400 font-bold">⛽ Fuel</div>
                      <div className="absolute bottom-0 right-0 text-xs text-yellow-400 font-bold">💨 O₂</div>
                      <div className="absolute top-8 left-1/2 -translate-x-1/2 text-lg">🔥</div>
                    </div>
                  </div>
                  <p className="text-[10px] text-gray-500 text-center">Remove ANY element to stop fire</p>
                </div>

                <div className="rounded-2xl bg-gradient-to-br from-blue-600/8 to-cyan-600/8 border border-blue-500/20 p-5 hover:border-blue-500/40 transition-colors">
                  <h3 className="font-bold text-blue-400 mb-3 text-sm">🧯 PASS Method</h3>
                  <div className="space-y-2">
                    {['P — Pull pin', 'A — Aim at base', 'S — Squeeze handle', 'S — Sweep'].map((s, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs">
                        <span className="w-5 h-5 rounded-full bg-blue-500/15 text-blue-400 flex items-center justify-center text-[10px] font-black">{i + 1}</span>
                        <span className="text-gray-300">{s}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl bg-gradient-to-br from-green-600/8 to-teal-600/8 border border-green-500/20 p-5 hover:border-green-500/40 transition-colors">
                  <h3 className="font-bold text-green-400 mb-3 text-sm">🚪 Evacuation</h3>
                  <div className="space-y-1.5 text-xs text-gray-300">
                    <p>✓ Stay calm & low</p>
                    <p>✓ Feel doors first</p>
                    <p>✓ Stairs, NOT elevators</p>
                    <p>✓ Go to assembly point</p>
                    <p>✓ Never go back inside</p>
                    <p>✓ Call emergency services</p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
      `}</style>
    </div>
  );
}
