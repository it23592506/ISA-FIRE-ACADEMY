import { useState, useEffect } from 'react';
import { GameResult, GameScreen } from '../types';

interface Props {
  result: GameResult;
  onNavigate: (screen: GameScreen) => void;
}

export default function Results({ result, onNavigate }: Props) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const [showGrade, setShowGrade] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [confetti, setConfetti] = useState<{ x: number; y: number; color: string; delay: number; size: number }[]>([]);

  const percentage = Math.round((result.score / result.maxScore) * 100);
  const grade = percentage >= 90 ? 'S' : percentage >= 75 ? 'A' : percentage >= 60 ? 'B' : percentage >= 40 ? 'C' : 'D';
  const isGoodGrade = ['S', 'A', 'B'].includes(grade);

  const gradeConfig: Record<string, { color: string; bg: string; glow: string; text: string }> = {
    S: { color: 'text-yellow-400', bg: 'from-yellow-500/20 to-amber-500/20', glow: 'shadow-yellow-500/40', text: 'OUTSTANDING!' },
    A: { color: 'text-green-400', bg: 'from-green-500/20 to-emerald-500/20', glow: 'shadow-green-500/40', text: 'EXCELLENT!' },
    B: { color: 'text-blue-400', bg: 'from-blue-500/20 to-cyan-500/20', glow: 'shadow-blue-500/40', text: 'GREAT JOB!' },
    C: { color: 'text-orange-400', bg: 'from-orange-500/20 to-yellow-500/20', glow: 'shadow-orange-500/40', text: 'GOOD EFFORT' },
    D: { color: 'text-red-400', bg: 'from-red-500/20 to-orange-500/20', glow: 'shadow-red-500/40', text: 'KEEP TRAINING' },
  };

  const gc = gradeConfig[grade];

  const modeMap: Record<string, { label: string; screen: GameScreen; color: string; icon: string }> = {
    story: { label: 'Hero Mode', screen: 'story', color: 'from-red-600 to-orange-500', icon: '🚒' },
    smartHome: { label: 'Prevention Mode', screen: 'smartHome', color: 'from-emerald-600 to-teal-500', icon: '🏠' },
    disaster: { label: 'Disaster Mode', screen: 'disaster', color: 'from-purple-600 to-pink-500', icon: '🌋' },
  };
  const modeInfo = modeMap[result.mode] || modeMap.story;

  // Animated score counter
  useEffect(() => {
    const duration = 1500;
    const steps = 60;
    const increment = result.score / steps;
    let current = 0;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      current = Math.min(Math.round(increment * step), result.score);
      setAnimatedScore(current);

      if (step >= steps) {
        clearInterval(timer);
        setAnimatedScore(result.score);
        setTimeout(() => setShowGrade(true), 300);
        setTimeout(() => setShowDetails(true), 800);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [result.score]);

  // Confetti for good grades
  useEffect(() => {
    if (showGrade && isGoodGrade) {
      const pieces = Array.from({ length: 40 }, () => ({
        x: Math.random() * 100,
        y: -10,
        color: ['#EF4444', '#F97316', '#EAB308', '#22C55E', '#3B82F6', '#A855F7', '#EC4899'][Math.floor(Math.random() * 7)],
        delay: Math.random() * 2,
        size: Math.random() * 6 + 4,
      }));
      setConfetti(pieces);
    }
  }, [showGrade, isGoodGrade]);

  return (
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center p-4 overflow-hidden relative">
      {/* Confetti */}
      {confetti.map((piece, i) => (
        <div
          key={i}
          className="absolute pointer-events-none z-50"
          style={{
            left: `${piece.x}%`,
            width: `${piece.size}px`,
            height: `${piece.size}px`,
            backgroundColor: piece.color,
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
            animation: `confettiFall ${2 + Math.random() * 3}s ease-in forwards`,
            animationDelay: `${piece.delay}s`,
          }}
        />
      ))}

      <div className="max-w-lg w-full relative z-10">
        <div className="bg-gray-900/95 rounded-2xl border border-gray-700/50 overflow-hidden shadow-2xl">
          {/* Header */}
          <div className={`relative bg-gradient-to-r ${modeInfo.color} p-5 text-center overflow-hidden`}>
            <div className="absolute inset-0 opacity-10">
              {Array.from({ length: 20 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute rounded-full bg-white"
                  style={{
                    width: Math.random() * 3 + 1 + 'px',
                    height: Math.random() * 3 + 1 + 'px',
                    left: Math.random() * 100 + '%',
                    top: Math.random() * 100 + '%',
                    animation: `twinkle ${1 + Math.random() * 2}s ease-in-out infinite`,
                    animationDelay: Math.random() * 2 + 's',
                  }}
                />
              ))}
            </div>
            <div className="relative">
              <span className="text-3xl">{modeInfo.icon}</span>
              <p className="text-sm opacity-80 mt-1">{modeInfo.label}</p>
              <h2 className="text-2xl font-black mt-1">Mission Complete!</h2>
            </div>
          </div>

          <div className="p-6 md:p-8">
            {/* Score */}
            <div className="text-center mb-6">
              <p className="text-6xl font-black tabular-nums" style={{ animation: 'fadeIn 0.3s ease' }}>
                {animatedScore}
              </p>
              <p className="text-gray-500 text-sm mt-1">out of {result.maxScore} points</p>

              {/* Score bar */}
              <div className="mt-3 max-w-xs mx-auto">
                <div className="h-2.5 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${modeInfo.color}`}
                    style={{
                      width: `${Math.min((animatedScore / result.maxScore) * 100, 100)}%`,
                      transition: 'width 1.5s ease-out',
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Grade Badge */}
            {showGrade && (
              <div className="text-center mb-6" style={{ animation: 'gradeReveal 0.5s ease-out' }}>
                <div className={`inline-flex flex-col items-center gap-2 bg-gradient-to-br ${gc.bg} rounded-2xl p-6 border border-gray-700/30 shadow-xl ${gc.glow}`}>
                  <span className={`text-7xl font-black ${gc.color}`} style={{ textShadow: '0 0 30px currentColor' }}>
                    {grade}
                  </span>
                  <span className={`text-sm font-bold ${gc.color}`}>{gc.text}</span>
                </div>
              </div>
            )}

            {/* Stats */}
            {showDetails && (
              <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
                <div className="grid grid-cols-2 gap-3 mb-5">
                  {result.accuracy > 0 && (
                    <div className="bg-gray-800/50 rounded-xl p-3 text-center border border-gray-700/30">
                      <p className="text-2xl font-black text-green-400">{result.accuracy}%</p>
                      <p className="text-[10px] text-gray-500 mt-0.5">Accuracy</p>
                    </div>
                  )}
                  {result.timeTaken > 0 && (
                    <div className="bg-gray-800/50 rounded-xl p-3 text-center border border-gray-700/30">
                      <p className="text-2xl font-black text-blue-400">{result.timeTaken}s</p>
                      <p className="text-[10px] text-gray-500 mt-0.5">Time Taken</p>
                    </div>
                  )}
                </div>

                {/* Detailed Report */}
                <div className="bg-gray-800/30 rounded-xl p-4 mb-5 border border-gray-700/30">
                  <h3 className="font-bold text-xs text-gray-400 mb-3 flex items-center gap-1.5">📋 MISSION REPORT</h3>
                  <div className="space-y-2">
                    {result.details.map((detail, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2 text-sm"
                        style={{ animation: `fadeIn ${0.3 + idx * 0.1}s ease-out` }}
                      >
                        <span className="text-gray-300">{detail}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={() => onNavigate(modeInfo.screen)}
                    className="flex-1 px-4 py-3 bg-gray-800 hover:bg-gray-700 rounded-xl transition-all font-medium text-sm border border-gray-700/50 hover:scale-[1.02] active:scale-95"
                  >
                    More Missions
                  </button>
                  <button
                    onClick={() => onNavigate('menu')}
                    className={`flex-1 px-4 py-3 bg-gradient-to-r ${modeInfo.color} hover:opacity-90 rounded-xl transition-all font-bold text-sm shadow-lg hover:scale-[1.02] active:scale-95`}
                  >
                    Main Menu 🏠
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes confettiFall {
          0% { transform: translateY(-10vh) rotate(0deg); opacity: 1; }
          100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
        }
        @keyframes gradeReveal {
          0% { transform: scale(0) rotate(-180deg); opacity: 0; }
          50% { transform: scale(1.2) rotate(10deg); }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        @keyframes twinkle { 0%,100% { opacity:0.3; } 50% { opacity:1; } }
      `}</style>
    </div>
  );
}
