import React from 'react';
import {
  X,
  Home,
  User,
  Gamepad2,
  Users,
  Handshake,
} from 'lucide-react';
import { NavTab } from '../types/navigation';
import { PortalSite } from '../types/auction';
import { DeviceViewMode } from '../types/donation';

interface HeaderProps {
  portalSite: PortalSite;
  onSelectPortalSite: (site: PortalSite) => void;
  currentTab: NavTab;
  onNavigate: (tab: NavTab) => void;
  wallet: string;
  viewMode?: DeviceViewMode;
}

export const Header: React.FC<HeaderProps> = ({
  portalSite,
  onSelectPortalSite,
  currentTab,
  onNavigate,
}) => {
  const navItems: { id: NavTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'home', label: 'Главная', icon: Home },
    { id: 'about', label: 'Обо мне', icon: User },
    { id: 'games', label: 'Игры', icon: Gamepad2 },
    { id: 'team', label: 'Команда', icon: Users },
    { id: 'partners', label: 'Партнеры', icon: Handshake },
  ];

  const handleTabClick = (tab: NavTab) => {
    onSelectPortalSite('site');
    onNavigate(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePortalSwitch = (site: PortalSite) => {
    onSelectPortalSite(site);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const closeButton = (
    <button
      onClick={() => handlePortalSwitch('portal')}
      title="Закрыть"
      aria-label="Закрыть"
      className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-950 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
      style={{ background: '#fff' }}
    >
      <X className="w-5 h-5" />
    </button>
  );

  if (portalSite === 'portal') {
    return null;
  }

  if (portalSite === 'site') {
    return (
      <header
        className="sticky top-0 z-50 w-full glass"
        data-rain="7"
        style={{ borderRadius: 0, borderBottom: '1px solid rgba(226,232,240,.6)' }}
      >
        <div className="glass-rain" />
        <div className="glass-body !px-4 sm:!px-8 !py-2 flex items-center justify-between gap-3">
          <nav
            className="flex items-center gap-1.5 text-xs font-semibold"
            style={{ overflowX: 'auto' }}
          >
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all cursor-pointer shrink-0 ${
                    isActive
                      ? 'bg-amber-400 text-slate-950 font-extrabold shadow-md shadow-amber-400/30'
                      : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-amber-600'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {closeButton}
        </div>
      </header>
    );
  }

  return (
    <div style={{ position: 'fixed', top: 12, right: 12, zIndex: 50 }}>
      {closeButton}
    </div>
  );
};
