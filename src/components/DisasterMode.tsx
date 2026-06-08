import { disasterScenarios } from '../gameData';
import { GameScreen } from '../types';

interface Props {
  onNavigate: (screen: GameScreen) => void;
  onSelectDisaster: (id: number) => void;
}

const typeIcons: Record<string, string> = {
  skyscraper: '🏢',
  factory: '🏭',
  forest: '🌲',
  subway: '🚇',
};

const typeColors: Record<string, string> = {
  skyscraper: 'from-red-600/20 to-orange-600/20 border-red-500/20',
  factory: 'from-purple-600/20 to-pink-600/20 border-purple-500/20',
  forest: 'from-green-600/20 to-yellow-600/20 border-green-500/20',
  subway: 'from-blue-600/20 to-cyan-600/20 border-blue-500/20',
};

export default function DisasterMode({ onNavigate, onSelectDisaster }: Props) {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="relative h-48 md:h-56 overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center opacity-30" style={{ backgroundImage: 'url(/images/disaster.jpg)' }} />
        <div className="absolute inset-0 bg-gradient-to-b from-gray-950/50 to-gray-950" />
        <div className="relative z-10 flex items-end h-full px-4 pb-6 max-w-6xl mx-auto">
          <div className="flex items-center gap-4 w-full">
            <button onClick={() => onNavigate('menu')} className="w-10 h-10 rounded-xl bg-gray-800/80 hover:bg-gray-700/80 flex items-center justify-center transition-colors flex-shrink-0">
              ←
            </button>
            <div>
              <h1 className="text-3xl font-black flex items-center gap-3">
                🌋 <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Disaster Mode</span>
              </h1>
              <p className="text-gray-400 text-sm mt-1">Large-scale emergencies. Make critical decisions as Emergency Commander.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid gap-6">
          {disasterScenarios.map((scenario) => (
            <button
              key={scenario.id}
              onClick={() => { onSelectDisaster(scenario.id); onNavigate('disasterGame'); }}
              className="group rounded-2xl border border-gray-700/50 bg-gray-900/80 hover:border-purple-500/30 hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300 text-left p-6 hover:scale-[1.01]"
            >
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${typeColors[scenario.type]} border flex items-center justify-center text-3xl flex-shrink-0`}>
                  {typeIcons[scenario.type]}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-gray-500 font-mono">SCENARIO {scenario.id}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${
                      scenario.difficulty === 'Extreme'
                        ? 'text-purple-400 bg-purple-500/10 border-purple-500/30'
                        : 'text-red-400 bg-red-500/10 border-red-500/30'
                    }`}>
                      {scenario.difficulty}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold mt-1">{scenario.title}</h3>
                  <p className="text-gray-400 text-sm mt-1">{scenario.description}</p>
                  <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                    <span>👥 {scenario.civilians} civilians</span>
                    <span>🧠 {scenario.decisions.length} critical decisions</span>
                  </div>
                </div>
                <span className="text-gray-600 group-hover:text-purple-400 transition-colors text-xl self-center">→</span>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-8 bg-purple-500/10 border border-purple-500/20 rounded-2xl p-5">
          <h3 className="font-bold text-purple-400 flex items-center gap-2">🧠 Commander Mode</h3>
          <p className="text-gray-400 text-sm mt-2">
            You are the <strong className="text-white">Emergency Commander</strong>. Every decision you make affects lives.
            Choose wisely — wrong decisions increase casualties. Time pressure adds to the challenge!
          </p>
        </div>
      </div>
    </div>
  );
}
