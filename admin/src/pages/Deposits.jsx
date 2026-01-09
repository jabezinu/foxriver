import { useState, useEffect } from 'react';
import { adminDepositAPI } from '../services/api';
import { toast } from 'react-hot-toast';
import { HiCheck, HiX, HiPhotograph } from 'react-icons/hi';
import { formatNumber } from '../utils/formatNumber';

import ConfirmModal from '../components/ConfirmModal';
import PromptModal from '../components/PromptModal';

export default function DepositRequests() {
    const [deposits, setDeposits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('ft_submitted');
    const [approveId, setApproveId] = useState(null);
    const [rejectId, setRejectId] = useState(null);
    const [viewScreenshot, setViewScreenshot] = useState(null);

    useEffect(() => {
        fetchDeposits();
    }, [filterStatus]);

    const fetchDeposits = async () => {
        setLoading(true);
        try {
            const res = await adminDepositAPI.getDeposits({ status: filterStatus });
            setDeposits(res.data.deposits);
        } catch (error) {
            toast.error('Failed to load ledger records');
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
            await adminDepositAPI.approve(approveId, { notes: 'Approved by admin' });
            toast.success('Deposit approved and user credited!');
            fetchDeposits();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Approval failed');
        }
    };

    const handleReject = (id) => {
        setRejectId(id);
    };

    const confirmReject = async (reason) => {
        try {
            await adminDepositAPI.reject(rejectId, { notes: reason || 'Rejected by admin' });
            toast.success('Deposit rejected');
            fetchDeposits();
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
                title="Authorize Capital"
                message="Are you sure you want to APPROVE this deposit? The user wallet will be credited immediately."
                confirmText="Approve Funds"
            />

            <PromptModal
                isOpen={!!rejectId}
                onClose={() => setRejectId(null)}
                onConfirm={confirmReject}
                title="Reject Transaction"
                message="Please provide a reason for rejecting this deposit:"
                placeholder="e.g. Invalid Transaction ID"
                confirmText="Reject Deposit"
            />

            {/* Screenshot Modal */}
            {viewScreenshot && (
                <div 
                    className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
                    onClick={() => setViewScreenshot(null)}
                >
                    <div className="max-w-4xl w-full bg-white rounded-2xl p-4">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-gray-900">Transaction Screenshot</h3>
                            <button
                                onClick={() => setViewScreenshot(null)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <HiX size={24} />
                            </button>
                        </div>
                        <img 
                            src={viewScreenshot}
                            alt="Transaction screenshot" 
                            className="w-full rounded-xl object-contain max-h-[70vh]"
                        />
                    </div>
                </div>
            )}

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Capital Ledger</h1>
                    <p className="text-sm text-gray-500">Authenticate incoming fund transfers and verify transaction credentials.</p>
                </div>
                <div className="flex flex-wrap gap-2 bg-white p-1 rounded-xl shadow-sm border border-gray-100 w-full md:w-auto">
                    <button
                        onClick={() => setFilterStatus('ft_submitted')}
                        className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all whitespace-nowrap ${filterStatus === 'ft_submitted' ? 'bg-yellow-100 text-yellow-700' : 'text-gray-400 hover:bg-gray-50'}`}
                    >
                        Pending
                    </button>
                    <button
                        onClick={() => setFilterStatus('approved')}
                        className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all whitespace-nowrap ${filterStatus === 'approved' ? 'bg-green-100 text-green-700' : 'text-gray-400 hover:bg-gray-50'}`}
                    >
                        Succeeded
                    </button>
                    <button
                        onClick={() => setFilterStatus('rejected')}
                        className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all whitespace-nowrap ${filterStatus === 'rejected' ? 'bg-red-100 text-red-700' : 'text-gray-400 hover:bg-gray-50'}`}
                    >
                        Failed
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="p-20 text-center text-gray-400 font-bold uppercase tracking-widest bg-white rounded-3xl">Verifying Transactions...</div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {deposits.length === 0 ? (
                        <div className="bg-white rounded-3xl p-20 text-center border-2 border-dashed border-gray-100">
                            <p className="text-gray-300 font-bold uppercase tracking-widest">No matching records found in ledger</p>
                        </div>
                    ) : (
                        deposits.map((dep) => (
                            <div key={dep._id} className="admin-card flex flex-col md:flex-row gap-6 items-center">
                                <div className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-2xl min-w-[120px]">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Incoming</p>
                                    <p className="text-xl font-bold text-indigo-600">{formatNumber(dep.amount)}</p>
                                    <p className="text-[8px] font-bold text-gray-400 uppercase tracking-tighter">ETB Capital</p>
                                </div>

                                <div className="flex-1 space-y-2">
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm font-bold text-gray-800">{dep.user?.phone}</span>
                                        <span className="bg-gray-100 text-gray-500 text-[8px] font-bold px-2 py-0.5 rounded uppercase">{dep.user?.membershipLevel}</span>
                                    </div>
                                    <div className="flex flex-wrap gap-x-6 gap-y-2">
                                        <div className="flex flex-col">
                                            <span className="text-[9px] text-gray-400 uppercase font-bold">Transaction ID</span>
                                            <span className="text-sm font-mono font-bold text-green-600">{dep.transactionFT || 'WAITING'}</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[9px] text-gray-400 uppercase font-bold">Screenshot</span>
                                            {dep.transactionScreenshot ? (
                                                <button
                                                    onClick={() => setViewScreenshot(dep.transactionScreenshot)}
                                                    className="text-sm font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                                                >
                                                    <HiPhotograph size={16} />
                                                    View
                                                </button>
                                            ) : (
                                                <span className="text-sm text-gray-400">Not uploaded</span>
                                            )}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[9px] text-gray-400 uppercase font-bold">Bank Name</span>
                                            <span className="text-sm font-bold text-gray-700">{dep.paymentMethod?.bankName || 'N/A'}</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[9px] text-gray-400 uppercase font-bold">Account</span>
                                            <span className="text-xs font-mono font-bold text-indigo-600">{dep.paymentMethod?.accountNumber || 'N/A'}</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[9px] text-gray-400 uppercase font-bold">Request Date</span>
                                            <span className="text-xs text-gray-500">{new Date(dep.createdAt).toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    {dep.status === 'ft_submitted' && (
                                        <>
                                            <button
                                                onClick={() => handleApprove(dep._id)}
                                                className="w-12 h-12 rounded-xl bg-green-100 text-green-600 flex items-center justify-center hover:bg-green-600 hover:text-white transition-all shadow-sm"
                                            >
                                                <HiCheck className="text-2xl" />
                                            </button>
                                            <button
                                                onClick={() => handleReject(dep._id)}
                                                className="w-12 h-12 rounded-xl bg-red-100 text-red-600 flex items-center justify-center hover:bg-red-600 hover:text-white transition-all shadow-sm"
                                            >
                                                <HiX className="text-2xl" />
                                            </button>
                                        </>
                                    )}
                                    {dep.status === 'approved' && (
                                        <div className="px-4 py-2 bg-green-50 text-green-600 text-[10px] font-bold rounded-lg uppercase border border-green-100">
                                            Authenticated
                                        </div>
                                    )}
                                    {dep.status === 'rejected' && (
                                        <div className="px-4 py-2 bg-red-50 text-red-600 text-[10px] font-bold rounded-lg uppercase border border-red-100">
                                            Invalidated
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
