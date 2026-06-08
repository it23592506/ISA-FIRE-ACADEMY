export interface PartyScenario {
  id: number;
  title: string;
  description: string;
  location: string;
  venue: 'club' | 'house' | 'hotel' | 'restaurant';
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Extreme';
  guestCount: number;
  timeLimit: number;
  points: number;
  story: string[];
  fireOrigin: { x: number; y: number };
  alarmPosition: { x: number; y: number };
  exits: { x: number; y: number; name: string }[];
  rooms: { x: number; y: number; w: number; h: number; name: string }[];
}

export interface PartyGuest {
  id: number;
  x: number;
  y: number;
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  state: 'partying' | 'alerted' | 'panicking' | 'evacuating' | 'safe' | 'trapped';
  panicTimer: number;
  speed: number;
  emoji: string;
}

export type PartyPhase =
  | 'briefing'
  | 'arriving'
  | 'patrol'
  | 'alarm'
  | 'panic'
  | 'evacuate'
  | 'contain'
  | 'result';

export const partyScenarios: PartyScenario[] = [
  {
    id: 1,
    title: 'Nightclub Inferno',
    description: 'A crowded nightclub. Disco lights and loud music mask the early warning signs.',
    location: 'Neon Lounge Downtown',
    venue: 'club',
    difficulty: 'Medium',
    guestCount: 45,
    timeLimit: 90,
    points: 300,
    story: [
      '📞 DISPATCH: "Multiple calls reporting smoke at Neon Lounge. Party is at peak capacity!"',
      '🎵 The music is so loud people didn\'t hear the alarm. You need to reach the fire alarm panel FAST!',
      '⚠️ The fire started in the DJ booth cables. Spread through the crowded dance floor!',
    ],
    fireOrigin: { x: 50, y: 40 },
    alarmPosition: { x: 15, y: 15 },
    exits: [
      { x: 85, y: 75, name: 'Main Entrance' },
      { x: 10, y: 85, name: 'Side Exit' },
    ],
    rooms: [
      { x: 10, y: 15, w: 20, h: 15, name: 'DJ Booth' },
      { x: 40, y: 20, w: 25, h: 20, name: 'Dance Floor' },
      { x: 70, y: 15, w: 22, h: 18, name: 'Bar Area' },
      { x: 10, y: 75, w: 22, h: 20, name: 'Lounge' },
      { x: 40, y: 65, w: 25, h: 22, name: 'VIP Section' },
      { x: 72, y: 55, w: 22, h: 25, name: 'Restrooms' },
    ],
  },
  {
    id: 2,
    title: 'House Party Fire',
    description: 'An uncontrolled house party. Cooking fire spread through a crowded basement.',
    location: 'Westside Student Housing',
    venue: 'house',
    difficulty: 'Easy',
    guestCount: 30,
    timeLimit: 80,
    points: 200,
    story: [
      '📞 DISPATCH: "Neighbor reports smoke coming from basement party at Westside Housing."',
      '🍕 Someone left a pizza box too close to the kitchen stove. Now the basement is filling with smoke!',
      '⚠️ Young partygoers don\'t know the exits. You need to guide them out!',
    ],
    fireOrigin: { x: 30, y: 45 },
    alarmPosition: { x: 80, y: 10 },
    exits: [
      { x: 50, y: 88, name: 'Basement Exit' },
      { x: 5, y: 5, name: 'Front Door' },
    ],
    rooms: [
      { x: 20, y: 20, w: 18, h: 14, name: 'Kitchen' },
      { x: 48, y: 30, w: 22, h: 16, name: 'Living Room' },
      { x: 22, y: 50, w: 28, h: 24, name: 'Basement' },
      { x: 65, y: 10, w: 25, h: 14, name: 'Upstairs' },
      { x: 5, y: 35, w: 14, h: 20, name: 'Garage' },
    ],
  },
  {
    id: 3,
    title: 'Hotel Ballroom Blaze',
    description: 'A wedding reception in a grand hotel. Candles and decorations fuel the fire.',
    location: 'Grand Horizon Hotel',
    venue: 'hotel',
    difficulty: 'Hard',
    guestCount: 80,
    timeLimit: 100,
    points: 400,
    story: [
      '📞 DISPATCH: "Structure fire at Grand Horizon Hotel, ballroom floor. Wedding reception in progress!"',
      '🕯️ Decorative candles ignited table centerpieces. The fire is spreading FAST through the banquet hall!',
      '⚠️ Elderly guests and children are present. You must reach the alarm AND direct evacuations simultaneously!',
    ],
    fireOrigin: { x: 45, y: 35 },
    alarmPosition: { x: 15, y: 10 },
    exits: [
      { x: 80, y: 85, name: 'Ballroom Exit' },
      { x: 5, y: 50, name: 'Service Hallway' },
    ],
    rooms: [
      { x: 15, y: 10, w: 12, h: 10, name: 'Alarm Panel' },
      { x: 25, y: 25, w: 40, h: 30, name: 'Banquet Hall' },
      { x: 70, y: 20, w: 22, h: 20, name: 'Dance Floor' },
      { x: 10, y: 55, w: 20, h: 20, name: 'Kitchen' },
      { x: 40, y: 60, w: 18, h: 22, name: 'Lobby' },
    ],
  },
  {
    id: 4,
    title: 'Restaurant Kitchen Fire',
    description: 'A busy restaurant Friday night. Grease fire spreading from the kitchen.',
    location: 'Bella Italia Ristorante',
    venue: 'restaurant',
    difficulty: 'Medium',
    guestCount: 55,
    timeLimit: 85,
    points: 350,
    story: [
      '📞 DISPATCH: "Structure fire at Bella Italia. Friday night crowd, grease fire in kitchen!"',
      '🍳 Deep fryer overheated and ignited. Grease fires spread fast and are extremely dangerous!',
      '⚠️ Kitchen staff panicking. Diners eating calmly, unaware of danger. Sound the alarm!',
    ],
    fireOrigin: { x: 20, y: 50 },
    alarmPosition: { x: 80, y: 85 },
    exits: [
      { x: 50, y: 90, name: 'Main Entrance' },
      { x: 60, y: 10, name: 'Patio Exit' },
    ],
    rooms: [
      { x: 10, y: 40, w: 20, h: 25, name: 'Kitchen' },
      { x: 35, y: 25, w: 35, h: 25, name: 'Dining Area' },
      { x: 75, y: 30, w: 18, h: 20, name: 'Bar' },
      { x: 50, y: 60, w: 30, h: 22, name: 'Patio' },
    ],
  },
];

export const partyVenueIcons: Record<string, string> = {
  club: '🎵',
  house: '🏠',
  hotel: '🏨',
  restaurant: '🍽️',
};
