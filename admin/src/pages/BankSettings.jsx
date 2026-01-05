import { useState, useEffect } from 'react';
import { adminBankAPI } from '../services/api';
import { toast } from 'react-hot-toast';
import { HiPlus, HiPencil, HiTrash, HiCheck, HiX, HiExclamation } from 'react-icons/hi';
import Loading from '../components/Loading';

export default function BankSettings() {
    const [banks, setBanks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBank, setEditingBank] = useState(null);
    const [formData, setFormData] = useState({
        bankName: '',
        accountNumber: '',
        accountHolderName: '',
        serviceType: 'Bank',
        isActive: true
    });

    useEffect(() => {
        fetchBanks();
    }, []);

    const fetchBanks = async () => {
        try {
            const res = await adminBankAPI.getAll();
            setBanks(res.data.data);
        } catch (error) {
            toast.error('Failed to fetch bank accounts');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (bank = null) => {
        if (bank) {
            setEditingBank(bank);
            setFormData({
                bankName: bank.bankName,
                accountNumber: bank.accountNumber,
                accountHolderName: bank.accountHolderName,
                serviceType: bank.serviceType || 'Bank',
                isActive: bank.isActive
            });
        } else {
            setEditingBank(null);
            setFormData({
                bankName: '',
                accountNumber: '',
                accountHolderName: '',
                serviceType: 'Bank',
                isActive: true
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingBank) {
                await adminBankAPI.update(editingBank._id, formData);
                toast.success('Bank account updated');
            } else {
                await adminBankAPI.create(formData);
                toast.success('Bank account created');
            }
            setIsModalOpen(false);
            fetchBanks();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Operation failed');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this bank account?')) {
            try {
                await adminBankAPI.delete(id);
                toast.success('Bank account deleted');
                fetchBanks();
            } catch (error) {
                toast.error('Failed to delete bank account');
            }
        }
    };

    if (loading) return <Loading />;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-white">Bank Settings</h1>
                    <p className="text-gray-400">Manage bank accounts for user deposits</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors font-bold"
                >
                    <HiPlus /> Add Bank Account
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {banks.map((bank) => (
                    <div key={bank._id} className="bg-gray-800 rounded-2xl p-6 border border-gray-700 hover:border-emerald-500/50 transition-all group">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${bank.isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                                }`}>
                                {bank.isActive ? 'Active' : 'Inactive'}
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleOpenModal(bank)}
                                    className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                                >
                                    <HiPencil />
                                </button>
                                <button
                                    onClick={() => handleDelete(bank._id)}
                                    className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                >
                                    <HiTrash />
                                </button>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div>
                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Bank Name</p>
                                <p className="text-white font-bold">{bank.bankName}</p>
                            </div>
                            <div>
                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Account Number</p>
                                <p className="text-emerald-400 font-mono font-bold text-lg select-all">{bank.accountNumber}</p>
                            </div>
                            <div>
                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Account Holder</p>
                                <p className="text-gray-300 font-medium">{bank.accountHolderName}</p>
                            </div>
                            <div>
                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Type</p>
                                <p className="text-gray-300">{bank.serviceType}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {banks.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 bg-gray-800/50 rounded-3xl border-2 border-dashed border-gray-700">
                    <HiExclamation className="text-5xl text-gray-600 mb-4" />
                    <p className="text-gray-400 font-medium">No bank accounts configured</p>
                    <button
                        onClick={() => handleOpenModal()}
                        className="mt-4 text-emerald-500 hover:underline font-bold"
                    >
                        Click here to add your first bank account
                    </button>
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-gray-800 rounded-3xl w-full max-w-md overflow-hidden border border-gray-700 shadow-2xl animate-scaleUp">
                        <div className="p-6 border-b border-gray-700 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-white">
                                {editingBank ? 'Edit Bank Account' : 'Add Bank Account'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white">
                                <HiX className="text-2xl" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1 ml-1">Bank/Service Name</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.bankName}
                                    onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                                    className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                                    placeholder="e.g. Commercial Bank of Ethiopia"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1 ml-1">Account/Phone Number</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.accountNumber}
                                    onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                                    className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                                    placeholder="e.g. 1000123456789"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1 ml-1">Account Holder Name</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.accountHolderName}
                                    onChange={(e) => setFormData({ ...formData, accountHolderName: e.target.value })}
                                    className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                                    placeholder="e.g. Foxriver Ethiopia Co."
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1 ml-1">Service Type</label>
                                    <select
                                        value={formData.serviceType}
                                        onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                                        className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                                    >
                                        <option value="Bank">Bank</option>
                                        <option value="Wallet">Wallet (e.g. TeleBirr)</option>
                                    </select>
                                </div>
                                <div className="flex items-end">
                                    <label className="flex items-center gap-3 cursor-pointer group p-3 rounded-xl hover:bg-gray-700/30 transition-colors w-full">
                                        <input
                                            type="checkbox"
                                            checked={formData.isActive}
                                            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                            className="w-5 h-5 rounded border-gray-700 text-emerald-500 focus:ring-offset-gray-800 focus:ring-emerald-500 bg-gray-900"
                                        />
                                        <span className="text-sm font-bold text-gray-300">Active</span>
                                    </label>
                                </div>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-bold transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/20 transition-all"
                                >
                                    {editingBank ? 'Update Account' : 'Add Account'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
