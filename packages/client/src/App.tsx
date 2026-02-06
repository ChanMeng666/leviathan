import { useGameStore } from './stores';
import { MainMenu } from './pages/MainMenu';
import { GameScreen } from './pages/GameScreen';

export default function App() {
  const showMenu = useGameStore((s) => s.showMenu);
  const setShowMenu = useGameStore((s) => s.setShowMenu);

  if (showMenu) {
    return <MainMenu onStart={() => setShowMenu(false)} />;
  }

  return <GameScreen />;
}
