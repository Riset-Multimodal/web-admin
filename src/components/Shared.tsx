import React from 'react';

// Tipe untuk User yang datang dari API /users
export interface UserFromApi {
    user_email: string;
    created_at: string;
}

// Tipe untuk Log yang datang dari API /keylog
export interface ApiLog {
    id: number;
    user_email: string;
    created_at: string;
    keystroke_count: number | null;
    left_click_count: number | null;
    right_click_count: number | null;
    scroll_up: number | null;
    scroll_down: number | null;
    space_count: number | null;
    error_rate: number | null;
    mean_dwell_time_ms: number | null;
    std_dev_dwell_time_ms: number | null;
    mean_flight_time_ms: number | null;
    std_dev_flight_time_ms: number | null;
    mean_digraph_time_ms: number | null;
    std_dev_digraph_time_ms: number | null;
    pause_count: number | null;
    mean_pause_duration_ms: number | null;
    mean_burst_length: number | null;
    type: string | null;
}

// Icon Components with proper SVGs
export const PostureIcon = ({ className = 'w-5 h-5' }) => (
    <svg
        className={className}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
        />
    </svg>
);

export const KeylogIcon = ({ className = 'w-5 h-5' }) => (
    <svg
        className={className}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
    </svg>
);

export const PlaceholderIcon = ({ className = 'w-32 h-32' }) => (
    <svg
        className={className}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1}
            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
        />
    </svg>
);

// Loading Spinner Component
export const LoadingSpinner = ({ className = 'w-6 h-6' }) => (
    <svg
        className={`${className} animate-spin`}
        fill="none"
        viewBox="0 0 24 24"
    >
        <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
        />
        <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
    </svg>
);

// Improved UserSelector component
export const UserSelector = ({
                                 selectedUserId,
                                 setSelectedUserId,
                                 users = []
                             }: {
    selectedUserId: string | null;
    setSelectedUserId: (id: string | null) => void;
    users: UserFromApi[]
}) => {
    const formatUserName = (email: string) => {
        return email
            .split('@')[0]
            .replace(/[._]/g, ' ')
            .replace(/\b\w/g, l => l.toUpperCase());
    };

    return (
        <div className="relative">
            <select
                value={selectedUserId || ''}
                onChange={(e) => setSelectedUserId(e.target.value || null)}
                className="appearance-none w-64 bg-white border border-slate-300 rounded-lg py-2.5 pl-4 pr-10 text-slate-700 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors shadow-sm hover:border-slate-400"
            >
                <option value="" disabled className="text-slate-500">
                    {users.length === 0 ? 'Loading users...' : 'Select a User...'}
                </option>
                {Array.isArray(users) && users.map(user => (
                    <option key={user.user_email} value={user.user_email} className="text-slate-700">
                        {formatUserName(user.user_email)}
                    </option>
                ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </div>
        </div>
    );
};

// Pagination Controls Component
export const PaginationControls = ({
                                       paginationInfo,
                                       onPageChange
                                   }: {
    paginationInfo: any;
    onPageChange: (page: number) => void;
}) => {
    if (!paginationInfo || paginationInfo.total_pages <= 1) {
        return null;
    }

    const { page, total_pages, has_prev, has_next, total_items } = paginationInfo;

    return (
        <div className="flex items-center justify-between px-6 py-4 bg-white border-t border-slate-200">
            <div className="flex items-center gap-2">
                <button
                    onClick={() => onPageChange(page - 1)}
                    disabled={!has_prev}
                    className="inline-flex items-center px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 focus:z-10 focus:ring-2 focus:ring-blue-500 focus:text-blue-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white transition-colors"
                >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Previous
                </button>

                <button
                    onClick={() => onPageChange(page + 1)}
                    disabled={!has_next}
                    className="inline-flex items-center px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 focus:z-10 focus:ring-2 focus:ring-blue-500 focus:text-blue-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white transition-colors"
                >
                    Next
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            </div>

            <div className="flex items-center gap-4 text-sm text-slate-600">
        <span>
          Page <span className="font-semibold text-slate-800">{page}</span> of{' '}
            <span className="font-semibold text-slate-800">{total_pages}</span>
        </span>
                {total_items && (
                    <span className="text-slate-500">
            ({total_items} total items)
          </span>
                )}
            </div>
        </div>
    );
};

// Empty State Component
export const EmptyState = ({
                               icon: Icon = PlaceholderIcon,
                               title,
                               description,
                               className = ""
                           }: {
    icon?: React.ComponentType<{ className?: string }>;
    title: string;
    description?: string;
    className?: string;
}) => (
    <div className={`text-center py-12 px-6 ${className}`}>
        <Icon className="w-16 h-16 mx-auto text-slate-300 mb-4" />
        <h3 className="text-lg font-semibold text-slate-700 mb-2">{title}</h3>
        {description && (
            <p className="text-slate-500 max-w-md mx-auto">{description}</p>
        )}
    </div>
);

// Error State Component
export const ErrorState = ({
                               message,
                               onRetry
                           }: {
    message: string;
    onRetry?: () => void;
}) => (
    <div className="text-center py-12 px-6">
        <div className="w-16 h-16 mx-auto mb-4 text-red-400">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
        </div>
        <h3 className="text-lg font-semibold text-slate-700 mb-2">Something went wrong</h3>
        <p className="text-red-600 mb-4">{message}</p>
        {onRetry && (
            <button
                onClick={onRetry}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-red-500 transition-colors"
            >
                Try Again
            </button>
        )}
    </div>
);