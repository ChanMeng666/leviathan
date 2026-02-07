import { useGameStore } from './stores';
import { useAuth } from './hooks/useAuth';
import { WelcomePage } from './pages/WelcomePage';
import { GameScreen } from './pages/GameScreen';
import { BalatroBackground } from './components/ui/BalatroBackground';

export default function App() {
  const screen = useGameStore((s) => s.screen);
  const { isAuthLoading } = useAuth();

  if (isAuthLoading) {
    return (
      <div className="h-screen flex items-center justify-center relative overflow-hidden">
        <BalatroBackground className="z-0" />
        <div className="relative z-10 text-dim text-sm">加载中...</div>
      </div>
    );
  }

  if (screen === 'game') {
    return <GameScreen />;
  }

  return <WelcomePage />;
}
