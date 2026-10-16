import React from 'react';
import { usePalle, AppView } from '../context/PalleContext';

export const Navbar: React.FC = () => {
  const { currentView, navigateTo } = usePalle();

  // Hide on immersion views
  const hiddenViews: AppView[] = [
    'onboarding',
    'generating-path',
    'book-reader',
    'step-assessment',
    'step-celebration',
    'create-topic',
    'create-level'
  ];

  if (hiddenViews.includes(currentView)) {
    return null;
  }

  const navItems = [
    { id: 'home', label: 'خانه', icon: 'home', target: 'home' as AppView },
    { id: 'my-paths', label: 'مسیرهای من', icon: 'route', target: 'path-roadmap' as AppView },
    { id: 'library', label: 'کتابخانه', icon: 'local_library', target: 'library' as AppView },
    { id: 'profile', label: 'پروفایل', icon: 'account_circle', target: 'profile' as AppView },
  ];

  const getIsActive = (itemId: string) => {
    if (itemId === 'home' && currentView === 'home') return true;
    if (itemId === 'my-paths' && (currentView === 'path-roadmap' || currentView === 'step-overview')) return true;
    if (itemId === 'library' && currentView === 'library') return true;
    if (itemId === 'profile' && currentView === 'profile') return true;
    return false;
  };

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-[#F5F7EE]/95 backdrop-blur-xl border-t border-[#E6E9DE]/80 shadow-[0_-4px_20px_rgba(72,60,53,0.06)] pb-safe transition-all select-none">
      <div className="flex justify-around items-center h-16 px-2 max-w-lg mx-auto">
        {navItems.map((item) => {
          const active = getIsActive(item.id);
          return (
            <button
              key={item.id}
              onClick={() => navigateTo(item.target)}
              className="relative flex flex-col items-center justify-center flex-1 h-full py-1.5 touch-manipulation group active:scale-90 transition-all duration-150"
              aria-label={item.label}
            >
              {/* Active Tab Glow Pill */}
              <div
                className={`flex items-center justify-center px-4 py-1 rounded-full transition-all duration-200 ${
                  active
                    ? 'bg-[#FFDCC5] text-[#301400] shadow-xs'
                    : 'text-[#6B6057] group-hover:text-[#312620]'
                }`}
              >
                <span
                  className="material-symbols-outlined text-[23px] transition-transform duration-200 group-active:scale-95"
                  style={{ fontVariationSettings: active ? "'FILL' 1, 'wght' 600" : "'FILL' 0, 'wght' 400" }}
                >
                  {item.icon}
                </span>
              </div>

              <span
                className={`text-[10px] tracking-tight mt-0.5 transition-colors duration-150 ${
                  active
                    ? 'font-bold text-[#312620]'
                    : 'font-medium text-[#6B6057]'
                }`}
              >
                {item.label}
              </span>

              {/* Active Indicator Micro-dot */}
              {active && (
                <span className="w-1 h-1 rounded-full bg-[#8F4E15] mt-0.5 animate-pulse"></span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
