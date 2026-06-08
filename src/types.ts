export type GameScreen =
  | 'menu'
  | 'story'
  | 'storyGame'
  | 'smartHome'
  | 'smartHomeGame'
  | 'disaster'
  | 'disasterGame'
  | 'party'
  | 'partyGame'
  | 'learn'
  | 'profile'
  | 'results';

export type Rank = 'Rookie' | 'Firefighter' | 'Lieutenant' | 'Captain' | 'Chief';

export type ExtinguisherType = 'water' | 'co2' | 'foam' | 'powder';

export type FireType = 'electrical' | 'grease' | 'wood' | 'chemical' | 'paper' | 'fabric';

export interface Mission {
  id: number;
  title: string;
  description: string;
  location: string;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Extreme';
  fireType: FireType;
  correctExtinguisher: ExtinguisherType;
  timeLimit: number;
  rescueCount: number;
  points: number;
  story: string[];
}

export interface Hazard {
  id: number;
  name: string;
  description: string;
  x: number;
  y: number;
  type: 'wiring' | 'alarm' | 'exit' | 'clutter' | 'appliance' | 'extinguisher';
  found: boolean;
  fixed: boolean;
}

export interface SmartHomeLevel {
  id: number;
  title: string;
  description: string;
  building: string;
  hazards: Hazard[];
  timeLimit: number;
  requiredFixes: number;
}

export interface DisasterScenario {
  id: number;
  title: string;
  description: string;
  type: 'skyscraper' | 'factory' | 'forest' | 'subway';
  civilians: number;
  difficulty: 'Hard' | 'Extreme';
  decisions: DisasterDecision[];
}

export interface DisasterDecision {
  id: number;
  question: string;
  options: { text: string; correct: boolean; feedback: string; points: number }[];
  timeLimit: number;
}

export interface PlayerState {
  name: string;
  rank: Rank;
  xp: number;
  totalScore: number;
  missionsCompleted: number;
  hazardsFixed: number;
  civiliansRescued: number;
  badges: string[];
}

export interface GameResult {
  score: number;
  maxScore: number;
  timeTaken: number;
  accuracy: number;
  details: string[];
  mode: string;
}
