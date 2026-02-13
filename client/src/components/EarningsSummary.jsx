import { useState, useEffect } from 'react';
import { useEarningsStore } from '../store/earningsStore';
import { toast } from 'react-hot-toast';
import { TrendingUp, DollarSign, Clock, Calendar } from 'lucide-react';
import { formatNumber } from '../utils/formatNumber';
import EarningsCard from './EarningsCard';

const EarningsSummary = () => {
    const { earnings, fetchEarnings, loading: storeLoading } = useEarningsStore();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const init = async () => {
            await fetchEarnings();
            setLoading(false);
        };
        init();
    }, [fetchEarnings]);


    if (loading) {
        return (
            <div className="grid grid-cols-2 gap-3">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-20 bg-zinc-800 rounded-2xl animate-pulse"></div>
                ))}
            </div>
        );
    }

    if (!earnings) {
        return (
            <div className="text-center py-4">
                <p className="text-zinc-500 text-sm">Unable to load earnings</p>
            </div>
        );
    }

    const summaryData = [
        {
            title: 'Today',
            amount: earnings.today.total,
            icon: Clock,
            color: 'emerald'
        },
        {
            title: 'This Week',
            amount: earnings.thisWeek.total,
            icon: Calendar,
            color: 'blue'
        },
        {
            title: 'This Month',
            amount: earnings.thisMonth.total,
            icon: TrendingUp,
            color: 'violet'
        },
        {
            title: 'All Time',
            amount: earnings.totals.allTime,
            icon: DollarSign,
            color: 'amber'
        }
    ];

    return (
        <div className="grid grid-cols-2 gap-3">
            {summaryData.map((item, index) => (
                <EarningsCard
                    key={index}
                    title={item.title}
                    amount={item.amount}
                    icon={item.icon}
                    color={item.color}
                    compact={true}
                />
            ))}
        </div>
    );
};

export default EarningsSummary;