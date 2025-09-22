import React, { useState, useEffect } from 'react';
import { UserSelector, EmptyState, ErrorState, LoadingSpinner, PaginationControls } from './Shared';
import type { UserFromApi } from './Shared';

const API_BASE_URL = 'https://admin-riset-be.akbarfikri.my.id';
const ITEMS_PER_PAGE = 6;

interface PostureData {
  id?: number;
  timestamp: string;
  front_image_link?: string;
  side_image_link?: string;
  overhead_image_link?: string;
  final_scores_section_a_score?: number | null;
  final_scores_section_b_score?: number | null;
  final_scores_section_c_score?: number | null;
  final_scores_bc_combined_score?: number | null;
  final_scores_final_rosa_score?: number | null;
}

interface PostureViewProps {
  selectedUserId: string | null;
  setSelectedUserId: (id: string | null) => void;
  users: UserFromApi[];
}

function PostureView({ selectedUserId, setSelectedUserId, users }: PostureViewProps) {
  const [postureData, setPostureData] = useState<PostureData[]>([]);
  const [paginationInfo, setPaginationInfo] = useState<any | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageLoadErrors, setImageLoadErrors] = useState<Set<string>>(new Set());

  // Reset page when user changes
  useEffect(() => {
    setCurrentPage(1);
    setPaginationInfo(null);
    setImageLoadErrors(new Set());
  }, [selectedUserId]);

  // Fetch posture data
  useEffect(() => {
    if (!selectedUserId) {
      setPostureData([]);
      setPaginationInfo(null);
      return;
    }

    const fetchPostureData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const apiUrl = `${API_BASE_URL}/posture?email=${selectedUserId}&page=${currentPage}&per_page=${ITEMS_PER_PAGE}`;
        const response = await fetch(apiUrl);

        if (!response.ok) {
          throw new Error(`Failed to fetch posture data: ${response.status} ${response.statusText}`);
        }

        const responseJson = await response.json();
        setPostureData(responseJson.data || []);
        setPaginationInfo(responseJson.pagination);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
        setError(errorMessage);
        setPostureData([]);
        setPaginationInfo(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPostureData();
  }, [selectedUserId, currentPage]);

  const formatTimestamp = (ts: string) => {
    try {
      return new Date(ts).toLocaleString("id-ID", {
        timeZone: "Asia/Jakarta",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    } catch {
      return 'Invalid date';
    }
  };

  const formatScore = (score: number | null | undefined) => {
    if (score === null || score === undefined) return '-';
    return typeof score === 'number' ? score.toString() : '-';
  };

  const getScoreColor = (score: number | null | undefined, type: 'rosa' | 'section') => {
    if (score === null || score === undefined) return 'text-slate-500';

    if (type === 'rosa') {
      if (score <= 2) return 'text-green-600';
      if (score <= 4) return 'text-yellow-600';
      if (score <= 6) return 'text-orange-600';
      return 'text-red-600';
    }

    // For sections A, B, C
    if (score <= 2) return 'text-green-600';
    if (score <= 3) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score: number | null | undefined) => {
    if (score === null || score === undefined) return '';
    if (score <= 2) return 'Low Risk';
    if (score <= 4) return 'Medium Risk';
    if (score <= 6) return 'High Risk';
    return 'Very High Risk';
  };

  const handleImageError = (imageUrl: string) => {
    setImageLoadErrors(prev => new Set([...prev, imageUrl]));
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

  const renderImageCard = (imageUrl: string | undefined, title: string, icon: string) => {
    if (!imageUrl || imageLoadErrors.has(imageUrl)) {
      return (
          <div className="aspect-square bg-slate-100 rounded-lg flex flex-col items-center justify-center border-2 border-dashed border-slate-300">
            <div className="text-slate-400 mb-2 text-2xl">{icon}</div>
            <div className="text-sm text-slate-500 text-center px-2">
              {imageLoadErrors.has(imageUrl || '') ? 'Failed to load' : 'No image'}
            </div>
          </div>
      );
    }

    return (
        <div className="aspect-square bg-white rounded-lg overflow-hidden shadow-sm border border-slate-200">
          <img
              src={imageUrl}
              alt={title}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-200 cursor-pointer"
              onError={() => handleImageError(imageUrl)}
              onClick={() => window.open(imageUrl, '_blank')}
          />
        </div>
    );
  };

  const renderContent = () => {
    if (!selectedUserId) {
      return (
          <EmptyState
              title="Select a user to view posture data"
              description="Choose a user from the dropdown above to start analyzing their posture and ROSA scores."
              className="py-20"
          />
      );
    }

    if (isLoading) {
      return (
          <div className="flex flex-col items-center justify-center py-20">
            <LoadingSpinner className="w-8 h-8 text-blue-600 mb-4" />
            <p className="text-slate-600">Loading posture data...</p>
            <p className="text-sm text-slate-500 mt-1">Analyzing posture for {getSelectedUserName()}</p>
          </div>
      );
    }

    if (error) {
      return <ErrorState message={error} onRetry={retryFetch} />;
    }

    if (postureData.length === 0) {
      return (
          <EmptyState
              title="No posture data found"
              description={`No posture analysis is available for ${getSelectedUserName()}.`}
              className="py-20"
          />
      );
    }

    return (
        <div className="space-y-6">
          {/* Summary Stats */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Posture Analysis Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="text-sm font-medium text-slate-600">Total Analyses</div>
                <div className="text-2xl font-bold text-slate-900">{paginationInfo?.total_items || postureData.length}</div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="text-sm font-medium text-slate-600">Avg ROSA Score</div>
                <div className="text-2xl font-bold text-slate-900">
                  {postureData.length > 0 ? (
                      postureData
                          .filter(p => p.final_scores_final_rosa_score !== null)
                          .reduce((sum, p) => sum + (p.final_scores_final_rosa_score || 0), 0) /
                      postureData.filter(p => p.final_scores_final_rosa_score !== null).length || 0
                  ).toFixed(1) : '-'}
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="text-sm font-medium text-slate-600">Latest Analysis</div>
                <div className="text-lg font-semibold text-slate-900">
                  {postureData.length > 0 ? formatTimestamp(postureData[0].timestamp).split(' ')[0] : '-'}
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="text-sm font-medium text-slate-600">Current User</div>
                <div className="text-lg font-semibold text-blue-700 truncate">{getSelectedUserName()}</div>
              </div>
            </div>
          </div>

          {/* Posture Cards */}
          <div className="space-y-6">
            {postureData.map((p, idx) => (
                <div key={p.id || idx} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                  {/* Header */}
                  <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-lg font-semibold text-slate-800">
                          Posture Analysis #{(currentPage - 1) * ITEMS_PER_PAGE + idx + 1}
                        </h4>
                        <p className="text-sm text-slate-600 font-mono">
                          {formatTimestamp(p.timestamp)}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-slate-600">ROSA Score</div>
                        <div className={`text-2xl font-bold ${getScoreColor(p.final_scores_final_rosa_score, 'rosa')}`}>
                          {formatScore(p.final_scores_final_rosa_score)}
                        </div>
                        <div className={`text-xs font-medium ${getScoreColor(p.final_scores_final_rosa_score, 'rosa')}`}>
                          {getScoreLabel(p.final_scores_final_rosa_score)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    {/* Images */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                      <div>
                        <h5 className="text-sm font-semibold text-slate-700 mb-3 text-center">Front View 👤</h5>
                        {renderImageCard(p.front_image_link, 'Front view', '👤')}
                      </div>
                      <div>
                        <h5 className="text-sm font-semibold text-slate-700 mb-3 text-center">Side View 📐</h5>
                        {renderImageCard(p.side_image_link, 'Side view', '📐')}
                      </div>
                      <div>
                        <h5 className="text-sm font-semibold text-slate-700 mb-3 text-center">Overhead View 🔄</h5>
                        {renderImageCard(p.overhead_image_link, 'Overhead view', '🔄')}
                      </div>
                    </div>

                    {/* Scores */}
                    <div className="bg-slate-50 rounded-lg p-4">
                      <h5 className="text-sm font-semibold text-slate-700 mb-4">ROSA Section Scores</h5>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <div className="bg-white rounded-lg p-4 text-center shadow-sm">
                          <div className="text-xs text-slate-600 mb-1">Section A</div>
                          <div className={`text-xl font-bold ${getScoreColor(p.final_scores_section_a_score, 'section')}`}>
                            {formatScore(p.final_scores_section_a_score)}
                          </div>
                        </div>
                        <div className="bg-white rounded-lg p-4 text-center shadow-sm">
                          <div className="text-xs text-slate-600 mb-1">Section B</div>
                          <div className={`text-xl font-bold ${getScoreColor(p.final_scores_section_b_score, 'section')}`}>
                            {formatScore(p.final_scores_section_b_score)}
                          </div>
                        </div>
                        <div className="bg-white rounded-lg p-4 text-center shadow-sm">
                          <div className="text-xs text-slate-600 mb-1">Section C</div>
                          <div className={`text-xl font-bold ${getScoreColor(p.final_scores_section_c_score, 'section')}`}>
                            {formatScore(p.final_scores_section_c_score)}
                          </div>
                        </div>
                        <div className="bg-white rounded-lg p-4 text-center shadow-sm">
                          <div className="text-xs text-slate-600 mb-1">BC Combined</div>
                          <div className={`text-xl font-bold ${getScoreColor(p.final_scores_bc_combined_score, 'section')}`}>
                            {formatScore(p.final_scores_bc_combined_score)}
                          </div>
                        </div>
                        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg p-4 text-center shadow-sm">
                          <div className="text-xs text-blue-100 mb-1">Final ROSA</div>
                          <div className="text-xl font-bold">
                            {formatScore(p.final_scores_final_rosa_score)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
            ))}
          </div>
        </div>
    );
  };

  return (
      <main className="flex-1 bg-slate-50 min-h-screen lg:ml-72">
        {/* Header */}
        <div className="bg-white border-b border-slate-200 px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Posture Analysis</h1>
              <p className="text-slate-600 mt-1">Monitor workspace ergonomics and ROSA assessments</p>
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
          <div className="max-w-7xl mx-auto">
            {renderContent()}
            {paginationInfo && (
                <div className="mt-8">
                  <PaginationControls
                      paginationInfo={paginationInfo}
                      onPageChange={setCurrentPage}
                  />
                </div>
            )}
          </div>
        </div>
      </main>
  );
}

export default PostureView;