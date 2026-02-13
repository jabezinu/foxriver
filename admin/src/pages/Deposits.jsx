import { useState, useEffect } from 'react';
import { useAdminDepositStore } from '../store/depositStore';
import { toast } from 'react-hot-toast';
import { HiDownload } from 'react-icons/hi';
import ConfirmModal from '../components/ConfirmModal';
import PromptModal from '../components/PromptModal';
import PageHeader from '../components/shared/PageHeader';
import DepositItem from '../components/DepositItem';
import ScreenshotModal from '../components/ScreenshotModal';
import ExportModal from '../components/ExportModal';
import { exportToCSV } from '../utils/exportUtils';

export default function DepositRequests() {
    const { deposits, loading, fetchDeposits, approveDeposit, rejectDeposit, undoDeposit } = useAdminDepositStore();
    const [filterStatus, setFilterStatus] = useState('ft_submitted');
    const [approveId, setApproveId] = useState(null);
    const [rejectId, setRejectId] = useState(null);
    const [viewScreenshot, setViewScreenshot] = useState(null);
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [totalCount, setTotalCount] = useState(0);

    const fetchDepositsList = async (status = filterStatus) => {
        await fetchDeposits({ status });
    };

    useEffect(() => { fetchDepositsList(); }, [filterStatus]);

    const fetchTotalCount = async () => {
        try {
            const res = await adminDepositAPI.getDeposits({});
            setTotalCount(res.data.deposits.length);
        } catch (error) { console.error('Failed to fetch total count'); }
    };

    const handleOpenExport = () => {
        fetchTotalCount();
        setIsExportModalOpen(true);
    };

    const DEPOSIT_COLUMNS = [
        'Date & Time', 'Order ID', 'User Phone', 'Amount (ETB)', 'Status',
        'Deposit Type', 'Bank Reference (FT)', 'Admin Bank', 'Target Account',
        'Admin Notes', 'Processed By', 'Processed At'
    ];

    const handleGenerateExport = async (selectedColumns, scope, startDate, endDate) => {
        let dataToExport = deposits;

        if (scope === 'all') {
            const loadToast = toast.loading('Synchronizing full financial ledger...');
            try {
                const res = await adminDepositAPI.getDeposits({});
                dataToExport = res.data.deposits;
                toast.dismiss(loadToast);
            } catch (error) {
                toast.error('Failed to sync full ledger', { id: loadToast });
                return;
            }
        } else if (scope === 'today') {
            const loadToast = toast.loading('Synchronizing daily financial ledger...');
            try {
                const today = new Date();
                const start = new Date(today.setHours(0, 0, 0, 0)).toISOString();
                const end = new Date(today.setHours(23, 59, 59, 999)).toISOString();
                const res = await adminDepositAPI.getDeposits({ startDate: start, endDate: end });
                dataToExport = res.data.deposits;
                toast.dismiss(loadToast);
            } catch (error) {
                toast.error('Failed to sync daily ledger', { id: loadToast });
                return;
            }
        } else if (scope === 'custom' && startDate && endDate) {
            const loadToast = toast.loading(`Synchronizing ledger for ${startDate} to ${endDate}...`);
            try {
                const start = new Date(startDate);
                start.setHours(0, 0, 0, 0);
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                
                const res = await adminDepositAPI.getDeposits({ 
                    startDate: start.toISOString(), 
                    endDate: end.toISOString() 
                });
                dataToExport = res.data.deposits;
                toast.dismiss(loadToast);
            } catch (error) {
                toast.error('Failed to sync custom ledger', { id: loadToast });
                return;
            }
        }

        const exportData = dataToExport.map(dep => {
            const fullRecord = {
                'Date & Time': new Date(dep.createdAt).toLocaleString(),
                'Order ID': dep.orderId,
                'User Phone': dep.userDetails?.phone || 'N/A',
                'Amount (ETB)': dep.amount,
                'Status': dep.status.charAt(0).toUpperCase() + dep.status.slice(1).replace('_', ' '),
                'Deposit Type': dep.rankUpgradeRequest ? 'Rank Upgrade' : 'Capital Intake',
                'Bank Reference (FT)': dep.transactionFT || '',
                'Admin Bank': dep.paymentMethodDetails?.bankName || '',
                'Target Account': dep.paymentMethodDetails?.accountNumber || '',
                'Admin Notes': dep.adminNotes || '',
                'Processed By': dep.approver?.phone || '',
                'Processed At': dep.approvedAt ? new Date(dep.approvedAt).toLocaleString() : ''
            };

            const filteredRecord = {};
            selectedColumns.forEach(col => {
                filteredRecord[col] = fullRecord[col];
            });
            return filteredRecord;
        });

        const fileName = scope === 'all' ? 'Deposits_Full_Ledger' : (scope === 'today' ? 'Deposits_Daily_Report' : (scope === 'custom' ? `Deposits_Report_${startDate}_to_${endDate}` : `Deposits_${filterStatus}`));
        exportToCSV(exportData, selectedColumns, fileName);
        toast.success('Professional Ledger Exported');
    };

    const confirmApprove = async () => {
        const res = await approveDeposit(approveId, { notes: 'Authenticated by Prime core' });
        if (res.success) {
            toast.success('Capital Synchronized');
        } else {
            toast.error(res.message);
        }
        setApproveId(null);
    };

    const confirmReject = async (reason) => {
        const res = await rejectDeposit(rejectId, { notes: reason || 'Invalid transmission source' });
        if (res.success) {
            toast.success('Intake Blocked');
        } else {
            toast.error(res.message);
        }
        setRejectId(null);
    };

    const handleUndo = async (id) => {
        const res = await undoDeposit(id);
        if (res.success) {
            toast.success('Signal Reset: Transaction returned to intake pool');
        } else {
            toast.error(res.message);
        }
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
            <ExportModal
                isOpen={isExportModalOpen}
                onClose={() => setIsExportModalOpen(false)}
                onExport={handleGenerateExport}
                columns={DEPOSIT_COLUMNS}
                dataCount={deposits.length}
                totalCount={totalCount}
                type="Deposits"
                currentFilter={filterStatus === 'ft_submitted' ? 'Pending' : filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1)}
                onDateCheck={async (start, end) => {
                    const s = new Date(start);
                    s.setHours(0, 0, 0, 0);
                    const e = new Date(end);
                    e.setHours(23, 59, 59, 999);
                    const res = await adminDepositAPI.getDeposits({ 
                        startDate: s.toISOString(), 
                        endDate: e.toISOString() 
                    });
                    const deposits = res.data.deposits;
                    const total = deposits.reduce((sum, dep) => sum + (parseFloat(dep.amount) || 0), 0);
                    return { count: deposits.length, total };
                }}
            />

            <PageHeader
                title="Financial Intake Ledger"
                subtitle="Authenticate incoming capital signals and verify transactional integrity across the network."
                extra={
                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleOpenExport}
                            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 active:scale-95"
                        >
                            <HiDownload className="text-sm" />
                            Export Ledger
                        </button>
                        <div className="flex bg-gray-100 p-1.5 rounded-2xl shadow-inner border border-gray-200">
                            <FilterBtn active={filterStatus === 'ft_submitted'} color="yellow" onClick={() => setFilterStatus('ft_submitted')} label="Pending" />
                            <FilterBtn active={filterStatus === 'approved'} color="emerald" onClick={() => setFilterStatus('approved')} label="Approved" />
                            <FilterBtn active={filterStatus === 'rejected'} color="rose" onClick={() => setFilterStatus('rejected')} label="Rejected" />
                        </div>
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
                            key={dep._id || dep.id}
                            deposit={dep}
                            onApprove={setApproveId}
                            onReject={setRejectId}
                            onViewScreenshot={setViewScreenshot}
                            onUndo={handleUndo}
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
