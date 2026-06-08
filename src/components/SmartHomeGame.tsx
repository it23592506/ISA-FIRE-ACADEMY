import { useState, useCallback, useEffect, useRef } from 'react';
import { smartHomeLevels } from '../gameData';
import { GameScreen, GameResult, Hazard } from '../types';
import { useTimer } from '../hooks/useTimer';

interface Props {
  levelId: number;
  onNavigate: (screen: GameScreen) => void;
  onComplete: (result: GameResult) => void;
}

interface FloatingText {
  id: number;
  text: string;
  x: number;
  y: number;
  color: string;
}

export default function SmartHomeGame({ levelId, onNavigate, onComplete }: Props) {
  const level = smartHomeLevels.find(l => l.id === levelId) || smartHomeLevels[0];
  const [hazards, setHazards] = useState<Hazard[]>(level.hazards.map(h => ({ ...h })));
  const [selectedHazard, setSelectedHazard] = useState<Hazard | null>(null);
  const [fixedCount, setFixedCount] = useState(0);
  const [foundCount, setFoundCount] = useState(0);
  const [started, setStarted] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
  const [flashlightMode, setFlashlightMode] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const [comboCount, setComboCount] = useState(0);
  const [lastFixTime, setLastFixTime] = useState(0);
  const [showFixAnimation, setShowFixAnimation] = useState<number | null>(null);
  const [scanPulse, setScanPulse] = useState(false);
  const [totalScore, setTotalScore] = useState(0);
  const ftIdRef = useRef(0);
  const completedRef = useRef(false);

  const timeLeftRef = useRef(level.timeLimit);

  const finishGame = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    const result: GameResult = {
      score: totalScore,
      maxScore: level.hazards.length * 80,
      timeTaken: level.timeLimit - timeLeftRef.current,
      accuracy: Math.round((fixedCount / level.hazards.length) * 100),
      details: [
        `🔍 Found ${foundCount}/${level.hazards.length} hazards`,
        `🔧 Fixed ${fixedCount}/${level.hazards.length} hazards`,
        fixedCount >= level.requiredFixes ? '✅ Inspection PASSED!' : '❌ Not enough hazards fixed',
        comboCount > 1 ? `⚡ Best combo: ${comboCount}x` : '',
      ].filter(Boolean),
      mode: 'smartHome',
    };
    onComplete(result);
  }, [totalScore, fixedCount, foundCount, level, onComplete, comboCount]);

  const { timeLeft, start } = useTimer(level.timeLimit, finishGame);
  timeLeftRef.current = timeLeft;

  const addFloatingText = useCallback((text: string, x: number, y: number, color: string) => {
    const id = ++ftIdRef.current;
    setFloatingTexts(prev => [...prev, { id, text, x, y, color }]);
    setTimeout(() => {
      setFloatingTexts(prev => prev.filter(ft => ft.id !== id));
    }, 1200);
  }, []);

  // Scan pulse effect
  const triggerScan = useCallback(() => {
    setScanPulse(true);
    setTimeout(() => setScanPulse(false), 800);
  }, []);

  const hazardIcons: Record<string, string> = {
    wiring: '⚡', alarm: '🔔', exit: '🚪', clutter: '📦', appliance: '🔌', extinguisher: '🧯',
  };

  const hazardColors: Record<string, { border: string; bg: string; glow: string }> = {
    wiring: { border: 'border-yellow-500', bg: 'bg-yellow-500/20', glow: 'shadow-yellow-500/30' },
    alarm: { border: 'border-red-500', bg: 'bg-red-500/20', glow: 'shadow-red-500/30' },
    exit: { border: 'border-green-500', bg: 'bg-green-500/20', glow: 'shadow-green-500/30' },
    clutter: { border: 'border-orange-500', bg: 'bg-orange-500/20', glow: 'shadow-orange-500/30' },
    appliance: { border: 'border-blue-500', bg: 'bg-blue-500/20', glow: 'shadow-blue-500/30' },
    extinguisher: { border: 'border-purple-500', bg: 'bg-purple-500/20', glow: 'shadow-purple-500/30' },
  };

  const fixDescriptions: Record<string, string> = {
    wiring: '🔧 Replacing damaged wiring...',
    alarm: '🔔 Installing smoke detector...',
    exit: '🚪 Clearing exit pathway...',
    clutter: '📦 Removing hazardous clutter...',
    appliance: '🔌 Fixing electrical appliance...',
    extinguisher: '🧯 Installing fire extinguisher...',
  };

  const handleStartInspection = () => {
    setStarted(true);
    start();
  };

  const handleClickHazard = (hazard: Hazard, e: React.MouseEvent) => {
    if (hazard.fixed) return;

    if (hazard.found) {
      setSelectedHazard(hazard);
      return;
    }

    const rect = (e.target as HTMLElement).getBoundingClientRect();
    const updated = hazards.map(h => h.id === hazard.id ? { ...h, found: true } : h);
    setHazards(updated);
    setFoundCount(prev => prev + 1);
    setSelectedHazard({ ...hazard, found: true });

    addFloatingText('🔍 FOUND!', rect.left + rect.width / 2, rect.top, '#22c55e');
    const pts = 20;
    setTotalScore(prev => prev + pts);
    addFloatingText(`+${pts}`, rect.left + rect.width / 2, rect.top - 25, '#fbbf24');
    triggerScan();
  };

  const handleFixHazard = () => {
    if (!selectedHazard || selectedHazard.fixed) return;

    setShowFixAnimation(selectedHazard.id);

    setTimeout(() => {
      const now = Date.now();
      const isCombo = now - lastFixTime < 3000;
      const newCombo = isCombo ? comboCount + 1 : 1;
      setComboCount(newCombo);
      setLastFixTime(now);

      const basePts = 50;
      const comboBonus = Math.min(newCombo * 10, 50);
      const pts = basePts + comboBonus;

      const updated = hazards.map(h => h.id === selectedHazard.id ? { ...h, fixed: true } : h);
      setHazards(updated);
      setFixedCount(prev => prev + 1);
      setTotalScore(prev => prev + pts);
      setSelectedHazard({ ...selectedHazard, fixed: true });
      setShowFixAnimation(null);

      addFloatingText(`+${pts}`, 50, 50, '#22c55e');
      if (newCombo > 1) {
        addFloatingText(`${newCombo}x COMBO!`, 50, 35, '#a855f7');
      }
    }, 1000);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  // Auto-complete check
  useEffect(() => {
    const allFixed = hazards.every(h => h.fixed);
    if (allFixed && started && !completedRef.current) {
      setTimeout(finishGame, 500);
    }
  }, [hazards, started, finishGame]);

  const timerColor = timeLeft > level.timeLimit * 0.5 ? 'text-green-400' : timeLeft > level.timeLimit * 0.25 ? 'text-yellow-400' : 'text-red-400';
  const timerBg = timeLeft > level.timeLimit * 0.5 ? 'bg-green-500' : timeLeft > level.timeLimit * 0.25 ? 'bg-yellow-500' : 'bg-red-500';

  // Room layout config
  const rooms = levelId === 1 ? [
    { name: 'Kitchen', icon: '🍳', x: 3, y: 3, w: 44, h: 32, color: 'rgba(251,191,36,0.05)', border: 'rgba(251,191,36,0.15)' },
    { name: 'Living Room', icon: '🛋️', x: 53, y: 3, w: 44, h: 32, color: 'rgba(59,130,246,0.05)', border: 'rgba(59,130,246,0.15)' },
    { name: 'Bedroom', icon: '🛏️', x: 3, y: 40, w: 35, h: 35, color: 'rgba(168,85,247,0.05)', border: 'rgba(168,85,247,0.15)' },
    { name: 'Hallway', icon: '🚶', x: 42, y: 40, w: 20, h: 25, color: 'rgba(107,114,128,0.05)', border: 'rgba(107,114,128,0.15)' },
    { name: 'Storage', icon: '📦', x: 66, y: 40, w: 31, h: 35, color: 'rgba(239,68,68,0.05)', border: 'rgba(239,68,68,0.15)' },
    { name: 'Bathroom', icon: '🚿', x: 42, y: 68, w: 20, h: 10, color: 'rgba(6,182,212,0.05)', border: 'rgba(6,182,212,0.15)' },
  ] : [
    { name: 'Kitchen', icon: '🍳', x: 3, y: 3, w: 30, h: 28, color: 'rgba(251,191,36,0.05)', border: 'rgba(251,191,36,0.15)' },
    { name: 'Living Area', icon: '🛋️', x: 37, y: 3, w: 30, h: 28, color: 'rgba(59,130,246,0.05)', border: 'rgba(59,130,246,0.15)' },
    { name: 'IoT Hub', icon: '📡', x: 71, y: 3, w: 26, h: 28, color: 'rgba(16,185,129,0.05)', border: 'rgba(16,185,129,0.15)' },
    { name: 'Bedroom', icon: '🛏️', x: 3, y: 35, w: 28, h: 30, color: 'rgba(168,85,247,0.05)', border: 'rgba(168,85,247,0.15)' },
    { name: 'Hallway', icon: '🚶', x: 35, y: 35, w: 18, h: 42, color: 'rgba(107,114,128,0.05)', border: 'rgba(107,114,128,0.15)' },
    { name: 'Server Room', icon: '🖥️', x: 57, y: 35, w: 20, h: 30, color: 'rgba(239,68,68,0.05)', border: 'rgba(239,68,68,0.15)' },
    { name: 'Balcony', icon: '🌿', x: 80, y: 35, w: 17, h: 30, color: 'rgba(34,197,94,0.05)', border: 'rgba(34,197,94,0.15)' },
    { name: 'Entrance', icon: '🚪', x: 3, y: 68, w: 28, h: 10, color: 'rgba(245,158,11,0.05)', border: 'rgba(245,158,11,0.15)' },
  ];

  if (!started) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center p-4">
        <div className="max-w-md w-full animate-fade-in">
          <div className="bg-gray-900/95 rounded-2xl border border-emerald-500/30 overflow-hidden shadow-2xl shadow-emerald-500/10">
            <div className="relative bg-emerald-600/15 border-b border-emerald-500/30 p-6 text-center">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-600 via-teal-400 to-emerald-600" />
              <span className="text-7xl block mb-3">{level.building}</span>
              <h2 className="text-2xl font-black">{level.title}</h2>
              <p className="text-gray-400 text-sm mt-2">{level.description}</p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="bg-gray-800/50 rounded-xl p-3 text-center border border-gray-700/30">
                  <span className="text-xl">🔍</span>
                  <p className="text-lg font-bold mt-1">{level.hazards.length}</p>
                  <p className="text-[10px] text-gray-500">Hazards</p>
                </div>
                <div className="bg-gray-800/50 rounded-xl p-3 text-center border border-gray-700/30">
                  <span className="text-xl">⏱️</span>
                  <p className="text-lg font-bold mt-1">{level.timeLimit}s</p>
                  <p className="text-[10px] text-gray-500">Time Limit</p>
                </div>
                <div className="bg-gray-800/50 rounded-xl p-3 text-center border border-gray-700/30">
                  <span className="text-xl">✅</span>
                  <p className="text-lg font-bold mt-1">{level.requiredFixes}+</p>
                  <p className="text-[10px] text-gray-500">To Pass</p>
                </div>
              </div>

              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 mb-6 text-sm text-gray-300">
                <p className="font-bold text-emerald-400 mb-1">🎮 How to play:</p>
                <ul className="space-y-1 text-xs text-gray-400">
                  <li>• Click suspicious spots to discover hazards</li>
                  <li>• Fix each hazard to earn points</li>
                  <li>• Fix hazards quickly for combo bonus!</li>
                  <li>• Use 🔦 flashlight mode for better visibility</li>
                </ul>
              </div>

              <div className="flex gap-3">
                <button onClick={() => onNavigate('smartHome')} className="flex-1 px-4 py-3 bg-gray-800 rounded-xl hover:bg-gray-700 transition-colors">
                  ← Back
                </button>
                <button
                  onClick={handleStartInspection}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 rounded-xl font-bold transition-all shadow-lg shadow-emerald-500/20 hover:scale-105 active:scale-95"
                >
                  Start Inspection 🔍
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-3 md:p-4 select-none">
      {/* HUD */}
      <div className="max-w-6xl mx-auto flex items-center justify-between mb-3 flex-wrap gap-2">
        <button onClick={() => { if (confirm('Exit inspection?')) onNavigate('smartHome'); }} className="px-3 py-1.5 bg-gray-800/80 rounded-lg hover:bg-gray-700/80 transition-colors text-xs border border-gray-700/50">
          ← Exit
        </button>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="bg-gray-800/80 rounded-lg px-2.5 py-1.5 text-xs border border-gray-700/50 flex items-center gap-1.5">
            ⭐ <span className="font-bold text-yellow-400">{totalScore}</span>
          </div>
          <div className="bg-gray-800/80 rounded-lg px-2.5 py-1.5 text-xs border border-gray-700/50">
            🔍 <span className="font-bold">{foundCount}</span><span className="text-gray-500">/{level.hazards.length}</span>
          </div>
          <div className="bg-gray-800/80 rounded-lg px-2.5 py-1.5 text-xs border border-gray-700/50">
            🔧 <span className={`font-bold ${fixedCount >= level.requiredFixes ? 'text-green-400' : ''}`}>{fixedCount}</span><span className="text-gray-500">/{level.requiredFixes}+</span>
          </div>
          {comboCount > 1 && (
            <div className="bg-purple-500/20 rounded-lg px-2.5 py-1.5 text-xs border border-purple-500/30 text-purple-400 font-bold animate-pulse">
              ⚡ {comboCount}x
            </div>
          )}
          <div className="flex items-center gap-2 bg-gray-800/80 rounded-lg px-3 py-1.5 border border-gray-700/50">
            <span className={`text-lg font-mono font-black ${timerColor}`}>{timeLeft}</span>
            <div className="w-16 h-1.5 bg-gray-700 rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all duration-1000 ${timerBg}`} style={{ width: `${(timeLeft / level.timeLimit) * 100}%` }} />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-3">
        {/* Inspection Area */}
        <div className="lg:col-span-3">
          <div
            className="relative bg-gray-900 rounded-2xl border border-gray-700/50 overflow-hidden"
            style={{ aspectRatio: '16/10' }}
            onMouseMove={handleMouseMove}
          >
            {/* Scan pulse effect */}
            {scanPulse && (
              <div className="absolute inset-0 z-30 pointer-events-none">
                <div className="absolute inset-0 border-2 border-green-400/30 rounded-2xl animate-ping" style={{ animationDuration: '0.8s' }} />
              </div>
            )}

            {/* Flashlight overlay */}
            {flashlightMode && (
              <div
                className="absolute inset-0 z-20 pointer-events-none"
                style={{
                  background: `radial-gradient(circle 100px at ${mousePos.x}% ${mousePos.y}%, transparent 0%, rgba(0,0,0,0.85) 100%)`,
                }}
              />
            )}

            {/* Floor/wall texture */}
            <div className="absolute inset-0" style={{
              background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #1a1a2e 100%)',
            }} />
            <div className="absolute inset-0 opacity-5" style={{
              backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 19px, rgba(255,255,255,0.1) 19px, rgba(255,255,255,0.1) 20px), repeating-linear-gradient(90deg, transparent, transparent 19px, rgba(255,255,255,0.1) 19px, rgba(255,255,255,0.1) 20px)',
            }} />

            {/* Room label */}
            <div className="absolute top-2 left-3 text-[10px] text-gray-600 font-mono z-10 flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              FLOOR PLAN — INSPECTION MODE
            </div>

            {/* Rooms */}
            {rooms.map((room, i) => (
              <div
                key={i}
                className="absolute rounded-lg border flex flex-col items-center justify-center transition-colors"
                style={{
                  left: `${room.x}%`,
                  top: `${room.y}%`,
                  width: `${room.w}%`,
                  height: `${room.h}%`,
                  backgroundColor: room.color,
                  borderColor: room.border,
                }}
              >
                <span className="text-lg md:text-xl opacity-30">{room.icon}</span>
                <span className="text-[9px] md:text-[10px] text-gray-600 mt-0.5">{room.name}</span>
              </div>
            ))}

            {/* Hazard markers */}
            {hazards.map((hazard) => {
              const colors = hazardColors[hazard.type];
              const isFixing = showFixAnimation === hazard.id;

              return (
                <button
                  key={hazard.id}
                  onClick={(e) => handleClickHazard(hazard, e)}
                  disabled={hazard.fixed}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 z-10 transition-all duration-300 group
                    ${hazard.fixed
                      ? 'w-7 h-7 md:w-8 md:h-8 scale-75 opacity-50'
                      : hazard.found
                        ? 'w-10 h-10 md:w-12 md:h-12'
                        : 'w-8 h-8 md:w-10 md:h-10 hover:w-12 hover:h-12 cursor-pointer'
                    }`}
                  style={{ left: `${hazard.x}%`, top: `${hazard.y}%` }}
                >
                  <div className={`w-full h-full rounded-full flex items-center justify-center transition-all duration-200
                    ${hazard.fixed
                      ? 'bg-green-500/20 border-2 border-green-500/40'
                      : hazard.found
                        ? `${colors.bg} border-2 ${colors.border} shadow-lg ${colors.glow}`
                        : showHint
                          ? 'bg-yellow-500/15 border-2 border-yellow-500/40 animate-pulse'
                          : 'bg-gray-700/20 border-2 border-gray-600/20 hover:border-yellow-500/50 hover:bg-yellow-500/10 group-hover:shadow-lg group-hover:shadow-yellow-500/20'
                    }
                    ${selectedHazard?.id === hazard.id ? 'ring-2 ring-white/40 scale-110' : ''}
                    ${isFixing ? 'animate-spin' : ''}
                  `}>
                    <span className="text-sm md:text-base">
                      {hazard.fixed ? '✅' : hazard.found ? hazardIcons[hazard.type] : (showHint ? '❓' : '')}
                    </span>
                  </div>
                  {/* Pulse ring for found items */}
                  {hazard.found && !hazard.fixed && (
                    <div className={`absolute inset-0 rounded-full ${colors.border} border animate-ping opacity-30`} />
                  )}
                  {/* Hover tooltip for unfound */}
                  {!hazard.found && !showHint && (
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[9px] bg-gray-800/90 text-gray-400 px-2 py-0.5 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      Click to inspect
                    </div>
                  )}
                </button>
              );
            })}

            {/* Floating texts */}
            {floatingTexts.map(ft => (
              <div
                key={ft.id}
                className="absolute pointer-events-none z-40 font-black text-lg"
                style={{
                  left: `${ft.x}%`,
                  top: `${ft.y}%`,
                  color: ft.color,
                  animation: 'floatUp 1.2s ease-out forwards',
                }}
              >
                {ft.text}
              </div>
            ))}
          </div>

          {/* Tools bar */}
          <div className="mt-3 flex gap-2 flex-wrap">
            <button
              onClick={() => setFlashlightMode(!flashlightMode)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 ${
                flashlightMode
                  ? 'bg-yellow-500/20 border-yellow-500/40 text-yellow-400'
                  : 'bg-gray-800/80 border-gray-700/50 text-gray-400 hover:text-yellow-400'
              }`}
            >
              🔦 Flashlight {flashlightMode ? 'ON' : 'OFF'}
            </button>
            <button
              onClick={() => { setShowHint(!showHint); if (!showHint) setTotalScore(prev => Math.max(prev - 10, 0)); }}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 ${
                showHint
                  ? 'bg-yellow-500/20 border-yellow-500/40 text-yellow-400'
                  : 'bg-gray-800/80 border-gray-700/50 text-gray-400 hover:text-yellow-400'
              }`}
            >
              💡 Hints {showHint ? 'ON' : 'OFF'} <span className="text-red-400">(-10pts)</span>
            </button>
            <button
              onClick={triggerScan}
              className="px-3 py-2 rounded-xl text-xs font-bold transition-all border bg-gray-800/80 border-gray-700/50 text-gray-400 hover:text-green-400 flex items-center gap-1.5"
            >
              📡 Scan Area
            </button>
          </div>
        </div>

        {/* Side Panel */}
        <div className="space-y-3">
          {/* Selected Hazard Detail */}
          {selectedHazard ? (
            <div className={`rounded-2xl border p-4 transition-all animate-fade-in ${hazardColors[selectedHazard.type].bg} ${hazardColors[selectedHazard.type].border}`}>
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl ${hazardColors[selectedHazard.type].bg}`}>
                  {hazardIcons[selectedHazard.type]}
                </div>
                <div>
                  <h3 className="font-bold text-sm">{selectedHazard.name}</h3>
                  <p className="text-[10px] text-gray-400 capitalize">{selectedHazard.type} hazard</p>
                </div>
              </div>
              <p className="text-xs text-gray-300 mb-3">{selectedHazard.description}</p>

              {showFixAnimation === selectedHazard.id ? (
                <div className="w-full px-4 py-3 bg-gray-700/50 rounded-xl text-center text-sm">
                  <div className="animate-spin inline-block mb-1">🔧</div>
                  <p className="text-xs text-gray-400">{fixDescriptions[selectedHazard.type]}</p>
                </div>
              ) : !selectedHazard.fixed ? (
                <button
                  onClick={handleFixHazard}
                  className="w-full px-4 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 rounded-xl font-bold transition-all text-sm shadow-lg shadow-emerald-500/20 hover:scale-[1.02] active:scale-95"
                >
                  🔧 Fix Hazard <span className="text-emerald-200">(+50pts)</span>
                </button>
              ) : (
                <div className="w-full px-4 py-3 bg-green-600/15 rounded-xl text-center text-green-400 font-bold text-sm border border-green-500/30">
                  ✅ Fixed!
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-2xl border border-gray-700/50 bg-gray-900/50 p-4 text-center">
              <div className="text-3xl mb-2 animate-bounce">👆</div>
              <p className="text-gray-500 text-xs">Click spots on the floor plan to discover hazards</p>
            </div>
          )}

          {/* Progress */}
          <div className="rounded-2xl border border-gray-700/50 bg-gray-900/50 p-4">
            <h3 className="font-bold text-xs mb-2 text-gray-400">📊 INSPECTION PROGRESS</h3>
            <div className="mb-2">
              <div className="flex justify-between text-[10px] text-gray-500 mb-1">
                <span>Found</span><span>{foundCount}/{level.hazards.length}</span>
              </div>
              <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${(foundCount / level.hazards.length) * 100}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-[10px] text-gray-500 mb-1">
                <span>Fixed</span><span>{fixedCount}/{level.hazards.length}</span>
              </div>
              <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${(fixedCount / level.hazards.length) * 100}%` }} />
              </div>
            </div>
          </div>

          {/* Checklist */}
          <div className="rounded-2xl border border-gray-700/50 bg-gray-900/50 p-4 max-h-52 overflow-y-auto">
            <h3 className="font-bold text-xs mb-2 text-gray-400">📋 CHECKLIST</h3>
            <div className="space-y-1.5">
              {hazards.map((h) => (
                <div
                  key={h.id}
                  className={`flex items-center gap-2 text-xs rounded-lg px-2 py-1 transition-colors cursor-pointer ${
                    h.found && !h.fixed ? 'bg-gray-800/50 hover:bg-gray-700/50' : ''
                  } ${!h.found ? 'text-gray-600' : ''}`}
                  onClick={() => h.found && !h.fixed && setSelectedHazard(h)}
                >
                  <span className="text-sm">{h.fixed ? '✅' : h.found ? hazardIcons[h.type] : '⬜'}</span>
                  <span className={h.fixed ? 'line-through text-gray-600' : ''}>
                    {h.found ? h.name : '??? Unknown'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Finish */}
          <button
            onClick={finishGame}
            className={`w-full px-4 py-3 rounded-xl font-bold transition-all text-sm ${
              fixedCount >= level.requiredFixes
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-lg shadow-emerald-500/20 hover:scale-[1.02] active:scale-95'
                : 'bg-gray-800 text-gray-400 border border-gray-700/50'
            }`}
          >
            {fixedCount >= level.requiredFixes ? '✅ Complete Inspection' : `Fix ${level.requiredFixes - fixedCount} more to pass`}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes floatUp {
          0% { transform: translateY(0) scale(1); opacity: 1; }
          100% { transform: translateY(-40px) scale(1.2); opacity: 0; }
        }
        @keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        .animate-fade-in { animation: fadeIn 0.3s ease-out; }
      `}</style>
    </div>
  );
}
