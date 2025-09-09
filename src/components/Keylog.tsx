import React, { useState, useEffect } from 'react';
import { UserSelector, EmptyState, ErrorState, LoadingSpinner, PaginationControls } from './Shared';
import type { ApiLog, UserFromApi } from './Shared';

const API_BASE_URL = 'http://10.34.4.136:5000';
const ITEMS_PER_PAGE = 15;

interface KeylogsViewProps {
  selectedUserId: string | null;
  setSelectedUserId: (id: string | null) => void;
  users: UserFromApi[];
}

function KeylogsView({ selectedUserId, setSelectedUserId, users }: KeylogsViewProps) {
  const [logs, setLogs] = useState<ApiLog[]>([]);
  const [paginationInfo, setPaginationInfo] = useState<any | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset page when user changes
  useEffect(() => {
    setCurrentPage(1);
    setPaginationInfo(null);
  }, [selectedUserId]);

  // Fetch keylog data
  useEffect(() => {
    if (!selectedUserId) {
      setLogs([]);
      setPaginationInfo(null);
      return;
    }

    const fetchKeylogData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const apiUrl = `${API_BASE_URL}/keylog?email=${selectedUserId}&page=${currentPage}&per_page=${ITEMS_PER_PAGE}`;
        const response = await fetch(apiUrl);

        if (!response.ok) {
          throw new Error(`Failed to fetch keylog data: ${response.status} ${response.statusText}`);
        }

        const responseJson = await response.json();
        setLogs(responseJson.data || []);
        setPaginationInfo(responseJson.pagination);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
        setError(errorMessage);
        setLogs([]);
        setPaginationInfo(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchKeylogData();
  }, [selectedUserId, currentPage]);

  const formatTimestamp = (ts: string) => {
    try {
      return new Date(ts).toLocaleString('id-ID', {
        dateStyle: 'medium',
        timeStyle: 'medium',
        timeZone: 'Asia/Jakarta'
      });
    } catch {
      return 'Invalid date';
    }
  };

  const formatNumber = (num: number | null) => {
    if (num === null || num === undefined) return '-';
    return typeof num === 'number' ? (num % 1 !== 0 ? num.toFixed(2) : num.toString()) : '-';
  };

  const retryFetch = () => {
    if (selectedUserId) {
      setError(null);
      setCurrentPage(1);
    }
  };

  const getSelectedUserName = () => {
    if (!selectedUserId) return null;
    return selectedUserId
        .split('@')[0]
        .replace(/[._]/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase());
  };

  const renderContent = () => {
    if (!selectedUserId) {
      return (
          <EmptyState
              title="Select a user to view keylog data"
              description="Choose a user from the dropdown above to start monitoring their typing patterns and activity."
              className="py-20"
          />
      );
    }

    if (isLoading) {
      return (
          <div className="flex flex-col items-center justify-center py-20">
            <LoadingSpinner className="w-8 h-8 text-blue-600 mb-4" />
            <p className="text-slate-600">Loading keylog data...</p>
            <p className="text-sm text-slate-500 mt-1">Fetching data for {getSelectedUserName()}</p>
          </div>
      );
    }

    if (error) {
      return <ErrorState message={error} onRetry={retryFetch} />;
    }

    if (logs.length === 0) {
      return (
          <EmptyState
              title="No keylog data found"
              description={`No keylog entries are available for ${getSelectedUserName()}.`}
              className="py-20"
          />
      );
    }

    return (
        <div className="overflow-hidden">
          {/* Stats Cards */}
          <div className="p-6 bg-slate-50 border-b border-slate-200">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-200">
                <div className="text-sm font-medium text-slate-600">Total Sessions</div>
                <div className="text-2xl font-bold text-slate-900">{paginationInfo?.total_items || logs.length}</div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-200">
                <div className="text-sm font-medium text-slate-600">Avg Keystrokes</div>
                <div className="text-2xl font-bold text-slate-900">
                  {logs.length > 0
                      ? Math.round(logs.reduce((sum, log) => sum + (log.keystroke_count || 0), 0) / logs.length)
                      : '-'
                  }
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-200">
                <div className="text-sm font-medium text-slate-600">Avg Error Rate</div>
                <div className="text-2xl font-bold text-slate-900">
                  {logs.length > 0
                      ? (logs.reduce((sum, log) => sum + (log.error_rate || 0), 0) / logs.length).toFixed(1)
                      : '-'
                  }
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-200">
                <div className="text-sm font-medium text-slate-600">Current User</div>
                <div className="text-lg font-semibold text-blue-700 truncate">{getSelectedUserName()}</div>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-100 border-b border-slate-200">
              <tr>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Timestamp
                </th>
                <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Keystrokes
                </th>
                <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Clicks (L/R)
                </th>
                <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Scroll (Up/Down)
                </th>
                <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Error Rate
                </th>
                <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Dwell Time (ms)
                </th>
                <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Flight Time (ms)
                </th>
                <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Pauses
                </th>
              </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
              {logs.map((log, index) => (
                  <tr key={log.id} className={`hover:bg-slate-50 transition-colors ${
                      index % 2 === 0 ? 'bg-white' : 'bg-slate-25'
                  }`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-mono text-slate-900">
                        {formatTimestamp(log.created_at)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="text-sm font-mono text-slate-900">
                        {formatNumber(log.keystroke_count)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="text-sm font-mono text-slate-900">
                        {formatNumber(log.left_click_count)} / {formatNumber(log.right_click_count)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="text-sm font-mono text-slate-900">
                        {formatNumber(log.scroll_up)} / {formatNumber(log.scroll_down)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className={`text-sm font-mono ${
                          log.error_rate && log.error_rate > 5
                              ? 'text-red-600 font-semibold'
                              : 'text-slate-900'
                      }`}>
                        {formatNumber(log.error_rate)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="text-sm font-mono text-slate-900">
                        {formatNumber(log.mean_dwell_time_ms)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="text-sm font-mono text-slate-900">
                        {formatNumber(log.mean_flight_time_ms)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="text-sm font-mono text-slate-900">
                        {formatNumber(log.pause_count)}
                      </div>
                    </td>
                  </tr>
              ))}
              </tbody>
            </table>
          </div>
        </div>
    );
  };

  return (
      <main className="flex-1 bg-slate-50">
        {/* Header */}
        <div className="bg-white border-b border-slate-200 px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Keylog Monitoring</h1>
              <p className="text-slate-600 mt-1">Track user typing patterns and keyboard activity</p>
            </div>
            <UserSelector
                selectedUserId={selectedUserId}
                setSelectedUserId={setSelectedUserId}
                users={users}
            />
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 min-h-[500px] flex flex-col">
            <div className="flex-grow">
              {renderContent()}
            </div>
            {paginationInfo && (
                <PaginationControls
                    paginationInfo={paginationInfo}
                    onPageChange={setCurrentPage}
                />
            )}
          </div>
        </div>
      </main>
  );
}

export default KeylogsView;