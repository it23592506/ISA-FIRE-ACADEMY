import { useState, useEffect, useCallback, useRef } from 'react';
import { disasterScenarios } from '../gameData';
import { GameScreen, GameResult, DisasterDecision } from '../types';

interface Props {
  disasterId: number;
  onNavigate: (screen: GameScreen) => void;
  onComplete: (result: GameResult) => void;
}

const typeEmojis: Record<string, string> = {
  skyscraper: '🏢',
  factory: '🏭',
  forest: '🌲',
  subway: '🚇',
};

export default function DisasterGame({ disasterId, onNavigate, onComplete }: Props) {
  const scenario = disasterScenarios.find(s => s.id === disasterId) || disasterScenarios[0];
  const [currentDecision, setCurrentDecision] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [decisionTimer, setDecisionTimer] = useState(scenario.decisions[0]?.timeLimit || 15);
  const [started, setStarted] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [results, setResults] = useState<string[]>([]);
  const [timerActive, setTimerActive] = useState(false);
  const [civsSaved, setCivsSaved] = useState(scenario.civilians);
  const [shakeScreen, setShakeScreen] = useState(false);
  const [showStreakPopup, setShowStreakPopup] = useState('');
  const [consecutiveCorrect, setConsecutiveCorrect] = useState(0);
  const [heartbeat, setHeartbeat] = useState(false);
  const [radioStatic, setRadioStatic] = useState(false);
  const [countdownPhase, setCountdownPhase] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const completedRef = useRef(false);

  const decision: DisasterDecision | undefined = scenario.decisions[currentDecision];

  const handleTimerEnd = useCallback(() => {
    if (selectedOption === null && !showFeedback) {
      setResults(prev => [...prev, `⏰ Decision ${currentDecision + 1}: Time ran out!`]);
      setCivsSaved(prev => Math.max(prev - Math.floor(scenario.civilians * 0.1), 0));
      setShowFeedback(true);
      setSelectedOption(-1);
      setConsecutiveCorrect(0);
      setShakeScreen(true);
      setTimeout(() => setShakeScreen(false), 500);
    }
  }, [selectedOption, showFeedback, currentDecision, scenario.civilians]);

  // Timer
  useEffect(() => {
    if (!timerActive || decisionTimer <= 0) {
      if (decisionTimer <= 0) handleTimerEnd();
      return;
    }
    const interval = setInterval(() => {
      setDecisionTimer(prev => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timerActive, decisionTimer, handleTimerEnd]);

  // Heartbeat effect when timer low
  useEffect(() => {
    if (timerActive && decisionTimer <= 5 && decisionTimer > 0) {
      setHeartbeat(true);
    } else {
      setHeartbeat(false);
    }
  }, [timerActive, decisionTimer]);

  const handleStart = () => {
    setCountdownPhase(true);
    setCountdown(3);
  };

  // Countdown
  useEffect(() => {
    if (!countdownPhase) return;
    if (countdown <= 0) {
      setCountdownPhase(false);
      setStarted(true);
      setTimerActive(true);
      return;
    }
    const t = setTimeout(() => setCountdown(prev => prev - 1), 800);
    return () => clearTimeout(t);
  }, [countdownPhase, countdown]);

  const handleSelectOption = (optionIdx: number) => {
    if (showFeedback) return;
    setSelectedOption(optionIdx);
    setShowFeedback(true);
    setTimerActive(false);

    const option = decision.options[optionIdx];
    setTotalScore(prev => prev + option.points);

    if (option.correct) {
      setCorrectCount(prev => prev + 1);
      const newStreak = consecutiveCorrect + 1;
      setConsecutiveCorrect(newStreak);
      setResults(prev => [...prev, `✅ Decision ${currentDecision + 1}: Correct!`]);

      if (newStreak >= 2) {
        setShowStreakPopup(`🔥 ${newStreak}x STREAK!`);
        setTotalScore(prev => prev + newStreak * 15);
        setTimeout(() => setShowStreakPopup(''), 1500);
      }

      // Radio confirmation
      setRadioStatic(true);
      setTimeout(() => setRadioStatic(false), 1000);
    } else {
      setConsecutiveCorrect(0);
      setCivsSaved(prev => Math.max(prev - Math.floor(scenario.civilians * 0.08), 0));
      setResults(prev => [...prev, `❌ Decision ${currentDecision + 1}: Wrong choice`]);
      setShakeScreen(true);
      setTimeout(() => setShakeScreen(false), 500);
    }
  };

  const handleNext = () => {
    if (currentDecision + 1 >= scenario.decisions.length) {
      if (completedRef.current) return;
      completedRef.current = true;
      const result: GameResult = {
        score: totalScore,
        maxScore: scenario.decisions.length * 100,
        timeTaken: 0,
        accuracy: Math.round((correctCount / scenario.decisions.length) * 100),
        details: [
          ...results,
          `👥 Civilians saved: ${civsSaved}/${scenario.civilians}`,
          `🎯 Accuracy: ${Math.round((correctCount / scenario.decisions.length) * 100)}%`,
          consecutiveCorrect >= 3 ? `🔥 Streak bonus earned!` : '',
        ].filter(Boolean),
        mode: 'disaster',
      };
      onComplete(result);
      return;
    }

    setCurrentDecision(prev => prev + 1);
    setSelectedOption(null);
    setShowFeedback(false);
    setDecisionTimer(scenario.decisions[currentDecision + 1].timeLimit);
    setTimerActive(true);
    setRadioStatic(true);
    setTimeout(() => setRadioStatic(false), 500);
  };

  const timerPercent = decision ? (decisionTimer / decision.timeLimit) * 100 : 0;
  const timerColor = timerPercent > 50 ? '#22c55e' : timerPercent > 25 ? '#eab308' : '#ef4444';

  // Countdown screen
  if (countdownPhase) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-[120px] font-black text-red-500 animate-pulse" style={{ textShadow: '0 0 60px rgba(239,68,68,0.5)' }}>
            {countdown > 0 ? countdown : 'GO!'}
          </div>
          <p className="text-gray-400 text-lg mt-4">Prepare for critical decisions...</p>
        </div>
      </div>
    );
  }

  // Start screen
  if (!started) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center p-4">
        <div className="max-w-lg w-full animate-fade-in">
          <div className="bg-gray-900/95 rounded-2xl border border-red-500/30 overflow-hidden shadow-2xl shadow-red-500/10">
            {/* Alert header */}
            <div className="relative bg-red-600/15 border-b border-red-500/30 p-6">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-600 via-orange-500 to-red-600 animate-pulse" />
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-red-600/20 flex items-center justify-center text-4xl animate-pulse">
                  🚨
                </div>
                <div>
                  <p className="text-xs text-red-400 font-mono tracking-widest">⚡ EMERGENCY ALERT</p>
                  <h2 className="text-2xl font-black text-red-400 mt-1">{scenario.title}</h2>
                </div>
              </div>
            </div>

            <div className="p-6">
              <p className="text-gray-300 text-sm mb-6">{scenario.description}</p>

              {/* Animated threat display */}
              <div className="bg-gray-800/50 rounded-xl p-4 mb-6 border border-gray-700/30">
                <div className="flex items-center justify-between">
                  <div className="text-center flex-1">
                    <div className="text-4xl mb-1">{typeEmojis[scenario.type]}</div>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider">Threat</p>
                  </div>
                  <div className="w-px h-12 bg-gray-700" />
                  <div className="text-center flex-1">
                    <p className="text-3xl font-black text-orange-400">{scenario.civilians}</p>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider">Lives at risk</p>
                  </div>
                  <div className="w-px h-12 bg-gray-700" />
                  <div className="text-center flex-1">
                    <p className="text-3xl font-black text-purple-400">{scenario.decisions.length}</p>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider">Decisions</p>
                  </div>
                </div>
              </div>

              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-6 text-xs text-gray-400">
                <p className="font-bold text-red-400 mb-1">⚠️ Commander Briefing:</p>
                <p>Every decision is timed. Wrong choices cost lives. Trust your training and act decisively.</p>
              </div>

              <div className="flex gap-3">
                <button onClick={() => onNavigate('disaster')} className="flex-1 px-4 py-3 bg-gray-800 rounded-xl hover:bg-gray-700 transition-colors">
                  ← Stand down
                </button>
                <button
                  onClick={handleStart}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 rounded-xl font-bold transition-all shadow-lg shadow-red-500/20 hover:scale-105 active:scale-95"
                >
                  🧠 Take Command
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!decision) return null;

  return (
    <div className={`min-h-screen bg-gray-950 text-white select-none ${shakeScreen ? 'animate-shake' : ''} ${heartbeat ? 'animate-heartbeat' : ''}`}>
      {/* Streak popup */}
      {showStreakPopup && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
          <div className="text-4xl font-black text-yellow-400 animate-bounce" style={{ textShadow: '0 0 30px rgba(250,204,21,0.5)' }}>
            {showStreakPopup}
          </div>
        </div>
      )}

      {/* Radio static overlay */}
      {radioStatic && (
        <div className="fixed inset-0 z-40 pointer-events-none bg-white/5 animate-pulse" style={{ animationDuration: '0.1s' }} />
      )}

      <div className="min-h-screen p-3 md:p-4">
        {/* HUD */}
        <div className="max-w-3xl mx-auto flex items-center justify-between mb-4 flex-wrap gap-2">
          <button onClick={() => { if (confirm('Abandon post?')) onNavigate('disaster'); }} className="px-3 py-1.5 bg-gray-800/80 rounded-lg hover:bg-gray-700/80 transition-colors text-xs border border-gray-700/50">
            ← Abort
          </button>
          <div className="flex items-center gap-2">
            <div className="bg-gray-800/80 rounded-lg px-2.5 py-1.5 text-xs border border-gray-700/50 flex items-center gap-1.5">
              👥 <span className={`font-bold ${civsSaved < scenario.civilians * 0.5 ? 'text-red-400' : 'text-green-400'}`}>{civsSaved}</span>
              <span className="text-gray-600">safe</span>
            </div>
            <div className="bg-gray-800/80 rounded-lg px-2.5 py-1.5 text-xs border border-gray-700/50">
              🧠 <span className="font-bold">{currentDecision + 1}</span><span className="text-gray-600">/{scenario.decisions.length}</span>
            </div>
            <div className="bg-gray-800/80 rounded-lg px-2.5 py-1.5 text-xs border border-gray-700/50">
              ⭐ <span className="font-bold text-yellow-400">{totalScore}</span>
            </div>
            {consecutiveCorrect >= 2 && (
              <div className="bg-orange-500/20 rounded-lg px-2.5 py-1.5 text-xs border border-orange-500/30 text-orange-400 font-bold animate-pulse">
                🔥 {consecutiveCorrect}x
              </div>
            )}
          </div>
        </div>

        <div className="max-w-3xl mx-auto">
          {/* Circular Timer */}
          <div className="flex justify-center mb-4">
            <div className="relative w-20 h-20">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
                <circle
                  cx="50" cy="50" r="42" fill="none"
                  stroke={timerColor}
                  strokeWidth="6"
                  strokeDasharray={`${2 * Math.PI * 42}`}
                  strokeDashoffset={`${2 * Math.PI * 42 * (1 - timerPercent / 100)}`}
                  strokeLinecap="round"
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={`text-2xl font-black ${decisionTimer <= 5 ? 'text-red-400 animate-pulse' : 'text-white'}`}>
                  {decisionTimer}
                </span>
              </div>
            </div>
          </div>

          {/* Scenario Card */}
          <div className="relative rounded-2xl overflow-hidden mb-5 bg-gradient-to-br from-gray-900 to-gray-800 border border-red-500/20">
            {/* Top accent */}
            <div className="h-1 bg-gradient-to-r from-red-500 via-orange-500 to-red-500" style={{
              animation: timerActive ? 'pulse 1.5s ease-in-out infinite' : 'none',
            }} />

            <div className="p-5 md:p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-red-600/20 flex items-center justify-center text-xl animate-pulse">
                  🚨
                </div>
                <div>
                  <p className="text-[10px] text-red-400 font-mono tracking-widest">CRITICAL DECISION #{currentDecision + 1}</p>
                  <h3 className="text-sm font-bold text-gray-400">{scenario.title}</h3>
                </div>
                <div className="ml-auto text-2xl">{typeEmojis[scenario.type]}</div>
              </div>

              <div className="bg-gray-800/50 rounded-xl p-4 border-l-4 border-red-500">
                <p className="text-base md:text-lg leading-relaxed font-medium" key={currentDecision} style={{ animation: 'fadeIn 0.4s ease' }}>
                  {decision.question}
                </p>
              </div>
            </div>
          </div>

          {/* Options */}
          <div className="space-y-2.5">
            {decision.options.map((option, idx) => {
              const isSelected = selectedOption === idx;
              const showResult = showFeedback;
              const letter = String.fromCharCode(65 + idx);

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(idx)}
                  disabled={showFeedback}
                  className={`w-full rounded-xl border p-4 text-left transition-all duration-200 group
                    ${showResult
                      ? option.correct
                        ? 'border-green-500 bg-green-500/10 shadow-lg shadow-green-500/10'
                        : isSelected
                          ? 'border-red-500 bg-red-500/10 shadow-lg shadow-red-500/10'
                          : 'border-gray-800 bg-gray-900/50 opacity-30'
                      : 'border-gray-700/50 bg-gray-800/50 hover:border-purple-500/50 hover:bg-gray-800/80 hover:scale-[1.01] active:scale-[0.99]'
                    }`}
                  style={{ animation: `fadeIn ${0.3 + idx * 0.1}s ease` }}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black flex-shrink-0 transition-colors ${
                      showResult
                        ? option.correct ? 'bg-green-500 text-white' : isSelected ? 'bg-red-500 text-white' : 'bg-gray-700/50 text-gray-500'
                        : 'bg-gray-700/80 text-gray-300 group-hover:bg-purple-600 group-hover:text-white'
                    }`}>
                      {showResult ? (option.correct ? '✓' : isSelected ? '✗' : letter) : letter}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium leading-snug">{option.text}</p>
                      {showResult && (isSelected || option.correct) && (
                        <div className={`mt-2 p-2 rounded-lg text-xs ${option.correct ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                          {option.feedback}
                        </div>
                      )}
                    </div>
                    {showResult && option.correct && (
                      <span className="text-green-400 text-xs font-bold flex-shrink-0">+{option.points}</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Time out message */}
          {showFeedback && selectedOption === -1 && (
            <div className="mt-4 bg-red-500/15 border border-red-500/30 rounded-xl p-4 text-center animate-fade-in">
              <p className="text-red-400 font-bold text-sm">⏰ Time ran out! Lives were lost due to indecision.</p>
              <p className="text-xs text-gray-500 mt-1">{decision.options.find(o => o.correct)?.feedback}</p>
            </div>
          )}

          {/* Next button */}
          {showFeedback && (
            <button
              onClick={handleNext}
              className="w-full mt-5 px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-xl font-bold transition-all text-base shadow-lg shadow-purple-500/20 hover:scale-[1.02] active:scale-95 animate-fade-in"
            >
              {currentDecision + 1 >= scenario.decisions.length ? '📊 See Final Report' : 'Next Decision →'}
            </button>
          )}

          {/* Status bar */}
          <div className="mt-5 flex items-center gap-2">
            {scenario.decisions.map((_, idx) => (
              <div
                key={idx}
                className={`flex-1 h-1.5 rounded-full transition-all ${
                  idx < currentDecision
                    ? results[idx]?.startsWith('✅') ? 'bg-green-500' : 'bg-red-500'
                    : idx === currentDecision
                      ? 'bg-purple-500 animate-pulse'
                      : 'bg-gray-800'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        .animate-fade-in { animation: fadeIn 0.3s ease-out; }
        @keyframes shake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-6px)} 75%{transform:translateX(6px)} }
        .animate-shake { animation: shake 0.3s ease-in-out; }
        @keyframes heartbeat { 0%,100%{transform:scale(1)} 50%{transform:scale(1.005)} }
        .animate-heartbeat { animation: heartbeat 0.5s ease-in-out infinite; }
      `}</style>
    </div>
  );
}
