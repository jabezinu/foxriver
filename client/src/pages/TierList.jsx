import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { membershipAPI } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { toast } from 'react-hot-toast';
import { ChevronLeft, Zap, CheckCircle, Crown, Lock, Star } from 'lucide-react';
import Loading from '../components/Loading';
import { formatNumber } from '../utils/formatNumber';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/Modal';

export default function TierList() {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const [tiers, setTiers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedTier, setSelectedTier] = useState(null);
    const [confirmLoading, setConfirmLoading] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('personal'); // 'personal' or 'income'

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
        const levels = ['Intern', 'V1', 'V2', 'V3', 'V4', 'V5', 'V6', 'V7', 'V8', 'V9', 'V10'];
        const currentIdx = levels.indexOf(user?.membershipLevel || 'Intern');
        const tierIdx = levels.indexOf(tierLevel);
        return tierIdx > currentIdx;
    };

    const handleJoinClick = (tier) => {
        setSelectedTier(tier);
        setPaymentMethod('personal');
        setShowModal(true);
    };

    const handleConfirmUpgrade = async () => {
        if (!selectedTier) return;
        setConfirmLoading(true);
        try {
            const res = await membershipAPI.upgrade({
                newLevel: selectedTier.level,
                walletType: paymentMethod
            });

            if (res.data.success) {
                toast.success(res.data.message);
                setShowModal(false);
                window.location.reload();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Upgrade failed');
        } finally {
            setConfirmLoading(false);
        }
    };

    if (loading) return <Loading />;

    return (
        <div className="min-h-screen bg-gray-50 pb-20 animate-fade-in">
            {/* Header */}
            <div className="bg-white/80 backdrop-blur-md px-4 py-3 flex items-center gap-4 sticky top-0 z-30 border-b border-gray-100">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 -ml-2 rounded-full text-gray-600 hover:bg-gray-100 transition-colors"
                >
                    <ChevronLeft size={24} />
                </button>
                <h1 className="text-xl font-bold text-gray-900">Membership Tiers</h1>
            </div>

            <div className="px-4 py-6 space-y-4">
                {tiers.map((tier, index) => {
                    const isCurrent = user?.membershipLevel === tier.level;
                    const canUpgrade = isHigherLevel(tier.level);

                    // Determine styling based on tier (just simple alteration for visual variety)
                    const isPremium = index >= 4;

                    return (
                        <Card
                            key={index}
                            className={`relative overflow-hidden transition-all duration-300 ${isCurrent
                                    ? 'border-emerald-500 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500'
                                    : canUpgrade
                                        ? 'border-gray-100 hover:shadow-md'
                                        : 'border-gray-100 opacity-80 grayscale-[0.5]'
                                }`}
                        >
                            {/* Background decoration */}
                            {isCurrent && <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-10 -mt-10 pointer-events-none" />}

                            <div className="p-5 relative z-10">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-black shadow-sm ${isCurrent ? 'bg-gradient-to-br from-emerald-400 to-green-600 text-white' :
                                                canUpgrade ? 'bg-gradient-to-br from-gray-800 to-black text-white' :
                                                    'bg-gray-100 text-gray-400'
                                            }`}>
                                            {tier.level}
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-black text-gray-900 leading-none mb-1">
                                                {formatNumber(tier.price)} <span className="text-xs font-bold text-gray-400">ETB</span>
                                            </h3>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{tier.level} Membership</p>
                                        </div>
                                    </div>

                                    {isCurrent ? (
                                        <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 uppercase bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100">
                                            <CheckCircle size={12} /> Active
                                        </span>
                                    ) : !canUpgrade ? (
                                        <span className="flex items-center gap-1 text-[10px] font-bold text-gray-400 uppercase bg-gray-50 px-2 py-1 rounded-lg border border-gray-100">
                                            <Lock size={12} /> Locked
                                        </span>
                                    ) : null}
                                </div>

                                {/* Stats Grid */}
                                <div className="grid grid-cols-3 gap-2 mb-5">
                                    <div className="bg-gray-50 rounded-xl p-2 text-center border border-gray-100">
                                        <p className="text-[9px] text-gray-400 uppercase font-bold mb-1">Daily Limit</p>
                                        <p className="font-black text-gray-800 text-sm">{tier.dailyTasks} <span className="text-[9px] font-medium text-gray-400">Tasks</span></p>
                                    </div>
                                    <div className="bg-gray-50 rounded-xl p-2 text-center border border-gray-100">
                                        <p className="text-[9px] text-gray-400 uppercase font-bold mb-1">Per Video</p>
                                        <p className="font-black text-indigo-600 text-sm">{formatNumber(tier.perVideoIncome.toFixed(0))}</p>
                                    </div>
                                    <div className="bg-gray-50 rounded-xl p-2 text-center border border-gray-100">
                                        <p className="text-[9px] text-gray-400 uppercase font-bold mb-1">Daily Income</p>
                                        <p className="font-black text-emerald-600 text-sm">{formatNumber(tier.dailyIncome.toFixed(0))}</p>
                                    </div>
                                </div>

                                {canUpgrade ? (
                                    <Button
                                        onClick={() => handleJoinClick(tier)}
                                        className="w-full shadow-lg shadow-gray-900/10"
                                    >
                                        <Zap size={16} className="mr-2 fill-yellow-400 text-yellow-400" />
                                        Upgrade Now
                                    </Button>
                                ) : isCurrent ? (
                                    <div className="w-full py-3 bg-emerald-50/50 text-emerald-600 rounded-xl font-bold text-center border border-emerald-100 text-xs flex items-center justify-center gap-2">
                                        <CheckCircle size={14} />
                                        Current Active Plan
                                    </div>
                                ) : (
                                    <Button
                                        disabled
                                        variant="secondary"
                                        className="w-full opacity-50"
                                    >
                                        Combined with Lower Tier
                                    </Button>
                                )}
                            </div>
                        </Card>
                    );
                })}
            </div>

            {/* Upgrade Modal */}
            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={selectedTier ? `Upgrade to ${selectedTier.level}` : 'Confirm Upgrade'}
            >
                {selectedTier && (
                    <div className="space-y-5">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-100 flex flex-col items-center text-center">
                                <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wide mb-1">Income Wallet</span>
                                <span className="text-sm font-black text-indigo-700">{formatNumber(user?.incomeWallet || 0)} ETB</span>
                            </div>
                            <div className="p-3 bg-purple-50 rounded-xl border border-purple-100 flex flex-col items-center text-center">
                                <span className="text-[10px] uppercase font-bold text-purple-400 tracking-wide mb-1">Personal Wallet</span>
                                <span className="text-sm font-black text-purple-700">{formatNumber(user?.personalWallet || 0)} ETB</span>
                            </div>
                        </div>

                        <div className="bg-gray-900 text-white p-4 rounded-xl shadow-lg flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-400">Upgrade Cost</span>
                            <span className="text-xl font-black">{formatNumber(selectedTier.price)} ETB</span>
                        </div>

                        <div className="space-y-3">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide ml-1">Payment Source</label>

                            <div
                                className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === 'personal'
                                    ? 'border-primary-500 bg-primary-50/50'
                                    : 'border-gray-100 hover:border-gray-200'
                                    }`}
                                onClick={() => setPaymentMethod('personal')}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'personal' ? 'border-primary-500' : 'border-gray-300'
                                        }`}>
                                        {paymentMethod === 'personal' && <div className="w-2.5 h-2.5 rounded-full bg-primary-500" />}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-gray-900">Personal Wallet</span>
                                        <span className="text-[10px] text-gray-500">Use your deposited funds</span>
                                    </div>
                                </div>
                            </div>

                            <div
                                className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === 'income'
                                    ? 'border-primary-500 bg-primary-50/50'
                                    : 'border-gray-100 hover:border-gray-200'
                                    }`}
                                onClick={() => setPaymentMethod('income')}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'income' ? 'border-primary-500' : 'border-gray-300'
                                        }`}>
                                        {paymentMethod === 'income' && <div className="w-2.5 h-2.5 rounded-full bg-primary-500" />}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-gray-900">Income Wallet</span>
                                        <span className="text-[10px] text-gray-500">Use your earnings</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <Button
                                variant="outline"
                                onClick={() => setShowModal(false)}
                                className="flex-1"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleConfirmUpgrade}
                                loading={confirmLoading}
                                disabled={confirmLoading}
                                className="flex-[2]"
                            >
                                Confirm Payment
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}
