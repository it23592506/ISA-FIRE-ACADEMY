import { partyScenarios, partyVenueIcons } from '../partyData';
import { GameScreen } from '../types';

interface Props {
  onNavigate: (screen: GameScreen) => void;
  onSelectScenario: (id: number) => void;
}

const venueColors: Record<string, string> = {
  club: 'from-pink-600 to-purple-600 border-pink-500/20',
  house: 'from-orange-600 to-yellow-600 border-orange-500/20',
  hotel: 'from-blue-600 to-indigo-600 border-blue-500/20',
  restaurant: 'from-red-600 to-orange-600 border-red-500/20',
};

export default function PartyMode({ onNavigate, onSelectScenario }: Props) {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="relative h-48 md:h-56 overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center opacity-20" style={{ backgroundImage: 'linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url(/images/city-map.jpg)' }} />
        <div className="absolute inset-0 bg-gradient-to-b from-gray-950/50 to-gray-950" />
        <div className="relative z-10 flex items-end h-full px-4 pb-6 max-w-6xl mx-auto">
          <div className="flex items-center gap-4 w-full">
            <button onClick={() => onNavigate('menu')} className="w-10 h-10 rounded-xl bg-gray-800/80 hover:bg-gray-700/80 flex items-center justify-center transition-colors flex-shrink-0">
              ←
            </button>
            <div>
              <h1 className="text-3xl font-black flex items-center gap-3">
                🎉 <span className="bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">Party Emergency</span>
              </h1>
              <p className="text-gray-400 text-sm mt-1">Navigate the venue, sound the alarm, and evacuate civilians from a dangerous party fire.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* How it works */}
        <div className="bg-purple-500/10 border border-purple-500/20 rounded-2xl p-5 mb-8">
          <h3 className="font-bold text-purple-400 flex items-center gap-2">🎮 How It Works</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 text-xs text-gray-400">
            <div>
              <p className="text-2xl text-center mb-1">👀</p>
              <p className="font-bold text-gray-300">1. Spot the Fire</p>
              <p className="mt-1">Navigate the venue and locate where the fire started.</p>
            </div>
            <div>
              <p className="text-2xl text-center mb-1">🚨</p>
              <p className="font-bold text-gray-300">2. Sound the Alarm</p>
              <p className="mt-1">Reach the fire alarm panel and alert everyone.</p>
            </div>
            <div>
              <p className="text-2xl text-center mb-1">🎯</p>
              <p className="font-bold text-gray-300">3. Choose Extinguisher</p>
              <p className="mt-1">Fight the fire with the right type of extinguisher.</p>
            </div>
            <div>
              <p className="text-2xl text-center mb-1">🏃</p>
              <p className="font-bold text-gray-300">4. Evacuate Guests</p>
              <p className="mt-1">Guide all partygoers to the exits before time runs out.</p>
            </div>
          </div>
        </div>

        <h2 className="text-xl font-black mb-5 text-gray-300">Select Emergency Scenario</h2>
        <div className="grid gap-5 md:grid-cols-2">
          {partyScenarios.map((scenario) => (
            <button
              key={scenario.id}
              onClick={() => { onSelectScenario(scenario.id); onNavigate('partyGame'); }}
              className={`group rounded-2xl border ${venueColors[scenario.venue].split(' ').pop()} bg-gray-900/80 hover:shadow-xl transition-all duration-300 text-left p-5 hover:scale-[1.01]`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${venueColors[scenario.venue].split(' ')[0]} ${venueColors[scenario.venue].split(' ')[1]} border flex items-center justify-center text-3xl flex-shrink-0`}>
                  {partyVenueIcons[scenario.venue]}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-gray-500 font-mono">SCENARIO {scenario.id}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${
                      scenario.difficulty === 'Easy' ? 'text-green-400 bg-green-500/10 border-green-500/30' :
                      scenario.difficulty === 'Medium' ? 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30' :
                      scenario.difficulty === 'Hard' ? 'text-red-400 bg-red-500/10 border-red-500/30' :
                      'text-purple-400 bg-purple-500/10 border-purple-500/30'
                    }`}>
                      {scenario.difficulty}
                    </span>
                  </div>
                  <h3 className="text-lg font-black mt-1">{scenario.title}</h3>
                  <p className="text-gray-400 text-sm mt-1 line-clamp-2">{scenario.description}</p>
                  <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                    <span>📍 {scenario.location}</span>
                    <span>👥 {scenario.guestCount} guests</span>
                    <span>⏱️ {scenario.timeLimit}s</span>
                  </div>
                </div>
                <span className="text-gray-600 group-hover:text-purple-400 transition-colors text-xl">→</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
