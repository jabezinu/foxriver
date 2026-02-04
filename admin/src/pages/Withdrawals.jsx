import { useState, useEffect } from 'react';
import { adminWithdrawalAPI } from '../services/api';
import { toast } from 'react-hot-toast';
import { HiDownload } from 'react-icons/hi';
import ConfirmModal from '../components/ConfirmModal';
import PromptModal from '../components/PromptModal';
import PageHeader from '../components/shared/PageHeader';
import WithdrawalItem from '../components/WithdrawalItem';
import ExportModal from '../components/ExportModal';
import { exportToCSV } from '../utils/exportUtils';

export default function WithdrawalRequests() {
    const [withdrawals, setWithdrawals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('pending');
    const [approveId, setApproveId] = useState(null);
    const [rejectId, setRejectId] = useState(null);
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [totalCount, setTotalCount] = useState(0);

    useEffect(() => { fetchWithdrawals(); }, [filterStatus]);

    const fetchWithdrawals = async () => {
        setLoading(true);
        try {
            const res = await adminWithdrawalAPI.getWithdrawals({ status: filterStatus });
            setWithdrawals(res.data.withdrawals);
        } catch (error) { toast.error('Signal Loss: Registry inaccessible'); }
        finally { setLoading(false); }
    };

    const fetchTotalCount = async () => {
        try {
            const res = await adminWithdrawalAPI.getWithdrawals({});
            setTotalCount(res.data.withdrawals.length);
        } catch (error) { console.error('Failed to fetch total count'); }
    };

    const handleOpenExport = () => {
        fetchTotalCount();
        setIsExportModalOpen(true);
    };

    const WITHDRAWAL_COLUMNS = [
        'Date & Time', 'Withdrawal ID', 'User Name', 'User Phone', 'Wallet Source',
        'Gross Amount', 'Tax (10%)', 'Net Payout', 'Status', 'User Bank',
        'Account Name', 'Account Number', 'Admin Notes', 'Disbursed By', 'Disbursed At'
    ];

    const handleGenerateExport = async (selectedColumns, scope, startDate, endDate) => {
        let dataToExport = withdrawals;

        if (scope === 'all') {
            const loadToast = toast.loading('Synchronizing full payout matrix...');
            try {
                const res = await adminWithdrawalAPI.getWithdrawals({});
                dataToExport = res.data.withdrawals;
                toast.dismiss(loadToast);
            } catch (error) {
                toast.error('Failed to sync full matrix', { id: loadToast });
                return;
            }
        } else if (scope === 'today') {
            const loadToast = toast.loading('Synchronizing daily payout matrix...');
            try {
                const today = new Date();
                const start = new Date(today.setHours(0, 0, 0, 0)).toISOString();
                const end = new Date(today.setHours(23, 59, 59, 999)).toISOString();
                const res = await adminWithdrawalAPI.getWithdrawals({ startDate: start, endDate: end });
                dataToExport = res.data.withdrawals;
                toast.dismiss(loadToast);
            } catch (error) {
                toast.error('Failed to sync daily matrix', { id: loadToast });
                return;
            }
        } else if (scope === 'custom' && startDate && endDate) {
            const loadToast = toast.loading(`Synchronizing payout matrix for ${startDate} to ${endDate}...`);
            try {
                const start = new Date(startDate);
                start.setHours(0, 0, 0, 0);
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);

                const res = await adminWithdrawalAPI.getWithdrawals({ 
                    startDate: start.toISOString(), 
                    endDate: end.toISOString() 
                });
                dataToExport = res.data.withdrawals;
                toast.dismiss(loadToast);
            } catch (error) {
                toast.error('Failed to sync custom matrix', { id: loadToast });
                return;
            }
        }

        const exportData = dataToExport.map(wit => {
            const user = wit.userDetails || wit.user;
            const bank = user?.bankAccount || {};

            const fullRecord = {
                'Date & Time': new Date(wit.createdAt).toLocaleString(),
                'Withdrawal ID': wit.id || wit._id,
                'User Name': user?.name || 'Unknown',
                'User Phone': user?.phone || 'N/A',
                'Wallet Source': wit.walletType,
                'Gross Amount': wit.amount,
                'Tax (10%)': wit.taxAmount,
                'Net Payout': wit.netAmount,
                'Status': wit.status.charAt(0).toUpperCase() + wit.status.slice(1),
                'User Bank': bank.bank || '',
                'Account Name': bank.accountName || '',
                'Account Number': bank.accountNumber || '',
                'Admin Notes': wit.adminNotes || '',
                'Disbursed By': wit.approver?.phone || '',
                'Disbursed At': wit.approvedAt ? new Date(wit.approvedAt).toLocaleString() : ''
            };

            const filteredRecord = {};
            selectedColumns.forEach(col => {
                filteredRecord[col] = fullRecord[col];
            });
            return filteredRecord;
        });

        const fileName = scope === 'all' ? 'Withdrawals_Full_Ledger' : (scope === 'today' ? 'Withdrawals_Daily_Report' : (scope === 'custom' ? `Withdrawals_Report_${startDate}_to_${endDate}` : `Withdrawals_${filterStatus}`));
        exportToCSV(exportData, selectedColumns, fileName);
        toast.success('Professional Payout Matrix Exported');
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
            <ExportModal
                isOpen={isExportModalOpen}
                onClose={() => setIsExportModalOpen(false)}
                onExport={handleGenerateExport}
                columns={WITHDRAWAL_COLUMNS}
                dataCount={withdrawals.length}
                totalCount={totalCount}
                type="Withdrawals"
                currentFilter={filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1)}
                onDateCheck={async (start, end) => {
                    const s = new Date(start);
                    s.setHours(0, 0, 0, 0);
                    const e = new Date(end);
                    e.setHours(23, 59, 59, 999);
                    const res = await adminWithdrawalAPI.getWithdrawals({ 
                        startDate: s.toISOString(), 
                        endDate: e.toISOString() 
                    });
                    const withdrawals = res.data.withdrawals;
                    const total = withdrawals.reduce((sum, wit) => sum + (parseFloat(wit.netAmount) || 0), 0);
                    return { count: withdrawals.length, total };
                }}
            />

            <PageHeader
                title="Payout Operation Matrix"
                subtitle="Review pending disbursement signals and authorize capital liquidation to personnel bank nodes."
                extra={
                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleOpenExport}
                            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-purple-700 transition-all shadow-lg shadow-purple-200 active:scale-95"
                        >
                            <HiDownload className="text-sm" />
                            Export Data
                        </button>
                        <div className="flex bg-gray-100 p-1.5 rounded-2xl shadow-inner border border-gray-200">
                            <FilterBtn active={filterStatus === 'pending'} color="purple" onClick={() => setFilterStatus('pending')} label="Pending" />
                            <FilterBtn active={filterStatus === 'approved'} color="emerald" onClick={() => setFilterStatus('approved')} label="Approved" />
                            <FilterBtn active={filterStatus === 'rejected'} color="rose" onClick={() => setFilterStatus('rejected')} label="Rejected" />
                        </div>
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
