import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { adminSpinAPI } from '../services/api';
import { FiRefreshCw, FiFilter } from 'react-icons/fi';

const SpinResults = () => {
    const [spins, setSpins] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ page: 1, limit: 50, total: 0, pages: 0 });
    const [filters, setFilters] = useState({
        result: '',
        startDate: '',
        endDate: ''
    });

    useEffect(() => {
        fetchSpinResults();
    }, [pagination.page, filters]);

    const fetchSpinResults = async () => {
        setLoading(true);
        try {
            const params = {
                page: pagination.page,
                limit: pagination.limit,
                ...filters
            };

            const response = await adminSpinAPI.getAllSpins(params);
            setSpins(response.data.data.spins);
            setStats(response.data.data.stats);
            setPagination(prev => ({
                ...prev,
                total: response.data.data.pagination.total,
                pages: response.data.data.pagination.pages
            }));
        } catch (error) {
            toast.error('Failed to fetch spin results');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    const clearFilters = () => {
        setFilters({ result: '', startDate: '', endDate: '' });
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    const exportToCSV = () => {
        const headers = ['Date', 'User Phone', 'Membership', 'Result', 'Amount Paid', 'Amount Won', 'Balance Before', 'Balance After'];
        const rows = spins.map(spin => [
            new Date(spin.createdAt).toLocaleString(),
            spin.userId?.phone || 'N/A',
            spin.userId?.membershipLevel || 'N/A',
            spin.result,
            spin.amountPaid,
            spin.amountWon,
            spin.balanceBefore,
            spin.balanceAfter
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `spin-results-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">🎡 Spin Wheel Results</h1>
                    <p className="text-gray-600 mt-1">Track all spin activities and winnings</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={exportToCSV}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                        📥 Export CSV
                    </button>
                    <button
                        onClick={fetchSpinResults}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                        <FiRefreshCw /> Refresh
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm">Total Spins</p>
                                <p className="text-3xl font-bold text-gray-800">{stats.totalSpins}</p>
                            </div>
                            <div className="text-4xl">🎰</div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-md p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm">Total Wins</p>
                                <p className="text-3xl font-bold text-green-600">{stats.wins}</p>
                                <p className="text-xs text-gray-500">
                                    {stats.totalSpins > 0 ? ((stats.wins / stats.totalSpins) * 100).toFixed(1) : 0}% win rate
                                </p>
                            </div>
                            <div className="text-4xl">🎉</div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-md p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm">Total Collected</p>
                                <p className="text-3xl font-bold text-blue-600">{stats.totalPaid} ETB</p>
                            </div>
                            <div className="text-4xl">💰</div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-md p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm">Total Paid Out</p>
                                <p className="text-3xl font-bold text-red-600">{stats.totalWon} ETB</p>
                                <p className="text-xs text-gray-500">
                                    Net: {stats.totalPaid - stats.totalWon} ETB
                                </p>
                            </div>
                            <div className="text-4xl">💸</div>
                        </div>
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                <div className="flex items-center gap-2 mb-4">
                    <FiFilter className="text-gray-600" />
                    <h3 className="text-lg font-semibold text-gray-800">Filters</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Result</label>
                        <select
                            name="result"
                            value={filters.result}
                            onChange={handleFilterChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="">All Results</option>
                            <option value="Win 100 ETB">Wins Only</option>
                            <option value="Try Again">Try Again Only</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                        <input
                            type="date"
                            name="startDate"
                            value={filters.startDate}
                            onChange={handleFilterChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                        <input
                            type="date"
                            name="endDate"
                            value={filters.endDate}
                            onChange={handleFilterChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    <div className="flex items-end">
                        <button
                            onClick={clearFilters}
                            className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                        >
                            Clear Filters
                        </button>
                    </div>
                </div>
            </div>

            {/* Results Table */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Date & Time
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    User
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Membership
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Result
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Paid
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Won
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Balance Before
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Balance After
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan="8" className="px-6 py-12 text-center">
                                        <div className="flex justify-center">
                                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                                        </div>
                                    </td>
                                </tr>
                            ) : spins.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                                        No spin results found
                                    </td>
                                </tr>
                            ) : (
                                spins.map((spin) => (
                                    <tr key={spin._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {new Date(spin.createdAt).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {spin.userId?.phone || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                                {spin.userId?.membershipLevel || 'N/A'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {spin.result === 'Win 100 ETB' ? (
                                                <span className="px-3 py-1 text-sm font-semibold rounded-full bg-green-100 text-green-800">
                                                    🎉 Win 100 ETB
                                                </span>
                                            ) : (
                                                <span className="px-3 py-1 text-sm font-semibold rounded-full bg-red-100 text-red-800">
                                                    ❌ Try Again
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-semibold">
                                            -{spin.amountPaid} ETB
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">
                                            {spin.amountWon > 0 ? (
                                                <span className="text-green-600">+{spin.amountWon} ETB</span>
                                            ) : (
                                                <span className="text-gray-400">0 ETB</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {spin.balanceBefore.toFixed(2)} ETB
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {spin.balanceAfter.toFixed(2)} ETB
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {pagination.pages > 1 && (
                    <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
                        <div className="text-sm text-gray-700">
                            Showing page {pagination.page} of {pagination.pages} ({pagination.total} total results)
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                                disabled={pagination.page === 1}
                                className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                                disabled={pagination.page === pagination.pages}
                                className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SpinResults;
