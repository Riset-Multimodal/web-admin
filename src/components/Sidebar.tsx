import React from 'react';
import { PostureIcon, KeylogIcon } from './Shared';

interface SidebarProps {
    activeView: string;
    setActiveView: (view: string) => void;
}

function Sidebar({ activeView, setActiveView }: SidebarProps) {
    const navItems = [
        {
            id: 'keylogs',
            label: 'Keylogs',
            icon: KeylogIcon,
            description: 'Monitor typing patterns'
        },
        {
            id: 'posture',
            label: 'Posture',
            icon: PostureIcon,
            description: 'Analyze body posture'
        },
    ];

    return (
        <aside className="w-72 flex-shrink-0 bg-white border-r border-slate-200 flex flex-col shadow-sm">
            {/* Header */}
            <div className="h-16 flex items-center px-6 border-b border-slate-200 bg-gradient-to-r from-blue-600 to-blue-700">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-white">Admin Panel</h1>
                        <p className="text-xs text-blue-100">Monitoring Dashboard</p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4">
                <div className="space-y-2">
                    {navItems.map(item => {
                        const Icon = item.icon;
                        const isActive = activeView === item.id;

                        return (
                            <button
                                key={item.id}
                                onClick={() => setActiveView(item.id)}
                                className={`w-full group flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                                    isActive
                                        ? 'bg-blue-50 text-blue-700 shadow-sm border border-blue-200'
                                        : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900 border border-transparent'
                                }`}
                            >
                                <div className={`flex-shrink-0 p-2 rounded-md transition-colors ${
                                    isActive
                                        ? 'bg-blue-100 text-blue-600'
                                        : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200'
                                }`}>
                                    <Icon className="w-4 h-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className={`text-sm font-medium ${
                                        isActive ? 'text-blue-900' : 'text-slate-900'
                                    }`}>
                                        {item.label}
                                    </div>
                                    <div className={`text-xs ${
                                        isActive ? 'text-blue-600' : 'text-slate-500'
                                    }`}>
                                        {item.description}
                                    </div>
                                </div>
                                {isActive && (
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                )}
                            </button>
                        );
                    })}
                </div>
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50">
                <div className="text-xs text-slate-500 text-center">
                    <p className="font-medium">System Monitor v1.0</p>
                    <p>© 2024 Admin Dashboard</p>
                </div>
            </div>
        </aside>
    );
}

export default Sidebar;