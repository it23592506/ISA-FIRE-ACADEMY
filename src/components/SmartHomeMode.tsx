import { smartHomeLevels } from '../gameData';
import { GameScreen } from '../types';

interface Props {
  onNavigate: (screen: GameScreen) => void;
  onSelectLevel: (id: number) => void;
}

export default function SmartHomeMode({ onNavigate, onSelectLevel }: Props) {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="relative h-48 md:h-56 overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center opacity-30" style={{ backgroundImage: 'url(/images/smart-home.jpg)' }} />
        <div className="absolute inset-0 bg-gradient-to-b from-gray-950/50 to-gray-950" />
        <div className="relative z-10 flex items-end h-full px-4 pb-6 max-w-6xl mx-auto">
          <div className="flex items-center gap-4 w-full">
            <button onClick={() => onNavigate('menu')} className="w-10 h-10 rounded-xl bg-gray-800/80 hover:bg-gray-700/80 flex items-center justify-center transition-colors flex-shrink-0">
              ←
            </button>
            <div>
              <h1 className="text-3xl font-black flex items-center gap-3">
                🏠 <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">Prevention Mode</span>
              </h1>
              <p className="text-gray-400 text-sm mt-1">Inspect buildings. Find hazards. Save lives before fires start.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid gap-6 md:grid-cols-2">
          {smartHomeLevels.map((level) => (
            <button
              key={level.id}
              onClick={() => { onSelectLevel(level.id); onNavigate('smartHomeGame'); }}
              className="group rounded-2xl border border-gray-700/50 bg-gray-900/80 hover:border-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300 text-left p-6 hover:scale-[1.02]"
            >
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-emerald-600/20 to-teal-600/20 border border-emerald-500/20 flex items-center justify-center text-3xl flex-shrink-0">
                  {level.building}
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500 font-mono">LEVEL {level.id}</p>
                  <h3 className="text-xl font-bold mt-1">{level.title}</h3>
                  <p className="text-gray-400 text-sm mt-1">{level.description}</p>
                  <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                    <span>🔍 {level.hazards.length} hazards</span>
                    <span>⏱️ {level.timeLimit}s</span>
                    <span>✅ Fix {level.requiredFixes}+ to pass</span>
                  </div>
                </div>
                <span className="text-gray-600 group-hover:text-emerald-400 transition-colors text-xl">→</span>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-8 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-5">
          <h3 className="font-bold text-emerald-400 flex items-center gap-2">🔍 How To Play</h3>
          <p className="text-gray-400 text-sm mt-2">
            Click on highlighted areas to inspect hazards. Each hazard you find can be fixed to earn points.
            Find and fix enough hazards before time runs out!
          </p>
        </div>
      </div>
    </div>
  );
}
