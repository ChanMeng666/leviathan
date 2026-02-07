import { useGameStore } from './stores';
import { useAuth } from './hooks/useAuth';
import { useBackgroundMusic } from './hooks/useAudio';
import { WelcomePage } from './pages/WelcomePage';
import { GameScreen } from './pages/GameScreen';
import { GalleryPage } from './pages/GalleryPage';
import { BalatroBackground } from './components/ui/BalatroBackground';

export default function App() {
  const screen = useGameStore((s) => s.screen);
  const { isAuthLoading } = useAuth();
  useBackgroundMusic();

  if (isAuthLoading) {
    return (
      <div className="h-screen flex items-center justify-center relative overflow-hidden">
        <BalatroBackground className="z-0" />
        <div className="relative z-10 flex flex-col items-center gap-3">
          <img src="/leviathan-logo.svg" alt="利维坦的诞生" className="w-16 h-16 animate-pulse" />
          <span className="text-dim text-sm">加载中...</span>
        </div>
      </div>
    );
  }

  if (screen === 'game') {
    return <GameScreen />;
  }

  if (screen === 'gallery') {
    return <GalleryPage />;
  }

  return <WelcomePage />;
}
