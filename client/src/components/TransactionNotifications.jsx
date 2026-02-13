import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, CheckCircle, XCircle, AlertCircle, Bell } from 'lucide-react';
import { useDepositStore } from '../store/depositStore';
import { useWithdrawalStore } from '../store/withdrawalStore';
import { formatNumber } from '../utils/formatNumber';

export default function TransactionNotifications() {
    const navigate = useNavigate();
    const { history: deposits, fetchHistory: fetchDeposits, loadingHistory: depositsLoading } = useDepositStore();
    const { history: withdrawals, fetchHistory: fetchWithdrawals, loading: withdrawalsLoading } = useWithdrawalStore();
    const [pendingTransactions, setPendingTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const init = async () => {
            await Promise.all([
                fetchDeposits(),
                fetchWithdrawals()
            ]);
            
            // Filter for pending/processing transactions
            const pendingDeposits = (deposits || []).filter(d => 
                ['pending', 'ft_submitted'].includes(d.status)
            ).map(d => ({ ...d, type: 'deposit' }));

            const pendingWithdrawals = (withdrawals || []).filter(w => 
                w.status === 'pending'
            ).map(w => ({ ...w, type: 'withdrawal' }));

            const allPending = [...pendingDeposits, ...pendingWithdrawals]
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .slice(0, 3); // Show only latest 3

            setPendingTransactions(allPending);
            setLoading(false);
        };
        init();
    }, [fetchDeposits, fetchWithdrawals, deposits, withdrawals]);

    if (loading || pendingTransactions.length === 0) {
        return null;
    }

    const getStatusConfig = (status, type) => {
        if (type === 'deposit') {
            switch (status) {
                case 'pending':
                    return {
                        icon: AlertCircle,
                        text: 'Payment Required',
                        color: 'text-amber-500 bg-amber-500/10 border-amber-500/20'
                    };
                case 'ft_submitted':
                    return {
                        icon: Clock,
                        text: 'Under Review',
                        color: 'text-violet-500 bg-violet-500/10 border-violet-500/20'
                    };
                default:
                    return {
                        icon: Clock,
                        text: 'Processing',
                        color: 'text-zinc-500 bg-zinc-500/10 border-zinc-500/20'
                    };
            }
        } else {
            return {
                icon: Clock,
                text: 'Processing',
                color: 'text-violet-500 bg-violet-500/10 border-violet-500/20'
            };
        }
    };

    return (
        <div className="bg-zinc-900 rounded-2xl p-5 border border-zinc-800 mb-6">
            <div className="flex items-center gap-2 mb-4">
                <Bell size={18} className="text-primary-500" />
                <h3 className="font-bold text-white text-sm">Transaction Updates</h3>
                <span className="text-xs text-zinc-500">({pendingTransactions.length})</span>
            </div>

            <div className="space-y-3">
                {pendingTransactions.map((transaction) => {
                    const config = getStatusConfig(transaction.status, transaction.type);
                    const Icon = config.icon;

                    return (
                        <div
                            key={`${transaction.type}-${transaction._id || transaction.id}`}
                            onClick={() => navigate('/transaction-status')}
                            className="flex items-center gap-3 p-3 bg-zinc-950 rounded-xl border border-zinc-800 hover:border-primary-500/30 transition-all cursor-pointer"
                        >
                            <div className={`p-2 rounded-lg ${config.color}`}>
                                <Icon size={16} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-white truncate">
                                    {formatNumber(transaction.type === 'deposit' ? transaction.amount : transaction.netAmount)} ETB
                                </p>
                                <p className="text-xs text-zinc-500">
                                    {transaction.type === 'deposit' ? 'Deposit' : 'Withdrawal'} • {config.text}
                                </p>
                            </div>
                            <div className="text-xs text-zinc-600">
                                {new Date(transaction.createdAt).toLocaleDateString()}
                            </div>
                        </div>
                    );
                })}
            </div>

            <button
                onClick={() => navigate('/transaction-status')}
                className="w-full mt-3 py-2 text-xs text-primary-500 hover:text-primary-400 transition-colors border border-dashed border-zinc-800 rounded-lg hover:border-primary-500/30"
            >
                View All Transactions
            </button>
        </div>
    );
}