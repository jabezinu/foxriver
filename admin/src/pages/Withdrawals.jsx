import { useState, useEffect } from 'react';
import { adminWithdrawalAPI } from '../services/api';
import { toast } from 'react-hot-toast';
import { HiBriefcase, HiCheck, HiX, HiCreditCard } from 'react-icons/hi';
import { formatNumber } from '../utils/formatNumber';

import ConfirmModal from '../components/ConfirmModal';
import PromptModal from '../components/PromptModal';

export default function WithdrawalRequests() {
    const [withdrawals, setWithdrawals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('pending');
    const [approveId, setApproveId] = useState(null);
    const [rejectId, setRejectId] = useState(null);

    useEffect(() => {
        fetchWithdrawals();
    }, [filterStatus]);

    const fetchWithdrawals = async () => {
        setLoading(true);
        try {
            const res = await adminWithdrawalAPI.getWithdrawals({ status: filterStatus });
            setWithdrawals(res.data.withdrawals);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = (id) => {
        setApproveId(id);
    };

    const confirmApprove = async () => {
        try {
            await adminWithdrawalAPI.approve(approveId, { notes: 'Transferred by Finance Dept' });
            toast.success('Withdrawal marked as successfully transferred!');
            fetchWithdrawals();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Approval failed');
        }
    };

    const handleReject = (id) => {
        setRejectId(id);
    };

    const confirmReject = async (reason) => {
        try {
            await adminWithdrawalAPI.reject(rejectId, { notes: reason || 'Account issue / Verification failed' });
            toast.success('Withdrawal request invalidated');
            fetchWithdrawals();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Rejection failed');
        }
    };

    return (
        <div className="animate-fadeIn">
            <ConfirmModal
                isOpen={!!approveId}
                onClose={() => setApproveId(null)}
                onConfirm={confirmApprove}
                title="Confirm Payout"
                message="Confirm funds have been MANUALLY transferred to user bank? This will mark request as SUCCEEDED and deduct balance."
                confirmText="Confirm Transfer"
            />

            <PromptModal
                isOpen={!!rejectId}
                onClose={() => setRejectId(null)}
                onConfirm={confirmReject}
                title="Decline Payout"
                message="Please provide a reason for declining this withdrawal:"
                placeholder="e.g. Account Name Mismatch"
                confirmText="Decline Request"
            />

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Payout Control</h1>
                    <p className="text-sm text-gray-500">Review payout requests and verify bank credentials before transfer.</p>
                </div>
                <div className="flex flex-wrap gap-2 bg-white p-1 rounded-xl shadow-sm border border-gray-100 w-full md:w-auto">
                    <button
                        onClick={() => setFilterStatus('pending')}
                        className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all whitespace-nowrap ${filterStatus === 'pending' ? 'bg-purple-100 text-purple-700' : 'text-gray-400 hover:bg-gray-50'}`}
                    >
                        Pending Review
                    </button>
                    <button
                        onClick={() => setFilterStatus('approved')}
                        className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all whitespace-nowrap ${filterStatus === 'approved' ? 'bg-green-100 text-green-700' : 'text-gray-400 hover:bg-gray-50'}`}
                    >
                        Disbursed
                    </button>
                    <button
                        onClick={() => setFilterStatus('rejected')}
                        className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all whitespace-nowrap ${filterStatus === 'rejected' ? 'bg-red-100 text-red-700' : 'text-gray-400 hover:bg-gray-50'}`}
                    >
                        Dismissed
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="p-20 text-center text-gray-400 font-bold uppercase tracking-widest bg-white rounded-3xl">Auditing Accounts...</div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {withdrawals.length === 0 ? (
                        <div className="bg-white rounded-3xl p-20 text-center border-2 border-dashed border-gray-100">
                            <p className="text-gray-300 font-bold uppercase tracking-widest">No payout requests in current selection</p>
                        </div>
                    ) : (
                        withdrawals.map((wit) => (
                            <div key={wit._id} className="admin-card flex flex-col items-stretch border-l-4 border-l-purple-500">
                                <div className="flex flex-col md:flex-row gap-6 items-center mb-6">
                                    <div className="flex flex-col items-center justify-center p-4 bg-purple-50 rounded-2xl min-w-[140px]">
                                        <p className="text-[10px] font-bold text-purple-400 uppercase mb-1">Net Payout</p>
                                        <p className="text-2xl font-bold text-purple-600">{formatNumber(wit.netAmount)}</p>
                                        <p className="text-[8px] font-bold text-purple-400 uppercase tracking-tighter">ETB After 10% Tax</p>
                                    </div>

                                    <div className="flex-1 space-y-3">
                                        <div className="flex items-center gap-3">
                                            <span className="text-lg font-bold text-gray-800">{wit.user?.phone}</span>
                                            <span className="bg-indigo-50 text-indigo-600 text-[9px] font-bold px-3 py-1 rounded-full uppercase">{wit.user?.membershipLevel} Agent</span>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            <div className="flex flex-col">
                                                <span className="text-[9px] text-gray-400 uppercase font-bold mb-1">Bank Credentials</span>
                                                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                                                    <p className="text-xs font-bold text-gray-700">{wit.user?.bankAccount?.bankName || 'N/A'}</p>
                                                    <p className="text-[10px] font-mono font-bold text-indigo-600">{wit.user?.bankAccount?.accountNumber || 'NOT SET'}</p>
                                                    <p className="text-[8px] text-gray-500 font-bold uppercase">{wit.user?.bankAccount?.accountName || 'NO NAME'}</p>
                                                    <p className="text-[8px] text-indigo-400 font-bold mt-1">PH: {wit.user?.bankAccount?.phone || 'N/A'}</p>
                                                </div>
                                            </div>
                                            <div className="flex flex-col justify-center">
                                                <span className="text-[9px] text-gray-400 uppercase font-bold">Gross Amount</span>
                                                <span className="text-sm font-bold text-gray-500">{formatNumber(wit.amount)} ETB</span>
                                                <span className="text-[9px] text-red-400 font-bold mt-1">10% Tax: {formatNumber(wit.taxAmount)} ETB</span>
                                            </div>
                                            <div className="flex flex-col justify-center">
                                                <span className="text-[9px] text-gray-400 uppercase font-bold">Wallet Source</span>
                                                <span className="text-xs font-bold text-gray-700 capitalize">{wit.walletType} Wallet</span>
                                                <span className="text-[9px] text-gray-400 mt-1 italic">Request: {new Date(wit.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        {wit.status === 'pending' && (
                                            <>
                                                <button
                                                    onClick={() => handleApprove(wit._id)}
                                                    className="w-12 h-12 rounded-xl bg-green-100 text-green-600 flex items-center justify-center hover:bg-green-600 hover:text-white transition-all shadow-sm"
                                                    title="Verify & Payout"
                                                >
                                                    <HiCheck className="text-2xl" />
                                                </button>
                                                <button
                                                    onClick={() => handleReject(wit._id)}
                                                    className="w-12 h-12 rounded-xl bg-red-100 text-red-600 flex items-center justify-center hover:bg-red-600 hover:text-white transition-all shadow-sm"
                                                    title="Decline Request"
                                                >
                                                    <HiX className="text-2xl" />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {wit.status !== 'pending' && (
                                    <div className={`mt-auto pt-4 border-t flex justify-between items-center ${wit.status === 'approved' ? 'border-green-100' : 'border-red-100'}`}>
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${wit.status === 'approved' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                                            <span className={`text-[10px] font-bold uppercase ${wit.status === 'approved' ? 'text-green-600' : 'text-red-600'}`}>
                                                {wit.status === 'approved' ? 'Funds Disbursed' : 'Payment Dismissed'}
                                            </span>
                                        </div>
                                        <span className="text-[9px] text-gray-400 font-bold uppercase">Transaction ID: #{String(wit._id).slice(-8)}</span>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
