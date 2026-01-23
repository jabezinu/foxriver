import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Wallet, ShieldCheck, Eye, EyeOff, History, ExternalLink } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useUserStore } from '../store/userStore';
import { withdrawalAPI } from '../services/api';
import { formatNumber } from '../utils/formatNumber';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Loading from '../components/Loading';
import TransactionStatusBadge from '../components/TransactionStatusBadge';

export default function Withdraw() {
    const navigate = useNavigate();
    // Use store data
    const { wallet, fetchWallet } = useUserStore();

    const [loading, setLoading] = useState(true);
    // wallets state is replaced by store wallet

    // We don't really need profile here based on the code shown (it was fetched but not obviously used in render, checked: line 36 sets it, line 16 defines it. line 36 is the only usage. It's not used in JSX. Wait, let me check JSX again. 
    // I see no usage of `profile` in JSX of Withdraw.jsx. It seems unused. I'll remove it.)

    const [selectedAmount, setSelectedAmount] = useState(null);
    const [walletType, setWalletType] = useState('income');
    const [transactionPassword, setTransactionPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [history, setHistory] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(false);

    const amounts = [750, 1600, 4500, 10000, 18700, 31500, 53200];

    useEffect(() => {
        const init = async () => {
            await fetchWallet();
            setLoading(false);
        };
        
        const fetchHistory = async () => {
            setLoadingHistory(true);
            try {
                const res = await withdrawalAPI.getUserWithdrawals();
                setHistory(res.data.withdrawals || []);
            } catch (error) {
                console.error('Failed to load withdrawal history', error);
            } finally {
                setLoadingHistory(false);
            }
        };
        
        init();
        fetchHistory();
    }, [fetchWallet]);

    // Derived values using store wallet
    // Renaming usages of 'wallets' to 'wallet' in the rest of the file via this replacer? 
    // No, I need to do that separately or mapping it here.
    // Let's alias it for minimal diffs if possible, or just update usages.
    // Updating usages is better practice. I will do it in next steps.
    // For now, let's just alias it.
    const wallets = wallet;


    const handleWithdraw = async () => {
        if (!selectedAmount || !transactionPassword) {
            toast.error('Please select amount and enter transaction password');
            return;
        }

        if (transactionPassword.length !== 6) {
            toast.error('Transaction password must be exactly 6 digits');
            return;
        }

        if (wallets[`${walletType}Wallet`] < selectedAmount) {
            toast.error('Insufficient balance in selected wallet');
            return;
        }

        setSubmitting(true);
        try {
            await withdrawalAPI.create({
                amount: selectedAmount,
                walletType,
                transactionPassword
            });
            toast.success('Withdrawal request submitted!');
            navigate('/');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Withdrawal failed');
        } finally {
            setSubmitting(false);
        }
    };

    const netAmount = selectedAmount ? selectedAmount * 0.9 : 0;
    const taxAmount = selectedAmount ? selectedAmount * 0.1 : 0;

    if (loading) return <Loading />;

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
                <h1 className="text-xl font-bold text-white">Withdraw</h1>
            </div>

            <div className="max-w-md mx-auto px-4 py-6">
                {/* Wallet Balances Summary */}
                <div className="bg-zinc-900 rounded-2xl p-5 shadow-sm mb-6 border border-zinc-800">
                    <div className="flex justify-between items-stretch">
                        <div className="flex-1">
                            <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider mb-1">Income Balance</p>
                            <p className="text-xl font-bold text-white">{formatNumber(wallets.incomeWallet)} <span className="text-xs text-zinc-500 font-medium">ETB</span></p>
                        </div>
                        <div className="w-px bg-zinc-800 mx-4"></div>
                        <div className="flex-1 text-right">
                            <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider mb-1">Personal Balance</p>
                            <p className="text-xl font-bold text-white">{formatNumber(wallets.personalWallet)} <span className="text-xs text-zinc-500 font-medium">ETB</span></p>
                        </div>
                    </div>
                </div>

                {/* Wallet Selector */}
                <div className="mb-6">
                    <label className="block text-sm font-bold text-zinc-400 mb-3 ml-1 uppercase tracking-wider text-[10px]">Withdraw From</label>
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={() => setWalletType('income')}
                            className={`p-4 rounded-xl border transition-all flex flex-col items-center gap-2 ${walletType === 'income'
                                ? 'border-primary-500 bg-primary-500/10 text-primary-500 shadow-glow'
                                : 'border-zinc-800 bg-zinc-900 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300'
                                }`}
                        >
                            <Wallet size={24} strokeWidth={walletType === 'income' ? 2 : 1.5} />
                            <span className="text-xs font-bold uppercase">Income Wallet</span>
                        </button>
                        <button
                            onClick={() => setWalletType('personal')}
                            className={`p-4 rounded-xl border transition-all flex flex-col items-center gap-2 ${walletType === 'personal'
                                ? 'border-primary-500 bg-primary-500/10 text-primary-500 shadow-glow'
                                : 'border-zinc-800 bg-zinc-900 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300'
                                }`}
                        >
                            <Wallet size={24} strokeWidth={walletType === 'personal' ? 2 : 1.5} />
                            <span className="text-xs font-bold uppercase">Personal Wallet</span>
                        </button>
                    </div>
                </div>

                {/* Amount Selection */}
                <div className="bg-zinc-900 rounded-2xl p-5 shadow-sm border border-zinc-800 mb-6">
                    <div className="flex justify-between items-end mb-4">
                        <h3 className="font-bold text-white text-sm">Withdraw Amount</h3>
                        <div className="text-right">
                            <span className="text-xl font-bold text-primary-500">
                                {selectedAmount ? formatNumber(selectedAmount) : '0'}
                            </span>
                            <span className="text-xs font-medium text-zinc-500 ml-1">ETB</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-4 gap-2">
                        {amounts.map((amount) => (
                            <button
                                key={amount}
                                onClick={() => setSelectedAmount(amount)}
                                className={`
                                    py-2.5 rounded-lg font-bold text-xs transition-all border
                                    ${selectedAmount === amount
                                        ? 'border-primary-500 bg-primary-500/10 text-primary-500 shadow-glow'
                                        : 'border-zinc-800 bg-zinc-950 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300'
                                    }
                                `}
                            >
                                {formatNumber(amount)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tax Info */}
                {selectedAmount && (
                    <div className="bg-violet-500/10 rounded-2xl p-5 mb-6 border border-violet-500/20 animate-slide-up">
                        <div className="flex justify-between items-center mb-3">
                            <span className="text-xs font-bold text-violet-500 uppercase tracking-wide">Summary</span>
                            <ShieldCheck size={18} className="text-violet-500" />
                        </div>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between text-violet-200/70">
                                <span>Gross Amount</span>
                                <span className="font-medium">{formatNumber(selectedAmount)} ETB</span>
                            </div>
                            <div className="flex justify-between text-violet-200/70">
                                <span>Tax (10%)</span>
                                <span className="font-medium text-red-400">-{formatNumber(taxAmount)} ETB</span>
                            </div>
                            <div className="pt-2 border-t border-violet-500/20 flex justify-between items-center mt-1">
                                <span className="font-bold text-violet-200">Net Arrival</span>
                                <span className="font-bold text-lg text-emerald-400">{formatNumber(netAmount)} ETB</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Transaction Password */}
                <Card className="p-6 mb-8 border-zinc-800 bg-zinc-900">
                    <label className="block text-sm font-bold text-zinc-300 mb-4 text-center">Transaction Password</label>
                    <div className="relative max-w-[200px] mx-auto">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            value={transactionPassword}
                            onChange={(e) => setTransactionPassword(e.target.value)}
                            placeholder="••••••"
                            maxLength={6}
                            className="w-full text-center text-2xl tracking-[0.5em] py-3 border-b-2 border-zinc-700 focus:border-primary-500 outline-none transition-colors bg-transparent placeholder:tracking-normal font-mono text-white"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute -right-8 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 p-1"
                        >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>
                    <p className="text-xs text-center text-zinc-500 mt-4">Enter your 6-digit pin to confirm</p>
                </Card>

                <Button
                    onClick={handleWithdraw}
                    loading={submitting}
                    disabled={submitting}
                    size="lg"
                    className="w-full shadow-glow"
                >
                    Submit Request
                </Button>

                {/* Withdrawal Restrictions Notice */}
                <div className="mt-6 bg-amber-500/10 rounded-xl p-4 border border-amber-500/20">
                    <p className="text-xs text-amber-200/80 text-center leading-relaxed">
                        ⚠️ Please note: Withdrawals are not processed on Sundays and public holidays.
                    </p>
                </div>

                {/* Recent Withdrawals */}
                {!loadingHistory && history.length > 0 && (
                    <div className="mt-8 space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <History size={18} className="text-zinc-500" />
                                <h3 className="font-bold text-zinc-300 text-sm uppercase tracking-wider">Recent Withdrawals</h3>
                            </div>
                            <button
                                onClick={() => navigate('/transaction-status')}
                                className="flex items-center gap-1 text-xs text-primary-500 hover:text-primary-400 transition-colors"
                            >
                                View All
                                <ExternalLink size={12} />
                            </button>
                        </div>
                        
                        <div className="space-y-3">
                            {history.slice(0, 2).map((item, index) => (
                                <div key={item._id || `withdrawal-${index}`} className="bg-zinc-900 rounded-2xl p-4 shadow-sm border border-zinc-800 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`
                                            p-2.5 rounded-xl
                                            ${item.status === 'approved' ? 'bg-emerald-500/10 text-emerald-500' :
                                                item.status === 'rejected' ? 'bg-red-500/10 text-red-500' :
                                                    'bg-amber-500/10 text-amber-500'}
                                        `}>
                                            <Wallet size={20} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-white text-sm">{formatNumber(item.netAmount)} ETB</p>
                                            <p className="text-[10px] text-zinc-500 font-medium">
                                                {item.walletType} • {new Date(item.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <TransactionStatusBadge status={item.status} size="xs" />
                                </div>
                            ))}
                            {history.length > 2 && (
                                <button
                                    onClick={() => navigate('/transaction-status')}
                                    className="w-full py-3 text-xs text-primary-500 hover:text-primary-400 transition-colors border border-dashed border-zinc-800 rounded-xl hover:border-primary-500/30"
                                >
                                    View {history.length - 2} more transactions
                                </button>
                            )}
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
