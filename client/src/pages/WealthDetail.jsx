import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp } from 'lucide-react';
import Card from '../components/ui/Card';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';

export default function WealthDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuthStore();
    
    const [fund, setFund] = useState(null);
    const [loading, setLoading] = useState(true);
    const [amount, setAmount] = useState('');
    const [totalRevenue, setTotalRevenue] = useState(0);
    const [showFundingModal, setShowFundingModal] = useState(false);
    const [fundingSource, setFundingSource] = useState({
        incomeWallet: 0,
        personalWallet: 0
    });
    const [transactionPassword, setTransactionPassword] = useState('');
    const [investing, setInvesting] = useState(false);

    useEffect(() => {
        fetchFund();
    }, [id]);

    useEffect(() => {
        if (amount && fund) {
            calculateRevenue();
        } else {
            setTotalRevenue(0);
        }
    }, [amount, fund]);

    const fetchFund = async () => {
        try {
            const token = localStorage.getItem('foxriver_token');
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/wealth/funds/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setFund(response.data.data);
        } catch (error) {
            console.error('Error fetching fund:', error);
            alert('Error loading fund details');
            navigate('/wealth');
        } finally {
            setLoading(false);
        }
    };

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
        
        const totalAvailable = user.incomeWallet + user.personalWallet;
        if (investAmount > totalAvailable) {
            alert('Insufficient balance');
            return;
        }
        
        // Auto-allocate from wallets
        let remaining = investAmount;
        const fromIncome = Math.min(remaining, user.incomeWallet);
        remaining -= fromIncome;
        const fromPersonal = Math.min(remaining, user.personalWallet);
        
        setFundingSource({
            incomeWallet: fromIncome,
            personalWallet: fromPersonal
        });
        
        setShowFundingModal(true);
    };

    const handleConfirmInvestment = async () => {
        if (!transactionPassword) {
            alert('Please enter your transaction password');
            return;
        }

        setInvesting(true);
        try {
            const token = localStorage.getItem('foxriver_token');
            await axios.post(
                `${import.meta.env.VITE_API_URL}/wealth/invest`,
                {
                    wealthFundId: id,
                    amount: parseFloat(amount),
                    fundingSource,
                    transactionPassword
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            alert('Investment successful!');
            navigate('/wealth');
        } catch (error) {
            console.error('Error creating investment:', error);
            alert(error.response?.data?.message || 'Error creating investment');
        } finally {
            setInvesting(false);
        }
    };

    const adjustFunding = (wallet, value) => {
        const investAmount = parseFloat(amount) || 0;
        let newValue = Math.max(0, parseFloat(value) || 0);
        
        if (wallet === 'income') {
            newValue = Math.min(newValue, user.incomeWallet);
            const remaining = investAmount - newValue;
            const personalAmount = Math.min(remaining, user.personalWallet);
            
            setFundingSource({
                incomeWallet: newValue,
                personalWallet: personalAmount
            });
        } else {
            newValue = Math.min(newValue, user.personalWallet);
            const remaining = investAmount - newValue;
            const incomeAmount = Math.min(remaining, user.incomeWallet);
            
            setFundingSource({
                incomeWallet: incomeAmount,
                personalWallet: newValue
            });
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
                <div className="animate-spin w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
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
                            src={fund.image}
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
                <div className="fixed inset-0 bg-black/80 flex items-end z-50 animate-fade-in">
                    <div className="bg-zinc-900 w-full rounded-t-3xl p-6 animate-slide-up">
                        <h3 className="text-xl font-bold text-white mb-6">Select Funding Source</h3>
                        
                        <div className="space-y-4 mb-6">
                            <div>
                                <label className="text-sm text-zinc-400 mb-2 block">
                                    From Income Wallet (Available: {user.incomeWallet.toFixed(2)} ETB)
                                </label>
                                <input
                                    type="number"
                                    value={fundingSource.incomeWallet}
                                    onChange={(e) => adjustFunding('income', e.target.value)}
                                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500"
                                />
                            </div>

                            <div>
                                <label className="text-sm text-zinc-400 mb-2 block">
                                    From Personal Wallet (Available: {user.personalWallet.toFixed(2)} ETB)
                                </label>
                                <input
                                    type="number"
                                    value={fundingSource.personalWallet}
                                    onChange={(e) => adjustFunding('personal', e.target.value)}
                                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500"
                                />
                            </div>

                            <div className="bg-zinc-800/50 rounded-xl p-4">
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-zinc-400">Total</span>
                                    <span className="text-white font-semibold">
                                        {(fundingSource.incomeWallet + fundingSource.personalWallet).toFixed(2)} ETB
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-zinc-400">Required</span>
                                    <span className="text-orange-400 font-semibold">{amount} ETB</span>
                                </div>
                            </div>

                            <div>
                                <label className="text-sm text-zinc-400 mb-2 block">
                                    Transaction Password
                                </label>
                                <input
                                    type="password"
                                    value={transactionPassword}
                                    onChange={(e) => setTransactionPassword(e.target.value)}
                                    placeholder="Enter 6-digit password"
                                    maxLength={6}
                                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowFundingModal(false);
                                    setTransactionPassword('');
                                }}
                                className="flex-1 bg-zinc-800 text-white font-semibold py-4 rounded-xl"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmInvestment}
                                disabled={
                                    investing ||
                                    (fundingSource.incomeWallet + fundingSource.personalWallet) !== parseFloat(amount) ||
                                    !transactionPassword
                                }
                                className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold py-4 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
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
