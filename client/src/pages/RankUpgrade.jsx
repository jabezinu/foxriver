import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { membershipAPI, rankUpgradeAPI, userAPI } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { toast } from 'react-hot-toast';
import { ChevronLeft, Zap, CheckCircle, Crown, Lock, Star, Wallet, Check, ChevronDown } from 'lucide-react';
import Loading from '../components/Loading';
import { formatNumber } from '../utils/formatNumber';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/Modal';

export default function RankUpgrade() {
    const navigate = useNavigate();
    const { user, updateUser } = useAuthStore();
    const [tiers, setTiers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedTier, setSelectedTier] = useState(null);
    const [confirmLoading, setConfirmLoading] = useState(false);
    const [bonusPercent, setBonusPercent] = useState(15); // Dynamic bonus percentage
    const [walletBalances, setWalletBalances] = useState({
        personalWallet: 0,
        incomeWallet: 0,
        tasksWallet: 0
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [tiersRes, systemRes, walletRes] = await Promise.all([
                    membershipAPI.getTiers(),
                    userAPI.getSystemSettings(),
                    userAPI.getWallet()
                ]);

                setTiers(tiersRes.data.tiers);

                // Set dynamic bonus percentage
                const bonusPercentage = systemRes.data.settings?.rankUpgradeBonusPercent || 15;
                setBonusPercent(bonusPercentage);

                // Set wallet balances
                setWalletBalances(walletRes.data.wallet);
            } catch (error) {
                toast.error('Failed to fetch data');
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const isHigherLevel = (tierLevel) => {
        const levels = ['Intern', 'Rank 1', 'Rank 2', 'Rank 3', 'Rank 4', 'Rank 5', 'Rank 6', 'Rank 7', 'Rank 8', 'Rank 9', 'Rank 10'];
        const currentIdx = levels.indexOf(user?.membershipLevel || 'Intern');
        const tierIdx = levels.indexOf(tierLevel);
        return tierIdx > currentIdx;
    };

    const handleUpgradeClick = (tier) => {
        if (tier.hidden) {
            toast.error('This tier is coming soon. Please stay tuned for updates!');
            return;
        }

        // Check balance and show toast if insufficient
        if (walletBalances.personalWallet < tier.price) {
            toast.error(`Insufficient Balance. You need ${formatNumber(tier.price)} ETB but have ${formatNumber(walletBalances.personalWallet)} ETB`);
            return;
        }

        setSelectedTier(tier);
        setShowModal(true);
    };

    const handleConfirmUpgrade = async () => {
        if (!selectedTier) {
            toast.error('Please select a tier');
            return;
        }

        // Check if user has sufficient balance in Personal Wallet
        if (walletBalances.personalWallet < selectedTier.price) {
            toast.error(`Insufficient Personal Wallet balance. You need ${formatNumber(selectedTier.price)} ETB but have ${formatNumber(walletBalances.personalWallet)} ETB`);
            return;
        }

        setConfirmLoading(true);
        try {
            const res = await rankUpgradeAPI.createRequest({
                newLevel: selectedTier.level,
                amount: selectedTier.price,
                walletType: 'personal' // Only Personal Wallet is allowed
            });

            if (res.data.success) {
                // Update user data and wallet balances
                updateUser({
                    ...user,
                    membershipLevel: selectedTier.level,
                    personalWallet: res.data.newWalletBalances.personalWallet,
                    incomeWallet: res.data.newWalletBalances.incomeWallet,
                    tasksWallet: res.data.newWalletBalances.tasksWallet
                });

                setWalletBalances(res.data.newWalletBalances);
                setShowModal(false);

                toast.success(res.data.message);

                // Navigate back to home or tier list
                navigate('/tier-list');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to upgrade rank');
        } finally {
            setConfirmLoading(false);
        }
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
                <h1 className="text-xl font-bold text-white">Rank Upgrade</h1>
            </div>

            <div className="px-4 py-6 space-y-4">
                {/* Wallet Balance Notice */}
                <div className="bg-blue-900/20 border border-blue-500/20 rounded-2xl p-4 mb-6">
                    <div className="flex items-start gap-3">
                        <div className="bg-blue-500/10 p-2 rounded-lg">
                            <Wallet size={20} className="text-blue-500" />
                        </div>
                        <div>
                            <h3 className="text-blue-400 font-bold text-sm mb-1">Personal Wallet Payment</h3>
                            <p className="text-blue-200/80 text-xs leading-relaxed mb-2">
                                Rank upgrades are paid from your Personal Wallet. Current balance: <span className="font-bold text-blue-300">{formatNumber(walletBalances.personalWallet)} ETB</span>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Bonus Notice */}
                <div className="bg-emerald-900/20 border border-emerald-500/20 rounded-2xl p-4 mb-6">
                    <div className="flex items-start gap-3">
                        <div className="bg-emerald-500/10 p-2 rounded-lg">
                            <Star size={20} className="text-emerald-500" />
                        </div>
                        <div>
                            <h3 className="text-emerald-400 font-bold text-sm mb-1">Upgrade Bonus</h3>
                            <p className="text-emerald-200/80 text-xs leading-relaxed">
                                Get {bonusPercent}% bonus on upgrades to Rank 2 and above, credited to your income wallet. No bonus for Rank 1 upgrades.
                            </p>
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-1 gap-4">
                    {tiers.map((tier, index) => {
                        const isCurrent = user?.membershipLevel === tier.level;
                        const canUpgrade = isHigherLevel(tier.level);
                        const isHidden = tier.hidden;

                        return (
                            <Card
                                key={index}
                                className={`relative overflow-hidden transition-all duration-300 border-zinc-800 bg-zinc-900 ${isCurrent
                                    ? 'border-primary-500 shadow-lg shadow-primary-500/10 ring-1 ring-primary-500'
                                    : canUpgrade && !isHidden
                                        ? 'hover:border-zinc-700 hover:shadow-card'
                                        : isHidden
                                            ? 'border-amber-500/30 bg-amber-900/10'
                                            : 'opacity-60 grayscale-[0.8]'
                                    }`}
                            >
                                {/* Background decoration */}
                                {isCurrent && <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 rounded-full -mr-10 -mt-10 pointer-events-none blur-2xl" />}
                                {isHidden && <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full -mr-10 -mt-10 pointer-events-none blur-2xl" />}

                                <div className="p-5 relative z-10">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-black shadow-lg ${isCurrent ? 'bg-gradient-to-br from-primary-400 to-violet-600 text-white shadow-primary-500/20' :
                                                canUpgrade && !isHidden ? 'bg-gradient-to-br from-zinc-800 to-zinc-950 text-white border border-zinc-700' :
                                                    isHidden ? 'bg-gradient-to-br from-amber-800 to-amber-950 text-amber-300 border border-amber-700' :
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
                                        ) : isHidden ? (
                                            <span className="flex items-center gap-1 text-[10px] font-bold text-amber-400 uppercase bg-amber-500/10 px-2 py-1 rounded-lg border border-amber-500/20">
                                                <Star size={12} /> Coming Soon
                                            </span>
                                        ) : !canUpgrade ? (
                                            <span className="flex items-center gap-1 text-[10px] font-bold text-zinc-500 uppercase bg-zinc-800 px-2 py-1 rounded-lg border border-zinc-700">
                                                <Lock size={12} /> Locked
                                            </span>
                                        ) : null}
                                    </div>

                                    {/* Stats Grid */}
                                    <div className="grid grid-cols-3 gap-2 mb-4">
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

                                    {/* Upgrade Bonus Info */}
                                    {(() => {
                                        const getCurrentRankNumber = (level) => {
                                            if (level === 'Intern') return 0;
                                            const match = level.match(/Rank (\d+)/);
                                            return match ? parseInt(match[1]) : 0;
                                        };
                                        const targetRankNumber = getCurrentRankNumber(tier.level);

                                        if (canUpgrade && !isHidden && targetRankNumber >= 2) {
                                            const bonusAmount = tier.price * (bonusPercent / 100);
                                            return (
                                                <div className="bg-emerald-900/20 border border-emerald-500/20 rounded-xl p-3 mb-4">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <Star size={14} className="text-emerald-400" />
                                                        <span className="text-emerald-400 font-bold text-xs">Upgrade Bonus</span>
                                                    </div>
                                                    <p className="text-emerald-300 text-xs">
                                                        Get <span className="font-bold">+{formatNumber(bonusAmount)} ETB</span> bonus ({bonusPercent}%) in your income wallet
                                                    </p>
                                                </div>
                                            );
                                        } else if (canUpgrade && !isHidden && targetRankNumber === 1) {
                                            return (
                                                <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-xl p-3 mb-4">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <Star size={14} className="text-zinc-500" />
                                                        <span className="text-zinc-500 font-bold text-xs">No Bonus</span>
                                                    </div>
                                                    <p className="text-zinc-500 text-xs">
                                                        Bonus starts from Rank 2 upgrades
                                                    </p>
                                                </div>
                                            );
                                        } else if (isHidden) {
                                            return (
                                                <div className="bg-amber-900/20 border border-amber-500/20 rounded-xl p-3 mb-4">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <Star size={14} className="text-amber-400" />
                                                        <span className="text-amber-400 font-bold text-xs">Coming Soon</span>
                                                    </div>
                                                    <p className="text-amber-300 text-xs">
                                                        This tier will be available soon. Stay tuned for updates!
                                                    </p>
                                                </div>
                                            );
                                        }
                                        return null;
                                    })()}

                                    {canUpgrade && !isHidden ? (
                                        <Button
                                            onClick={() => handleUpgradeClick(tier)}
                                            className={`w-full shadow-glow ${walletBalances.personalWallet < tier.price
                                                ? 'bg-zinc-800 text-zinc-100 opacity-90'
                                                : 'bg-primary-500 hover:bg-primary-600 text-black'} font-bold`}
                                        >
                                            <Zap size={16} className={`mr-2 ${walletBalances.personalWallet < tier.price ? 'text-primary-400 fill-primary-400/20' : 'fill-black text-black'}`} />
                                            Upgrade with Personal Wallet
                                        </Button>
                                    ) : isCurrent ? (
                                        <div className="w-full py-3 bg-primary-500/10 text-primary-500 rounded-xl font-bold text-center border border-primary-500/20 text-xs flex items-center justify-center gap-2">
                                            <CheckCircle size={14} />
                                            Current Active Plan
                                        </div>
                                    ) : isHidden ? (
                                        <div className="w-full py-3 bg-amber-500/10 text-amber-400 rounded-xl font-bold text-center border border-amber-500/20 text-xs flex items-center justify-center gap-2">
                                            <Star size={14} />
                                            Coming Soon - Stay Tuned!
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

            {/* Upgrade Modal */}
            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={selectedTier ? `Upgrade to ${selectedTier.level}` : 'Confirm Upgrade'}
            >
                {selectedTier && (
                    <div className="space-y-5">
                        <div className="bg-zinc-950 text-white p-4 rounded-xl shadow-lg border border-zinc-800 space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-zinc-400">Payment Required</span>
                                <span className="text-xl font-black text-primary-500">{formatNumber(selectedTier.price)} ETB</span>
                            </div>

                            {/* Show bonus information for Rank 2 and above */}
                            {(() => {
                                const getCurrentRankNumber = (level) => {
                                    if (level === 'Intern') return 0;
                                    const match = level.match(/Rank (\d+)/);
                                    return match ? parseInt(match[1]) : 0;
                                };
                                const targetRankNumber = getCurrentRankNumber(selectedTier.level);

                                if (targetRankNumber >= 2) {
                                    const bonusAmount = selectedTier.price * (bonusPercent / 100);
                                    return (
                                        <div className="flex justify-between items-center pt-2 border-t border-zinc-800">
                                            <span className="text-sm font-medium text-emerald-400">Upgrade Bonus ({bonusPercent}%)</span>
                                            <span className="text-lg font-bold text-emerald-400">+{formatNumber(bonusAmount)} ETB</span>
                                        </div>
                                    );
                                } else {
                                    return (
                                        <div className="pt-2 border-t border-zinc-800">
                                            <span className="text-xs text-zinc-500">No bonus for Rank 1 upgrade</span>
                                        </div>
                                    );
                                }
                            })()}
                        </div>

                        {/* Wallet Selection */}
                        <div className="space-y-3">
                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wide ml-1">Payment Wallet</label>

                            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-blue-500/10 p-2 rounded-lg">
                                            <Wallet size={20} className="text-blue-500" />
                                        </div>
                                        <div>
                                            <span className="block font-semibold text-sm text-white">Personal Wallet</span>
                                            <span className="text-xs text-zinc-400">Available: {formatNumber(walletBalances.personalWallet)} ETB</span>
                                        </div>
                                    </div>
                                    <div className="bg-blue-500/10 p-1.5 rounded-lg">
                                        <Check size={16} className="text-blue-500" />
                                    </div>
                                </div>
                            </div>

                            <p className="text-xs text-zinc-500 ml-1">
                                Only Personal Wallet can be used for rank upgrades
                            </p>
                        </div>



                        <div className="bg-blue-900/20 border border-blue-500/20 rounded-xl p-4">
                            <p className="text-blue-200 text-xs leading-relaxed">
                                <strong>Instant Upgrade:</strong> Your rank will be upgraded immediately after payment confirmation. The amount will be deducted from your Personal Wallet.
                            </p>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <Button
                                variant="outline"
                                onClick={() => setShowModal(false)}
                                className="flex-1 border-zinc-700 text-zinc-400 hover:bg-zinc-800 hover:text-white"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleConfirmUpgrade}
                                loading={confirmLoading}
                                disabled={confirmLoading || walletBalances.personalWallet < selectedTier.price}
                                className={`flex-[2] shadow-glow ${walletBalances.personalWallet < selectedTier.price ? 'opacity-80 bg-zinc-800 text-zinc-100' : ''}`}
                            >
                                Confirm Upgrade
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}