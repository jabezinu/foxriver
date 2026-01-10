import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, TrendingUp } from 'lucide-react';
import axios from 'axios';

export default function WealthFunds() {
    const [funds, setFunds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingFund, setEditingFund] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        image: '',
        days: '',
        profitType: 'percentage',
        dailyProfit: '',
        minimumDeposit: '',
        description: '',
        isActive: true
    });

    useEffect(() => {
        fetchFunds();
    }, []);

    const fetchFunds = async () => {
        try {
            const token = localStorage.getItem('foxriver_admin_token');
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/wealth/admin/funds`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setFunds(response.data.data);
        } catch (error) {
            console.error('Error fetching funds:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('foxriver_admin_token');
            
            if (editingFund) {
                await axios.put(
                    `${import.meta.env.VITE_API_URL}/wealth/admin/funds/${editingFund._id}`,
                    formData,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            } else {
                await axios.post(
                    `${import.meta.env.VITE_API_URL}/wealth/admin/funds`,
                    formData,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            }
            
            fetchFunds();
            handleCloseModal();
        } catch (error) {
            console.error('Error saving fund:', error);
            alert(error.response?.data?.message || 'Error saving fund');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this wealth fund?')) return;
        
        try {
            const token = localStorage.getItem('foxriver_admin_token');
            await axios.delete(`${import.meta.env.VITE_API_URL}/wealth/admin/funds/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchFunds();
        } catch (error) {
            console.error('Error deleting fund:', error);
            alert(error.response?.data?.message || 'Error deleting fund');
        }
    };

    const handleEdit = (fund) => {
        setEditingFund(fund);
        setFormData({
            name: fund.name,
            image: fund.image,
            days: fund.days,
            profitType: fund.profitType,
            dailyProfit: fund.dailyProfit,
            minimumDeposit: fund.minimumDeposit,
            description: fund.description,
            isActive: fund.isActive
        });
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingFund(null);
        setFormData({
            name: '',
            image: '',
            days: '',
            profitType: 'percentage',
            dailyProfit: '',
            minimumDeposit: '',
            description: '',
            isActive: true
        });
    };

    if (loading) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Wealth Funds</h1>
                    <p className="text-gray-600 mt-1">Manage investment opportunities</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
                >
                    <Plus size={20} />
                    Add Wealth Fund
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {funds.map((fund) => (
                    <div key={fund._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                        <img
                            src={fund.image}
                            alt={fund.name}
                            className="w-full h-48 object-cover"
                        />
                        <div className="p-4">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="text-lg font-bold text-gray-900">{fund.name}</h3>
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                    fund.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                }`}>
                                    {fund.isActive ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                            
                            <p className="text-sm text-gray-600 mb-4 line-clamp-2">{fund.description}</p>
                            
                            <div className="space-y-2 mb-4">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Duration:</span>
                                    <span className="font-semibold">{fund.days} Days</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Daily Profit:</span>
                                    <span className="font-semibold text-green-600">
                                        {fund.profitType === 'percentage' ? `${fund.dailyProfit}%` : `${fund.dailyProfit} ETB`}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Min. Deposit:</span>
                                    <span className="font-semibold">ETB {fund.minimumDeposit}</span>
                                </div>
                            </div>
                            
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleEdit(fund)}
                                    className="flex-1 flex items-center justify-center gap-2 bg-blue-50 text-blue-600 px-3 py-2 rounded-lg hover:bg-blue-100"
                                >
                                    <Edit2 size={16} />
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(fund._id)}
                                    className="flex-1 flex items-center justify-center gap-2 bg-red-50 text-red-600 px-3 py-2 rounded-lg hover:bg-red-100"
                                >
                                    <Trash2 size={16} />
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {funds.length === 0 && (
                <div className="text-center py-12">
                    <TrendingUp className="mx-auto text-gray-400 mb-4" size={48} />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Wealth Funds</h3>
                    <p className="text-gray-600">Create your first wealth fund to get started</p>
                </div>
            )}

            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <h2 className="text-xl font-bold mb-4">
                                {editingFund ? 'Edit Wealth Fund' : 'Create Wealth Fund'}
                            </h2>
                            
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Fund Name
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Image URL
                                    </label>
                                    <input
                                        type="url"
                                        value={formData.image}
                                        onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Duration (Days)
                                        </label>
                                        <input
                                            type="number"
                                            value={formData.days}
                                            onChange={(e) => setFormData({ ...formData, days: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                            required
                                            min="1"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Profit Type
                                        </label>
                                        <select
                                            value={formData.profitType}
                                            onChange={(e) => setFormData({ ...formData, profitType: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                        >
                                            <option value="percentage">Percentage (%)</option>
                                            <option value="fixed">Fixed Amount (ETB)</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Daily Profit {formData.profitType === 'percentage' ? '(%)' : '(ETB)'}
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={formData.dailyProfit}
                                            onChange={(e) => setFormData({ ...formData, dailyProfit: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                            required
                                            min="0"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Minimum Deposit (ETB)
                                        </label>
                                        <input
                                            type="number"
                                            value={formData.minimumDeposit}
                                            onChange={(e) => setFormData({ ...formData, minimumDeposit: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                            required
                                            min="0"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Description
                                    </label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                        rows="4"
                                        required
                                    />
                                </div>

                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="isActive"
                                        checked={formData.isActive}
                                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                        className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                    />
                                    <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
                                        Active (visible to users)
                                    </label>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={handleCloseModal}
                                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                                    >
                                        {editingFund ? 'Update' : 'Create'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
