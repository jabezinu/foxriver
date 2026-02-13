import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, Calendar, DollarSign, Clock } from 'lucide-react';
import Card from '../components/ui/Card';
import { useWealthStore } from '../store/wealthStore';
import { getServerUrl } from '../config/api.config';
import logo from '../assets/logo.png';

export default function MyInvestments() {
    const navigate = useNavigate();
    const { myInvestments: investments, fetchMyInvestments, loading: storeLoading } = useWealthStore();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const init = async () => {
            await fetchMyInvestments();
            setLoading(false);
        };
        init();
    }, [fetchMyInvestments]);

    const getStatusColor = (status) => {
        switch (status) {
            case 'active':
                return 'bg-green-500/10 text-green-400 border-green-500/20';
            case 'completed':
                return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
            case 'cancelled':
                return 'bg-red-500/10 text-red-400 border-red-500/20';
            default:
                return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20';
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getDaysRemaining = (endDate) => {
        const now = new Date();
        const end = new Date(endDate);
        const diffTime = end - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 0 ? diffDays : 0;
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
                <h1 className="text-xl font-bold text-white">My Investments</h1>
            </div>

            <div className="p-5 space-y-4">
                {investments.length > 0 ? (
                    investments.map((investment) => {
                        const daysRemaining = getDaysRemaining(investment.endDate);
                        const progress = investment.status === 'completed' 
                            ? 100 
                            : ((investment.days - daysRemaining) / investment.days) * 100;

                        return (
                            <Card key={investment._id} className="bg-zinc-900/80 border-zinc-800">
                                {/* Fund Info */}
                                <div className="flex items-center gap-4 mb-4">
                                    <img
                                        src={renderImageUrl(investment.wealthFund?.image)}
                                        alt={investment.wealthFund?.name}
                                        className="w-16 h-16 rounded-xl object-cover"
                                    />
                                    <div className="flex-1">
                                        <h3 className="text-white font-bold mb-1">
                                            {investment.wealthFund?.name}
                                        </h3>
                                        <span className={`text-xs px-2 py-1 rounded-full border ${getStatusColor(investment.status)}`}>
                                            {investment.status.charAt(0).toUpperCase() + investment.status.slice(1)}
                                        </span>
                                    </div>
                                </div>

                                {/* Investment Details */}
                                <div className="space-y-3 mb-4">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-2 text-zinc-400">
                                            <DollarSign size={16} />
                                            <span className="text-sm">Investment</span>
                                        </div>
                                        <span className="text-white font-semibold">
                                            ETB {investment.amount.toFixed(2)}
                                        </span>
                                    </div>

                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-2 text-zinc-400">
                                            <TrendingUp size={16} />
                                            <span className="text-sm">Total Revenue</span>
                                        </div>
                                        <span className="text-green-400 font-bold">
                                            ETB {investment.totalRevenue.toFixed(2)}
                                        </span>
                                    </div>

                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-2 text-zinc-400">
                                            <TrendingUp size={16} />
                                            <span className="text-sm">Profit</span>
                                        </div>
                                        <span className="text-orange-400 font-semibold">
                                            ETB {(investment.totalRevenue - investment.amount).toFixed(2)}
                                        </span>
                                    </div>

                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-2 text-zinc-400">
                                            <Calendar size={16} />
                                            <span className="text-sm">Duration</span>
                                        </div>
                                        <span className="text-white font-semibold">
                                            {investment.days} Days
                                        </span>
                                    </div>

                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-2 text-zinc-400">
                                            <Clock size={16} />
                                            <span className="text-sm">
                                                {investment.status === 'active' ? 'Days Remaining' : 'Completed On'}
                                            </span>
                                        </div>
                                        <span className="text-white font-semibold">
                                            {investment.status === 'active' 
                                                ? `${daysRemaining} Days`
                                                : formatDate(investment.completedAt || investment.endDate)
                                            }
                                        </span>
                                    </div>
                                </div>

                                {/* Progress Bar */}
                                {investment.status === 'active' && (
                                    <div>
                                        <div className="flex justify-between text-xs text-zinc-400 mb-2">
                                            <span>Progress</span>
                                            <span>{progress.toFixed(1)}%</span>
                                        </div>
                                        <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-300"
                                                style={{ width: `${progress}%` }}
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Dates */}
                                <div className="mt-4 pt-4 border-t border-zinc-800 flex justify-between text-xs text-zinc-500">
                                    <span>Started: {formatDate(investment.startDate)}</span>
                                    <span>Ends: {formatDate(investment.endDate)}</span>
                                </div>

                                {/* Funding Source */}
                                <div className="mt-3 pt-3 border-t border-zinc-800">
                                    <p className="text-xs text-zinc-500 mb-2">Funded from:</p>
                                    <div className="flex gap-2 text-xs flex-wrap">
                                        {investment.fundingSource.incomeWallet > 0 && (
                                            <span className="px-2 py-1 bg-yellow-500/10 text-yellow-400 rounded">
                                                Income: ETB {investment.fundingSource.incomeWallet.toFixed(2)}
                                            </span>
                                        )}
                                        {investment.fundingSource.personalWallet > 0 && (
                                            <span className="px-2 py-1 bg-orange-500/10 text-orange-400 rounded">
                                                Personal: ETB {investment.fundingSource.personalWallet.toFixed(2)}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        );
                    })
                ) : (
                    <Card className="text-center py-16 border-dashed border-2 border-zinc-800 bg-zinc-900/50">
                        <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-4 border border-zinc-800">
                            <TrendingUp className="text-zinc-600" size={24} />
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2">No Investments Yet</h3>
                        <p className="text-zinc-500 text-sm mb-4">
                            Start investing in wealth funds to see them here
                        </p>
                        <button
                            onClick={() => navigate('/wealth')}
                            className="px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg font-semibold"
                        >
                            Browse Funds
                        </button>
                    </Card>
                )}
            </div>
        </div>
    );
}
