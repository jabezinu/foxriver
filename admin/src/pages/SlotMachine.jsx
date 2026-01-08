import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { adminSpinAPI } from '../services/api';
import { FiPlus, FiEdit2, FiTrash2, FiToggleLeft, FiToggleRight, FiRefreshCw, FiFilter } from 'react-icons/fi';

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
            const response = await fetch('http://localhost:5002/api/slot-tiers/admin/all', {
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
                ? `http://localhost:5002/api/slot-tiers/admin/${editingTier._id}`
                : 'http://localhost:5002/api/slot-tiers/admin';
            
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
            const response = await fetch(`http://localhost:5002/api/slot-tiers/admin/${id}`, {
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
            const response = await fetch(`http://localhost:5002/api/slot-tiers/admin/${id}/toggle`, {
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
        <div className="p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">🎰 Slot Machine Management</h1>
                    <p className="text-gray-600 mt-1">Manage slot machine results and betting tiers</p>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="bg-white rounded-xl shadow-md mb-6">
                <div className="flex border-b border-gray-200">
                    <button
                        onClick={() => setActiveTab('results')}
                        className={`flex-1 px-6 py-4 text-center font-semibold transition-colors ${
                            activeTab === 'results'
                                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                        }`}
                    >
                        📊 Spin Results & Statistics
                    </button>
                    <button
                        onClick={() => setActiveTab('tiers')}
                        className={`flex-1 px-6 py-4 text-center font-semibold transition-colors ${
                            activeTab === 'tiers'
                                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                        }`}
                    >
                        🎯 Betting Tiers Configuration
                    </button>
                </div>
            </div>

            {/* Spin Results Section */}
            {activeTab === 'results' && (
                <div>
                    <div className="flex justify-end gap-3 mb-6">
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

                    {/* Stats Cards */}
                    {stats && (
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                            <div className="bg-white rounded-xl shadow-md p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-600 text-sm">Total Plays</p>
                                        <p className="text-3xl font-bold text-gray-800">{stats.totalSpins}</p>
                                    </div>
                                    <div className="text-4xl">🎰</div>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl shadow-md p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-600 text-sm">Total Jackpots</p>
                                        <p className="text-3xl font-bold text-green-600">{stats.wins}</p>
                                        <p className="text-xs text-gray-500">
                                            {stats.totalSpins > 0 ? ((stats.wins / stats.totalSpins) * 100).toFixed(1) : 0}% jackpot rate
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
                                    <option value="Win 100 ETB">Jackpots Only</option>
                                    <option value="Try Again">No Match Only</option>
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
                                    {loadingSpins ? (
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
                                                No slot machine results found
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
            )}

            {/* Slot Tiers Section */}
            {activeTab === 'tiers' && (
                <div>
                    <div className="flex justify-end mb-6">
                        <button
                            onClick={openCreateModal}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                        >
                            <FiPlus /> Create New Tier
                        </button>
                    </div>

                    {loadingTiers ? (
                        <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {tiers.map((tier) => (
                                <div
                                    key={tier._id}
                                    className={`bg-white rounded-xl shadow-md p-6 border-2 ${
                                        tier.isActive ? 'border-green-500' : 'border-gray-300'
                                    }`}
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-800">{tier.name}</h3>
                                            <span className={`inline-block px-2 py-1 rounded text-xs font-semibold mt-1 ${
                                                tier.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                            }`}>
                                                {tier.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => handleToggleStatus(tier._id)}
                                            className="text-2xl"
                                        >
                                            {tier.isActive ? (
                                                <FiToggleRight className="text-green-600" />
                                            ) : (
                                                <FiToggleLeft className="text-gray-400" />
                                            )}
                                        </button>
                                    </div>

                                    <div className="space-y-3 mb-4">
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">Bet Amount:</span>
                                            <span className="font-bold text-red-600">{tier.betAmount} ETB</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">Win Amount:</span>
                                            <span className="font-bold text-green-600">{tier.winAmount} ETB</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">Win Rate:</span>
                                            <span className="font-bold text-blue-600">{tier.winProbability}%</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">Multiplier:</span>
                                            <span className="font-bold text-purple-600">{(tier.winAmount / tier.betAmount).toFixed(1)}x</span>
                                        </div>
                                    </div>

                                    {tier.description && (
                                        <p className="text-sm text-gray-600 mb-4 italic">{tier.description}</p>
                                    )}

                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleEdit(tier)}
                                            className="flex-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors flex items-center justify-center gap-2"
                                        >
                                            <FiEdit2 /> Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(tier._id)}
                                            className="flex-1 px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors flex items-center justify-center gap-2"
                                        >
                                            <FiTrash2 /> Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {tiers.length === 0 && !loadingTiers && (
                        <div className="text-center py-12">
                            <p className="text-gray-500 text-lg">No tiers created yet</p>
                            <button
                                onClick={openCreateModal}
                                className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Create Your First Tier
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Modal for Creating/Editing Tiers */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl p-6 max-w-md w-full">
                        <h2 className="text-2xl font-bold mb-4">
                            {editingTier ? 'Edit Tier' : 'Create New Tier'}
                        </h2>
                        
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Tier Name *
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="e.g., Bronze, Silver, Gold"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Bet Amount (ETB) *
                                </label>
                                <input
                                    type="number"
                                    name="betAmount"
                                    value={formData.betAmount}
                                    onChange={handleChange}
                                    required
                                    min="1"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="e.g., 10"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Win Amount (ETB) *
                                </label>
                                <input
                                    type="number"
                                    name="winAmount"
                                    value={formData.winAmount}
                                    onChange={handleChange}
                                    required
                                    min="1"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="e.g., 1000"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
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
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="e.g., 10"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Description
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows="2"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Optional description"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Display Order
                                </label>
                                <input
                                    type="number"
                                    name="order"
                                    value={formData.order}
                                    onChange={handleChange}
                                    min="0"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="0"
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowModal(false);
                                        setEditingTier(null);
                                    }}
                                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    {editingTier ? 'Update' : 'Create'}
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
