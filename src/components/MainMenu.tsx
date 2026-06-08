import { useState, useEffect } from 'react';
import { GameScreen, PlayerState } from '../types';
import { rankThresholds } from '../gameData';

interface Props {
  player: PlayerState;
  onNavigate: (screen: GameScreen) => void;
}

export default function MainMenu({ player, onNavigate }: Props) {
  const [showMenu, setShowMenu] = useState(false);
  const [hoveredMode, setHoveredMode] = useState<string | null>(null);
  const [fireParticles, setFireParticles] = useState<{ id: number; x: number; y: number; size: number; speed: number; color: string; opacity: number }[]>([]);

  const nextRank = rankThresholds.find(r => r.xp > player.xp);
  const currentRankData = [...rankThresholds].reverse().find(r => player.xp >= r.xp);
  const progress = nextRank && currentRankData
    ? ((player.xp - currentRankData.xp) / (nextRank.xp - currentRankData.xp)) * 100
    : 100;

  // Entrance animation
  useEffect(() => {
    setTimeout(() => setShowMenu(true), 300);
  }, []);

  // Animated fire particles
  useEffect(() => {
    let id = 0;
    const interval = setInterval(() => {
      setFireParticles(prev => {
        const updated = prev
          .map(p => ({ ...p, y: p.y - p.speed, opacity: p.opacity - 0.01 }))
          .filter(p => p.opacity > 0);

        if (updated.length < 35) {
          updated.push({
            id: id++,
            x: 30 + Math.random() * 40,
            y: 45 + Math.random() * 20,
            size: 2 + Math.random() * 5,
            speed: 0.2 + Math.random() * 0.4,
            color: ['#EF4444', '#F97316', '#EAB308', '#FBBF24', '#FB923C'][Math.floor(Math.random() * 5)],
            opacity: 0.3 + Math.random() * 0.5,
          });
        }
        return updated;
      });
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const modes = [
    {
      id: 'story' as GameScreen,
      title: 'Hero Mode',
      subtitle: 'Story Missions',
      icon: '🚒',
      emoji2: '🔥',
      description: 'Fight real fires, rescue civilians, choose the right extinguisher!',
      color: 'from-red-600 to-orange-500',
      border: 'border-red-500/30 hover:border-red-500/60',
      glow: 'hover:shadow-red-500/20',
      badge: '5 Missions',
      image: '/images/firefighter.jpg',
    },
    {
      id: 'smartHome' as GameScreen,
      title: 'Prevention Mode',
      subtitle: 'Building Inspector',
      icon: '🏠',
      emoji2: '🔍',
      description: 'Find hidden hazards, fix safety issues, earn combo points!',
      color: 'from-emerald-600 to-teal-500',
      border: 'border-emerald-500/30 hover:border-emerald-500/60',
      glow: 'hover:shadow-emerald-500/20',
      badge: '2 Levels',
      image: '/images/smart-home.jpg',
    },
    {
      id: 'disaster' as GameScreen,
      title: 'Disaster Mode',
      subtitle: 'Emergency Commander',
      icon: '🌋',
      emoji2: '🧠',
      description: 'Make split-second decisions that determine who lives and who dies.',
      color: 'from-purple-600 to-pink-500',
      border: 'border-purple-500/30 hover:border-purple-500/60',
      glow: 'hover:shadow-purple-500/20',
      badge: '3 Scenarios',
      image: '/images/disaster.jpg',
    },
    {
      id: 'learn' as GameScreen,
      title: 'Academy',
      subtitle: 'ISA Fire Academy',
      icon: '📚',
      emoji2: '🧯',
      description: 'Master PASS method, fire triangle, extinguisher types & more.',
      color: 'from-blue-600 to-cyan-500',
      border: 'border-blue-500/30 hover:border-blue-500/60',
      glow: 'hover:shadow-blue-500/20',
      badge: '6 Lessons',
      image: '/images/city-map.jpg',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-white relative overflow-hidden">
      {/* Hero Section */}
      <div className="relative h-[55vh] min-h-[380px]">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: 'url(/images/hero-bg.jpg)' }} />
        <div className="absolute inset-0 bg-gradient-to-b from-gray-950/30 via-gray-950/60 to-gray-950" />

        {/* Animated particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {fireParticles.map(p => (
            <div
              key={p.id}
              className="absolute rounded-full"
              style={{
                left: `${p.x}%`,
                top: `${p.y}%`,
                width: `${p.size}px`,
                height: `${p.size}px`,
                backgroundColor: p.color,
                opacity: p.opacity,
                filter: `blur(${p.size > 4 ? 1 : 0}px)`,
                transition: 'top 0.05s linear',
              }}
            />
          ))}
        </div>

        <div
          className="relative z-10 flex flex-col items-center justify-center h-full px-4 text-center"
          style={{ animation: 'fadeInUp 0.8s ease-out' }}
        >
          <div className="mb-3">
            <span className="text-6xl md:text-7xl block" style={{ animation: 'fireGlow 2s ease-in-out infinite' }}>🔥</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-1">
            <span className="bg-gradient-to-r from-red-400 via-orange-400 to-yellow-400 bg-clip-text text-transparent">
              ISA FIRE
            </span>
          </h1>
          <p className="text-2xl md:text-3xl font-light text-orange-200/80 tracking-[0.2em]">
            ACADEMY
          </p>
          <p className="mt-3 text-gray-400 max-w-md text-sm leading-relaxed">
            Master fire safety through immersive mini-games. Fight fires. Save lives. Be the hero.
          </p>

          {/* Play button */}
          <button
            onClick={() => {
              document.getElementById('modes')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="mt-6 px-8 py-3 bg-gradient-to-r from-red-600 to-orange-600 rounded-full font-bold text-sm hover:from-red-500 hover:to-orange-500 transition-all shadow-lg shadow-red-500/30 hover:shadow-red-500/50 hover:scale-105 active:scale-95 flex items-center gap-2"
          >
            <span>▶</span> START PLAYING
          </button>
        </div>
      </div>

      {/* Player HUD */}
      <div
        className={`max-w-6xl mx-auto px-4 -mt-8 relative z-20 transition-all duration-700 ${showMenu ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
      >
        <div className="bg-gray-900/95 backdrop-blur-xl rounded-2xl border border-gray-700/50 p-4 md:p-5 shadow-2xl">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-xl shadow-lg shadow-red-500/30 flex-shrink-0">
              🧑‍🚒
            </div>
            <div className="flex-1 text-center sm:text-left min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                <h3 className="font-bold">{player.name}</h3>
                <span className="px-2.5 py-0.5 bg-orange-500/20 text-orange-400 rounded-full text-[10px] font-bold tracking-wide self-center sm:self-auto border border-orange-500/30">
                  {player.rank}
                </span>
              </div>
              <div className="mt-1.5 flex items-center gap-2">
                <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full transition-all duration-700" style={{ width: `${Math.min(progress, 100)}%` }} />
                </div>
                <span className="text-[10px] text-gray-500 flex-shrink-0">{player.xp} XP</span>
              </div>
            </div>
            <div className="flex gap-5 text-center flex-shrink-0">
              {[
                { val: player.missionsCompleted, label: 'Missions', color: 'text-orange-400', icon: '🎯' },
                { val: player.civiliansRescued, label: 'Rescued', color: 'text-green-400', icon: '👥' },
                { val: player.badges.length, label: 'Badges', color: 'text-blue-400', icon: '🏆' },
              ].map(s => (
                <div key={s.label} className="min-w-[50px]">
                  <p className="text-[10px] text-gray-600">{s.icon}</p>
                  <p className={`text-lg font-black ${s.color}`}>{s.val}</p>
                  <p className="text-[9px] text-gray-600">{s.label}</p>
                </div>
              ))}
            </div>
            <button
              onClick={() => onNavigate('profile')}
              className="px-4 py-2 bg-gray-800/80 hover:bg-gray-700/80 rounded-xl text-xs transition-all border border-gray-700/50 flex-shrink-0 hover:scale-105 active:scale-95"
            >
              👤 Profile
            </button>
          </div>
        </div>
      </div>

      {/* Game Modes */}
      <div
        id="modes"
        className={`max-w-6xl mx-auto px-4 py-10 transition-all duration-700 delay-200 ${showMenu ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
      >
        <h2 className="text-xl font-black mb-6 text-center text-gray-300 tracking-wide">🎮 CHOOSE YOUR MISSION</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {modes.map((mode, idx) => (
            <button
              key={mode.id}
              onClick={() => onNavigate(mode.id)}
              onMouseEnter={() => setHoveredMode(mode.id)}
              onMouseLeave={() => setHoveredMode(null)}
              className={`group relative overflow-hidden rounded-2xl border ${mode.border} bg-gray-900/60 transition-all duration-300 text-left shadow-xl ${mode.glow} hover:shadow-2xl hover:scale-[1.02] active:scale-[0.99]`}
              style={{ animation: `fadeInUp ${0.4 + idx * 0.1}s ease-out` }}
            >
              {/* Background image */}
              <div className="absolute inset-0 opacity-15 group-hover:opacity-25 transition-opacity duration-500">
                <img src={mode.image} alt="" className="w-full h-full object-cover" loading="lazy" />
              </div>
              <div className={`absolute inset-0 bg-gradient-to-br ${mode.color} opacity-0 group-hover:opacity-[0.07] transition-opacity duration-300`} />

              <div className="relative p-5 md:p-6">
                <div className="flex items-start gap-4">
                  <div className="relative">
                    <span className="text-4xl group-hover:scale-110 transition-transform inline-block">{mode.icon}</span>
                    {hoveredMode === mode.id && (
                      <span className="absolute -top-1 -right-1 text-sm animate-bounce">{mode.emoji2}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-lg font-black">{mode.title}</h3>
                      <span className="text-[10px] text-gray-500 bg-gray-800/80 px-2 py-0.5 rounded-full">{mode.badge}</span>
                    </div>
                    <p className="text-gray-500 text-xs mt-0.5">{mode.subtitle}</p>
                    <p className="text-gray-400 text-sm mt-2 leading-relaxed">{mode.description}</p>
                  </div>
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${mode.color} flex items-center justify-center text-sm font-bold opacity-0 group-hover:opacity-100 transition-all group-hover:scale-100 scale-75 flex-shrink-0`}>
                    →
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className={`max-w-6xl mx-auto px-4 pb-10 transition-all duration-700 delay-400 ${showMenu ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: 'Fire Types', value: '6', icon: '🔥' },
            { label: 'Missions', value: '10+', icon: '🎯' },
            { label: 'Scenarios', value: '3', icon: '🌋' },
            { label: 'Tips', value: '30+', icon: '💡' },
          ].map((stat) => (
            <div key={stat.label} className="bg-gray-900/40 rounded-xl border border-gray-800/50 p-3 text-center hover:bg-gray-900/60 transition-colors">
              <span className="text-lg">{stat.icon}</span>
              <p className="text-lg font-black mt-0.5">{stat.value}</p>
              <p className="text-[9px] text-gray-600">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      <footer className="text-center py-5 text-gray-700 text-[10px] border-t border-gray-800/30 tracking-wider">
        🔥 ISA FIRE ACADEMY — Learn. Protect. Save Lives. 🧯
      </footer>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fireGlow {
          0%, 100% { filter: brightness(1) drop-shadow(0 0 10px rgba(239,68,68,0.3)); }
          50% { filter: brightness(1.2) drop-shadow(0 0 25px rgba(239,68,68,0.6)); }
        }
      `}</style>
    </div>
  );
}
