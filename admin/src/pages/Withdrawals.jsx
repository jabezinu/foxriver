import { useState, useEffect } from 'react';
import { adminWithdrawalAPI } from '../services/api';
import { toast } from 'react-hot-toast';
import ConfirmModal from '../components/ConfirmModal';
import PromptModal from '../components/PromptModal';
import PageHeader from '../components/shared/PageHeader';
import WithdrawalItem from '../components/WithdrawalItem';

export default function WithdrawalRequests() {
    const [withdrawals, setWithdrawals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('pending');
    const [approveId, setApproveId] = useState(null);
    const [rejectId, setRejectId] = useState(null);

    useEffect(() => { fetchWithdrawals(); }, [filterStatus]);

    const fetchWithdrawals = async () => {
        setLoading(true);
        try {
            const res = await adminWithdrawalAPI.getWithdrawals({ status: filterStatus });
            setWithdrawals(res.data.withdrawals);
        } catch (error) { toast.error('Signal Loss: Registry inaccessible'); }
        finally { setLoading(false); }
    };

    const confirmApprove = async () => {
        try {
            await adminWithdrawalAPI.approve(approveId, { notes: 'Transfer verified by prime core financial node' });
            toast.success('Funds Disbursed');
            fetchWithdrawals();
        } catch (error) { toast.error('Transfer Denial'); }
        finally { setApproveId(null); }
    };

    const confirmReject = async (reason) => {
        try {
            await adminWithdrawalAPI.reject(rejectId, { notes: reason || 'Protocol non-compliance / Identity failure' });
            toast.success('Payout Invalidated');
            fetchWithdrawals();
        } catch (error) { toast.error('Command Rejection'); }
        finally { setRejectId(null); }
    };

    const handleUndo = async (id) => {
        try {
            await adminWithdrawalAPI.undo(id);
            toast.success('Payout Reset: Signal returned to pending matrix');
            fetchWithdrawals();
        } catch (error) { toast.error('Undo Protocol Failure'); }
    };

    return (
        <div className="animate-fadeIn">
            <ConfirmModal
                isOpen={!!approveId} onClose={() => setApproveId(null)} onConfirm={confirmApprove}
                title="Authorize Payout Sequence"
                message="Ensure manual funds transfer has been authenticated at the target bank node before proceeding. This action is irreversible."
                confirmText="Authorize Payout"
            />
            <PromptModal
                isOpen={!!rejectId} onClose={() => setRejectId(null)} onConfirm={confirmReject}
                title="Invalidate Withdrawal Request"
                message="State the primary cause for signal termination:"
                placeholder="e.g. Account Credentials Identity Mismatch"
                confirmText="Invalidate Request"
            />

            <PageHeader
                title="Payout Operation Matrix"
                subtitle="Review pending disbursement signals and authorize capital liquidation to personnel bank nodes."
                extra={
                    <div className="flex bg-gray-100 p-1.5 rounded-2xl shadow-inner border border-gray-200">
                        <FilterBtn active={filterStatus === 'pending'} color="purple" onClick={() => setFilterStatus('pending')} label="Pending" />
                        <FilterBtn active={filterStatus === 'approved'} color="emerald" onClick={() => setFilterStatus('approved')} label="Approved" />
                        <FilterBtn active={filterStatus === 'rejected'} color="rose" onClick={() => setFilterStatus('rejected')} label="Rejected" />
                    </div>
                }
            />

            {loading ? (
                <div className="admin-card py-32 flex flex-col items-center justify-center text-gray-400">
                    <div className="w-16 h-16 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin mb-6"></div>
                    <p className="font-black uppercase tracking-[0.3em] text-[10px]">Synchronizing Payout Matrix...</p>
                </div>
            ) : (
                <div className="space-y-8">
                    {withdrawals.map(wit => (
                        <WithdrawalItem
                            key={wit.id || wit._id}
                            withdrawal={wit}
                            onApprove={setApproveId}
                            onReject={setRejectId}
                            onUndo={handleUndo}
                        />
                    ))}
                    {withdrawals.length === 0 && (
                        <div className="py-24 text-center border-2 border-dashed border-gray-100 rounded-3xl flex flex-col items-center justify-center text-gray-300">
                            <p className="font-black uppercase tracking-[0.3em] text-[10px]">No Active Payout Signals Detected</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

function FilterBtn({ active, onClick, label, color }) {
    const colors = {
        purple: active ? 'bg-white text-purple-600 shadow-md border-purple-100' : 'text-gray-400 hover:text-purple-400',
        emerald: active ? 'bg-white text-emerald-600 shadow-md border-emerald-100' : 'text-gray-400 hover:text-emerald-400',
        rose: active ? 'bg-white text-rose-600 shadow-md border-rose-100' : 'text-gray-400 hover:text-rose-400',
    };
    return (
        <button
            onClick={onClick}
            className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-transparent ${colors[color]}`}
        >
            {label}
        </button>
    );
}
