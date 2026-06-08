import { useGameState } from './hooks/useGameState';
import MainMenu from './components/MainMenu';
import StoryMode from './components/StoryMode';
import StoryGame from './components/StoryGame';
import SmartHomeMode from './components/SmartHomeMode';
import SmartHomeGame from './components/SmartHomeGame';
import DisasterMode from './components/DisasterMode';
import DisasterGame from './components/DisasterGame';
import PartyMode from './components/PartyMode';
import PartyGame from './components/PartyGame';
import LearnMode from './components/LearnMode';
import Profile from './components/Profile';
import Results from './components/Results';

export default function App() {
  const {
    screen,
    setScreen,
    player,
    lastResult,
    selectedMissionId,
    setSelectedMissionId,
    selectedLevelId,
    setSelectedLevelId,
    selectedDisasterId,
    setSelectedDisasterId,
    completeGame,
  } = useGameState();

  const renderScreen = () => {
    switch (screen) {
      case 'menu':
        return <MainMenu player={player} onNavigate={setScreen} />;
      case 'story':
        return (
          <StoryMode
            onNavigate={setScreen}
            onSelectMission={setSelectedMissionId}
            completedCount={player.missionsCompleted}
          />
        );
      case 'storyGame':
        return (
          <StoryGame
            missionId={selectedMissionId}
            onNavigate={setScreen}
            onComplete={completeGame}
          />
        );
      case 'smartHome':
        return (
          <SmartHomeMode
            onNavigate={setScreen}
            onSelectLevel={setSelectedLevelId}
          />
        );
      case 'smartHomeGame':
        return (
          <SmartHomeGame
            levelId={selectedLevelId}
            onNavigate={setScreen}
            onComplete={completeGame}
          />
        );
      case 'disaster':
        return (
          <DisasterMode
            onNavigate={setScreen}
            onSelectDisaster={setSelectedDisasterId}
          />
        );
      case 'disasterGame':
        return (
          <DisasterGame
            disasterId={selectedDisasterId}
            onNavigate={setScreen}
            onComplete={completeGame}
          />
        );
      case 'learn':
        return <LearnMode onNavigate={setScreen} />;
      case 'profile':
        return <Profile player={player} onNavigate={setScreen} />;
      case 'results':
        return lastResult ? (
          <Results result={lastResult} onNavigate={setScreen} />
        ) : (
          <MainMenu player={player} onNavigate={setScreen} />
        );
      default:
        return <MainMenu player={player} onNavigate={setScreen} />;
    }
  };

  return (
    <div className="antialiased">
      {renderScreen()}
    </div>
  );
}
