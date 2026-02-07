import { useGameStore } from './stores';
import { useAuth } from './hooks/useAuth';
import { MainMenu } from './pages/MainMenu';
import { GameScreen } from './pages/GameScreen';
import { LoginScreen } from './components/auth/LoginScreen';

export default function App() {
  const showMenu = useGameStore((s) => s.showMenu);
  const setShowMenu = useGameStore((s) => s.setShowMenu);

  const { user, isGuest, isAuthLoading } = useAuth();

  // Loading auth state
  if (isAuthLoading) {
    return (
      <div className="h-screen flex items-center justify-center felt-bg">
        <div className="text-dim text-sm">加载中...</div>
      </div>
    );
  }

  // Not authenticated and not in guest mode — show login
  if (!user && !isGuest) {
    return <LoginScreen />;
  }

  if (showMenu) {
    return <MainMenu onStart={() => setShowMenu(false)} />;
  }

  return <GameScreen />;
}
