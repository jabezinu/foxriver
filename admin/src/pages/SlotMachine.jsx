import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { adminSpinAPI } from '../services/api';
import { FiPlus, FiEdit2, FiTrash2, FiToggleLeft, FiToggleRight, FiRefreshCw, FiFilter } from 'react-icons/fi';
import { getApiUrl } from '../config/api.config';

const SlotMachine = () => {
    const [activeTab, setActiveTab] = useState('results'); // 'results' or 'tiers'
    
    // Spin Results State
    const [spins, setSpins] = useState([]);
    const [stats, setStats] = useState(null);
    const [loadingSpins, setLoadingSpins] = useState(true);
    const [pagination, setPagination] = useState({ page: 1, limit: 50, total: 0, pages: 0 });
    const [filters, setFilters] = useState({
        result: '',
        startDate: '',
        endDate: ''
    });

    // Slot Tiers State
    const [tiers, setTiers] = useState([]);
    const [loadingTiers, setLoadingTiers] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingTier, setEditingTier] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        betAmount: '',
        winAmount: '',
        winProbability: '10',
        description: '',
        order: '0'
    });

    useEffect(() => {
        if (activeTab === 'results') {
            fetchSpinResults();
        } else {
            fetchTiers();
        }
    }, [activeTab, pagination.page, filters]);

    // Spin Results Functions
    const fetchSpinResults = async () => {
        setLoadingSpins(true);
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
            toast.error('Failed to fetch slot machine results');
            console.error(error);
        } finally {
            setLoadingSpins(false);
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
        a.download = `slot-machine-results-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    // Slot Tiers Functions
    const fetchTiers = async () => {
        setLoadingTiers(true);
        try {
            const token = localStorage.getItem('foxriver_admin_token');
            const response = await fetch(`${getApiUrl()}/slot-tiers/admin/all`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            
            if (data.success) {
                setTiers(data.data);
            } else {
                toast.error(data.message || 'Failed to fetch tiers');
            }
        } catch (error) {
            toast.error('Error fetching tiers');
            console.error(error);
        } finally {
            setLoadingTiers(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            const token = localStorage.getItem('foxriver_admin_token');
            const url = editingTier
                ? `${getApiUrl()}/slot-tiers/admin/${editingTier._id}`
                : `${getApiUrl()}/slot-tiers/admin`;
            
            const method = editingTier ? 'PUT' : 'POST';
            
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });
            
            const data = await response.json();
            
            if (data.success) {
                toast.success(editingTier ? 'Tier updated successfully' : 'Tier created successfully');
                setShowModal(false);
                setEditingTier(null);
                setFormData({
                    name: '',
                    betAmount: '',
                    winAmount: '',
                    winProbability: '10',
                    description: '',
                    order: '0'
                });
                fetchTiers();
            } else {
                toast.error(data.message || 'Operation failed');
            }
        } catch (error) {
            toast.error('Error saving tier');
            console.error(error);
        }
    };

    const handleEdit = (tier) => {
        setEditingTier(tier);
        setFormData({
            name: tier.name,
            betAmount: tier.betAmount.toString(),
            winAmount: tier.winAmount.toString(),
            winProbability: tier.winProbability.toString(),
            description: tier.description || '',
            order: tier.order.toString()
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this tier?')) return;
        
        try {
            const token = localStorage.getItem('foxriver_admin_token');
            const response = await fetch(`${getApiUrl()}/slot-tiers/admin/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            const data = await response.json();
            
            if (data.success) {
                toast.success('Tier deleted successfully');
                fetchTiers();
            } else {
                toast.error(data.message || 'Failed to delete tier');
            }
        } catch (error) {
            toast.error('Error deleting tier');
            console.error(error);
        }
    };

    const handleToggleStatus = async (id) => {
        try {
            const token = localStorage.getItem('foxriver_admin_token');
            const response = await fetch(`${getApiUrl()}/slot-tiers/admin/${id}/toggle`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            const data = await response.json();
            
            if (data.success) {
                toast.success('Tier status updated');
                fetchTiers();
            } else {
                toast.error(data.message || 'Failed to update status');
            }
        } catch (error) {
            toast.error('Error updating status');
            console.error(error);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const openCreateModal = () => {
        setEditingTier(null);
        setFormData({
            name: '',
            betAmount: '',
            winAmount: '',
            winProbability: '10',
            description: '',
            order: '0'
        });
        setShowModal(true);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 p-6">
            {/* Header with Gradient Background */}
            <div className="mb-8">
                <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl shadow-2xl p-8 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="text-5xl">🎰</div>
                                <h1 className="text-4xl font-bold">Slot Machine Management</h1>
                            </div>
                            <p className="text-blue-100 text-lg">Comprehensive control over slot machine operations and betting configurations</p>
                        </div>
                        <div className="hidden lg:block">
                            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 border border-white/30">
                                <div className="text-center">
                                    <div className="text-3xl mb-1">💎</div>
                                    <div className="text-sm font-semibold">Premium</div>
                                    <div className="text-xs text-blue-100">Gaming System</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tab Navigation with Modern Design */}
            <div className="bg-white rounded-2xl shadow-lg mb-8 overflow-hidden border border-gray-100">
                <div className="flex">
                    <button
                        onClick={() => setActiveTab('results')}
                        className={`flex-1 px-8 py-5 text-center font-semibold transition-all duration-300 relative ${
                            activeTab === 'results'
                                ? 'text-blue-600 bg-gradient-to-br from-blue-50 to-purple-50'
                                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                        }`}
                    >
                        <div className="flex items-center justify-center gap-3">
                            <span className="text-2xl">📊</span>
                            <span className="text-lg">Spin Results & Statistics</span>
                        </div>
                        {activeTab === 'results' && (
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-purple-600"></div>
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('tiers')}
                        className={`flex-1 px-8 py-5 text-center font-semibold transition-all duration-300 relative ${
                            activeTab === 'tiers'
                                ? 'text-blue-600 bg-gradient-to-br from-blue-50 to-purple-50'
                                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                        }`}
                    >
                        <div className="flex items-center justify-center gap-3">
                            <span className="text-2xl">🎯</span>
                            <span className="text-lg">Betting Tiers Configuration</span>
                        </div>
                        {activeTab === 'tiers' && (
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-purple-600"></div>
                        )}
                    </button>
                </div>
            </div>

            {/* Spin Results Section */}
            {activeTab === 'results' && (
                <div>
                    <div className="flex justify-end gap-3 mb-6">
                        <button
                            onClick={exportToCSV}
                            className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-2 font-semibold"
                        >
                            <span className="text-xl">📥</span> Export CSV
                        </button>
                        <button
                            onClick={fetchSpinResults}
                            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-2 font-semibold"
                        >
                            <FiRefreshCw className="text-lg" /> Refresh
                        </button>
                    </div>

                    {/* Stats Cards with Enhanced Design */}
                    {stats && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 border border-gray-100 transform hover:-translate-y-1">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl p-3 shadow-lg">
                                        <div className="text-3xl">🎰</div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Total Plays</p>
                                        <p className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{stats.totalSpins}</p>
                                    </div>
                                </div>
                                <div className="h-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"></div>
                            </div>

                            <div className="bg-gradient-to-br from-white to-green-50 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 border border-green-100 transform hover:-translate-y-1">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-3 shadow-lg">
                                        <div className="text-3xl">🎉</div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Total Jackpots</p>
                                        <p className="text-4xl font-bold text-green-600">{stats.wins}</p>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-gray-600 font-medium">Win Rate</span>
                                    <span className="text-sm font-bold text-green-600">
                                        {stats.totalSpins > 0 ? ((stats.wins / stats.totalSpins) * 100).toFixed(1) : 0}%
                                    </span>
                                </div>
                                <div className="h-1 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full mt-2"></div>
                            </div>

                            <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 border border-blue-100 transform hover:-translate-y-1">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl p-3 shadow-lg">
                                        <div className="text-3xl">💰</div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Total Collected</p>
                                        <p className="text-3xl font-bold text-blue-600">{stats.totalPaid} <span className="text-lg">ETB</span></p>
                                    </div>
                                </div>
                                <div className="h-1 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-full"></div>
                            </div>

                            <div className="bg-gradient-to-br from-white to-red-50 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 border border-red-100 transform hover:-translate-y-1">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="bg-gradient-to-br from-red-500 to-pink-600 rounded-xl p-3 shadow-lg">
                                        <div className="text-3xl">💸</div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Total Paid Out</p>
                                        <p className="text-3xl font-bold text-red-600">{stats.totalWon} <span className="text-lg">ETB</span></p>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-gray-600 font-medium">Net Profit</span>
                                    <span className={`text-sm font-bold ${stats.totalPaid - stats.totalWon >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {stats.totalPaid - stats.totalWon >= 0 ? '+' : ''}{stats.totalPaid - stats.totalWon} ETB
                                    </span>
                                </div>
                                <div className="h-1 bg-gradient-to-r from-red-500 to-pink-600 rounded-full mt-2"></div>
                            </div>
                        </div>
                    )}

                    {/* Filters with Modern Design */}
                    <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg p-2">
                                <FiFilter className="text-white text-lg" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800">Advanced Filters</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Result Type</label>
                                <select
                                    name="result"
                                    value={filters.result}
                                    onChange={handleFilterChange}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-gray-50 hover:bg-white"
                                >
                                    <option value="">All Results</option>
                                    <option value="Win 100 ETB">🎉 Jackpots Only</option>
                                    <option value="Try Again">❌ No Match Only</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Start Date</label>
                                <input
                                    type="date"
                                    name="startDate"
                                    value={filters.startDate}
                                    onChange={handleFilterChange}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-gray-50 hover:bg-white"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">End Date</label>
                                <input
                                    type="date"
                                    name="endDate"
                                    value={filters.endDate}
                                    onChange={handleFilterChange}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-gray-50 hover:bg-white"
                                />
                            </div>

                            <div className="flex items-end">
                                <button
                                    onClick={clearFilters}
                                    className="w-full px-4 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all duration-300 font-semibold shadow-md hover:shadow-lg"
                                >
                                    Clear Filters
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Results Table with Enhanced Design */}
                    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                                    <tr>
                                        <th className="px-6 py-5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                            Date & Time
                                        </th>
                                        <th className="px-6 py-5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                            User
                                        </th>
                                        <th className="px-6 py-5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                            Membership
                                        </th>
                                        <th className="px-6 py-5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                            Result
                                        </th>
                                        <th className="px-6 py-5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                            Paid
                                        </th>
                                        <th className="px-6 py-5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                            Won
                                        </th>
                                        <th className="px-6 py-5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                            Balance Before
                                        </th>
                                        <th className="px-6 py-5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                            Balance After
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 bg-white">
                                    {loadingSpins ? (
                                        <tr>
                                            <td colSpan="8" className="px-6 py-16 text-center">
                                                <div className="flex flex-col items-center justify-center gap-4">
                                                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
                                                    <p className="text-gray-500 font-medium">Loading results...</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : spins.length === 0 ? (
                                        <tr>
                                            <td colSpan="8" className="px-6 py-16 text-center">
                                                <div className="flex flex-col items-center gap-3">
                                                    <div className="text-6xl">🎰</div>
                                                    <p className="text-gray-500 text-lg font-medium">No slot machine results found</p>
                                                    <p className="text-gray-400 text-sm">Try adjusting your filters</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        spins.map((spin, index) => (
                                            <tr key={spin._id} className={`hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-200 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                                                    {new Date(spin.createdAt).toLocaleString()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                                                    {spin.userId?.phone || 'N/A'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="px-3 py-1.5 text-xs font-bold rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md">
                                                        {spin.userId?.membershipLevel || 'N/A'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {spin.result === 'Win 100 ETB' ? (
                                                        <span className="px-4 py-2 text-sm font-bold rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg inline-flex items-center gap-2">
                                                            <span className="text-lg">🎉</span> Win 100 ETB
                                                        </span>
                                                    ) : (
                                                        <span className="px-4 py-2 text-sm font-bold rounded-xl bg-gradient-to-r from-red-500 to-pink-600 text-white shadow-lg inline-flex items-center gap-2">
                                                            <span className="text-lg">❌</span> Try Again
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-bold">
                                                    -{spin.amountPaid} ETB
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold">
                                                    {spin.amountWon > 0 ? (
                                                        <span className="text-green-600">+{spin.amountWon} ETB</span>
                                                    ) : (
                                                        <span className="text-gray-400">0 ETB</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-semibold">
                                                    {spin.balanceBefore.toFixed(2)} ETB
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-semibold">
                                                    {spin.balanceAfter.toFixed(2)} ETB
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination with Modern Design */}
                        {pagination.pages > 1 && (
                            <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-5 flex items-center justify-between border-t-2 border-gray-200">
                                <div className="text-sm text-gray-700 font-semibold">
                                    Showing page <span className="text-blue-600 font-bold">{pagination.page}</span> of <span className="text-blue-600 font-bold">{pagination.pages}</span> 
                                    <span className="text-gray-500 ml-2">({pagination.total} total results)</span>
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                                        disabled={pagination.page === 1}
                                        className="px-6 py-2.5 bg-white border-2 border-gray-300 rounded-xl hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 hover:text-white hover:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-semibold shadow-md hover:shadow-lg"
                                    >
                                        ← Previous
                                    </button>
                                    <button
                                        onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                                        disabled={pagination.page === pagination.pages}
                                        className="px-6 py-2.5 bg-white border-2 border-gray-300 rounded-xl hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 hover:text-white hover:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-semibold shadow-md hover:shadow-lg"
                                    >
                                        Next →
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Slot Tiers Section */}
            {activeTab === 'tiers' && (
                <div>
                    <div className="flex justify-end mb-6">
                        <button
                            onClick={openCreateModal}
                            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-2 font-semibold"
                        >
                            <FiPlus className="text-lg" /> Create New Tier
                        </button>
                    </div>

                    {loadingTiers ? (
                        <div className="text-center py-16">
                            <div className="flex flex-col items-center gap-4">
                                <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600"></div>
                                <p className="text-gray-500 font-medium text-lg">Loading tiers...</p>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {tiers.map((tier) => (
                                <div
                                    key={tier._id}
                                    className={`bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 border-2 transform hover:-translate-y-1 ${
                                        tier.isActive ? 'border-green-400 ring-2 ring-green-200' : 'border-gray-200'
                                    }`}
                                >
                                    <div className="flex justify-between items-start mb-5">
                                        <div>
                                            <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{tier.name}</h3>
                                            <span className={`inline-block px-3 py-1.5 rounded-full text-xs font-bold mt-2 shadow-md ${
                                                tier.isActive 
                                                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white' 
                                                    : 'bg-gray-200 text-gray-600'
                                            }`}>
                                                {tier.isActive ? '✓ Active' : '○ Inactive'}
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => handleToggleStatus(tier._id)}
                                            className="text-3xl transition-transform hover:scale-110"
                                        >
                                            {tier.isActive ? (
                                                <FiToggleRight className="text-green-600" />
                                            ) : (
                                                <FiToggleLeft className="text-gray-400" />
                                            )}
                                        </button>
                                    </div>

                                    <div className="space-y-3 mb-5 bg-white rounded-xl p-4 shadow-inner">
                                        <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                                            <span className="text-gray-600 font-semibold text-sm">Bet Amount:</span>
                                            <span className="font-bold text-red-600 text-lg">{tier.betAmount} ETB</span>
                                        </div>
                                        <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                                            <span className="text-gray-600 font-semibold text-sm">Win Amount:</span>
                                            <span className="font-bold text-green-600 text-lg">{tier.winAmount} ETB</span>
                                        </div>
                                        <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                                            <span className="text-gray-600 font-semibold text-sm">Win Rate:</span>
                                            <span className="font-bold text-blue-600 text-lg">{tier.winProbability}%</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600 font-semibold text-sm">Multiplier:</span>
                                            <span className="font-bold text-purple-600 text-lg">{(tier.winAmount / tier.betAmount).toFixed(1)}x</span>
                                        </div>
                                    </div>

                                    {tier.description && (
                                        <p className="text-sm text-gray-600 mb-4 italic bg-blue-50 p-3 rounded-lg border-l-4 border-blue-400">{tier.description}</p>
                                    )}

                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => handleEdit(tier)}
                                            className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 flex items-center justify-center gap-2 font-semibold shadow-md hover:shadow-lg"
                                        >
                                            <FiEdit2 /> Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(tier._id)}
                                            className="flex-1 px-4 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-300 flex items-center justify-center gap-2 font-semibold shadow-md hover:shadow-lg"
                                        >
                                            <FiTrash2 /> Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {tiers.length === 0 && !loadingTiers && (
                        <div className="text-center py-16 bg-white rounded-2xl shadow-lg border-2 border-dashed border-gray-300">
                            <div className="flex flex-col items-center gap-4">
                                <div className="text-8xl">🎯</div>
                                <p className="text-gray-500 text-xl font-semibold">No tiers created yet</p>
                                <p className="text-gray-400 text-sm">Create your first betting tier to get started</p>
                                <button
                                    onClick={openCreateModal}
                                    className="mt-4 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl font-semibold text-lg"
                                >
                                    <FiPlus className="inline mr-2" /> Create Your First Tier
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Modal for Creating/Editing Tiers with Enhanced Design */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
                    <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl border border-gray-100 transform transition-all">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl p-3">
                                <span className="text-3xl">{editingTier ? '✏️' : '➕'}</span>
                            </div>
                            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                {editingTier ? 'Edit Tier' : 'Create New Tier'}
                            </h2>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Tier Name *
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-gray-50 hover:bg-white font-medium"
                                    placeholder="e.g., Bronze, Silver, Gold"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        Bet Amount (ETB) *
                                    </label>
                                    <input
                                        type="number"
                                        name="betAmount"
                                        value={formData.betAmount}
                                        onChange={handleChange}
                                        required
                                        min="1"
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-gray-50 hover:bg-white font-medium"
                                        placeholder="e.g., 10"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        Win Amount (ETB) *
                                    </label>
                                    <input
                                        type="number"
                                        name="winAmount"
                                        value={formData.winAmount}
                                        onChange={handleChange}
                                        required
                                        min="1"
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-gray-50 hover:bg-white font-medium"
                                        placeholder="e.g., 1000"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        Win Probability (%) *
                                    </label>
                                    <input
                                        type="number"
                                        name="winProbability"
                                        value={formData.winProbability}
                                        onChange={handleChange}
                                        required
                                        min="0"
                                        max="100"
                                        step="0.1"
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-gray-50 hover:bg-white font-medium"
                                        placeholder="e.g., 10"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        Display Order
                                    </label>
                                    <input
                                        type="number"
                                        name="order"
                                        value={formData.order}
                                        onChange={handleChange}
                                        min="0"
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-gray-50 hover:bg-white font-medium"
                                        placeholder="0"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Description
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows="3"
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-gray-50 hover:bg-white font-medium resize-none"
                                    placeholder="Optional description for this tier"
                                />
                            </div>

                            <div className="flex gap-3 pt-4 border-t-2 border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowModal(false);
                                        setEditingTier(null);
                                    }}
                                    className="flex-1 px-6 py-3 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 transition-all duration-300 font-semibold shadow-md hover:shadow-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl"
                                >
                                    {editingTier ? '✓ Update Tier' : '+ Create Tier'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SlotMachine;
