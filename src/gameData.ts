import { Mission, SmartHomeLevel, DisasterScenario } from './types';

export const missions: Mission[] = [
  {
    id: 1,
    title: 'Kitchen Emergency',
    description: 'A grease fire has broken out in an apartment kitchen. A family is trapped inside.',
    location: 'Maple Street Apartments',
    difficulty: 'Easy',
    fireType: 'grease',
    correctExtinguisher: 'foam',
    timeLimit: 60,
    rescueCount: 3,
    points: 100,
    story: [
      '📞 DISPATCH: "Attention Unit 7, we have a 10-70 at Maple Street Apartments, Building C, 3rd floor."',
      '🔥 A grease fire has erupted in apartment 3B. The family tried to use water — it made things WORSE!',
      '⚠️ Remember: NEVER use water on a grease fire! Choose the correct extinguisher to save the family.',
    ],
  },
  {
    id: 2,
    title: 'Office Short Circuit',
    description: 'An electrical fire in the server room of a tech company. Critical data at risk.',
    location: 'TechHub Office Tower',
    difficulty: 'Medium',
    fireType: 'electrical',
    correctExtinguisher: 'co2',
    timeLimit: 45,
    rescueCount: 5,
    points: 200,
    story: [
      '📞 DISPATCH: "Unit 7, electrical fire reported at TechHub Tower, floor 12. Server room."',
      '⚡ The fire started from a short circuit in the server room. Sparks are flying!',
      '⚠️ Electrical fires need CO₂ extinguishers — water will conduct electricity and make it deadly!',
    ],
  },
  {
    id: 3,
    title: 'School Library Fire',
    description: 'Paper and books caught fire in the school library. Students need evacuation.',
    location: 'Lincoln Elementary School',
    difficulty: 'Easy',
    fireType: 'paper',
    correctExtinguisher: 'water',
    timeLimit: 50,
    rescueCount: 12,
    points: 150,
    story: [
      '📞 DISPATCH: "All units, fire at Lincoln Elementary, library wing. Multiple children present."',
      '📚 Books and papers are fueling the fire. The sprinkler system has malfunctioned!',
      '⚠️ Paper fires can be fought with water. But get those kids out FIRST!',
    ],
  },
  {
    id: 4,
    title: 'Chemical Plant Alert',
    description: 'A chemical spill has ignited at the industrial plant. Hazmat situation.',
    location: 'CyberChem Industries',
    difficulty: 'Hard',
    fireType: 'chemical',
    correctExtinguisher: 'powder',
    timeLimit: 40,
    rescueCount: 8,
    points: 350,
    story: [
      '📞 DISPATCH: "HAZMAT ALERT! Chemical fire at CyberChem plant. Full gear required."',
      '☣️ Reactive chemicals are burning with toxic fumes. Standard extinguishers won\'t work here!',
      '⚠️ Chemical fires require dry powder extinguishers. Seal the area and protect yourself!',
    ],
  },
  {
    id: 5,
    title: 'Mall Fabric Store Blaze',
    description: 'Fabric materials caught fire in the mall. Thick smoke filling corridors.',
    location: 'Grand City Mall',
    difficulty: 'Medium',
    fireType: 'fabric',
    correctExtinguisher: 'water',
    timeLimit: 55,
    rescueCount: 20,
    points: 250,
    story: [
      '📞 DISPATCH: "Unit 7, structure fire at Grand City Mall, fabric store, heavy smoke."',
      '🧵 The fabric store is ablaze! Dense smoke is filling the corridors, reducing visibility.',
      '⚠️ Fabric fires respond to water. Focus on evacuation — 20 shoppers need rescue!',
    ],
  },
];

export const smartHomeLevels: SmartHomeLevel[] = [
  {
    id: 1,
    title: 'Family Home Inspection',
    description: 'Inspect a standard family home for fire hazards.',
    building: '🏠',
    hazards: [
      { id: 1, name: 'Missing Smoke Alarm', description: 'No smoke alarm in the kitchen', x: 30, y: 25, type: 'alarm', found: false, fixed: false },
      { id: 2, name: 'Frayed Wiring', description: 'Exposed wires behind the TV stand', x: 65, y: 40, type: 'wiring', found: false, fixed: false },
      { id: 3, name: 'Blocked Exit', description: 'Boxes blocking the back door', x: 80, y: 70, type: 'exit', found: false, fixed: false },
      { id: 4, name: 'Overloaded Socket', description: 'Too many plugs in one outlet', x: 45, y: 55, type: 'appliance', found: false, fixed: false },
      { id: 5, name: 'No Extinguisher', description: 'Kitchen has no fire extinguisher', x: 20, y: 30, type: 'extinguisher', found: false, fixed: false },
      { id: 6, name: 'Cluttered Stairway', description: 'Items blocking the stairway', x: 55, y: 15, type: 'clutter', found: false, fixed: false },
    ],
    timeLimit: 90,
    requiredFixes: 4,
  },
  {
    id: 2,
    title: 'Smart Apartment Complex',
    description: 'Modern apartment with IoT devices — check smart safety systems.',
    building: '🏢',
    hazards: [
      { id: 1, name: 'Disconnected IoT Alarm', description: 'Smart smoke detector is offline', x: 25, y: 20, type: 'alarm', found: false, fixed: false },
      { id: 2, name: 'Faulty Smart Oven', description: 'Smart oven auto-shutoff disabled', x: 50, y: 35, type: 'appliance', found: false, fixed: false },
      { id: 3, name: 'Emergency Light Out', description: 'Emergency exit light burnt out', x: 75, y: 60, type: 'exit', found: false, fixed: false },
      { id: 4, name: 'Old Wiring Panel', description: 'Electrical panel needs upgrade', x: 15, y: 50, type: 'wiring', found: false, fixed: false },
      { id: 5, name: 'Storage Room Clutter', description: 'Flammable materials near heater', x: 60, y: 75, type: 'clutter', found: false, fixed: false },
      { id: 6, name: 'Missing Route Map', description: 'No evacuation route posted', x: 40, y: 15, type: 'exit', found: false, fixed: false },
      { id: 7, name: 'Expired Extinguisher', description: 'Fire extinguisher expired 2 years ago', x: 85, y: 30, type: 'extinguisher', found: false, fixed: false },
      { id: 8, name: 'Candle Near Curtain', description: 'Lit candle dangerously close to curtains', x: 35, y: 65, type: 'clutter', found: false, fixed: false },
    ],
    timeLimit: 120,
    requiredFixes: 6,
  },
];

export const disasterScenarios: DisasterScenario[] = [
  {
    id: 1,
    title: 'Skyscraper Inferno',
    description: 'A 40-story building is on fire. Coordinate the emergency response.',
    type: 'skyscraper',
    civilians: 200,
    difficulty: 'Hard',
    decisions: [
      {
        id: 1,
        question: 'The fire is on floors 15-18. Elevators are still running. What do you order?',
        options: [
          { text: 'Use elevators for fast evacuation', correct: false, feedback: '❌ NEVER use elevators during a fire! They can get stuck or open into the fire floor.', points: 0 },
          { text: 'Shut down elevators, use stairwells only', correct: true, feedback: '✅ Correct! Elevators are death traps during fires. Stairwells are the safe route.', points: 100 },
          { text: 'Wait for the fire to be contained first', correct: false, feedback: '❌ Every second counts! Begin evacuation immediately while fighting the fire.', points: 20 },
        ],
        timeLimit: 15,
      },
      {
        id: 2,
        question: 'Smoke is filling upper floors. People on floor 30 are panicking. What\'s the priority?',
        options: [
          { text: 'Tell them to go to the roof for helicopter rescue', correct: false, feedback: '❌ Roofs are often inaccessible and too dangerous. Smoke rises to the top.', points: 10 },
          { text: 'Instruct them to stay low, seal doors, and signal from windows', correct: true, feedback: '✅ When evacuation isn\'t possible, shelter in place: seal doors, stay low, signal for help.', points: 100 },
          { text: 'Send firefighters up through smoke without gear', correct: false, feedback: '❌ Never send anyone without proper breathing apparatus into smoke!', points: 0 },
        ],
        timeLimit: 12,
      },
      {
        id: 3,
        question: 'The building\'s sprinkler system is partially working. What do you do?',
        options: [
          { text: 'Turn off sprinklers to reduce water damage', correct: false, feedback: '❌ Property can be replaced, lives cannot! Sprinklers slow fire spread.', points: 0 },
          { text: 'Boost water pressure to sprinklers and deploy aerial trucks', correct: true, feedback: '✅ Maximize every fire suppression system available!', points: 100 },
          { text: 'Ignore sprinklers, focus only on manual hosing', correct: false, feedback: '❌ Use ALL available resources! Sprinklers help contain fire on multiple floors.', points: 30 },
        ],
        timeLimit: 10,
      },
      {
        id: 4,
        question: 'A group of disabled residents is on floor 20. Stairwells are filling with smoke. What do you do?',
        options: [
          { text: 'Create a positive pressure ventilation in the stairwell and send rescue team with Stokes baskets', correct: true, feedback: '✅ Clear the stairwell with PPV and use specialized rescue equipment for mobility-impaired people.', points: 100 },
          { text: 'Tell them to crawl down the stairs', correct: false, feedback: '❌ Disabled residents may not be able to navigate stairs. Specialized equipment is needed.', points: 10 },
          { text: 'Leave them until the fire is fully controlled', correct: false, feedback: '❌ Time is critical! Every person must be accounted for and rescued ASAP.', points: 0 },
        ],
        timeLimit: 15,
      },
    ],
  },
  {
    id: 2,
    title: 'Chemical Factory Explosion',
    description: 'An explosion at a chemical plant. Toxic fumes spreading toward the city.',
    type: 'factory',
    civilians: 50,
    difficulty: 'Extreme',
    decisions: [
      {
        id: 1,
        question: 'An explosion occurred in the chemical storage area. Unknown substances involved. First action?',
        options: [
          { text: 'Rush in immediately to rescue workers', correct: false, feedback: '❌ Unknown chemicals could be lethal! Identify hazards first.', points: 0 },
          { text: 'Establish hot/warm/cold zones and identify chemicals via Safety Data Sheets', correct: true, feedback: '✅ Correct! HAZMAT protocol: identify the substance, establish zones, then plan entry.', points: 100 },
          { text: 'Spray water on everything to cool it down', correct: false, feedback: '❌ Some chemicals react violently with water! You could cause a bigger explosion.', points: 0 },
        ],
        timeLimit: 12,
      },
      {
        id: 2,
        question: 'Wind is blowing toxic fumes toward a residential area 2km away. What do you order?',
        options: [
          { text: 'Evacuate residents downwind immediately', correct: true, feedback: '✅ Correct! Protect civilian lives first. Evacuate anyone in the plume path.', points: 100 },
          { text: 'Focus all resources on stopping the chemical fire', correct: false, feedback: '❌ You need to do both! Civilian safety is the top priority.', points: 30 },
          { text: 'Wait to see if fumes dissipate on their own', correct: false, feedback: '❌ Toxic fumes can be lethal! Never wait and hope.', points: 0 },
        ],
        timeLimit: 10,
      },
      {
        id: 3,
        question: 'A second tank is showing signs of overheating. It contains pressurized gas. Action?',
        options: [
          { text: 'Cool the tank with water streams from a safe distance', correct: true, feedback: '✅ Cooling prevents BLEVE (Boiling Liquid Expanding Vapor Explosion). Keep distance!', points: 100 },
          { text: 'Open the tank valve to release pressure', correct: false, feedback: '❌ Releasing pressurized flammable gas near a fire could be catastrophic!', points: 0 },
          { text: 'Evacuate and let it explode safely', correct: false, feedback: '❌ Uncontrolled explosion near other chemicals could cascade into a mega disaster.', points: 20 },
        ],
        timeLimit: 10,
      },
      {
        id: 4,
        question: 'Workers report a colleague is unconscious inside the hot zone. A rescue team wants to go in.',
        options: [
          { text: 'Send them in immediately — time is critical!', correct: false, feedback: '❌ Entering a hot zone without proper HAZMAT suits is suicidal.', points: 0 },
          { text: 'Deploy HAZMAT-suited rescue team with SCBA, monitor exposure time', correct: true, feedback: '✅ Proper PPE is non-negotiable in chemical environments. Monitor entry/exit times.', points: 100 },
          { text: 'Wait for specialized HAZMAT team from another city', correct: false, feedback: '❌ That could take too long. Use the trained team you have with proper equipment.', points: 30 },
        ],
        timeLimit: 12,
      },
    ],
  },
  {
    id: 3,
    title: 'Subway Tunnel Fire',
    description: 'A fire in the subway tunnel. Hundreds of commuters trapped underground.',
    type: 'subway',
    civilians: 300,
    difficulty: 'Extreme',
    decisions: [
      {
        id: 1,
        question: 'A train is stopped in the tunnel due to fire on the tracks ahead. 300 passengers aboard. What first?',
        options: [
          { text: 'Cut power to the third rail in the affected section', correct: true, feedback: '✅ Correct! The electrified third rail is lethal. Power must be cut before any rescue.', points: 100 },
          { text: 'Send passengers walking through the tunnel immediately', correct: false, feedback: '❌ The third rail could electrocute people! Cut power first.', points: 0 },
          { text: 'Keep passengers on the train and wait', correct: false, feedback: '❌ Smoke will fill the train. You need to act, but safely — cut power first.', points: 20 },
        ],
        timeLimit: 10,
      },
      {
        id: 2,
        question: 'Power is cut. Smoke is increasing. Visibility is dropping. How do you evacuate?',
        options: [
          { text: 'Have passengers walk to the nearest station along the tunnel', correct: false, feedback: '❌ Without guides and lighting, this is dangerous. People could trip, panic, or get lost.', points: 20 },
          { text: 'Deploy firefighters with lighting, guide ropes, and PA system to lead evacuation', correct: true, feedback: '✅ Organized evacuation with guides, lighting, and communication saves lives!', points: 100 },
          { text: 'Wait for smoke to clear before moving anyone', correct: false, feedback: '❌ Smoke will only get worse. Controlled evacuation NOW.', points: 0 },
        ],
        timeLimit: 12,
      },
      {
        id: 3,
        question: 'Several passengers are experiencing smoke inhalation symptoms. Paramedics can\'t reach the tunnel easily.',
        options: [
          { text: 'Set up triage at the nearest station exit and prioritize transport', correct: true, feedback: '✅ Establish triage at the nearest accessible point. Prioritize severe cases for transport.', points: 100 },
          { text: 'Send all to the same hospital', correct: false, feedback: '❌ One hospital can\'t handle mass casualties. Distribute patients across facilities.', points: 30 },
          { text: 'Treat them in the tunnel', correct: false, feedback: '❌ The tunnel is a hazardous environment. Get patients to clean air ASAP.', points: 10 },
        ],
        timeLimit: 12,
      },
    ],
  },
];

export const extinguisherInfo: Record<string, { name: string; color: string; icon: string; use: string }> = {
  water: { name: 'Water', color: '#EF4444', icon: '💧', use: 'Paper, wood, fabric fires' },
  co2: { name: 'CO₂', color: '#1F2937', icon: '❄️', use: 'Electrical & flammable liquid fires' },
  foam: { name: 'Foam', color: '#F59E0B', icon: '🧴', use: 'Grease & flammable liquid fires' },
  powder: { name: 'Dry Powder', color: '#3B82F6', icon: '🔵', use: 'Chemical & multi-purpose fires' },
};

export const fireTypeInfo: Record<string, { name: string; icon: string; danger: string }> = {
  electrical: { name: 'Electrical Fire', icon: '⚡', danger: 'Water conducts electricity — lethal risk!' },
  grease: { name: 'Grease Fire', icon: '🍳', danger: 'Water causes explosive splatter!' },
  wood: { name: 'Wood Fire', icon: '🪵', danger: 'Spreads quickly, needs fast action' },
  chemical: { name: 'Chemical Fire', icon: '☣️', danger: 'Toxic fumes, may react with water' },
  paper: { name: 'Paper Fire', icon: '📄', danger: 'Burns fast, can spread rapidly' },
  fabric: { name: 'Fabric Fire', icon: '🧵', danger: 'Dense smoke, toxic fumes from synthetics' },
};

export const rankThresholds: { rank: string; xp: number }[] = [
  { rank: 'Rookie', xp: 0 },
  { rank: 'Firefighter', xp: 300 },
  { rank: 'Lieutenant', xp: 800 },
  { rank: 'Captain', xp: 1500 },
  { rank: 'Chief', xp: 3000 },
];

export const educationalContent = [
  {
    title: 'The Fire Triangle',
    icon: '🔺',
    content: 'Fire needs three things: HEAT, FUEL, and OXYGEN. Remove any one of these, and the fire goes out. This is the foundation of all fire fighting.',
    details: [
      '🔥 HEAT — The ignition source (spark, flame, friction)',
      '⛽ FUEL — Any combustible material (wood, paper, gas)',
      '💨 OXYGEN — Air feeds the fire (about 16%+ needed)',
    ],
  },
  {
    title: 'PASS Method',
    icon: '🧯',
    content: 'The PASS method is the standard technique for using a fire extinguisher effectively.',
    details: [
      'P — PULL the pin to unlock the handle',
      'A — AIM low at the base of the fire',
      'S — SQUEEZE the handle to release the agent',
      'S — SWEEP from side to side at the base',
    ],
  },
  {
    title: 'Emergency Numbers',
    icon: '📞',
    content: 'Know your local emergency number and call IMMEDIATELY when you see a fire.',
    details: [
      '🇺🇸 USA: 911',
      '🇬🇧 UK: 999',
      '🇪🇺 Europe: 112',
      '🇦🇺 Australia: 000',
      '🇮🇳 India: 101 (Fire)',
    ],
  },
  {
    title: 'Evacuation Rules',
    icon: '🚪',
    content: 'When a fire alarm sounds, follow these critical rules to survive.',
    details: [
      '1. Stay calm — don\'t panic or run',
      '2. Feel the door before opening — if hot, DON\'T open!',
      '3. Stay LOW — smoke rises, cleaner air is near the floor',
      '4. Never use elevators during a fire',
      '5. Go to the assembly point and DO NOT go back inside',
      '6. Call emergency services once safe',
    ],
  },
  {
    title: 'Extinguisher Types',
    icon: '🔴',
    content: 'Using the WRONG extinguisher can make a fire WORSE or even kill you!',
    details: [
      '💧 WATER (Red) — Wood, paper, fabric',
      '❄️ CO₂ (Black) — Electrical, flammable liquids',
      '🧴 FOAM (Cream) — Grease, flammable liquids',
      '🔵 DRY POWDER (Blue) — Chemical, multi-purpose',
      '⚠️ NEVER use water on electrical or grease fires!',
    ],
  },
  {
    title: 'Smoke Alarm Safety',
    icon: '🔔',
    content: 'Smoke alarms save lives. They give you the early warning needed to escape.',
    details: [
      'Install on every level of your home',
      'Test alarms monthly by pressing the test button',
      'Replace batteries at least once a year',
      'Replace the entire alarm every 10 years',
      'Never disable an alarm — even if cooking triggers it',
    ],
  },
];
