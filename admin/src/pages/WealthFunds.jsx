import { useState, useEffect } from 'react';
import { adminWealthAPI } from '../services/api';
import { getServerUrl } from '../config/api.config';
import { toast } from 'react-hot-toast';
import {
    HiPlus, HiPencil, HiTrash, HiTrendingUp, HiUsers,
    HiCheckCircle, HiXCircle, HiInformationCircle,
    HiCurrencyDollar, HiCalendar, HiPhotograph, HiUpload
} from 'react-icons/hi';
import Loading from '../components/Loading';
import ConfirmModal from '../components/ConfirmModal';

export default function WealthFunds() {
    const [activeTab, setActiveTab] = useState('funds'); // 'funds' or 'investments'
    const [funds, setFunds] = useState([]);
    const [investments, setInvestments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const [editingFund, setEditingFund] = useState(null);

    // File upload states
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        days: '',
        profitType: 'percentage',
        dailyProfit: '',
        minimumDeposit: '',
        description: '',
        isActive: true
    });

    useEffect(() => {
        if (activeTab === 'funds') {
            fetchFunds();
        } else {
            fetchInvestments();
        }
    }, [activeTab]);

    const fetchFunds = async () => {
        setLoading(true);
        try {
            const response = await adminWealthAPI.getAllFunds();
            setFunds(response.data.data);
        } catch (error) {
            console.error('Error fetching funds:', error);
            toast.error('Failed to fetch wealth funds');
        } finally {
            setLoading(false);
        }
    };

    const fetchInvestments = async () => {
        setLoading(true);
        try {
            const response = await adminWealthAPI.getAllInvestments();
            setInvestments(response.data.data);
        } catch (error) {
            console.error('Error fetching investments:', error);
            toast.error('Failed to fetch investments');
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const data = new FormData();
            data.append('name', formData.name);
            data.append('days', formData.days);
            data.append('profitType', formData.profitType);
            data.append('dailyProfit', formData.dailyProfit);
            data.append('minimumDeposit', formData.minimumDeposit);
            data.append('description', formData.description);
            data.append('isActive', formData.isActive);

            if (selectedFile) {
                data.append('image', selectedFile);
            }

            if (editingFund) {
                await adminWealthAPI.updateFund(editingFund._id, data);
                toast.success('Wealth fund updated successfully');
            } else {
                if (!selectedFile) {
                    return toast.error('Please select an image file');
                }
                await adminWealthAPI.createFund(data);
                toast.success('Wealth fund created successfully');
            }

            fetchFunds();
            handleCloseModal();
        } catch (error) {
            console.error('Error saving fund:', error);
            toast.error(error.response?.data?.message || 'Error saving fund');
        }
    };

    const handleDelete = async () => {
        try {
            await adminWealthAPI.deleteFund(deleteId);
            toast.success('Wealth fund deleted successfully');
            fetchFunds();
        } catch (error) {
            console.error('Error deleting fund:', error);
            toast.error(error.response?.data?.message || 'Error deleting fund');
        } finally {
            setDeleteId(null);
        }
    };

    const handleEdit = (fund) => {
        setEditingFund(fund);
        setFormData({
            name: fund.name,
            days: fund.days,
            profitType: fund.profitType,
            dailyProfit: fund.dailyProfit,
            minimumDeposit: fund.minimumDeposit,
            description: fund.description,
            isActive: fund.isActive
        });

        // Show existing image as preview
        if (fund.image) {
            const imageUrl = fund.image.startsWith('http')
                ? fund.image
                : `${getServerUrl()}${fund.image}`;
            setPreviewUrl(imageUrl);
        }

        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingFund(null);
        setSelectedFile(null);
        setPreviewUrl(null);
        setFormData({
            name: '',
            days: '',
            profitType: 'percentage',
            dailyProfit: '',
            minimumDeposit: '',
            description: '',
            isActive: true
        });
    };

    const renderImageUrl = (image) => {
        if (!image) return null;
        return image.startsWith('http') ? image : `${getServerUrl()}${image}`;
    };

    return (
        <div className="animate-fadeIn">
            <ConfirmModal
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={handleDelete}
                title="Delete Wealth Fund"
                message="Are you sure you want to remove this investment fund? This action cannot be undone."
                confirmText="Delete Fund"
                isDangerous={true}
            />

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Wealth Management</h1>
                    <p className="text-sm text-gray-500">Manage investment funds and monitor user participation.</p>
                </div>
                {activeTab === 'funds' && (
                    <button
                        onClick={() => setShowModal(true)}
                        className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold text-xs uppercase hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                    >
                        <HiPlus className="text-lg" />
                        Create New Fund
                    </button>
                )}
            </div>

            {/* Tabs */}
            <div className="flex bg-white p-1 rounded-xl shadow-sm border border-gray-100 mb-8 max-w-md">
                <button
                    onClick={() => setActiveTab('funds')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'funds'
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                        }`}
                >
                    <HiTrendingUp className="text-lg" />
                    Wealth Funds
                </button>
                <button
                    onClick={() => setActiveTab('investments')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'investments'
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                        }`}
                >
                    <HiUsers className="text-lg" />
                    Active Investments
                </button>
            </div>

            {loading ? (
                <div className="h-64 flex items-center justify-center">
                    <Loading />
                </div>
            ) : activeTab === 'funds' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {funds.map((fund) => (
                        <div key={fund._id} className="admin-card overflow-hidden group">
                            <div className="relative h-48 -mx-6 -mt-6 mb-4">
                                <img
                                    src={renderImageUrl(fund.image)}
                                    alt={fund.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute top-4 right-4">
                                    <span className={`status-badge ${fund.isActive ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200' : 'bg-gray-500 text-white shadow-lg shadow-gray-200'}`}>
                                        {fund.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                            </div>

                            <h3 className="text-lg font-bold text-gray-800 mb-2 truncate">{fund.name}</h3>
                            <p className="text-xs text-gray-500 mb-6 line-clamp-2 min-h-[2rem]">
                                {fund.description}
                            </p>

                            <div className="space-y-3 mb-8 bg-gray-50 p-4 rounded-xl">
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-gray-400 font-bold uppercase tracking-widest flex items-center gap-1">
                                        <HiCalendar className="text-sm" /> Duration
                                    </span>
                                    <span className="font-bold text-gray-800">{fund.days} Days</span>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-gray-400 font-bold uppercase tracking-widest flex items-center gap-1">
                                        <HiTrendingUp className="text-sm" /> Daily Profit
                                    </span>
                                    <span className="font-bold text-emerald-600">
                                        {fund.profitType === 'percentage' ? `${fund.dailyProfit}%` : `${fund.dailyProfit} ETB`}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-gray-400 font-bold uppercase tracking-widest flex items-center gap-1">
                                        <HiCurrencyDollar className="text-sm" /> Min. Deposit
                                    </span>
                                    <span className="font-bold text-gray-800">ETB {fund.minimumDeposit}</span>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => handleEdit(fund)}
                                    className="flex-1 flex items-center justify-center gap-2 bg-indigo-50 text-indigo-600 py-3 rounded-xl hover:bg-indigo-600 hover:text-white transition-all text-xs font-bold uppercase tracking-wider"
                                >
                                    <HiPencil /> Edit
                                </button>
                                <button
                                    onClick={() => setDeleteId(fund._id)}
                                    className="w-12 h-12 flex items-center justify-center bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"
                                >
                                    <HiTrash className="text-lg" />
                                </button>
                            </div>
                        </div>
                    ))}

                    {funds.length === 0 && (
                        <div className="col-span-full py-20 text-center admin-card flex flex-col items-center justify-center text-gray-400">
                            <HiTrendingUp className="text-6xl mb-4 text-gray-100" />
                            <p className="font-bold uppercase tracking-widest">No wealth funds found</p>
                        </div>
                    )}
                </div>
            ) : (
                <div className="admin-card p-0 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr>
                                    <th className="table-header">Investor</th>
                                    <th className="table-header">Fund</th>
                                    <th className="table-header">Amount</th>
                                    <th className="table-header">Ends In</th>
                                    <th className="table-header">Status</th>
                                    <th className="table-header text-right">Revenue</th>
                                </tr>
                            </thead>
                            <tbody>
                                {investments.map((inv) => (
                                    <tr key={inv._id} className="table-row">
                                        <td className="px-6 py-4">
                                            <div>
                                                <div className="font-bold text-gray-800">{inv.user?.phone || 'Unknown User'}</div>
                                                <div className="text-[10px] text-gray-400 font-bold uppercase">{inv.user?.name || 'Customer'}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0">
                                                    <img src={renderImageUrl(inv.wealthFund?.image)} className="w-full h-full object-cover" />
                                                </div>
                                                <span className="text-xs font-bold text-gray-700">{inv.wealthFund?.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-xs font-bold text-gray-800">ETB {inv.amount}</div>
                                            <div className="text-[9px] text-gray-400">
                                                I: {inv.fundingSource?.incomeWallet} | P: {inv.fundingSource?.personalWallet}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-xs font-medium text-gray-500">
                                            {new Date(inv.endDate).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`status-badge ${inv.status === 'active' ? 'status-approved' :
                                                inv.status === 'completed' ? 'status-pending' : 'status-rejected'
                                                }`}>
                                                {inv.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="text-xs font-black text-emerald-600">ETB {inv.totalRevenue?.toFixed(2)}</div>
                                            <div className="text-[9px] text-gray-400 font-bold">
                                                +{inv.profitType === 'percentage' ? `${inv.dailyProfit}%` : `${inv.dailyProfit} ETB`}/day
                                            </div>
                                        </td>
                                    </tr>
                                ))}

                                {investments.length === 0 && (
                                    <tr>
                                        <td colSpan="6" className="py-20 text-center text-gray-400 font-bold uppercase tracking-widest bg-gray-50/30">
                                            No active investments to display
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Fund Editor Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fadeIn">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 shrink-0">
                            <div>
                                <h3 className="font-bold text-gray-800">{editingFund ? 'Edit Wealth Fund' : 'New Wealth Fund'}</h3>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Configure investment parameters</p>
                            </div>
                            <button onClick={handleCloseModal} className="text-gray-400 hover:text-red-500 transition-colors">
                                <HiXCircle className="text-2xl" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Fund Name</label>
                                    <div className="relative">
                                        <HiTrendingUp className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="admin-input pl-10"
                                            placeholder="e.g. Real Estate Growth"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Fund Image</label>
                                    <div
                                        onClick={() => document.getElementById('image-upload').click()}
                                        className="relative border-2 border-dashed border-gray-200 rounded-xl p-4 flex flex-col items-center justify-center gap-2 hover:border-indigo-400 hover:bg-indigo-50/30 cursor-pointer transition-all min-h-[140px]"
                                    >
                                        <input
                                            id="image-upload"
                                            type="file"
                                            onChange={handleFileChange}
                                            className="hidden"
                                            accept="image/*"
                                        />

                                        {previewUrl ? (
                                            <div className="relative w-full h-32 rounded-lg overflow-hidden group">
                                                <img
                                                    src={previewUrl}
                                                    className="w-full h-full object-cover"
                                                    alt="Preview"
                                                />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                                    <HiUpload className="text-white text-2xl" />
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center">
                                                    <HiPhotograph className="text-2xl text-gray-300" />
                                                </div>
                                                <p className="text-xs font-bold text-gray-400">Click to upload image</p>
                                                <p className="text-[10px] text-gray-300 uppercase font-black">PNG, JPG, WEBP (MAX 5MB)</p>
                                            </>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Duration (Days)</label>
                                    <div className="relative">
                                        <HiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
                                        <input
                                            type="number"
                                            value={formData.days}
                                            onChange={(e) => setFormData({ ...formData, days: e.target.value })}
                                            className="admin-input pl-10"
                                            min="1"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Profit Model</label>
                                    <select
                                        value={formData.profitType}
                                        onChange={(e) => setFormData({ ...formData, profitType: e.target.value })}
                                        className="admin-input"
                                    >
                                        <option value="percentage">Percentage (%)</option>
                                        <option value="fixed">Fixed Amount (ETB)</option>
                                    </select>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">
                                        Daily Return {formData.profitType === 'percentage' ? '(%)' : '(ETB)'}
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={formData.dailyProfit}
                                            onChange={(e) => setFormData({ ...formData, dailyProfit: e.target.value })}
                                            className="admin-input text-emerald-600 font-bold"
                                            min="0"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Minimum Stake (ETB)</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={formData.minimumDeposit}
                                            onChange={(e) => setFormData({ ...formData, minimumDeposit: e.target.value })}
                                            className="admin-input"
                                            min="0"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="admin-input min-h-[100px] resize-none"
                                    placeholder="Explain this investment opportunity..."
                                    required
                                />
                            </div>

                            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, isActive: !prev.isActive }))}
                                    className={`w-12 h-6 rounded-full transition-all relative ${formData.isActive ? 'bg-emerald-500' : 'bg-gray-300'}`}
                                >
                                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.isActive ? 'left-7' : 'left-1'}`} />
                                </button>
                                <div>
                                    <p className="text-xs font-bold text-gray-700">Set as Active</p>
                                    <p className="text-[10px] text-gray-400 font-medium">If disabled, this fund will be hidden from the client side.</p>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-gray-100 flex gap-3 shrink-0">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-500 font-bold text-xs uppercase hover:bg-gray-50 transition-all"
                                >
                                    Discard Changes
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-3 rounded-xl bg-indigo-600 text-white font-bold text-xs uppercase hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all"
                                >
                                    {editingFund ? 'Commit Updates' : 'Publish Fund'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
