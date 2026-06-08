import { missions, extinguisherInfo, fireTypeInfo } from '../gameData';
import { Mission, GameScreen } from '../types';

interface Props {
  onNavigate: (screen: GameScreen) => void;
  onSelectMission: (id: number) => void;
  completedCount: number;
}

export default function StoryMode({ onNavigate, onSelectMission, completedCount }: Props) {
  const getDifficultyColor = (d: Mission['difficulty']) => {
    switch (d) {
      case 'Easy': return 'text-green-400 bg-green-500/10 border-green-500/30';
      case 'Medium': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
      case 'Hard': return 'text-red-400 bg-red-500/10 border-red-500/30';
      case 'Extreme': return 'text-purple-400 bg-purple-500/10 border-purple-500/30';
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="relative h-48 md:h-56 overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center opacity-30" style={{ backgroundImage: 'url(/images/firefighter.jpg)' }} />
        <div className="absolute inset-0 bg-gradient-to-b from-gray-950/50 to-gray-950" />
        <div className="relative z-10 flex items-end h-full px-4 pb-6 max-w-6xl mx-auto">
          <div className="flex items-center gap-4 w-full">
            <button onClick={() => onNavigate('menu')} className="w-10 h-10 rounded-xl bg-gray-800/80 hover:bg-gray-700/80 flex items-center justify-center transition-colors flex-shrink-0">
              ←
            </button>
            <div className="flex-1">
              <h1 className="text-3xl font-black flex items-center gap-3">
                🚒 <span className="bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">Hero Mode</span>
              </h1>
              <p className="text-gray-400 text-sm mt-1">Respond to emergencies. Save lives. Choose wisely.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Mission List */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid gap-4">
          {missions.map((mission, idx) => {
            const fireInfo = fireTypeInfo[mission.fireType];
            const extInfo = extinguisherInfo[mission.correctExtinguisher];
            const isLocked = idx > completedCount + 1;

            return (
              <button
                key={mission.id}
                disabled={isLocked}
                onClick={() => {
                  onSelectMission(mission.id);
                  onNavigate('storyGame');
                }}
                className={`group relative overflow-hidden rounded-2xl border transition-all duration-300 text-left 
                  ${isLocked
                    ? 'border-gray-800 bg-gray-900/30 opacity-50 cursor-not-allowed'
                    : 'border-gray-700/50 bg-gray-900/80 hover:border-red-500/30 hover:shadow-xl hover:shadow-red-500/10 hover:scale-[1.01]'
                  }`}
              >
                <div className="p-5 md:p-6">
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-red-600/20 to-orange-600/20 border border-red-500/20 flex items-center justify-center text-2xl flex-shrink-0">
                        {isLocked ? '🔒' : fireInfo.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs text-gray-500 font-mono">MISSION {mission.id}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full border ${getDifficultyColor(mission.difficulty)}`}>
                            {mission.difficulty}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold mt-1 truncate">{mission.title}</h3>
                        <p className="text-gray-400 text-sm mt-0.5 line-clamp-1">{mission.description}</p>
                      </div>
                    </div>

                    {!isLocked && (
                      <div className="flex items-center gap-4 md:gap-6 text-sm flex-shrink-0">
                        <div className="flex items-center gap-1.5">
                          <span>{extInfo.icon}</span>
                          <span className="text-gray-400">{extInfo.name}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span>👥</span>
                          <span className="text-gray-400">{mission.rescueCount} people</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span>⏱️</span>
                          <span className="text-gray-400">{mission.timeLimit}s</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span>⭐</span>
                          <span className="text-yellow-400 font-bold">{mission.points}</span>
                        </div>
                        <span className="text-gray-600 group-hover:text-red-400 transition-colors text-lg">→</span>
                      </div>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Tip */}
        <div className="mt-8 bg-orange-500/10 border border-orange-500/20 rounded-2xl p-5">
          <h3 className="font-bold text-orange-400 flex items-center gap-2">
            💡 Pro Tip
          </h3>
          <p className="text-gray-400 text-sm mt-2">
            Choosing the <strong className="text-white">wrong extinguisher</strong> will make the fire worse and cost you points!
            Remember: <strong className="text-red-400">NEVER</strong> use water on electrical or grease fires.
          </p>
        </div>
      </div>
    </div>
  );
}
