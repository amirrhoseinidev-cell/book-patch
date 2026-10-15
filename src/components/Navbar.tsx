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
    <nav className="fixed bottom-0 inset-x-0 z-50 pb-safe bg-surface/90 backdrop-blur-xl shadow-[0_-1px_12px_rgba(72,60,53,0.06)]">
      <div className="flex justify-around items-center h-16 px-space-xs max-w-xl mx-auto">
        {navItems.map((item) => {
          const active = getIsActive(item.id);
          return (
            <button
              key={item.id}
              onClick={() => navigateTo(item.target)}
              className={`flex flex-col items-center justify-center gap-1 min-w-[56px] h-11 transition-all duration-200 ${
                active
                  ? 'text-primary font-bold'
                  : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              <span
                className="material-symbols-outlined text-[22px]"
                style={{ fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0" }}
              >
                {item.icon}
              </span>
              <span className="text-[11px] leading-tight">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
