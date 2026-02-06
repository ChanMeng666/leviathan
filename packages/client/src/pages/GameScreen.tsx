import { GameBoard } from '../components/game/GameBoard';
import { useAutoSave } from '../hooks/useAutoSave';

export function GameScreen() {
  useAutoSave();
  return <GameBoard />;
}
