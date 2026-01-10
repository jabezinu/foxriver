import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, ShieldCheck, Zap, ChevronRight } from 'lucide-react';
import Card from '../components/ui/Card';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';

export default function Wealth() {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const [funds, setFunds] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchFunds();
    }, []);

    const fetchFunds = async () => {
        try {
            const token = localStorage.getItem('foxriver_token');
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/wealth/funds`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setFunds(response.data.data);
        } catch (error) {
            console.error('Error fetching funds:', error);
        } finally {
            setLoading(false);
        }
    };

    const calculateProgress = (fund) => {
        // Mock progress calculation - you can customize this
        return Math.random() * 100;
    };

    return (
        <div className="animate-fade-in p-5 py-8 min-h-screen bg-zinc-950">
            {/* Header */}
            <div className="bg-gradient-to-br from-indigo-900 to-purple-900 rounded-[2rem] p-8 text-white text-center shadow-lg shadow-indigo-900/20 mb-8 relative overflow-hidden border border-white/5">
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -mr-12 -mt-12 blur-2xl pointer-events-none"></div>

                <div className="relative z-10">
                    <div className="w-20 h-20 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6 backdrop-blur-sm border border-white/10">
                        <TrendingUp className="text-primary-400" size={40} />
                    </div>
                    <h2 className="text-2xl font-bold mb-2 tracking-tight">Wealth Fund</h2>
                    <p className="text-zinc-300 text-sm font-medium leading-relaxed max-w-xs mx-auto">
                        High yield asset management exclusively for Foxriver members.
                    </p>
                </div>
            </div>

            {/* User Wallets */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/10 border-yellow-500/20">
                    <p className="text-xs text-yellow-400 mb-1">Income Wallet</p>
                    <p className="text-2xl font-bold text-yellow-400">ETB {user?.incomeWallet?.toFixed(2) || '0.00'}</p>
                </Card>
                <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 border-orange-500/20">
                    <p className="text-xs text-orange-400 mb-1">Personal Wallet</p>
                    <p className="text-2xl font-bold text-orange-400">ETB {user?.personalWallet?.toFixed(2) || '0.00'}</p>
                </Card>
            </div>

            {/* Wealth Funds List */}
            <div className="space-y-6">
                {loading ? (
                    <Card className="text-center py-8">
                        <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto"></div>
                        <p className="text-zinc-400 mt-4">Loading funds...</p>
                    </Card>
                ) : funds.length > 0 ? (
                    <>
                        <h3 className="text-lg font-bold text-white mb-4">Storage Period</h3>
                        {funds.map((fund) => {
                            const progress = calculateProgress(fund);
                            return (
                                <Card
                                    key={fund._id}
                                    className="bg-zinc-900/80 border-zinc-800 hover:border-indigo-500/50 transition-all cursor-pointer"
                                    onClick={() => navigate(`/wealth/${fund._id}`)}
                                >
                                    <div className="flex items-center gap-4">
                                        <img
                                            src={fund.image}
                                            alt={fund.name}
                                            className="w-20 h-20 rounded-xl object-cover"
                                        />
                                        <div className="flex-1">
                                            <h4 className="text-white font-bold mb-2">{fund.name}</h4>
                                            <div className="space-y-1 text-sm">
                                                <div className="flex justify-between">
                                                    <span className="text-orange-400">{fund.days} Days</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-zinc-400">Daily Profit:</span>
                                                    <span className="text-orange-400 font-semibold">
                                                        {fund.profitType === 'percentage' ? `${fund.dailyProfit}%` : `${fund.dailyProfit} ETB`}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-zinc-400">Minimum Deposit Amount:</span>
                                                </div>
                                                <div className="text-orange-400 font-bold">ETB {fund.minimumDeposit}</div>
                                            </div>
                                            
                                            {/* Progress Bar */}
                                            <div className="mt-3 flex items-center gap-2">
                                                <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-gradient-to-r from-yellow-500 to-orange-500"
                                                        style={{ width: `${progress}%` }}
                                                    />
                                                </div>
                                                <span className="text-xs text-zinc-400">{progress.toFixed(2)}%</span>
                                            </div>
                                        </div>
                                        <ChevronRight className="text-zinc-600" size={20} />
                                    </div>
                                </Card>
                            );
                        })}
                    </>
                ) : (
                    <Card className="text-center py-16 border-dashed border-2 border-zinc-800 bg-zinc-900/50 shadow-none">
                        <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-4 border border-zinc-800 shadow-sm">
                            <Zap className="text-zinc-600" size={24} />
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2">No Funds Available</h3>
                        <p className="text-zinc-500 text-sm leading-relaxed max-w-[260px] mx-auto">
                            Investment options are currently being prepared.
                        </p>
                    </Card>
                )}

                {/* Security Notice */}
                <div className="bg-emerald-900/10 rounded-2xl p-4 flex items-center gap-4 border border-emerald-500/20">
                    <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500 shadow-sm border border-emerald-500/20">
                        <ShieldCheck size={24} />
                    </div>
                    <div className="flex-1">
                        <p className="text-xs font-bold text-emerald-400 uppercase tracking-wide mb-0.5">Secure Assurance</p>
                        <p className="text-xs text-emerald-600/80 font-medium leading-snug">
                            All funds within the Wealth program are backed by Foxriver Reserve Capitals.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
