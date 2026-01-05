import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { membershipAPI } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { toast } from 'react-hot-toast';
import { HiChevronLeft, HiFire, HiCheckCircle } from 'react-icons/hi';
import Loading from '../components/Loading';
import { formatNumber } from '../utils/formatNumber';

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

    const canShowJoinButton = (tierLevel) => {
        if (!isHigherLevel(tierLevel)) return false;

        // Special rule for Interns
        if (user?.membershipLevel === 'Intern') {
            const levels = ['Intern', 'V1', 'V2', 'V3', 'V4', 'V5', 'V6', 'V7', 'V8', 'V9', 'V10'];
            const tierIdx = levels.indexOf(tierLevel);
            const v3Idx = levels.indexOf('V3');
            // Hide if lower than V3
            if (tierIdx < v3Idx) return false;
        }
        return true;
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
        <div className="min-h-screen bg-gray-50 pb-20 animate-fadeIn">
            {/* Header */}
            <div className="bg-white px-4 py-4 flex items-center gap-4 sticky top-0 z-10 shadow-sm">
                <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <HiChevronLeft className="text-2xl text-gray-600" />
                </button>
                <h1 className="text-xl font-bold text-gray-800">Membership Tiers</h1>
            </div>

            <div className="px-3 py-3 space-y-2">
                {tiers.map((tier, index) => {
                    const isCurrent = user?.membershipLevel === tier.level;
                    const showJoin = canShowJoinButton(tier.level);

                    return (
                        <div
                            key={index}
                            className={`relative overflow-hidden bg-white rounded-xl shadow-sm border transition-all ${isCurrent ? 'border-green-500 ring-2 ring-green-50' : 'border-gray-100'
                                }`}
                        >
                            <div className="p-3 relative z-10">
                                <div className="flex justify-between items-center mb-2">
                                    <div className="flex items-center gap-2">
                                        <span className={`px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase tracking-wider ${isCurrent ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                                            }`}>
                                            {tier.level}
                                        </span>
                                        <h3 className="text-lg font-black text-gray-800">
                                            {formatNumber(tier.price)} <span className="text-[10px] font-medium text-gray-400">ETB</span>
                                        </h3>
                                    </div>
                                    {isCurrent && (
                                        <span className="flex items-center gap-1 text-[9px] font-bold text-green-600 uppercase">
                                            <HiCheckCircle /> Active
                                        </span>
                                    )}
                                </div>

                                <div className="grid grid-cols-4 gap-1 mb-2">
                                    <div className="bg-gray-50/50 p-1.5 rounded-lg border border-gray-50 text-center">
                                        <p className="text-[7px] text-gray-400 uppercase font-bold leading-none mb-0.5">Tasks</p>
                                        <p className="font-bold text-gray-700 text-[10px] leading-none">{tier.dailyTasks}</p>
                                    </div>
                                    <div className="bg-gray-50/50 p-1.5 rounded-lg border border-gray-50 text-center">
                                        <p className="text-[7px] text-gray-400 uppercase font-bold leading-none mb-0.5">Price</p>
                                        <p className="font-bold text-emerald-600 text-[10px] leading-none">{formatNumber(tier.perVideoIncome.toFixed(0))}</p>
                                    </div>
                                    <div className="bg-gray-50/50 p-1.5 rounded-lg border border-gray-50 text-center">
                                        <p className="text-[7px] text-gray-400 uppercase font-bold leading-none mb-0.5">Daily</p>
                                        <p className="font-bold text-blue-600 text-[10px] leading-none">{formatNumber(tier.dailyIncome.toFixed(0))}</p>
                                    </div>
                                    <div className="bg-gray-50/50 p-1.5 rounded-lg border border-gray-50 text-center">
                                        <p className="text-[7px] text-gray-400 uppercase font-bold leading-none mb-0.5">4-Day</p>
                                        <p className="font-bold text-purple-600 text-[10px] leading-none">{formatNumber(tier.fourDayIncome.toFixed(0))}</p>
                                    </div>
                                </div>

                                {showJoin ? (
                                    <button
                                        onClick={() => handleJoinClick(tier)}
                                        className="w-full py-1.5 bg-gray-900 text-white rounded-lg font-bold shadow-sm active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-[10px]"
                                    >
                                        <HiFire className="text-orange-400 text-xs" />
                                        Join Now
                                    </button>
                                ) : isCurrent ? (
                                    <div className="w-full py-1.5 bg-green-50 text-green-700 rounded-lg font-bold text-center border border-green-100 text-[10px]">
                                        Current Plan
                                    </div>
                                ) : (
                                    <div className="hidden"></div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Upgrade Modal */}
            {showModal && selectedTier && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-xl animate-scaleIn">
                        <div className="p-4 border-b border-gray-100">
                            <h3 className="text-lg font-bold text-gray-800 text-center">Confirm Upgrade</h3>
                            <p className="text-xs text-center text-gray-500">Upgrade to {selectedTier.level}</p>
                        </div>

                        <div className="p-4 space-y-4">
                            {/* Balances Row */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-2.5 bg-yellow-50 rounded-xl border border-yellow-100 flex flex-col items-center">
                                    <span className="text-[10px] uppercase font-bold text-yellow-600 tracking-wide">Income Wallet</span>
                                    <span className="text-sm font-black text-gray-800">{formatNumber(user?.incomeWallet || 0)}</span>
                                </div>
                                <div className="p-2.5 bg-blue-50 rounded-xl border border-blue-100 flex flex-col items-center">
                                    <span className="text-[10px] uppercase font-bold text-blue-600 tracking-wide">Personal Wallet</span>
                                    <span className="text-sm font-black text-gray-800">{formatNumber(user?.personalWallet || 0)}</span>
                                </div>
                            </div>

                            {/* Cost */}
                            <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 flex justify-between items-center">
                                <span className="text-sm font-medium text-gray-600">Cost</span>
                                <span className="text-lg font-black text-gray-800">{formatNumber(selectedTier.price)} ETB</span>
                            </div>

                            {/* Wallet Selection */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Pay From</label>

                                {/* Personal Wallet Option */}
                                <div
                                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${paymentMethod === 'personal'
                                            ? 'border-blue-500 bg-blue-50/30 ring-1 ring-blue-500'
                                            : 'border-gray-200 hover:border-gray-50'
                                        }`}
                                    onClick={() => setPaymentMethod('personal')}
                                >
                                    <div className="flex items-center gap-2">
                                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${paymentMethod === 'personal' ? 'border-blue-500' : 'border-gray-400'
                                            }`}>
                                            {paymentMethod === 'personal' && <div className="w-2 h-2 rounded-full bg-blue-500" />}
                                        </div>
                                        <span className="text-sm font-bold text-gray-700">Personal Wallet</span>
                                    </div>
                                </div>

                                {/* Income Wallet Option */}
                                <div
                                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${paymentMethod === 'income'
                                            ? 'border-blue-500 bg-blue-50/30 ring-1 ring-blue-500'
                                            : 'border-gray-200 hover:border-gray-50'
                                        }`}
                                    onClick={() => setPaymentMethod('income')}
                                >
                                    <div className="flex items-center gap-2">
                                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${paymentMethod === 'income' ? 'border-blue-500' : 'border-gray-400'
                                            }`}>
                                            {paymentMethod === 'income' && <div className="w-2 h-2 rounded-full bg-blue-500" />}
                                        </div>
                                        <span className="text-sm font-bold text-gray-700">Income Wallet</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 bg-gray-50 grid grid-cols-2 gap-3">
                            <button
                                onClick={() => setShowModal(false)}
                                className="py-2.5 rounded-xl font-bold text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 active:scale-[0.98] transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmUpgrade}
                                disabled={confirmLoading}
                                className="py-2.5 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {confirmLoading ? <Loading className="w-4 h-4" /> : 'Confirm Payment'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
