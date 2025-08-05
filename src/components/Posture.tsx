import React, { useState, useEffect } from 'react';
import { UserSelector, PlaceholderIcon } from './Shared';
import type { UserFromApi } from './Shared';

const API_BASE_URL = 'http://10.200.19.62:5000';

function PostureView({ selectedUserId, setSelectedUserId, users }: { selectedUserId: string | null; setSelectedUserId: (id: string | null) => void; users: UserFromApi[] }) {
  const [postureData, setPostureData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedUserId) {
      setPostureData([]);
      return;
    }

    const fetchPostureData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const apiUrl = `${API_BASE_URL}/posture?email=${selectedUserId}`; // Ganti dengan endpoint postur Anda
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error(`Failed to fetch posture data: ${response.statusText}`);
        const data = await response.json();
        setPostureData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPostureData();
  }, [selectedUserId]);

  const renderContent = () => {
    if (!selectedUserId) return <div className="text-center py-24 px-6"><PlaceholderIcon className="w-32 h-32 mx-auto text-slate-300 mb-4" /><h3>Select a user to begin</h3></div>;
    if (isLoading) return <p className="text-center py-24">Loading posture data...</p>;
    if (error) return <p className="text-center py-24 text-red-500">Error: {error}</p>;
    
    // Ganti dengan logika render data postur Anda
    return <div className="p-6">Posture data will be displayed here.</div>;
  };

  return (
    <main className="flex-1 p-8 bg-slate-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-slate-800">Posture</h2>
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

export default PostureView;