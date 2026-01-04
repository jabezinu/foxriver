import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { membershipAPI } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { toast } from 'react-hot-toast';
import { HiChevronLeft, HiFire, HiLightningBolt, HiCheckCircle } from 'react-icons/hi';
import Loading from '../components/Loading';
import { formatNumber } from '../utils/formatNumber';

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
        const levels = ['Intern', 'V1', 'V2', 'V3', 'V4', 'V5', 'V6', 'V7', 'V8', 'V9', 'V10'];
        const currentIdx = levels.indexOf(user?.membershipLevel || 'Intern');
        const tierIdx = levels.indexOf(tierLevel);
        return tierIdx > currentIdx;
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
                    const higher = isHigherLevel(tier.level);

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

                                {higher ? (
                                    <button
                                        onClick={() => navigate('/deposit')}
                                        className="w-full py-1.5 bg-gray-900 text-white rounded-lg font-bold shadow-sm active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-[10px]"
                                    >
                                        <HiFire className="text-orange-400 text-xs" />
                                        Join Now
                                    </button>
                                ) : isCurrent && (
                                    <div className="w-full py-1.5 bg-green-50 text-green-700 rounded-lg font-bold text-center border border-green-100 text-[10px]">
                                        Current Plan
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
