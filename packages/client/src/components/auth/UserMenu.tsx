import { useState, useRef, useEffect } from 'react';
import { useGameStore } from '../../stores';
import { useAuth } from '../../hooks/useAuth';

interface UserMenuProps {
  onOpenSaveManager: () => void;
}

export function UserMenu({ onOpenSaveManager }: UserMenuProps) {
  const user = useGameStore((s) => s.user);
  const { signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  if (!user) {
    return <span className="text-dim text-xs">游客</span>;
  }

  const initial = (user.name ?? user.email)?.[0]?.toUpperCase() ?? '?';

  return (
    <div className="relative" ref={menuRef}>
      <button
        className="w-7 h-7 rounded-full bg-accent text-bg text-xs font-bold flex items-center justify-center hover:opacity-90 transition-opacity"
        onClick={() => setOpen(!open)}
        title={user.email}
      >
        {initial}
      </button>

      {open && (
        <div className="absolute right-0 top-9 w-40 panel-raised py-1 z-50">
          <div className="px-3 py-2 border-b border-border">
            <div className="text-xs text-fg truncate">{user.name ?? user.email}</div>
            {user.name && (
              <div className="text-[10px] text-dim truncate">{user.email}</div>
            )}
          </div>
          <button
            className="w-full text-left px-3 py-2 text-xs text-fg hover:bg-surface transition-colors"
            onClick={() => { setOpen(false); onOpenSaveManager(); }}
          >
            存档管理
          </button>
          <button
            className="w-full text-left px-3 py-2 text-xs text-red hover:bg-surface transition-colors"
            onClick={() => { setOpen(false); signOut(); }}
          >
            退出登录
          </button>
        </div>
      )}
    </div>
  );
}
