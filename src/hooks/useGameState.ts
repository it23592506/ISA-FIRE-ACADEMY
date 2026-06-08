import { useState, useCallback } from 'react';
import { GameScreen, PlayerState, GameResult, Rank } from '../types';
import { rankThresholds } from '../gameData';

const initialPlayer: PlayerState = {
  name: 'Recruit',
  rank: 'Rookie',
  xp: 0,
  totalScore: 0,
  missionsCompleted: 0,
  hazardsFixed: 0,
  civiliansRescued: 0,
  badges: [],
};

export function useGameState() {
  const [screen, setScreen] = useState<GameScreen>('menu');
  const [player, setPlayer] = useState<PlayerState>(initialPlayer);
  const [lastResult, setLastResult] = useState<GameResult | null>(null);
  const [selectedMissionId, setSelectedMissionId] = useState<number>(1);
  const [selectedLevelId, setSelectedLevelId] = useState<number>(1);
  const [selectedDisasterId, setSelectedDisasterId] = useState<number>(1);

  const calculateRank = useCallback((xp: number): Rank => {
    let currentRank: Rank = 'Rookie';
    for (const threshold of rankThresholds) {
      if (xp >= threshold.xp) {
        currentRank = threshold.rank as Rank;
      }
    }
    return currentRank;
  }, []);

  const addScore = useCallback((score: number, civiliansRescued: number = 0, hazardsFixed: number = 0, mode: string = '') => {
    setPlayer(prev => {
      const newXp = prev.xp + score;
      const newBadges = [...prev.badges];

      if (civiliansRescued >= 10 && !newBadges.includes('Life Saver')) newBadges.push('Life Saver');
      if (hazardsFixed >= 5 && !newBadges.includes('Safety Inspector')) newBadges.push('Safety Inspector');
      if (prev.missionsCompleted >= 4 && !newBadges.includes('Veteran')) newBadges.push('Veteran');
      if (score >= 350 && !newBadges.includes('Perfect Score')) newBadges.push('Perfect Score');
      if (mode === 'disaster' && !newBadges.includes('Disaster Commander')) newBadges.push('Disaster Commander');
      if (newXp >= 1000 && !newBadges.includes('Fire Expert')) newBadges.push('Fire Expert');

      return {
        ...prev,
        xp: newXp,
        totalScore: prev.totalScore + score,
        missionsCompleted: prev.missionsCompleted + 1,
        civiliansRescued: prev.civiliansRescued + civiliansRescued,
        hazardsFixed: prev.hazardsFixed + hazardsFixed,
        rank: calculateRank(newXp),
        badges: newBadges,
      };
    });
  }, [calculateRank]);

  const completeGame = useCallback((result: GameResult) => {
    setLastResult(result);
    addScore(result.score, 0, 0, result.mode);
    setScreen('results');
  }, [addScore]);

  return {
    screen,
    setScreen,
    player,
    setPlayer,
    lastResult,
    selectedMissionId,
    setSelectedMissionId,
    selectedLevelId,
    setSelectedLevelId,
    selectedDisasterId,
    setSelectedDisasterId,
    completeGame,
    addScore,
  };
}
