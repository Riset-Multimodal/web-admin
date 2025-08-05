import React, { useState, useEffect } from 'react';
import { UserSelector, PlaceholderIcon } from './Shared';
import type { ApiLog, UserFromApi} from './Shared';

const API_BASE_URL = 'http://10.200.19.62:5000';

function KeylogsView({ selectedUserId, setSelectedUserId, users }: { selectedUserId: string | null; setSelectedUserId: (id: string | null) => void; users: UserFromApi[] }) {
  const [logs, setLogs] = useState<ApiLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedUserId) {
      setLogs([]);
      return;
    }

    const fetchKeylogData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const apiUrl = `${API_BASE_URL}/keylog?email=${selectedUserId}`;
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error(`Failed to fetch keylog data: ${response.statusText}`);
        const data: ApiLog[] = await response.json();
        setLogs(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchKeylogData();
  }, [selectedUserId]);

  const formatTimestamp = (ts: string) => new Date(ts).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'long' });
  const formatNumber = (num: number | null) => (num === null || num === undefined) ? 'N/A' : (num % 1 !== 0 ? Math.round(num) : num);

  const renderContent = () => {
    if (!selectedUserId) {
      return (
        <div className="text-center py-24 px-6">
          <PlaceholderIcon className="w-32 h-32 mx-auto text-slate-300 mb-4" />
          <h3 className="text-xl font-semibold text-slate-700">Select a user to begin</h3>
        </div>
      );
    }
    if (isLoading) return <p className="text-center py-24 text-slate-500">Loading keylog data...</p>;
    if (error) return <p className="text-center py-24 text-red-500">Error: {error}</p>;

    return (
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-slate-500">
          <thead className="text-xs text-slate-700 uppercase bg-slate-50">
            <tr>
              <th scope="col" className="px-6 py-3">Timestamp</th>
              <th scope="col" className="px-6 py-3 text-right">Keystrokes</th>
              <th scope="col" className="px-6 py-3 text-right">Clicks (L/R)</th>
              <th scope="col" className="px-6 py-3 text-right">Error Rate</th>
              <th scope="col" className="px-6 py-3 text-right">Dwell Time (ms)</th>
              <th scope="col" className="px-6 py-3 text-right">Flight Time (ms)</th>
              <th scope="col" className="px-6 py-3 text-right">Pauses</th>
            </tr>
          </thead>
          <tbody>
            {logs.length > 0 ? (
              logs.map((log) => (
                <tr key={log.id} className="bg-white border-b last:border-b-0 hover:bg-slate-50">
                  <td className="px-6 py-4 font-mono text-slate-600">{formatTimestamp(log.created_at)}</td>
                  <td className="px-6 py-4 text-right font-mono text-slate-600">{formatNumber(log.keystroke_count)}</td>
                  <td className="px-6 py-4 text-right font-mono text-slate-600">{`${formatNumber(log.left_click_count)} / ${formatNumber(log.right_click_count)}`}</td>
                  <td className="px-6 py-4 text-right font-mono text-slate-600">{formatNumber(log.error_rate)}</td>
                  <td className="px-6 py-4 text-right font-mono text-slate-600">{formatNumber(log.mean_dwell_time_ms)}</td>
                  <td className="px-6 py-4 text-right font-mono text-slate-600">{formatNumber(log.mean_flight_time_ms)}</td>
                  <td className="px-6 py-4 text-right font-mono text-slate-600">{formatNumber(log.pause_count)}</td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={7} className="text-center py-16 px-6 text-slate-500">No keylog data available for this user.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <main className="flex-1 p-8 bg-slate-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-slate-800">Keylogs</h2>
          <UserSelector 
            selectedUserId={selectedUserId} 
            setSelectedUserId={setSelectedUserId}
            users={users} 
          />
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 min-h-[300px]">
          {renderContent()}
        </div>
      </div>
    </main>
  );
}

export default KeylogsView;