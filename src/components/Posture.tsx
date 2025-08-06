import React, { useState, useEffect } from 'react';
import { UserSelector, PlaceholderIcon } from './Shared';
import type { UserFromApi } from './Shared';

const API_BASE_URL = 'http://10.200.19.62:5000';
const ITEMS_PER_PAGE = 5; // Menampilkan 5 postur per halaman

// --- Komponen baru untuk kontrol pagination ---
const PaginationControls = ({ paginationInfo, onPageChange }: { paginationInfo: any, onPageChange: (page: number) => void }) => {
  if (!paginationInfo || paginationInfo.total_pages <= 1) {
    return null; // Jangan tampilkan kontrol jika hanya ada 1 halaman atau kurang
  }

  return (
    <div className="flex justify-between items-center mt-8 p-4 border-t">
      <button
        onClick={() => onPageChange(paginationInfo.page - 1)}
        disabled={!paginationInfo.has_prev}
        className="px-4 py-2 text-sm font-medium text-white bg-slate-600 rounded-md disabled:bg-slate-300 disabled:cursor-not-allowed"
      >
        Previous
      </button>
      <span className="text-sm text-slate-600">
        Page <strong>{paginationInfo.page}</strong> of <strong>{paginationInfo.total_pages}</strong>
      </span>
      <button
        onClick={() => onPageChange(paginationInfo.page + 1)}
        disabled={!paginationInfo.has_next}
        className="px-4 py-2 text-sm font-medium text-white bg-slate-600 rounded-md disabled:bg-slate-300 disabled:cursor-not-allowed"
      >
        Next
      </button>
    </div>
  );
};


function PostureView({ selectedUserId, setSelectedUserId, users }: { selectedUserId: string | null; setSelectedUserId: (id: string | null) => void; users: UserFromApi[] }) {
  // --- 1. State Diubah ---
  const [postureData, setPostureData] = useState<any[]>([]);
  const [paginationInfo, setPaginationInfo] = useState<any | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- Efek untuk mereset halaman saat user diganti ---
  useEffect(() => {
    setCurrentPage(1);
    setPaginationInfo(null);
  }, [selectedUserId]);


  // --- 2. useEffect Diubah untuk Fetch Data ---
  useEffect(() => {
    if (!selectedUserId) {
      setPostureData([]);
      return;
    }

    const fetchPostureData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Tambahkan parameter page dan per_page
        const apiUrl = `${API_BASE_URL}/posture?email=${selectedUserId}&page=${currentPage}&per_page=${ITEMS_PER_PAGE}`;
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error(`Failed to fetch posture data: ${response.statusText}`);

        // --- 3. Proses Respons Baru ---
        const responseJson = await response.json();
        setPostureData(responseJson.data);
        setPaginationInfo(responseJson.pagination);

      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPostureData();
  }, [selectedUserId, currentPage]); // <-- Tambahkan currentPage sebagai dependency


  const renderContent = () => {
    if (!selectedUserId)
      return (
        <div className="text-center py-24 px-6">
          <PlaceholderIcon className="w-32 h-32 mx-auto text-slate-300 mb-4" />
          <h3>Select a user to begin</h3>
        </div>
      );
    if (isLoading) return <p className="text-center py-24">Loading posture data...</p>;
    if (error) return <p className="text-center py-24 text-red-500">Error: {error}</p>;
    if (postureData.length === 0) {
      return <p className="text-center py-24 text-slate-500">No posture data found for this user.</p>;
    }

    return (
      <div className="p-6 space-y-8">
        {postureData.map((p, idx) => {
          let readableDate = "No timestamp";

          if (p.timestamp) {
            const dateObj = new Date(p.timestamp); // kalau dari API udah format ISO
            readableDate = dateObj.toLocaleString("id-ID", {
              timeZone: "Asia/Jakarta",
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            });
          }

          return (
            <div key={idx} className="border rounded-lg p-4 shadow-sm bg-white">
              {/* ... (Konten kartu postur tidak berubah) ... */}
              <div className="mb-4 text-sm text-slate-500">{readableDate}</div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                {p.front_image_link && <img src={p.front_image_link} alt="Front view" className="w-full rounded-md border" />}
                {p.side_image_link && <img src={p.side_image_link} alt="Side view" className="w-full rounded-md border" />}
                {p.overhead_image_link && <img src={p.overhead_image_link} alt="Overhead view" className="w-full rounded-md border" />}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 text-center">
                <div className="bg-slate-100 rounded-md p-3"><p className="font-semibold text-slate-700">BC Combined</p><p className="text-lg">{p.final_scores_bc_combined_score ?? '-'}</p></div>
                <div className="bg-slate-100 rounded-md p-3"><p className="font-semibold text-slate-700">ROSA Final</p><p className="text-lg">{p.final_scores_final_rosa_score ?? '-'}</p></div>
                <div className="bg-slate-100 rounded-md p-3"><p className="font-semibold text-slate-700">Section A</p><p className="text-lg">{p.final_scores_section_a_score ?? '-'}</p></div>
                <div className="bg-slate-100 rounded-md p-3"><p className="font-semibold text-slate-700">Section B</p><p className="text-lg">{p.final_scores_section_b_score ?? '-'}</p></div>
                <div className="bg-slate-100 rounded-md p-3"><p className="font-semibold text-slate-700">Section C</p><p className="text-lg">{p.final_scores_section_c_score ?? '-'}</p></div>
              </div>
            </div>
          );
        })}
      </div>
    );
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
          {/* --- 4. Tampilkan Kontrol Pagination --- */}
          <PaginationControls paginationInfo={paginationInfo} onPageChange={setCurrentPage} />
        </div>
      </div>
    </main>
  );
}

export default PostureView;