import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { membershipAPI, rankUpgradeAPI } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { toast } from 'react-hot-toast';
import { ChevronLeft, Zap, CheckCircle, Crown, Lock, Star, AlertTriangle } from 'lucide-react';
import Loading from '../components/Loading';
import { formatNumber } from '../utils/formatNumber';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

export default function TierList() {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const [tiers, setTiers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTiers = async () => {
            try {
                const res = await membershipAPI.getTiers();
                setTiers(res.data.tiers);
            } catch (error) {
                toast.error('Failed to fetch tier list');
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchTiers();
    }, []);

    const isHigherLevel = (tierLevel) => {
        const levels = ['Intern', 'Rank 1', 'Rank 2', 'Rank 3', 'Rank 4', 'Rank 5', 'Rank 6', 'Rank 7', 'Rank 8', 'Rank 9', 'Rank 10'];
        const currentIdx = levels.indexOf(user?.membershipLevel || 'Intern');
        const tierIdx = levels.indexOf(tierLevel);
        return tierIdx > currentIdx;
    };

    const handleUpgradeClick = () => {
        navigate('/rank-upgrade');
    };

    if (loading) return <Loading />;

    return (
        <div className="min-h-screen bg-zinc-950 pb-20 animate-fade-in">
            {/* Header */}
            <div className="bg-zinc-900/80 backdrop-blur-md px-4 py-3 flex items-center gap-4 sticky top-0 z-30 border-b border-zinc-800">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 -ml-2 rounded-full text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
                >
                    <ChevronLeft size={24} />
                </button>
                <h1 className="text-xl font-bold text-white">Membership Tiers</h1>
            </div>

            <div className="px-4 py-6 space-y-4">
                {/* Important Notice */}
                <div className="bg-amber-900/20 border border-amber-500/20 rounded-2xl p-4 mb-6">
                    <div className="flex items-start gap-3">
                        <div className="bg-amber-500/10 p-2 rounded-lg">
                            <AlertTriangle size={20} className="text-amber-500" />
                        </div>
                        <div>
                            <h3 className="text-amber-400 font-bold text-sm mb-1">New Upgrade Process</h3>
                            <p className="text-amber-200/80 text-xs leading-relaxed mb-2">
                                All rank upgrades now require a new deposit. You can no longer upgrade using existing wallet funds.
                            </p>
                            <Button
                                onClick={handleUpgradeClick}
                                size="sm"
                                className="bg-amber-500 hover:bg-amber-600 text-black font-bold"
                            >
                                Go to New Upgrade Process
                            </Button>
                        </div>
                    </div>
                </div>

                {tiers.map((tier, index) => {
                    const isCurrent = user?.membershipLevel === tier.level;
                    const canUpgrade = isHigherLevel(tier.level);

                    // Determine styling based on tier (just simple alteration for visual variety)
                    const isPremium = index >= 4;

                    return (
                        <Card
                            key={index}
                            className={`relative overflow-hidden transition-all duration-300 border-zinc-800 bg-zinc-900 ${isCurrent
                                ? 'border-primary-500 shadow-lg shadow-primary-500/10 ring-1 ring-primary-500'
                                : canUpgrade
                                    ? 'hover:border-zinc-700 hover:shadow-card'
                                    : 'opacity-60 grayscale-[0.8]'
                                }`}
                        >
                            {/* Background decoration */}
                            {isCurrent && <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 rounded-full -mr-10 -mt-10 pointer-events-none blur-2xl" />}

                            <div className="p-5 relative z-10">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-black shadow-lg ${isCurrent ? 'bg-gradient-to-br from-primary-400 to-violet-600 text-white shadow-primary-500/20' :
                                            canUpgrade ? 'bg-gradient-to-br from-zinc-800 to-zinc-950 text-white border border-zinc-700' :
                                                'bg-zinc-800 text-zinc-500'
                                            }`}>
                                            {tier.level}
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-black text-white leading-none mb-1">
                                                {formatNumber(tier.price)} <span className="text-xs font-bold text-zinc-500">ETB</span>
                                            </h3>
                                            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">{tier.level} Membership</p>
                                        </div>
                                    </div>

                                    {isCurrent ? (
                                        <span className="flex items-center gap-1 text-[10px] font-bold text-primary-400 uppercase bg-primary-500/10 px-2 py-1 rounded-lg border border-primary-500/20">
                                            <CheckCircle size={12} /> Active
                                        </span>
                                    ) : !canUpgrade ? (
                                        <span className="flex items-center gap-1 text-[10px] font-bold text-zinc-500 uppercase bg-zinc-800 px-2 py-1 rounded-lg border border-zinc-700">
                                            <Lock size={12} /> Locked
                                        </span>
                                    ) : null}
                                </div>

                                {/* Stats Grid */}
                                <div className="grid grid-cols-3 gap-2 mb-5">
                                    <div className="bg-zinc-950 rounded-xl p-2 text-center border border-zinc-800">
                                        <p className="text-[9px] text-zinc-500 uppercase font-bold mb-1">Daily Limit</p>
                                        <p className="font-black text-zinc-300 text-sm">{tier.dailyTasks} <span className="text-[9px] font-medium text-zinc-600">Tasks</span></p>
                                    </div>
                                    <div className="bg-zinc-950 rounded-xl p-2 text-center border border-zinc-800">
                                        <p className="text-[9px] text-zinc-500 uppercase font-bold mb-1">Per Video</p>
                                        <p className="font-black text-primary-500 text-sm">{formatNumber(tier.perVideoIncome.toFixed(0))}</p>
                                    </div>
                                    <div className="bg-zinc-950 rounded-xl p-2 text-center border border-zinc-800">
                                        <p className="text-[9px] text-zinc-500 uppercase font-bold mb-1">Daily Income</p>
                                        <p className="font-black text-emerald-400 text-sm">{formatNumber(tier.dailyIncome.toFixed(0))}</p>
                                    </div>
                                </div>

                                {canUpgrade ? (
                                    <Button
                                        onClick={handleUpgradeClick}
                                        className="w-full shadow-glow bg-primary-500 hover:bg-primary-600 text-black font-bold"
                                    >
                                        <Zap size={16} className="mr-2 fill-black text-black" />
                                        Upgrade with Deposit
                                    </Button>
                                ) : isCurrent ? (
                                    <div className="w-full py-3 bg-primary-500/10 text-primary-500 rounded-xl font-bold text-center border border-primary-500/20 text-xs flex items-center justify-center gap-2">
                                        <CheckCircle size={14} />
                                        Current Active Plan
                                    </div>
                                ) : (
                                    <Button
                                        disabled
                                        variant="secondary"
                                        className="w-full opacity-50 bg-zinc-800 text-zinc-500"
                                    >
                                        Combined with Lower Tier
                                    </Button>
                                )}
                            </div>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
