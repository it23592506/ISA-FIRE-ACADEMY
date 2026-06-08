import { useState, useEffect, useCallback, useRef } from 'react';
import { missions, extinguisherInfo, fireTypeInfo } from '../gameData';
import { ExtinguisherType, GameScreen, GameResult } from '../types';
import { useTimer } from '../hooks/useTimer';
import FireCanvas from './FireCanvas';

interface Props {
  missionId: number;
  onNavigate: (screen: GameScreen) => void;
  onComplete: (result: GameResult) => void;
}

type GamePhase = 'briefing' | 'responding' | 'arriving' | 'choosing' | 'extinguishing' | 'rescuing';

export default function StoryGame({ missionId, onNavigate, onComplete }: Props) {
  const mission = missions.find(m => m.id === missionId) || missions[0];
  const [phase, setPhase] = useState<GamePhase>('briefing');
  const [storyIndex, setStoryIndex] = useState(0);
  const [selectedExtinguisher, setSelectedExtinguisher] = useState<ExtinguisherType | null>(null);
  const [isCorrect, setIsCorrect] = useState(false);
  const [fireIntensity, setFireIntensity] = useState(100);
  const [rescued, setRescued] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [shakeScreen, setShakeScreen] = useState(false);
  const [passStep, setPassStep] = useState(0);
  const [truckX, setTruckX] = useState(-200);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [comboStreak, setComboStreak] = useState(0);
  const [showCombo, setShowCombo] = useState('');
  const [rescuePhaseActive, setRescuePhaseActive] = useState(false);
  const [rescueTargets, setRescueTargets] = useState<{ id: number; x: number; y: number; saved: boolean; timer: number }[]>([]);
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const completedRef = useRef(false);

  const handleTimeUp = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    const result: GameResult = {
      score: Math.max(score, 0),
      maxScore: mission.points,
      timeTaken: mission.timeLimit,
      accuracy: 0,
      details: ['⏰ Time ran out!', 'The fire spread out of control.', `👥 Rescued ${rescued}/${mission.rescueCount} civilians`],
      mode: 'story',
    };
    onComplete(result);
  }, [score, mission, onComplete, rescued]);

  const { timeLeft, start } = useTimer(mission.timeLimit, handleTimeUp);
  const fireInfo = fireTypeInfo[mission.fireType];

  // Truck arrival animation
  useEffect(() => {
    if (phase === 'arriving') {
      const interval = setInterval(() => {
        setTruckX(prev => {
          if (prev >= 40) {
            clearInterval(interval);
            setTimeout(() => {
              setPhase('choosing');
              start();
            }, 600);
            return 40;
          }
          return prev + 4;
        });
      }, 30);
      return () => clearInterval(interval);
    }
  }, [phase, start]);

  // Fire reduction when extinguishing
  useEffect(() => {
    if (phase !== 'extinguishing' || !isCorrect) return;
    const interval = setInterval(() => {
      setFireIntensity(prev => {
        if (prev <= 0) return 0;
        const reduction = passStep >= 4 ? 1.5 : passStep >= 3 ? 1 : 0.5;
        return Math.max(prev - reduction, 0);
      });
    }, 50);
    return () => clearInterval(interval);
  }, [phase, isCorrect, passStep]);

  // Transition to rescue phase when fire is low
  useEffect(() => {
    if (fireIntensity <= 15 && phase === 'extinguishing' && !rescuePhaseActive) {
      setRescuePhaseActive(true);
      setPhase('rescuing');
      // Generate rescue targets
      const targets = Array.from({ length: mission.rescueCount }, (_, i) => ({
        id: i,
        x: 15 + Math.random() * 70,
        y: 20 + Math.random() * 50,
        saved: false,
        timer: 100,
      }));
      setRescueTargets(targets);
    }
  }, [fireIntensity, phase, mission.rescueCount, rescuePhaseActive]);

  // Rescue timer countdown
  useEffect(() => {
    if (phase !== 'rescuing') return;
    const interval = setInterval(() => {
      setRescueTargets(prev => {
        const updated = prev.map(t => t.saved ? t : { ...t, timer: Math.max(t.timer - 1, 0) });
        const allDone = updated.every(t => t.saved || t.timer <= 0);
        if (allDone && !completedRef.current) {
          completedRef.current = true;
          const savedCount = updated.filter(t => t.saved).length;
          const finalScore = Math.floor(
            mission.points * 0.4 +
            mission.points * 0.3 * (timeLeft / mission.timeLimit) +
            mission.points * 0.3 * (savedCount / mission.rescueCount) +
            comboStreak * 10 -
            wrongAttempts * 30
          );
          setTimeout(() => {
            onComplete({
              score: Math.max(finalScore, 10),
              maxScore: mission.points,
              timeTaken: mission.timeLimit - timeLeft,
              accuracy: wrongAttempts === 0 ? 100 : Math.max(100 - wrongAttempts * 25, 10),
              details: [
                wrongAttempts === 0 ? '✅ Perfect extinguisher choice!' : `⚠️ ${wrongAttempts} wrong attempt(s)`,
                `👥 Rescued ${savedCount}/${mission.rescueCount} civilians`,
                `⏱️ Completed in ${mission.timeLimit - timeLeft}s`,
                `🧯 Used ${extinguisherInfo[mission.correctExtinguisher].name}`,
                comboStreak > 1 ? `🔥 Best combo: ${comboStreak}x` : '',
              ].filter(Boolean),
              mode: 'story',
            });
          }, 800);
        }
        return updated;
      });
    }, 80);
    return () => clearInterval(interval);
  }, [phase, mission, timeLeft, comboStreak, wrongAttempts, onComplete]);

  const handleBriefingNext = () => {
    if (storyIndex < mission.story.length - 1) {
      setStoryIndex(storyIndex + 1);
    } else {
      setPhase('responding');
      setTimeout(() => {
        setPhase('arriving');
      }, 1800);
    }
  };

  const handleChooseExtinguisher = (type: ExtinguisherType) => {
    const correct = type === mission.correctExtinguisher;

    if (!correct) {
      setWrongAttempts(prev => prev + 1);
      setShakeScreen(true);
      setSelectedExtinguisher(type);
      setFeedback(`❌ WRONG! ${extinguisherInfo[type].name} makes ${fireInfo.name}s worse!`);
      setFireIntensity(prev => Math.min(prev + 20, 130));
      setComboStreak(0);
      setTimeout(() => setShakeScreen(false), 500);
      setTimeout(() => {
        setSelectedExtinguisher(null);
        setFeedback('');
        setScore(prev => prev - 30);
      }, 1800);
    } else {
      setSelectedExtinguisher(type);
      setIsCorrect(true);
      setFeedback(`✅ CORRECT! ${extinguisherInfo[type].name} is the right choice!`);
      setComboStreak(prev => prev + 1);
      setShowCombo('CORRECT!');
      setTimeout(() => setShowCombo(''), 1000);
      setPhase('extinguishing');
      setPassStep(1);
    }
  };

  const handlePassStep = (step: number) => {
    if (step === passStep) {
      setPassStep(step + 1);
      setComboStreak(prev => prev + 1);
      const labels = ['', 'PULL!', 'AIM!', 'SQUEEZE!', 'SWEEP!'];
      setShowCombo(labels[step] || '');
      setTimeout(() => setShowCombo(''), 600);
    }
  };

  const handleRescue = (id: number) => {
    setRescueTargets(prev => prev.map(t => t.id === id && !t.saved ? { ...t, saved: true } : t));
    setRescued(prev => prev + 1);
    setComboStreak(prev => prev + 1);
    setShowCombo(`SAVED! +${comboStreak + 1}x`);
    setTimeout(() => setShowCombo(''), 500);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  const timerColor = timeLeft > mission.timeLimit * 0.5 ? 'text-green-400' : timeLeft > mission.timeLimit * 0.25 ? 'text-yellow-400' : 'text-red-400';
  const timerBg = timeLeft > mission.timeLimit * 0.5 ? 'bg-green-500' : timeLeft > mission.timeLimit * 0.25 ? 'bg-yellow-500' : 'bg-red-500';

  const passSteps = [
    { letter: 'P', action: 'PULL the pin', icon: '📌', color: 'from-red-500 to-red-600' },
    { letter: 'A', action: 'AIM at base', icon: '🎯', color: 'from-orange-500 to-orange-600' },
    { letter: 'S', action: 'SQUEEZE handle', icon: '✊', color: 'from-yellow-500 to-yellow-600' },
    { letter: 'S', action: 'SWEEP side-to-side', icon: '↔️', color: 'from-green-500 to-green-600' },
  ];

  return (
    <div className={`min-h-screen bg-gray-950 text-white select-none ${shakeScreen ? 'animate-shake' : ''}`} onMouseMove={handleMouseMove}>

      {/* ===== BRIEFING ===== */}
      {phase === 'briefing' && (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="max-w-2xl w-full animate-fade-in">
            <div className="bg-gray-900/95 rounded-2xl border border-red-500/30 overflow-hidden shadow-2xl shadow-red-500/10">
              {/* Dispatch header with animated bar */}
              <div className="relative bg-red-600/20 border-b border-red-500/30 px-6 py-5">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600 via-orange-500 to-red-600 animate-pulse" />
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-red-600/30 flex items-center justify-center">
                    <span className="text-3xl animate-pulse">🚨</span>
                  </div>
                  <div>
                    <p className="text-xs text-red-400 font-mono tracking-widest">⚡ EMERGENCY DISPATCH</p>
                    <h2 className="text-2xl font-black mt-1">{mission.title}</h2>
                  </div>
                  <div className="ml-auto">
                    <span className={`text-xs px-3 py-1 rounded-full border ${
                      mission.difficulty === 'Easy' ? 'border-green-500/50 text-green-400 bg-green-500/10' :
                      mission.difficulty === 'Medium' ? 'border-yellow-500/50 text-yellow-400 bg-yellow-500/10' :
                      mission.difficulty === 'Hard' ? 'border-red-500/50 text-red-400 bg-red-500/10' :
                      'border-purple-500/50 text-purple-400 bg-purple-500/10'
                    }`}>
                      {mission.difficulty}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-6">
                {/* Mission stats */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                  <div className="bg-gray-800/50 rounded-xl p-3 text-center border border-gray-700/30">
                    <span className="text-xl">{fireInfo.icon}</span>
                    <p className="text-xs text-gray-400 mt-1">{fireInfo.name}</p>
                  </div>
                  <div className="bg-gray-800/50 rounded-xl p-3 text-center border border-gray-700/30">
                    <span className="text-xl">👥</span>
                    <p className="text-xs text-gray-400 mt-1">{mission.rescueCount} trapped</p>
                  </div>
                  <div className="bg-gray-800/50 rounded-xl p-3 text-center border border-gray-700/30">
                    <span className="text-xl">⏱️</span>
                    <p className="text-xs text-gray-400 mt-1">{mission.timeLimit}s limit</p>
                  </div>
                </div>

                {/* Story text with typewriter feel */}
                <div className="bg-gray-800/30 rounded-xl p-5 mb-6 border-l-4 border-red-500 min-h-[80px]">
                  <p className="text-lg leading-relaxed" key={storyIndex} style={{ animation: 'fadeIn 0.4s ease' }}>
                    {mission.story[storyIndex]}
                  </p>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                  <span>📍</span> {mission.location}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    {mission.story.map((_, i) => (
                      <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i <= storyIndex ? 'bg-red-500 w-6' : 'bg-gray-700 w-3'}`} />
                    ))}
                  </div>
                  <button
                    onClick={handleBriefingNext}
                    className="px-8 py-3 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 rounded-xl font-bold transition-all flex items-center gap-2 shadow-lg shadow-red-500/20 hover:shadow-red-500/40 hover:scale-105 active:scale-95"
                  >
                    {storyIndex < mission.story.length - 1 ? 'Continue' : '🚒 Respond!'} →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== RESPONDING ===== */}
      {phase === 'responding' && (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">
          <div className="text-center animate-fade-in">
            <div className="relative">
              <div className="text-[100px] animate-bounce" style={{ animationDuration: '0.6s' }}>🚒</div>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-20 h-3 bg-gray-800 rounded-full blur-sm animate-pulse" />
            </div>
            <h2 className="text-4xl font-black mt-6">
              <span className="text-red-400 animate-pulse">RESPONDING</span>
            </h2>
            <p className="text-gray-500 mt-3 text-lg">En route to {mission.location}</p>
            <div className="mt-8 flex justify-center gap-2">
              {[0, 1, 2, 3, 4].map(i => (
                <div
                  key={i}
                  className="w-2 h-2 bg-red-500 rounded-full"
                  style={{
                    animation: 'pulse 1s ease-in-out infinite',
                    animationDelay: `${i * 0.15}s`,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ===== ARRIVING (Truck drives in) ===== */}
      {phase === 'arriving' && (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="max-w-lg w-full">
            <div className="relative h-40 bg-gradient-to-b from-gray-800 to-gray-900 rounded-2xl overflow-hidden border border-gray-700/50">
              {/* Road */}
              <div className="absolute bottom-0 left-0 right-0 h-12 bg-gray-700">
                <div className="absolute top-1/2 left-0 right-0 h-1 border-t-2 border-dashed border-yellow-500/50" />
              </div>
              {/* Building */}
              <div className="absolute right-8 bottom-12 w-20 h-24 bg-gray-600 rounded-t">
                <div className="absolute top-2 left-2 w-3 h-3 bg-orange-500/80 animate-pulse rounded-sm" />
                <div className="absolute top-2 right-2 w-3 h-3 bg-orange-400/60 animate-pulse rounded-sm" style={{ animationDelay: '0.3s' }} />
                <div className="absolute top-8 left-2 w-3 h-3 bg-yellow-200/40 rounded-sm" />
              </div>
              {/* Fire truck driving */}
              <div
                className="absolute bottom-14 transition-none"
                style={{ left: `${truckX}%` }}
              >
                <div className="text-5xl">🚒</div>
              </div>
              {/* Fire glow */}
              <div className="absolute top-0 right-4 w-24 h-16 bg-gradient-to-b from-orange-500/20 to-transparent rounded-full animate-pulse" />
            </div>
            <p className="text-center text-gray-500 text-sm mt-4 animate-pulse">Arriving at scene...</p>
          </div>
        </div>
      )}

      {/* ===== CHOOSING EXTINGUISHER ===== */}
      {phase === 'choosing' && (
        <div className="min-h-screen p-3 md:p-4" ref={gameAreaRef}>
          {/* HUD */}
          <div className="max-w-5xl mx-auto flex items-center justify-between mb-3">
            <button onClick={() => onNavigate('story')} className="px-3 py-1.5 bg-gray-800/80 rounded-lg hover:bg-gray-700/80 transition-colors text-xs border border-gray-700/50">
              ← Abort
            </button>
            <div className="flex items-center gap-3">
              <div className="bg-gray-800/80 rounded-lg px-2.5 py-1.5 text-xs border border-gray-700/50">
                ⭐ {score}
              </div>
              <div className="flex items-center gap-2 bg-gray-800/80 rounded-lg px-3 py-1.5 border border-gray-700/50">
                <span className={`text-lg font-mono font-black ${timerColor}`}>{timeLeft}</span>
                <div className="w-16 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-1000 ${timerBg}`} style={{ width: `${(timeLeft / mission.timeLimit) * 100}%` }} />
                </div>
              </div>
            </div>
          </div>

          <div className="max-w-5xl mx-auto">
            {/* Combo popup */}
            {showCombo && (
              <div className="fixed top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none">
                <div className="text-4xl md:text-6xl font-black text-yellow-400 animate-bounce" style={{ textShadow: '0 0 30px rgba(250,204,21,0.5)' }}>
                  {showCombo}
                </div>
              </div>
            )}

            {/* Fire Canvas Scene */}
            <div className="mb-4">
              <FireCanvas
                fireIntensity={fireIntensity}
                isExtinguishing={false}
                extinguisherType={null}
                mousePos={null}
              />
            </div>

            {/* Fire info bar */}
            <div className="bg-gray-900/80 rounded-xl p-3 mb-4 border border-gray-700/50 flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xl">{fireInfo.icon}</span>
                <div>
                  <p className="font-bold text-sm">{fireInfo.name}</p>
                  <p className="text-xs text-red-400">⚠️ {fireInfo.danger}</p>
                </div>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <span className="text-xs text-gray-400">Intensity</span>
                <div className="w-24 h-2.5 bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-yellow-500 via-orange-500 to-red-600 rounded-full transition-all" style={{ width: `${Math.min(fireIntensity, 100)}%` }} />
                </div>
                <span className="text-xs font-mono text-orange-400">{Math.min(Math.round(fireIntensity), 100)}%</span>
              </div>
            </div>

            {/* Feedback */}
            {feedback && (
              <div className={`rounded-xl p-3 mb-4 text-center font-bold border animate-fade-in ${
                isCorrect ? 'bg-green-500/15 border-green-500/30 text-green-400' : 'bg-red-500/15 border-red-500/30 text-red-400'
              }`}>
                {feedback}
              </div>
            )}

            {/* Extinguisher Selection */}
            <div className="bg-gray-900/50 rounded-2xl border border-gray-700/50 p-4">
              <h3 className="text-sm font-bold mb-3 text-center text-gray-300">🧯 SELECT THE CORRECT EXTINGUISHER</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
                {Object.entries(extinguisherInfo).map(([type, info]) => {
                  const isSelected = selectedExtinguisher === type;
                  return (
                    <button
                      key={type}
                      onClick={() => handleChooseExtinguisher(type as ExtinguisherType)}
                      disabled={selectedExtinguisher !== null && isCorrect}
                      className={`group relative rounded-xl border p-4 text-center transition-all duration-200 hover:scale-[1.04] active:scale-95
                        ${isSelected
                          ? isCorrect
                            ? 'border-green-500 bg-green-500/20 ring-2 ring-green-400 shadow-lg shadow-green-500/20'
                            : 'border-red-500 bg-red-500/20 ring-2 ring-red-400 shadow-lg shadow-red-500/20'
                          : 'border-gray-700/50 bg-gray-800/60 hover:border-orange-500/50 hover:bg-gray-800/80'
                        }
                        ${selectedExtinguisher !== null && selectedExtinguisher !== type && isCorrect ? 'opacity-30 pointer-events-none' : ''}
                      `}
                    >
                      <div className="text-3xl mb-1 group-hover:animate-bounce">{info.icon}</div>
                      <p className="font-bold text-sm">{info.name}</p>
                      <p className="text-[10px] text-gray-500 mt-1 leading-tight">{info.use}</p>
                      {isSelected && (
                        <div className={`absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs ${isCorrect ? 'bg-green-500' : 'bg-red-500'}`}>
                          {isCorrect ? '✓' : '✗'}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== EXTINGUISHING (PASS Method Game) ===== */}
      {phase === 'extinguishing' && (
        <div className="min-h-screen p-3 md:p-4" ref={gameAreaRef}>
          {/* HUD */}
          <div className="max-w-5xl mx-auto flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-lg">{extinguisherInfo[mission.correctExtinguisher].icon}</span>
              <span className="text-gray-400">{extinguisherInfo[mission.correctExtinguisher].name}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-gray-800/80 rounded-lg px-2.5 py-1.5 text-xs border border-gray-700/50">
                🔥 {Math.max(Math.round(fireIntensity), 0)}%
              </div>
              <div className="flex items-center gap-2 bg-gray-800/80 rounded-lg px-3 py-1.5 border border-gray-700/50">
                <span className={`text-lg font-mono font-black ${timerColor}`}>{timeLeft}</span>
              </div>
            </div>
          </div>

          <div className="max-w-5xl mx-auto">
            {/* Combo popup */}
            {showCombo && (
              <div className="fixed top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none">
                <div className="text-5xl font-black text-yellow-400 animate-bounce" style={{ textShadow: '0 0 30px rgba(250,204,21,0.5)' }}>
                  {showCombo}
                </div>
              </div>
            )}

            {/* Fire Canvas - interactive */}
            <div className="mb-4">
              <FireCanvas
                fireIntensity={fireIntensity}
                isExtinguishing={passStep >= 4}
                extinguisherType={mission.correctExtinguisher}
                mousePos={mousePos}
              />
            </div>

            {/* Progress Bar */}
            <div className="bg-gray-900/80 rounded-xl p-3 mb-4 border border-gray-700/50">
              <div className="flex justify-between text-xs text-gray-400 mb-1.5">
                <span>🧯 Extinguishing Progress</span>
                <span className={fireIntensity <= 20 ? 'text-green-400 font-bold' : ''}>{Math.max(100 - Math.round(fireIntensity), 0)}%</span>
              </div>
              <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.max(100 - fireIntensity, 0)}%`,
                    background: fireIntensity > 50
                      ? 'linear-gradient(to right, #eab308, #f97316)'
                      : fireIntensity > 20
                        ? 'linear-gradient(to right, #22c55e, #84cc16)'
                        : 'linear-gradient(to right, #10b981, #06b6d4)',
                  }}
                />
              </div>
            </div>

            {/* PASS Method - Interactive buttons */}
            <div className="bg-gray-900/50 rounded-2xl border border-gray-700/50 p-4">
              <h3 className="text-sm font-bold mb-3 text-center text-gray-300">🧯 APPLY THE PASS METHOD — Click each step in order!</h3>
              <div className="grid grid-cols-4 gap-2 md:gap-3">
                {passSteps.map((step, idx) => {
                  const stepNum = idx + 1;
                  const isDone = stepNum < passStep;
                  const isCurrent = stepNum === passStep;
                  const isLocked = stepNum > passStep;

                  return (
                    <button
                      key={idx}
                      onClick={() => handlePassStep(stepNum)}
                      disabled={!isCurrent}
                      className={`relative rounded-xl border p-3 md:p-4 text-center transition-all duration-200
                        ${isDone
                          ? 'border-green-500/50 bg-green-500/10'
                          : isCurrent
                            ? `border-transparent bg-gradient-to-br ${step.color} shadow-lg hover:scale-105 active:scale-95 cursor-pointer ring-2 ring-white/20`
                            : 'border-gray-700/30 bg-gray-800/30 opacity-30'
                        }`}
                    >
                      {isDone && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center text-[10px] font-bold">✓</div>
                      )}
                      <span className="text-2xl block mb-1">{isDone ? '✅' : step.icon}</span>
                      <p className={`text-2xl font-black ${isCurrent ? 'text-white' : isDone ? 'text-green-400' : 'text-gray-600'}`}>{step.letter}</p>
                      <p className={`text-[10px] mt-1 ${isCurrent ? 'text-white/80' : 'text-gray-500'}`}>{step.action}</p>
                      {isCurrent && !isLocked && (
                        <div className="absolute inset-0 rounded-xl animate-pulse border-2 border-white/20 pointer-events-none" />
                      )}
                    </button>
                  );
                })}
              </div>
              {passStep >= 4 && (
                <p className="text-center text-green-400 text-sm mt-3 animate-pulse font-bold">
                  ✅ PASS complete! Move your mouse over the fire to extinguish! 🖱️
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ===== RESCUING CIVILIANS ===== */}
      {phase === 'rescuing' && (
        <div className="min-h-screen p-3 md:p-4">
          <div className="max-w-5xl mx-auto flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-sm text-green-400 font-bold">
              ✅ Fire contained!
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-gray-800/80 rounded-lg px-2.5 py-1.5 text-xs border border-gray-700/50">
                👥 {rescued}/{mission.rescueCount}
              </div>
              <div className="flex items-center gap-2 bg-gray-800/80 rounded-lg px-3 py-1.5 border border-gray-700/50">
                <span className={`text-lg font-mono font-black ${timerColor}`}>{timeLeft}</span>
              </div>
            </div>
          </div>

          <div className="max-w-5xl mx-auto">
            {/* Combo popup */}
            {showCombo && (
              <div className="fixed top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none">
                <div className="text-5xl font-black text-green-400 animate-bounce" style={{ textShadow: '0 0 30px rgba(34,197,94,0.5)' }}>
                  {showCombo}
                </div>
              </div>
            )}

            <div className="mb-4 text-center">
              <h2 className="text-xl font-black text-green-400">🏃 RESCUE THE CIVILIANS!</h2>
              <p className="text-gray-400 text-sm">Click on each person to rescue them before their timer runs out!</p>
            </div>

            {/* Rescue area */}
            <div className="relative bg-gradient-to-b from-gray-800/80 to-gray-900 rounded-2xl border border-green-500/20 overflow-hidden" style={{ aspectRatio: '16/9' }}>
              {/* Building interior background */}
              <div className="absolute inset-0 opacity-20" style={{
                backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
                backgroundSize: '30px 30px',
              }} />

              {/* Smoke remnants */}
              <div className="absolute inset-0 bg-gradient-to-b from-gray-700/20 to-transparent" />

              {/* Rescue targets */}
              {rescueTargets.map((target) => (
                <button
                  key={target.id}
                  onClick={() => !target.saved && target.timer > 0 && handleRescue(target.id)}
                  disabled={target.saved || target.timer <= 0}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-200
                    ${target.saved
                      ? 'scale-0 opacity-0'
                      : target.timer <= 0
                        ? 'opacity-20 pointer-events-none'
                        : 'hover:scale-125 active:scale-90 cursor-pointer'
                    }`}
                  style={{ left: `${target.x}%`, top: `${target.y}%` }}
                >
                  <div className="relative">
                    <span className={`text-3xl md:text-4xl block ${target.timer < 30 ? 'animate-pulse' : ''}`}>
                      {target.saved ? '💚' : target.timer <= 0 ? '😰' : '🧑'}
                    </span>
                    {/* Timer ring */}
                    {!target.saved && target.timer > 0 && (
                      <svg className="absolute -inset-2 w-[calc(100%+16px)] h-[calc(100%+16px)]" viewBox="0 0 44 44">
                        <circle cx="22" cy="22" r="18" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
                        <circle
                          cx="22" cy="22" r="18" fill="none"
                          stroke={target.timer > 50 ? '#22c55e' : target.timer > 25 ? '#eab308' : '#ef4444'}
                          strokeWidth="2.5"
                          strokeDasharray={`${2 * Math.PI * 18}`}
                          strokeDashoffset={`${2 * Math.PI * 18 * (1 - target.timer / 100)}`}
                          strokeLinecap="round"
                          transform="rotate(-90 22 22)"
                          className="transition-all duration-100"
                        />
                      </svg>
                    )}
                    {target.saved && (
                      <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-green-400 text-xs font-bold animate-bounce">SAVED!</span>
                    )}
                  </div>
                </button>
              ))}

              {/* Rescued count overlay */}
              <div className="absolute bottom-4 right-4 bg-green-500/20 border border-green-500/30 rounded-xl px-4 py-2 backdrop-blur-sm">
                <p className="text-xs text-green-400 font-mono">RESCUED</p>
                <p className="text-3xl font-black text-green-400">{rescued}<span className="text-lg text-gray-500">/{mission.rescueCount}</span></p>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        .animate-fade-in { animation: fadeIn 0.4s ease-out; }
        @keyframes shake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-6px)} 75%{transform:translateX(6px)} }
        .animate-shake { animation: shake 0.3s ease-in-out; }
      `}</style>
    </div>
  );
}
