import { useState, useRef, useEffect } from 'react';

export function InfoMenuButton() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        className="btn-secondary text-xs px-2 py-1"
        onClick={() => setOpen((v) => !v)}
        title="关于"
      >
        ⓘ
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-60 panel-raised p-3 z-50 shadow-lg border border-border-strong rounded-[var(--radius-lg)]">
          <p className="text-fg/40 text-[10px] italic leading-relaxed mb-2">
            "任何叙事都能构建——历史、民族、国家皆可被发明"
          </p>

          <div className="border-t border-fg/10 my-2" />

          <div className="flex items-center gap-2 mb-1.5">
            <img
              src="/chan_logo.svg"
              alt="Chan Meng"
              className="w-5 h-5"
              style={{ filter: 'invert(1)', opacity: 0.5 }}
            />
            <span className="text-fg/50 text-[11px]">
              由 <span className="text-accent/80 font-semibold">Chan Meng</span> 设计开发
            </span>
          </div>
          <p className="text-fg/30 text-[10px] mb-2 leading-relaxed">
            需要定制网站或Web应用？欢迎联系开发者
          </p>
          <div className="flex items-center gap-2 text-[10px] flex-wrap">
            <a
              href="mailto:chanmeng.dev@gmail.com"
              className="text-fg/40 hover:text-accent transition-colors"
              title="联系开发者"
            >
              Email
            </a>
            <span className="text-fg/15">|</span>
            <a
              href="https://github.com/ChanMeng666"
              target="_blank"
              rel="noopener noreferrer"
              className="text-fg/40 hover:text-accent transition-colors"
              title="开发者作品集"
            >
              GitHub
            </a>
            <span className="text-fg/15">|</span>
            <a
              href="https://github.com/ChanMeng666/leviathan"
              target="_blank"
              rel="noopener noreferrer"
              className="text-fg/40 hover:text-accent transition-colors"
              title="项目源码"
            >
              源码
            </a>
          </div>

          <div className="border-t border-fg/10 my-2" />

          <div className="text-fg/25 text-[10px]">v0.1.0</div>
        </div>
      )}
    </div>
  );
}
