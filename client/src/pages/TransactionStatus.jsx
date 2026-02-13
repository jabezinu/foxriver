import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard, Wallet, Clock, CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useDepositStore } from '../store/depositStore';
import { useWithdrawalStore } from '../store/withdrawalStore';
import { formatNumber } from '../utils/formatNumber';
import Loading from '../components/Loading';
import Button from '../components/ui/Button';

export default function TransactionStatus() {
    const navigate = useNavigate();
    const { 
        history: deposits, 
        fetchHistory: fetchDeposits, 
        loadingHistory: depositLoading 
    } = useDepositStore();
    const { 
        history: withdrawals, 
        fetchHistory: fetchWithdrawals, 
        loading: withdrawalLoading 
    } = useWithdrawalStore();

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState('deposits');

    const fetchTransactions = async (showRefreshIndicator = false) => {
        if (showRefreshIndicator) setRefreshing(true);

        try {
            await Promise.all([
                fetchDeposits(),
                fetchWithdrawals()
            ]);
        } catch (error) {
            toast.error('Failed to load transactions');
            console.error(error);
        } finally {
            setLoading(false);
            if (showRefreshIndicator) setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, []);

    const getStatusIcon = (status, type) => {
        switch (status) {
            case 'approved':
                return <CheckCircle size={20} className="text-emerald-500" />;
            case 'rejected':
                return <XCircle size={20} className="text-red-500" />;
            case 'ft_submitted':
                return <Clock size={20} className="text-violet-500" />;
            case 'pending':
                return <AlertCircle size={20} className="text-amber-500" />;
            default:
                return <Clock size={20} className="text-zinc-500" />;
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'approved':
                return 'Approved';
            case 'rejected':
                return 'Rejected';
            case 'ft_submitted':
                return 'Pending';
            case 'pending':
                return 'Pending';
            default:
                return 'Unknown';
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'approved':
                return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
            case 'rejected':
                return 'text-red-500 bg-red-500/10 border-red-500/20';
            case 'ft_submitted':
                return 'text-violet-500 bg-violet-500/10 border-violet-500/20';
            case 'pending':
                return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
            default:
                return 'text-zinc-500 bg-zinc-500/10 border-zinc-500/20';
        }
    };

    const getProgressSteps = (transaction, type) => {
        if (type === 'deposit') {
            return [
                {
                    label: 'Request Created',
                    completed: true,
                    timestamp: transaction.createdAt
                },
                {
                    label: 'Payment Submitted',
                    completed: ['ft_submitted', 'approved', 'rejected'].includes(transaction.status),
                    timestamp: transaction.status !== 'pending' ? transaction.updatedAt : null
                },
                {
                    label: transaction.status === 'rejected' ? 'Disproved' : 'Approved',
                    completed: ['approved', 'rejected'].includes(transaction.status),
                    timestamp: transaction.approvedAt || (transaction.status === 'rejected' ? transaction.updatedAt : null),
                    isRejected: transaction.status === 'rejected'
                }
            ];
        } else {
            return [
                {
                    label: 'Request Submitted',
                    completed: true,
                    timestamp: transaction.createdAt
                },
                {
                    label: transaction.status === 'rejected' ? 'Disproved' : 'Approved',
                    completed: ['approved', 'rejected'].includes(transaction.status),
                    timestamp: transaction.approvedAt || (transaction.status === 'rejected' ? transaction.updatedAt : null),
                    isRejected: transaction.status === 'rejected'
                }
            ];
        }
    };

    const TransactionCard = ({ transaction, type }) => {
        const steps = getProgressSteps(transaction, type);
        const isDeposit = type === 'deposit';

        return (
            <div className="bg-zinc-900 rounded-2xl p-5 border border-zinc-800 mb-4">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-xl ${getStatusColor(transaction.status)}`}>
                            {isDeposit ? <CreditCard size={20} /> : <Wallet size={20} />}
                        </div>
                        <div>
                            <p className="font-bold text-white text-lg">
                                {formatNumber(transaction.amount)} ETB
                            </p>
                            <p className="text-xs text-zinc-500">
                                {isDeposit ? 'Deposit' : `${transaction.walletType} Withdrawal`}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {getStatusIcon(transaction.status, type)}
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${getStatusColor(transaction.status)}`}>
                            {getStatusText(transaction.status)}
                        </span>
                    </div>
                </div>

                {/* Order ID for deposits */}
                {isDeposit && transaction.orderId && (
                    <div className="mb-4 p-3 bg-zinc-950 rounded-xl border border-zinc-800">
                        <p className="text-xs text-zinc-500 mb-1">Order ID</p>
                        <p className="font-mono text-sm text-zinc-300">{transaction.orderId}</p>
                    </div>
                )}

                {/* Transaction ID for deposits */}
                {isDeposit && transaction.transactionFT && (
                    <div className="mb-4 p-3 bg-zinc-950 rounded-xl border border-zinc-800">
                        <p className="text-xs text-zinc-500 mb-1">Transaction ID</p>
                        <p className="font-mono text-sm text-zinc-300">{transaction.transactionFT}</p>
                    </div>
                )}

                {/* Withdrawal details */}
                {!isDeposit && (
                    <div className="mb-4 p-3 bg-zinc-950 rounded-xl border border-zinc-800">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-xs text-zinc-500 mb-1">Gross Amount</p>
                                <p className="text-zinc-300">{formatNumber(transaction.grossAmount)} ETB</p>
                            </div>
                            <div>
                                <p className="text-xs text-zinc-500 mb-1">Tax (10%)</p>
                                <p className="text-red-400">-{formatNumber(transaction.taxAmount)} ETB</p>
                            </div>
                            <div className="col-span-2 pt-2 border-t border-zinc-800">
                                <p className="text-xs text-zinc-500 mb-1">Net Amount</p>
                                <p className="text-emerald-400 font-bold">{formatNumber(transaction.netAmount)} ETB</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Progress Steps */}
                <div className="space-y-3">
                    {steps.map((step, index) => (
                        <div key={index} className="flex items-center gap-3">
                            <div className={`
                                w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                                ${step.completed
                                    ? step.isRejected
                                        ? 'bg-red-500 text-white'
                                        : 'bg-emerald-500 text-white'
                                    : 'bg-zinc-700 text-zinc-400'
                                }
                            `}>
                                {step.completed ? (step.isRejected ? '✕' : '✓') : index + 1}
                            </div>
                            <div className="flex-1">
                                <p className={`text-sm font-medium ${step.completed
                                    ? step.isRejected
                                        ? 'text-red-400'
                                        : 'text-emerald-400'
                                    : 'text-zinc-500'
                                    }`}>
                                    {step.label}
                                </p>
                                {step.timestamp && (
                                    <p className="text-xs text-zinc-600">
                                        {new Date(step.timestamp).toLocaleString()}
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Admin Notes */}
                {transaction.adminNotes && (
                    <div className="mt-4 p-3 bg-amber-500/10 rounded-xl border border-amber-500/20">
                        <p className="text-xs text-amber-500 font-bold mb-1">Admin Notes</p>
                        <p className="text-sm text-amber-200/80">{transaction.adminNotes}</p>
                    </div>
                )}
            </div>
        );
    };

    if (loading) return <Loading />;

    const currentTransactions = activeTab === 'deposits' ? deposits : withdrawals;

    return (
        <div className="min-h-screen bg-zinc-950 pb-8 animate-fade-in">
            {/* Header */}
            <div className="bg-zinc-900/80 backdrop-blur-md px-4 py-3 flex items-center gap-4 sticky top-0 z-30 border-b border-zinc-800">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 -ml-2 rounded-full text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
                >
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-xl font-bold text-white">Transaction Status</h1>
                <div className="ml-auto">
                    <button
                        onClick={() => fetchTransactions(true)}
                        disabled={refreshing}
                        className="p-2 rounded-full text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors disabled:opacity-50"
                    >
                        <RefreshCw size={20} className={refreshing ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>

            <div className="max-w-md mx-auto px-4 py-6">
                {/* Tab Selector */}
                <div className="bg-zinc-900 rounded-2xl p-1 mb-6 border border-zinc-800">
                    <div className="grid grid-cols-2 gap-1">
                        <button
                            onClick={() => setActiveTab('deposits')}
                            className={`py-3 px-4 rounded-xl font-bold text-sm transition-all ${activeTab === 'deposits'
                                ? 'bg-primary-500 text-white shadow-glow'
                                : 'text-zinc-400 hover:text-white'
                                }`}
                        >
                            Deposits ({deposits.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('withdrawals')}
                            className={`py-3 px-4 rounded-xl font-bold text-sm transition-all ${activeTab === 'withdrawals'
                                ? 'bg-primary-500 text-white shadow-glow'
                                : 'text-zinc-400 hover:text-white'
                                }`}
                        >
                            Withdrawals ({withdrawals.length})
                        </button>
                    </div>
                </div>

                {/* Transactions List */}
                {currentTransactions.length === 0 ? (
                    <div className="text-center py-12 border border-dashed border-zinc-800 rounded-2xl bg-zinc-900/50">
                        <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
                            {activeTab === 'deposits' ? <CreditCard size={24} className="text-zinc-500" /> : <Wallet size={24} className="text-zinc-500" />}
                        </div>
                        <p className="text-zinc-500 font-medium mb-2">No {activeTab} found</p>
                        <p className="text-xs text-zinc-600">Your {activeTab} will appear here</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {currentTransactions.map((transaction) => (
                            <TransactionCard
                                key={transaction._id || transaction.id}
                                transaction={transaction}
                                type={activeTab === 'deposits' ? 'deposit' : 'withdrawal'}
                            />
                        ))}
                    </div>
                )}

                {/* Quick Actions */}
                <div className="mt-8 grid grid-cols-2 gap-3">
                    <Button
                        onClick={() => navigate('/deposit')}
                        variant="outline"
                        className="flex items-center justify-center gap-2"
                    >
                        <CreditCard size={18} />
                        New Deposit
                    </Button>
                    <Button
                        onClick={() => navigate('/withdraw')}
                        variant="outline"
                        className="flex items-center justify-center gap-2"
                    >
                        <Wallet size={18} />
                        New Withdrawal
                    </Button>
                </div>
            </div>
        </div>
    );
}