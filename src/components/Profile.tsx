import { useState } from 'react';
import { PlayerState, GameScreen } from '../types';
import { rankThresholds } from '../gameData';

interface Props {
  player: PlayerState;
  onNavigate: (screen: GameScreen) => void;
  onUpdateName?: (name: string) => void;
}

const badgeInfo: Record<string, { icon: string; desc: string; color: string }> = {
  'Life Saver': { icon: '💖', desc: 'Rescued 10+ civilians', color: 'border-pink-500/30 bg-pink-500/10' },
  'Safety Inspector': { icon: '🔍', desc: 'Fixed 5+ hazards', color: 'border-emerald-500/30 bg-emerald-500/10' },
  'Veteran': { icon: '🎖️', desc: 'Completed 5+ missions', color: 'border-orange-500/30 bg-orange-500/10' },
  'Perfect Score': { icon: '⭐', desc: 'Scored 350+ in a mission', color: 'border-yellow-500/30 bg-yellow-500/10' },
  'Disaster Commander': { icon: '🧠', desc: 'Completed a disaster scenario', color: 'border-purple-500/30 bg-purple-500/10' },
  'Fire Expert': { icon: '🔥', desc: 'Reached 1000+ XP', color: 'border-red-500/30 bg-red-500/10' },
};

const allBadgeKeys = Object.keys(badgeInfo);

const rankIcons: Record<string, string> = {
  'Rookie': '🔰',
  'Firefighter': '🧑‍🚒',
  'Lieutenant': '⭐',
  'Captain': '🌟',
  'Chief': '👑',
};

export default function Profile({ player, onNavigate }: Props) {
  const [editing, setEditing] = useState(false);
  const [nameInput, setNameInput] = useState(player.name);

  const nextRank = rankThresholds.find(r => r.xp > player.xp);
  const currentRankData = [...rankThresholds].reverse().find(r => player.xp >= r.xp);
  const progress = nextRank && currentRankData
    ? ((player.xp - currentRankData.xp) / (nextRank.xp - currentRankData.xp)) * 100
    : 100;

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => onNavigate('menu')} className="w-10 h-10 rounded-xl bg-gray-800/80 hover:bg-gray-700/80 flex items-center justify-center transition-all hover:scale-105 active:scale-95">
            ←
          </button>
          <h1 className="text-xl font-black text-gray-300">👤 Player Profile</h1>
        </div>

        {/* Profile Card */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border border-gray-700/50 overflow-hidden mb-5 shadow-xl">
          {/* Cover */}
          <div className="h-24 bg-gradient-to-r from-red-600/20 via-orange-600/20 to-yellow-600/20 relative">
            <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'url(/images/hero-bg.jpg)', backgroundSize: 'cover', backgroundPosition: 'center' }} />
          </div>

          <div className="px-6 pb-6 -mt-10">
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-4xl shadow-xl shadow-red-500/30 border-4 border-gray-900">
                {rankIcons[player.rank] || '🧑‍🚒'}
              </div>

              <div className="mt-3">
                {editing ? (
                  <div className="flex items-center gap-2">
                    <input
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-1.5 text-center text-sm focus:outline-none focus:border-orange-500"
                      maxLength={20}
                      autoFocus
                      onKeyDown={(e) => { if (e.key === 'Enter') setEditing(false); }}
                    />
                    <button onClick={() => setEditing(false)} className="text-xs text-green-400 hover:text-green-300">✓</button>
                  </div>
                ) : (
                  <button onClick={() => setEditing(true)} className="group">
                    <h2 className="text-xl font-black group-hover:text-orange-400 transition-colors">{player.name}</h2>
                    <span className="text-[10px] text-gray-600 group-hover:text-gray-400 transition-colors">✏️ tap to edit</span>
                  </button>
                )}
              </div>

              <div className="mt-2 px-4 py-1 bg-gradient-to-r from-orange-500/15 to-red-500/15 text-orange-400 rounded-full text-xs font-bold border border-orange-500/20">
                {rankIcons[player.rank]} {player.rank}
              </div>

              {/* XP Bar */}
              <div className="w-full max-w-xs mt-4">
                <div className="flex justify-between text-[10px] text-gray-500 mb-1">
                  <span>{player.xp} XP</span>
                  <span>{nextRank ? `${nextRank.rank} at ${nextRank.xp}` : 'Max Rank! 👑'}</span>
                </div>
                <div className="h-2.5 bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full transition-all duration-700" style={{ width: `${Math.min(progress, 100)}%` }} />
                </div>
              </div>

              {/* Rank progression */}
              <div className="flex items-center gap-1 mt-4">
                {rankThresholds.map((rt, i) => (
                  <div key={rt.rank} className="flex items-center">
                    <div className={`flex flex-col items-center transition-all ${player.xp >= rt.xp ? '' : 'opacity-30'}`}>
                      <span className="text-sm">{rankIcons[rt.rank]}</span>
                      <span className="text-[8px] text-gray-500 mt-0.5">{rt.rank}</span>
                    </div>
                    {i < rankThresholds.length - 1 && (
                      <div className={`w-4 h-0.5 mx-0.5 rounded ${player.xp >= rankThresholds[i + 1].xp ? 'bg-orange-500' : 'bg-gray-700'}`} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 mb-5">
          {[
            { label: 'Total Score', value: player.totalScore, icon: '⭐', color: 'text-yellow-400', bg: 'bg-yellow-500/5 border-yellow-500/20' },
            { label: 'Missions', value: player.missionsCompleted, icon: '🎯', color: 'text-orange-400', bg: 'bg-orange-500/5 border-orange-500/20' },
            { label: 'Rescued', value: player.civiliansRescued, icon: '👥', color: 'text-green-400', bg: 'bg-green-500/5 border-green-500/20' },
            { label: 'Hazards Fixed', value: player.hazardsFixed, icon: '🔧', color: 'text-blue-400', bg: 'bg-blue-500/5 border-blue-500/20' },
          ].map((stat) => (
            <div key={stat.label} className={`rounded-xl border p-3.5 text-center ${stat.bg}`}>
              <span className="text-xl">{stat.icon}</span>
              <p className={`text-xl font-black mt-1 ${stat.color}`}>{stat.value}</p>
              <p className="text-[9px] text-gray-500 mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Badges */}
        <div className="bg-gray-900/60 rounded-2xl border border-gray-700/50 p-5">
          <h3 className="text-sm font-black mb-4 text-gray-300 flex items-center gap-2">
            🏆 Achievements
            <span className="text-[10px] text-gray-600 font-normal">{player.badges.length}/{allBadgeKeys.length}</span>
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
            {allBadgeKeys.map((key) => {
              const earned = player.badges.includes(key);
              const info = badgeInfo[key];
              return (
                <div
                  key={key}
                  className={`rounded-xl border p-3.5 text-center transition-all ${
                    earned
                      ? `${info.color} shadow-lg`
                      : 'border-gray-800 bg-gray-900/30 opacity-40'
                  }`}
                >
                  <span className="text-2xl block mb-1">{earned ? info.icon : '🔒'}</span>
                  <p className="text-xs font-bold">{key}</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">{info.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
