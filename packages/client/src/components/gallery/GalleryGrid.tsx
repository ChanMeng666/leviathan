import { useState } from 'react';
import type { GameRunRecord } from '@leviathan/shared';
import { GalleryCard } from './GalleryCard';
import { GalleryDetail } from './GalleryDetail';

interface GalleryGridProps {
  runs: GameRunRecord[];
  isLoading: boolean;
}

export function GalleryGrid({ runs, isLoading }: GalleryGridProps) {
  const [selected, setSelected] = useState<GameRunRecord | null>(null);

  if (isLoading) {
    return (
      <div className="text-center text-dim text-sm py-12">
        加载结局记录中...
      </div>
    );
  }

  if (runs.length === 0) {
    return (
      <div className="text-center text-dim text-sm py-12">
        <div className="mb-2">尚无结局记录</div>
        <div className="text-xs text-fg/30">完成一局游戏后，你的结局将出现在这里</div>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {runs.map((run, i) => (
          <GalleryCard
            key={run.id}
            run={run}
            index={i}
            onClick={() => setSelected(run)}
          />
        ))}
      </div>

      <GalleryDetail
        run={selected}
        open={selected !== null}
        onClose={() => setSelected(null)}
      />
    </>
  );
}
