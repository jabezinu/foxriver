import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2, FiToggleLeft, FiToggleRight } from 'react-icons/fi';

const SlotTiers = () => {
    const [tiers, setTiers] = useState([]);
    const [loading, setLoading] = useState(true);
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
        fetchTiers();
    }, []);

    const fetchTiers = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('adminToken');
            const response = await fetch('http://localhost:5000/api/slot-tiers/admin/all', {
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
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            const token = localStorage.getItem('adminToken');
            const url = editingTier
                ? `http://localhost:5000/api/slot-tiers/admin/${editingTier._id}`
                : 'http://localhost:5000/api/slot-tiers/admin';
            
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
            const token = localStorage.getItem('adminToken');
            const response = await fetch(`http://localhost:5000/api/slot-tiers/admin/${id}`, {
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
            const token = localStorage.getItem('adminToken');
            const response = await fetch(`http://localhost:5000/api/slot-tiers/admin/${id}/toggle`, {
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
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">🎰 Slot Machine Tiers</h1>
                    <p className="text-gray-600 mt-1">Manage betting tiers and win amounts</p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                    <FiPlus /> Create New Tier
                </button>
            </div>

            {loading ? (
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

            {tiers.length === 0 && !loading && (
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

            {/* Modal */}
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

export default SlotTiers;
