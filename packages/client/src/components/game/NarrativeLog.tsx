import { useRef, useEffect } from 'react';
import { useGameStore } from '../../stores';
import { TypewriterText } from '../ui/TypewriterText';

export function NarrativeLog() {
  const narrativeLog = useGameStore((s) => s.narrativeLog);
  const currentNarrative = useGameStore((s) => s.currentNarrative);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [narrativeLog.length]);

  return (
    <div className="panel p-3 flex-1 flex flex-col min-h-0">
      <div className="text-dim text-xs mb-2 border-b border-border pb-1">
        叙事日志
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-3 pr-1">
        {narrativeLog.length === 0 ? (
          <div className="text-dim text-xs text-center py-4">
            等待第一条叙事...<br />
            历史是一张白纸。好的，坏的，都可以写上去。
          </div>
        ) : (
          narrativeLog.map((entry, idx) => {
            const isLatest = currentNarrative?.id === entry.id && idx === narrativeLog.length - 1;
            return (
              <div key={entry.id} className="border-l-2 border-accent/40 pl-2">
                <div className="text-xs text-dim font-mono">
                  第 {entry.day} 天
                </div>
                <div className="text-sm text-gold font-bold">{entry.title}</div>
                <div className="text-xs text-fg mt-0.5">
                  {isLatest ? (
                    <TypewriterText text={entry.text} speed={20} />
                  ) : (
                    entry.text
                  )}
                </div>
                <div className="text-xs text-teal mt-1 italic">{entry.comment}</div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
