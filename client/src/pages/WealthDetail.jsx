import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp } from 'lucide-react';
import Card from '../components/ui/Card';
import { useWealthStore } from '../store/wealthStore';
import { useUserStore } from '../store/userStore';
import { useAuthStore } from '../store/authStore';
import { getServerUrl } from '../config/api.config';
import logo from '../assets/logo.png';

export default function WealthDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user: authUser } = useAuthStore();
    const { wallet, fetchWallet } = useUserStore();
    const { 
        currentFund: fund, 
        loading: storeLoading, 
        fetchFundById, 
        invest, 
        loading: { investing } 
    } = useWealthStore();
    
    const [loading, setLoading] = useState(true);
    const [amount, setAmount] = useState('');
    const [totalRevenue, setTotalRevenue] = useState(0);
    const [showFundingModal, setShowFundingModal] = useState(false);
    const [fundingSource, setFundingSource] = useState({
        incomeWallet: 0,
        personalWallet: 0
    });

    useEffect(() => {
        const init = async () => {
            await Promise.all([
                fetchFundById(id),
                fetchWallet()
            ]);
            setLoading(false);
        };
        init();
    }, [id, fetchFundById, fetchWallet]);

    useEffect(() => {
        if (amount && fund) {
            calculateRevenue();
        } else {
            setTotalRevenue(0);
        }
    }, [amount, fund]);


    const calculateRevenue = () => {
        const investAmount = parseFloat(amount) || 0;
        if (investAmount < fund.minimumDeposit) {
            setTotalRevenue(0);
            return;
        }

        let revenue;
        if (fund.profitType === 'percentage') {
            const dailyProfitAmount = (investAmount * fund.dailyProfit) / 100;
            revenue = investAmount + (dailyProfitAmount * fund.days);
        } else {
            revenue = investAmount + (fund.dailyProfit * fund.days);
        }
        setTotalRevenue(revenue);
    };

    const handleInvestClick = () => {
        const investAmount = parseFloat(amount) || 0;
        
        if (!investAmount) {
            alert('Please enter an amount');
            return;
        }
        
        if (investAmount < fund.minimumDeposit) {
            alert(`Minimum deposit is ${fund.minimumDeposit} ETB`);
            return;
        }
        
        const totalAvailable = wallet.incomeWallet + wallet.personalWallet;
        if (investAmount > totalAvailable) {
            alert('Insufficient balance');
            return;
        }
        
        // Auto-allocate from wallets
        let remaining = investAmount;
        const fromIncome = Math.min(remaining, wallet.incomeWallet);
        remaining -= fromIncome;
        const fromPersonal = Math.min(remaining, wallet.personalWallet);
        
        setFundingSource({
            incomeWallet: fromIncome,
            personalWallet: fromPersonal
        });
        
        setShowFundingModal(true);
    };

    const handleConfirmInvestment = async () => {
        try {
            const result = await invest({
                wealthFundId: id,
                amount: parseFloat(amount),
                fundingSource
            });
            
            if (!result.success) throw new Error(result.message);

            alert('Investment successful!');
            await fetchWallet(true); // Sync wallet
            navigate('/wealth');
        } catch (error) {
            console.error('Error creating investment:', error);
            alert(error.message || 'Error creating investment');
        }
    };

    const adjustFunding = (walletType, value) => {
        const investAmount = parseFloat(amount) || 0;
        let newValue = Math.max(0, parseFloat(value) || 0);
        
        if (walletType === 'income') {
            newValue = Math.min(newValue, wallet.incomeWallet);
            const remaining = investAmount - newValue;
            const personalAmount = Math.min(remaining, wallet.personalWallet);
            
            setFundingSource({
                incomeWallet: newValue,
                personalWallet: personalAmount
            });
        } else if (walletType === 'personal') {
            newValue = Math.min(newValue, wallet.personalWallet);
            const remaining = investAmount - newValue;
            const incomeAmount = Math.min(remaining, wallet.incomeWallet);
            
            setFundingSource({
                incomeWallet: incomeAmount,
                personalWallet: newValue
            });
        }
    };

    const renderImageUrl = (image) => {
        if (!image) return null;
        return image.startsWith('http') ? image : `${getServerUrl()}${image}`;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
                <img 
                    src={logo} 
                    alt="Loading" 
                    className="w-24 h-24 object-contain animate-pulse"
                />
            </div>
        );
    }

    if (!fund) {
        return null;
    }

    const progress = Math.random() * 100; // Mock progress

    return (
        <div className="animate-fade-in min-h-screen bg-zinc-950 pb-20">
            {/* Header */}
            <div className="bg-zinc-900 p-4 flex items-center gap-4 sticky top-0 z-10 border-b border-zinc-800">
                <button
                    onClick={() => navigate('/wealth')}
                    className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
                >
                    <ArrowLeft className="text-white" size={24} />
                </button>
                <h1 className="text-xl font-bold text-white">Wealth Fund</h1>
            </div>

            <div className="p-5 space-y-6">
                {/* Fund Card */}
                <Card className="bg-zinc-900/80 border-zinc-800">
                    <div className="flex items-center gap-4 mb-4">
                        <img
                            src={renderImageUrl(fund.image)}
                            alt={fund.name}
                            className="w-20 h-20 rounded-xl object-cover"
                        />
                        <div className="flex-1">
                            <h2 className="text-xl font-bold text-white mb-1">{fund.name}</h2>
                            <div className="flex items-center gap-2 text-sm">
                                <span className="text-orange-400">{fund.days} Days</span>
                                <span className="text-zinc-600">•</span>
                                <span className="text-orange-400">
                                    Daily Profit: {fund.profitType === 'percentage' ? `${fund.dailyProfit}%` : `${fund.dailyProfit} ETB`}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="mb-4">
                        <p className="text-sm text-zinc-400 mb-2">Minimum Deposit Amount:</p>
                        <p className="text-lg font-bold text-orange-400">ETB {fund.minimumDeposit}</p>
                    </div>

                    {/* Progress Bar */}
                    <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-yellow-500 to-orange-500"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                        <span className="text-xs text-zinc-400">{progress.toFixed(2)}%</span>
                    </div>
                </Card>

                {/* Description */}
                <Card className="bg-zinc-900/80 border-zinc-800">
                    <p className="text-sm text-zinc-300 leading-relaxed">{fund.description}</p>
                </Card>

                {/* Investment Form */}
                <Card className="bg-zinc-900/80 border-zinc-800">
                    <h3 className="text-lg font-bold text-white mb-4">Total Investment</h3>
                    
                    <div className="relative mb-6">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">
                            <TrendingUp size={20} />
                        </div>
                        <input
                            type="number"
                            inputMode="decimal"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder={`Min. ${fund.minimumDeposit}`}
                            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-12 py-4 text-white text-lg focus:outline-none focus:border-indigo-500"
                        />
                    </div>

                    <div className="bg-zinc-800/50 rounded-xl p-4 mb-6">
                        <div className="flex justify-between items-center">
                            <span className="text-zinc-400">Total Revenue</span>
                            <span className="text-2xl font-bold text-orange-400">
                                {totalRevenue.toFixed(2)}
                            </span>
                        </div>
                        {amount && parseFloat(amount) >= fund.minimumDeposit && (
                            <p className="text-xs text-zinc-500 mt-2">
                                Profit: {(totalRevenue - parseFloat(amount)).toFixed(2)} ETB
                            </p>
                        )}
                    </div>

                    <button
                        onClick={handleInvestClick}
                        disabled={!amount || parseFloat(amount) < fund.minimumDeposit}
                        className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold py-4 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all"
                    >
                        Investment
                    </button>
                </Card>
            </div>

            {/* Funding Source Modal */}
            {showFundingModal && (
                <div className="fixed inset-0 bg-black/80 flex items-end md:items-center md:justify-center z-[100] animate-fade-in">
                    <div className="bg-zinc-900 w-full md:w-full md:max-w-md rounded-t-3xl md:rounded-3xl p-4 pb-6 animate-slide-up max-h-[92vh] overflow-y-auto">
                        {/* Header */}
                        <div className="mb-4">
                            <h3 className="text-xl font-bold text-white mb-1">Select Funding Source</h3>
                            <p className="text-xs text-zinc-400">Choose how to fund your investment</p>
                        </div>
                        
                        <div className="space-y-3 mb-4">
                            {/* Income Wallet */}
                            <div className="bg-zinc-800/50 rounded-2xl p-4 border border-zinc-700/50">
                                <div className="flex justify-between items-center mb-3">
                                    <label className="text-sm font-semibold text-white">
                                        Income Wallet
                                    </label>
                                    <span className="text-xs text-zinc-400 bg-zinc-800 px-3 py-1 rounded-full">
                                        Available: {wallet.incomeWallet.toFixed(2)} ETB
                                    </span>
                                </div>
                                <input
                                    type="number"
                                    inputMode="decimal"
                                    value={fundingSource.incomeWallet}
                                    onChange={(e) => adjustFunding('income', e.target.value)}
                                    placeholder="0.00"
                                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3.5 text-white text-lg font-semibold focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                                />
                            </div>

                            {/* Personal Wallet */}
                            <div className="bg-zinc-800/50 rounded-2xl p-4 border border-zinc-700/50">
                                <div className="flex justify-between items-center mb-3">
                                    <label className="text-sm font-semibold text-white">
                                        Personal Wallet
                                    </label>
                                    <span className="text-xs text-zinc-400 bg-zinc-800 px-3 py-1 rounded-full">
                                        Available: {wallet.personalWallet.toFixed(2)} ETB
                                    </span>
                                </div>
                                <input
                                    type="number"
                                    inputMode="decimal"
                                    value={fundingSource.personalWallet}
                                    onChange={(e) => adjustFunding('personal', e.target.value)}
                                    placeholder="0.00"
                                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3.5 text-white text-lg font-semibold focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                                />
                            </div>


                            {/* Summary Card */}
                            <div className="bg-gradient-to-br from-indigo-900/30 to-purple-900/30 rounded-2xl p-5 border border-indigo-500/20">
                                <div className="flex justify-between items-center mb-3">
                                    <span className="text-sm text-zinc-300">Total Selected</span>
                                    <span className="text-2xl font-bold text-white">
                                        {(fundingSource.incomeWallet + fundingSource.personalWallet).toFixed(2)} ETB
                                    </span>
                                </div>
                                <div className="flex justify-between items-center pt-3 border-t border-zinc-700/50">
                                    <span className="text-sm text-zinc-300">Required Amount</span>
                                    <span className="text-lg font-bold text-orange-400">{amount} ETB</span>
                                </div>
                                {(fundingSource.incomeWallet + fundingSource.personalWallet) !== parseFloat(amount) && (
                                    <div className="mt-3 pt-3 border-t border-zinc-700/50">
                                        <p className="text-xs text-red-400 text-center">
                                            ⚠️ Total must equal required amount
                                        </p>
                                    </div>
                                )}
                            </div>

                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3 pt-2">
                            <button
                                onClick={() => {
                                    setShowFundingModal(false);
                                }}
                                className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold py-4 rounded-xl transition-all active:scale-95"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmInvestment}
                                disabled={
                                    investing ||
                                    (fundingSource.incomeWallet + fundingSource.personalWallet) !== parseFloat(amount)
                                }
                                className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold py-4 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 shadow-lg shadow-orange-500/20"
                            >
                                {investing ? 'Processing...' : 'Confirm Investment'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
