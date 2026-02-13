import { useState, useEffect } from 'react';
import { HiX, HiDownload, HiUpload } from 'react-icons/hi';
import { useAdminUserStore } from '../store/userStore';
import Loading from './Loading';

export default function UserHistoryModal({ isOpen, onClose, user }) {
    const [activeTab, setActiveTab] = useState('deposits');
    const [deposits, setDeposits] = useState([]);
    const [withdrawals, setWithdrawals] = useState([]);
    const { fetchUserHistory, loading } = useAdminUserStore();

    useEffect(() => {
        if (isOpen && user) {
            fetchHistory();
        }
    }, [isOpen, user]);

    const fetchHistory = async () => {
        const res = await fetchUserHistory(user.id);
        if (res.success) {
            setDeposits(res.data.deposits);
            setWithdrawals(res.data.withdrawals);
        }
    };

    // Calculate totals
    const totalDeposits = deposits.reduce((sum, deposit) => sum + deposit.amount, 0);
    const totalWithdrawals = withdrawals.reduce((sum, withdrawal) => sum + withdrawal.netAmount, 0);
    const netAmount = totalDeposits - totalWithdrawals;

    if (!isOpen || !user) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 shrink-0">
                    <div>
                        <h3 className="font-bold text-gray-800 text-lg">Transaction History</h3>
                        <p className="text-sm text-gray-500">Operative: <span className="font-bold text-gray-700">{user.phone}</span></p>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 rounded-lg bg-gray-200 text-gray-500 flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all">
                        <HiX className="text-xl" />
                    </button>
                </div>

                {/* Summary Section */}
                <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-blue-50 border-b border-gray-100">
                    <div className="grid grid-cols-3 gap-4">
                        <div className="text-center">
                            <p className="text-xs font-bold text-gray-500 uppercase mb-1">Total Deposits</p>
                            <p className="text-lg font-bold text-green-600">{totalDeposits.toLocaleString()} ETB</p>
                        </div>
                        <div className="text-center">
                            <p className="text-xs font-bold text-gray-500 uppercase mb-1">Total Withdrawals</p>
                            <p className="text-lg font-bold text-red-600">{totalWithdrawals.toLocaleString()} ETB</p>
                        </div>
                        <div className="text-center">
                            <p className="text-xs font-bold text-gray-500 uppercase mb-1">Net Amount</p>
                            <p className={`text-lg font-bold ${netAmount >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                                {netAmount >= 0 ? '+' : ''}{netAmount.toLocaleString()} ETB
                            </p>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-100 shrink-0">
                    <button
                        onClick={() => setActiveTab('deposits')}
                        className={`flex-1 py-4 text-sm font-bold uppercase tracking-wide transition-all ${activeTab === 'deposits'
                                ? 'text-green-600 border-b-2 border-green-600 bg-green-50/50'
                                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        <div className="flex items-center justify-center gap-2">
                            <HiDownload className="text-lg" />
                            Deposits ({deposits.length})
                        </div>
                    </button>
                    <button
                        onClick={() => setActiveTab('withdrawals')}
                        className={`flex-1 py-4 text-sm font-bold uppercase tracking-wide transition-all ${activeTab === 'withdrawals'
                                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        <div className="flex items-center justify-center gap-2">
                            <HiUpload className="text-lg" />
                            Withdrawals ({withdrawals.length})
                        </div>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-auto p-0 bg-gray-50/30">
                    {loading ? (
                        <div className="h-64 flex items-center justify-center">
                            <Loading />
                        </div>
                    ) : (
                        <div className="w-full">
                            {activeTab === 'deposits' ? (
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-gray-100 sticky top-0 z-10">
                                        <tr>
                                            <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                                            <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Amount</th>
                                            <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Method</th>
                                            <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Approved By</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 bg-white">
                                        {deposits.map((deposit) => (
                                            <tr key={deposit.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 text-xs font-medium text-gray-900">
                                                    {new Date(deposit.createdAt).toLocaleString()}
                                                </td>
                                                <td className="px-6 py-4 text-sm font-bold text-green-600">
                                                    +{deposit.amount} ETB
                                                </td>
                                                <td className="px-6 py-4 text-xs text-gray-500 uppercase">
                                                    {deposit.paymentMethod}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${deposit.status === 'approved' ? 'bg-green-100 text-green-700' :
                                                            deposit.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                                                'bg-yellow-100 text-yellow-700'
                                                        }`}>
                                                        {deposit.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-xs text-gray-500">
                                                    {deposit.approvedBy?.phone || '-'}
                                                </td>
                                            </tr>
                                        ))}
                                        {deposits.length === 0 && (
                                            <tr>
                                                <td colSpan="5" className="px-6 py-12 text-center text-gray-400 text-sm">
                                                    No deposit history found
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            ) : (
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-gray-100 sticky top-0 z-10">
                                        <tr>
                                            <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                                            <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Amount</th>
                                            <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Net Amount</th>
                                            <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Wallet</th>
                                            <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Approved By</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 bg-white">
                                        {withdrawals.map((withdrawal) => (
                                            <tr key={withdrawal.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 text-xs font-medium text-gray-900">
                                                    {new Date(withdrawal.createdAt).toLocaleString()}
                                                </td>
                                                <td className="px-6 py-4 text-sm font-bold text-gray-500">
                                                    {withdrawal.amount} ETB
                                                </td>
                                                <td className="px-6 py-4 text-sm font-bold text-blue-600">
                                                    -{withdrawal.netAmount} ETB
                                                </td>
                                                <td className="px-6 py-4 text-xs text-gray-500 uppercase">
                                                    {withdrawal.walletType}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${withdrawal.status === 'approved' ? 'bg-green-100 text-green-700' :
                                                            withdrawal.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                                                'bg-yellow-100 text-yellow-700'
                                                        }`}>
                                                        {withdrawal.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-xs text-gray-500">
                                                    {withdrawal.approvedBy?.phone || '-'}
                                                </td>
                                            </tr>
                                        ))}
                                        {withdrawals.length === 0 && (
                                            <tr>
                                                <td colSpan="6" className="px-6 py-12 text-center text-gray-400 text-sm">
                                                    No withdrawal history found
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
