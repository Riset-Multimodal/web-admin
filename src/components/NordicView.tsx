import React, { useState, useEffect } from 'react';

const API_BASE_URL = 'https://admin-riset-be.akbarfikri.my.id';

// Shared components (minimal versions needed)
const LoadingSpinner = ({ className = 'w-6 h-6' }) => (
    <svg className={`${className} animate-spin`} fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
);

const EmptyState = ({ title, description, className = "" }) => (
    <div className={`text-center py-12 px-6 ${className}`}>
        <svg className="w-16 h-16 mx-auto text-slate-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
        <h3 className="text-lg font-semibold text-slate-700 mb-2">{title}</h3>
        {description && <p className="text-slate-500 max-w-md mx-auto">{description}</p>}
    </div>
);

const ErrorState = ({ message, onRetry }) => (
    <div className="text-center py-12 px-6">
        <div className="w-16 h-16 mx-auto mb-4 text-red-400">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
        </div>
        <h3 className="text-lg font-semibold text-slate-700 mb-2">Something went wrong</h3>
        <p className="text-red-600 mb-4">{message}</p>
        {onRetry && (
            <button onClick={onRetry} className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-red-500 transition-colors">
                Try Again
            </button>
        )}
    </div>
);

// Body part labels for NBM (0-26)
const bodyPartLabels = [
    "Neck (Upper)", "Neck (Lower)", "Left Shoulder", "Right Shoulder",
    "Left Upper Arm", "Upper Back", "Right Upper Arm", "Waist",
    "Lower Back", "Buttocks", "Left Elbow", "Right Elbow",
    "Left Forearm", "Right Forearm", "Left Wrist", "Right Wrist",
    "Left Hand", "Right Hand", "Left Thigh", "Right Thigh",
    "Left Knee", "Right Knee", "Left Calf", "Right Calf",
    "Left Ankle", "Right Ankle", "Left Foot", "Right Foot"
];

function NordicView() {
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedEntry, setSelectedEntry] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchNordicData();
    }, []);

    const fetchNordicData = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const apiUrl = `${API_BASE_URL}/nordic`;
            const response = await fetch(apiUrl);

            if (!response.ok) {
                throw new Error(`Failed to fetch Nordic data: ${response.status} ${response.statusText}`);
            }

            const responseJson = await response.json();

            // Response is directly an array
            if (Array.isArray(responseJson)) {
                setData(responseJson);
            } else if (responseJson.data) {
                // Fallback if structure changes
                setData(responseJson.data || []);
            } else {
                setData([]);
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
            setError(errorMessage);
            setData([]);
        } finally {
            setIsLoading(false);
        }
    };

    const formatTimestamp = (ts) => {
        try {
            return new Date(ts).toLocaleString('id-ID', {
                dateStyle: 'medium',
                timeStyle: 'short',
                timeZone: 'Asia/Jakarta'
            });
        } catch {
            return 'Invalid date';
        }
    };

    const getSeverityColor = (score) => {
        if (score === 1) return 'bg-green-100 text-green-800 border-green-300';
        if (score === 2) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
        if (score === 3) return 'bg-orange-100 text-orange-800 border-orange-300';
        if (score === 4) return 'bg-red-100 text-red-800 border-red-300';
        return 'bg-slate-100 text-slate-800 border-slate-300';
    };

    const getSeverityLabel = (score) => {
        if (score === 1) return 'No Pain';
        if (score === 2) return 'Mild';
        if (score === 3) return 'Moderate';
        if (score === 4) return 'Severe';
        return 'N/A';
    };

    const getTotalScoreColor = (score) => {
        if (score <= 27) return 'text-green-600';
        if (score <= 54) return 'text-yellow-600';
        if (score <= 81) return 'text-orange-600';
        return 'text-red-600';
    };

    const filteredData = data.filter(entry =>
        entry.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.user_email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const renderDetailModal = () => {
        if (!selectedEntry) return null;

        const bodyParts = [];
        for (let i = 0; i <= 26; i++) {
            const key = `nbm_${i}`;
            if (selectedEntry[key] !== undefined && selectedEntry[key] !== null) {
                bodyParts.push({
                    label: bodyPartLabels[i] || `Part ${i}`,
                    score: selectedEntry[key]
                });
            }
        }

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedEntry(null)}>
                <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden" onClick={e => e.stopPropagation()}>
                    {/* Modal Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-bold">{selectedEntry.name}</h2>
                                <p className="text-blue-100 text-sm">{selectedEntry.user_email}</p>
                            </div>
                            <button onClick={() => setSelectedEntry(null)} className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-colors">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Modal Content */}
                    <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                        {/* Summary Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                                <div className="text-sm text-slate-600 mb-1">Total Score</div>
                                <div className={`text-2xl font-bold ${getTotalScoreColor(selectedEntry.total_score)}`}>
                                    {selectedEntry.total_score}
                                </div>
                            </div>
                            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                                <div className="text-sm text-slate-600 mb-1">Date</div>
                                <div className="text-sm font-semibold text-slate-800">
                                    {formatTimestamp(selectedEntry.created_at)}
                                </div>
                            </div>
                            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                                <div className="text-sm text-slate-600 mb-1">Affected Areas</div>
                                <div className="text-2xl font-bold text-slate-800">
                                    {bodyParts.filter(bp => bp.score > 1).length}
                                </div>
                            </div>
                            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                                <div className="text-sm text-slate-600 mb-1">Severe Areas</div>
                                <div className="text-2xl font-bold text-red-600">
                                    {bodyParts.filter(bp => bp.score >= 3).length}
                                </div>
                            </div>
                        </div>

                        {/* Body Parts Grid */}
                        <h3 className="text-lg font-semibold text-slate-800 mb-4">Body Parts Assessment</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {bodyParts.map((part, idx) => (
                                <div key={idx} className={`border rounded-lg p-3 ${getSeverityColor(part.score)}`}>
                                    <div className="flex items-center justify-between">
                                        <div className="font-medium">{part.label}</div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-semibold px-2 py-1 rounded bg-white bg-opacity-50">
                                                {getSeverityLabel(part.score)}
                                            </span>
                                            <span className="text-lg font-bold">{part.score}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Legend */}
                        <div className="mt-6 bg-slate-50 rounded-lg p-4 border border-slate-200">
                            <h4 className="text-sm font-semibold text-slate-700 mb-3">Pain Scale Legend</h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded bg-green-500"></div>
                                    <span>1 - No Pain</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded bg-yellow-500"></div>
                                    <span>2 - Mild</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded bg-orange-500"></div>
                                    <span>3 - Moderate</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded bg-red-500"></div>
                                    <span>4 - Severe</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="flex flex-col items-center justify-center py-20">
                    <LoadingSpinner className="w-8 h-8 text-blue-600 mb-4" />
                    <p className="text-slate-600">Loading Nordic Body Map data...</p>
                </div>
            );
        }

        if (error) {
            return <ErrorState message={error} onRetry={fetchNordicData} />;
        }

        if (filteredData.length === 0) {
            return (
                <EmptyState
                    title={searchTerm ? "No matching results" : "No Nordic data found"}
                    description={searchTerm ? "Try adjusting your search terms" : "No Nordic Body Map assessments are available yet."}
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
                            <div className="text-sm font-medium text-slate-600">Shown Assessments</div>
                            <div className="text-2xl font-bold text-slate-900">{filteredData.length}</div>
                        </div>
                        <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-200">
                            <div className="text-sm font-medium text-slate-600">Average Score</div>
                            <div className="text-2xl font-bold text-slate-900">
                                {filteredData.length > 0 ? Math.round(filteredData.reduce((sum, d) => sum + d.total_score, 0) / filteredData.length) : '-'}
                            </div>
                        </div>
                        <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-200">
                            <div className="text-sm font-medium text-slate-600">High Risk Cases</div>
                            <div className="text-2xl font-bold text-red-600">
                                {filteredData.filter(d => d.total_score > 54).length}
                            </div>
                        </div>
                        <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-200">
                            <div className="text-sm font-medium text-slate-600">Critical Cases</div>
                            <div className="text-2xl font-bold text-red-700">
                                {filteredData.filter(d => d.total_score > 81).length}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-100 border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Email</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-4 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">Total Score</th>
                            <th className="px-6 py-4 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-4 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider">Action</th>
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                        {filteredData.map((entry, index) => (
                            <tr key={entry.id} className={`hover:bg-slate-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-slate-25'}`}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-slate-900">{entry.name}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-slate-600">{entry.user_email}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-mono text-slate-900">{formatTimestamp(entry.created_at)}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                    <div className={`text-sm font-bold ${getTotalScoreColor(entry.total_score)}`}>
                                        {entry.total_score}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                            entry.total_score <= 27 ? 'bg-green-100 text-green-800' :
                                                entry.total_score <= 54 ? 'bg-yellow-100 text-yellow-800' :
                                                    entry.total_score <= 81 ? 'bg-orange-100 text-orange-800' :
                                                        'bg-red-100 text-red-800'
                                        }`}>
                                            {entry.total_score <= 27 ? 'Low Risk' :
                                                entry.total_score <= 54 ? 'Moderate' :
                                                    entry.total_score <= 81 ? 'High Risk' :
                                                        'Critical'}
                                        </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                    <button
                                        onClick={() => setSelectedEntry(entry)}
                                        className="inline-flex items-center px-3 py-1 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                                    >
                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                        View Details
                                    </button>
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
        <main className="flex-1 bg-slate-50 min-h-screen lg:ml-72">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 px-8 py-6 sticky top-0 z-30">
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">Nordic Body Map</h1>
                            <p className="text-slate-600 mt-1">Musculoskeletal discomfort assessment</p>
                        </div>
                        <button
                            onClick={fetchNordicData}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Refresh
                        </button>
                    </div>

                    {/* Search */}
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full md:w-96 px-4 py-2 pl-10 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <svg className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-8">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 min-h-[500px]">
                    {renderContent()}
                </div>
            </div>

            {/* Detail Modal */}
            {renderDetailModal()}
        </main>
    );
}

export default NordicView;