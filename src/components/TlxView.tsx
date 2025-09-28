import React, { useState } from 'react';
import { LoadingSpinner, ErrorState } from './Shared';

const API_BASE_URL = 'https://admin-riset-be.akbarfikri.my.id';

interface TlxViewProps {}

function TlxView({}: TlxViewProps) {
    const [loadingStates, setLoadingStates] = useState({
        wwl: true,
        aspects: true,
        categories: true
    });
    const [errorStates, setErrorStates] = useState({
        wwl: null as string | null,
        aspects: null as string | null,
        categories: null as string | null
    });
    const [imageErrors, setImageErrors] = useState({
        wwl: false,
        aspects: false,
        categories: false
    });

    const charts = [
        {
            id: 'wwl',
            title: 'Workload Uniformity Test',
            description: 'NASA-TLX score distribution with control limits',
            endpoint: `${API_BASE_URL}/tlx/plot/wwl.png`,
            icon: '📊'
        },
        {
            id: 'aspects',
            title: 'NASA-TLX Aspects Comparison',
            description: 'Average scores across different NASA-TLX dimensions',
            endpoint: `${API_BASE_URL}/tlx/plot/aspects.png`,
            icon: '📈'
        },
        {
            id: 'categories',
            title: 'Workload Categories Distribution',
            description: 'Distribution of workload categories (Light/Medium/Heavy)',
            endpoint: `${API_BASE_URL}/tlx/plot/categories.png`,
            icon: '🎯'
        }
    ];

    const handleImageLoad = (chartId: string) => {
        setLoadingStates(prev => ({ ...prev, [chartId]: false }));
        setErrorStates(prev => ({ ...prev, [chartId]: null }));
        setImageErrors(prev => ({ ...prev, [chartId]: false }));
    };

    const handleImageError = (chartId: string) => {
        setLoadingStates(prev => ({ ...prev, [chartId]: false }));
        setImageErrors(prev => ({ ...prev, [chartId]: true }));
        setErrorStates(prev => ({
            ...prev,
            [chartId]: 'Failed to load chart image'
        }));
    };

    const retryChart = (chartId: string) => {
        setLoadingStates(prev => ({ ...prev, [chartId]: true }));
        setErrorStates(prev => ({ ...prev, [chartId]: null }));
        setImageErrors(prev => ({ ...prev, [chartId]: false }));

        // Force reload by adding timestamp
        const img = document.getElementById(`chart-${chartId}`) as HTMLImageElement;
        if (img) {
            const baseUrl = charts.find(c => c.id === chartId)?.endpoint;
            if (baseUrl) {
                img.src = `${baseUrl}?t=${Date.now()}`;
            }
        }
    };

    const refreshAllCharts = () => {
        setLoadingStates({
            wwl: true,
            aspects: true,
            categories: true
        });
        setErrorStates({
            wwl: null,
            aspects: null,
            categories: null
        });
        setImageErrors({
            wwl: false,
            aspects: false,
            categories: false
        });
    };

    const renderChart = (chart: any) => {
        const isLoading = loadingStates[chart.id as keyof typeof loadingStates];
        const error = errorStates[chart.id as keyof typeof errorStates];
        const hasImageError = imageErrors[chart.id as keyof typeof imageErrors];

        return (
            <div key={chart.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                {/* Header */}
                <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">{chart.icon}</span>
                            <div>
                                <h3 className="text-lg font-semibold text-slate-800">{chart.title}</h3>
                                <p className="text-sm text-slate-600">{chart.description}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => retryChart(chart.id)}
                            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Refresh chart"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Refresh
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6">
                    <div className="relative min-h-[300px] flex items-center justify-center bg-slate-50 rounded-lg overflow-hidden">
                        {/* Loading State */}
                        {isLoading && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white bg-opacity-90 z-10">
                                <LoadingSpinner className="w-8 h-8 text-blue-600 mb-2" />
                                <p className="text-sm text-slate-600">Loading chart...</p>
                            </div>
                        )}

                        {/* Error State */}
                        {error && !isLoading && (
                            <div className="flex flex-col items-center justify-center py-8">
                                <div className="text-slate-400 mb-4">
                                    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h4 className="text-lg font-semibold text-slate-800 mb-2">Chart Unavailable</h4>
                                <p className="text-sm text-slate-600 text-center mb-4 max-w-sm">
                                    {error}. Please try refreshing or check your connection.
                                </p>
                                <button
                                    onClick={() => retryChart(chart.id)}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                                >
                                    Try Again
                                </button>
                            </div>
                        )}

                        {/* Image */}
                        {!error && (
                            <img
                                id={`chart-${chart.id}`}
                                src={`${chart.endpoint}?t=${Date.now()}`}
                                alt={chart.title}
                                className={`max-w-full h-auto transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
                                onLoad={() => handleImageLoad(chart.id)}
                                onError={() => handleImageError(chart.id)}
                                style={{ display: hasImageError ? 'none' : 'block' }}
                            />
                        )}
                    </div>
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
                        <h1 className="text-2xl font-bold text-slate-900">NASA-TLX Analytics</h1>
                        <p className="text-slate-600 mt-1">Workload assessment and statistical analysis</p>
                    </div>
                    <button
                        onClick={refreshAllCharts}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Refresh All Charts
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="p-8">
                <div className="max-w-7xl mx-auto">
                    {/* Summary Info */}
                    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-200 mb-8">
                        <h2 className="text-xl font-semibold text-slate-800 mb-4">About NASA-TLX Analysis</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white rounded-lg p-4 shadow-sm">
                                <div className="text-indigo-600 text-2xl mb-2">🧠</div>
                                <h3 className="font-semibold text-slate-800 mb-2">Mental Workload</h3>
                                <p className="text-sm text-slate-600">Measures cognitive demands and mental effort required for task completion</p>
                            </div>
                            <div className="bg-white rounded-lg p-4 shadow-sm">
                                <div className="text-purple-600 text-2xl mb-2">📊</div>
                                <h3 className="font-semibold text-slate-800 mb-2">Statistical Analysis</h3>
                                <p className="text-sm text-slate-600">Control charts and distribution analysis for workload assessment</p>
                            </div>
                            <div className="bg-white rounded-lg p-4 shadow-sm">
                                <div className="text-blue-600 text-2xl mb-2">🎯</div>
                                <h3 className="font-semibold text-slate-800 mb-2">Performance Insights</h3>
                                <p className="text-sm text-slate-600">Categorizes workload levels to identify optimization opportunities</p>
                            </div>
                        </div>
                    </div>

                    {/* Charts */}
                    <div className="space-y-8">
                        {charts.map(renderChart)}
                    </div>

                    {/* Legend */}
                    <div className="mt-8 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <h3 className="text-lg font-semibold text-slate-800 mb-4">Chart Legend</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                            <div>
                                <h4 className="font-semibold text-slate-700 mb-2">Workload Categories</h4>
                                <ul className="space-y-1 text-slate-600">
                                    <li><span className="text-green-600">●</span> <strong>Ringan:</strong> Low mental workload</li>
                                    <li><span className="text-yellow-600">●</span> <strong>Sedang:</strong> Moderate mental workload</li>
                                    <li><span className="text-red-600">●</span> <strong>Berat:</strong> High mental workload</li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-semibold text-slate-700 mb-2">Control Limits</h4>
                                <ul className="space-y-1 text-slate-600">
                                    <li><strong>BKA:</strong> Upper Control Limit</li>
                                    <li><strong>BKB:</strong> Lower Control Limit</li>
                                    <li><strong>Rata-rata:</strong> Mean score</li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-semibold text-slate-700 mb-2">NASA-TLX Dimensions</h4>
                                <ul className="space-y-1 text-slate-600">
                                    <li><strong>Mental:</strong> Mental demands</li>
                                    <li><strong>Physical:</strong> Physical demands</li>
                                    <li><strong>Temporal:</strong> Time pressure</li>
                                    <li><strong>Performance:</strong> Task success</li>
                                    <li><strong>Effort:</strong> Work effort</li>
                                    <li><strong>Frustration:</strong> Stress level</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}

export default TlxView;