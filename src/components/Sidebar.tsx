import React from 'react';
import { PostureIcon, KeylogIcon } from './Shared';

function Sidebar({ activeView, setActiveView }) {
  const navItems = [
    { id: 'posture', label: 'Posture', icon: PostureIcon },
    { id: 'keylogs', label: 'Keylogs', icon: KeylogIcon },
  ];

  return (
    <aside className="w-64 flex-shrink-0 bg-white border-r border-slate-200 flex flex-col">
      <div className="h-16 flex items-center px-6 border-b border-slate-200">
        <h1 className="text-xl font-bold text-slate-800">Admin Panel</h1>
      </div>
      <nav className="p-4">
        <ul>
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <li key={item.id}>
                <button
                  onClick={() => setActiveView(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-left text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-slate-100 text-blue-700'
                      : 'text-black hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-blue-700' : 'text-black'}`} />
                  {item.label}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}

export default Sidebar;
