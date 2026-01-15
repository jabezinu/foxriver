import { useState, useEffect } from 'react';
import { adminDepositAPI } from '../services/api';
import { toast } from 'react-hot-toast';
import ConfirmModal from '../components/ConfirmModal';
import PromptModal from '../components/PromptModal';
import PageHeader from '../components/shared/PageHeader';
import DepositItem from '../components/DepositItem';
import ScreenshotModal from '../components/ScreenshotModal';

export default function DepositRequests() {
    const [deposits, setDeposits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('ft_submitted');
    const [approveId, setApproveId] = useState(null);
    const [rejectId, setRejectId] = useState(null);
    const [viewScreenshot, setViewScreenshot] = useState(null);

    useEffect(() => { fetchDeposits(); }, [filterStatus]);

    const fetchDeposits = async () => {
        setLoading(true);
        try {
            const res = await adminDepositAPI.getDeposits({ status: filterStatus });
            setDeposits(res.data.deposits);
        } catch (error) { toast.error('Ledger Offline'); } finally { setLoading(false); }
    };

    const confirmApprove = async () => {
        try {
            await adminDepositAPI.approve(approveId, { notes: 'Authenticated by Prime core' });
            toast.success('Capital Synchronized');
            fetchDeposits();
        } catch (error) { toast.error('Protocol Rejection'); } finally { setApproveId(null); }
    };

    const confirmReject = async (reason) => {
        try {
            await adminDepositAPI.reject(rejectId, { notes: reason || 'Invalid transmission source' });
            toast.success('Intake Blocked');
            fetchDeposits();
        } catch (error) { toast.error('Command Failed'); } finally { setRejectId(null); }
    };

    return (
        <div className="animate-fadeIn">
            <ConfirmModal
                isOpen={!!approveId} onClose={() => setApproveId(null)} onConfirm={confirmApprove}
                title="Authorize Capital Injection"
                message="This action will immediately synchronize wallet liquidity and update the personnel asset registry."
                confirmText="Authorize Funds"
            />
            <PromptModal
                isOpen={!!rejectId} onClose={() => setRejectId(null)} onConfirm={confirmReject}
                title="Invalidate Transmission"
                message="Provide justification for rejecting this financial signal:"
                placeholder="e.g. Evidence Mismatch"
                confirmText="Invalidate"
            />
            <ScreenshotModal
                isOpen={!!viewScreenshot} src={viewScreenshot} onClose={() => setViewScreenshot(null)}
            />

            <PageHeader
                title="Financial Intake Ledger"
                subtitle="Authenticate incoming capital signals and verify transactional integrity across the network."
                extra={
                    <div className="flex bg-gray-100 p-1.5 rounded-2xl shadow-inner border border-gray-200">
                        <FilterBtn active={filterStatus === 'ft_submitted'} color="yellow" onClick={() => setFilterStatus('ft_submitted')} label="Pending" />
                        <FilterBtn active={filterStatus === 'approved'} color="emerald" onClick={() => setFilterStatus('approved')} label="Liquidated" />
                        <FilterBtn active={filterStatus === 'rejected'} color="rose" onClick={() => setFilterStatus('rejected')} label="Purged" />
                    </div>
                }
            />

            {loading ? (
                <div className="admin-card py-32 flex flex-col items-center justify-center text-gray-400">
                    <div className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mb-6"></div>
                    <p className="font-black uppercase tracking-[0.3em] text-[10px]">Scanning Financial Matrix...</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {deposits.map(dep => (
                        <DepositItem
                            key={dep._id}
                            deposit={dep}
                            onApprove={setApproveId}
                            onReject={setRejectId}
                            onViewScreenshot={setViewScreenshot}
                        />
                    ))}
                    {deposits.length === 0 && (
                        <div className="py-24 text-center border-2 border-dashed border-gray-100 rounded-3xl flex flex-col items-center justify-center text-gray-300">
                            <p className="font-black uppercase tracking-[0.3em] text-[10px]">Registry Clear: No Signals Found</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

function FilterBtn({ active, onClick, label, color }) {
    const colors = {
        yellow: active ? 'bg-white text-yellow-600 shadow-md border-yellow-100' : 'text-gray-400 hover:text-yellow-400',
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
