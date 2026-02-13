import { useEffect } from 'react';
import { useEarningsStore } from '../store/earningsStore';
import { toast } from 'react-hot-toast';
import { 
    TrendingUp, 
    DollarSign, 
    Calendar, 
    Clock, 
    Users, 
    Briefcase,
    Target,
    Award,
    ChevronRight
} from 'lucide-react';
import Card from './ui/Card';
import EarningsCard from './EarningsCard';
import { formatNumber } from '../utils/formatNumber';

const EarningsDashboard = () => {
    const { earnings, loading, error, fetchEarnings } = useEarningsStore();

    useEffect(() => {
        fetchEarnings();
    }, [fetchEarnings]);

    useEffect(() => {
        if (error) {
            toast.error(error);
        }
    }, [error]);

    if (loading) {
        return (
            <div className="space-y-4">
                <div className="animate-pulse">
                    <div className="h-6 bg-zinc-800 rounded w-48 mb-4"></div>
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-24 bg-zinc-800 rounded-2xl"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (!earnings) {
        return (
            <div className="text-center py-8">
                <p className="text-zinc-500">Failed to load earnings data</p>
            </div>
        );
    }

    const timePeriodsData = [
        {
            title: 'Today',
            amount: earnings.today.total,
            icon: Clock,
            color: 'emerald',
            details: {
                tasks: earnings.today.taskEarnings,
                commissions: earnings.today.commissionEarnings
            }
        },
        {
            title: 'Yesterday',
            amount: earnings.yesterday.total,
            icon: Calendar,
            color: 'blue',
            details: {
                tasks: earnings.yesterday.taskEarnings,
                commissions: earnings.yesterday.commissionEarnings
            }
        },
        {
            title: 'This Week',
            amount: earnings.thisWeek.total,
            icon: TrendingUp,
            color: 'violet',
            details: {
                tasks: earnings.thisWeek.taskEarnings,
                commissions: earnings.thisWeek.commissionEarnings
            }
        },
        {
            title: 'This Month',
            amount: earnings.thisMonth.total,
            icon: Target,
            color: 'amber',
            details: {
                tasks: earnings.thisMonth.taskEarnings,
                commissions: earnings.thisMonth.commissionEarnings
            }
        }
    ];

    const earningTypesData = [
        {
            title: 'Task Earnings',
            amount: earnings.totals.taskEarnings,
            icon: Briefcase,
            color: 'green',
            description: 'From completed tasks'
        },
        {
            title: 'Referral Commissions',
            amount: earnings.totals.commissionEarnings,
            icon: Users,
            color: 'blue',
            description: 'From team activities'
        },
        {
            title: 'Monthly Salary',
            amount: earnings.totals.salaryEarnings,
            icon: Award,
            color: 'purple',
            description: 'Performance bonuses'
        }
    ];

    return (
        <div className="space-y-6">
            {/* Time Periods Section */}
            <div>
                <h3 className="text-sm font-bold text-zinc-400 mb-4 px-1 uppercase tracking-wider">
                    Earnings by Period
                </h3>
                <div className="grid grid-cols-2 gap-3">
                    {timePeriodsData.map((period, index) => (
                        <EarningsCard
                            key={index}
                            title={period.title}
                            amount={period.amount}
                            icon={period.icon}
                            color={period.color}
                            details={period.details}
                        />
                    ))}
                </div>
            </div>

            {/* Current Month Salary */}
            {earnings.monthlySalary && (
                <div>
                    <h3 className="text-sm font-bold text-zinc-400 mb-4 px-1 uppercase tracking-wider">
                        Monthly Salary
                    </h3>
                <Card className="p-6 border-2 border-purple-400 bg-gradient-to-r from-purple-800/40 to-pink-800/40 shadow-[0_0_30px_rgba(168,85,247,0.2)]">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-500/10 rounded-lg text-purple-500 border border-purple-500/20">
                                    <Award size={20} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-white">This Month's Salary</h4>
                                    <p className="text-xs text-zinc-400">{earnings.monthlySalary.ruleApplied}</p>
                                </div>
                            </div>
                            <ChevronRight className="text-zinc-600" size={20} />
                        </div>
                        <p className="text-2xl font-bold text-purple-400 mb-2">
                            {formatNumber(earnings.monthlySalary.amount)}
                        </p>
                        {earnings.monthlySalary.breakdown && (
                            <div className="text-xs text-zinc-500">
                                Based on team performance and activity
                            </div>
                        )}
                    </Card>
                </div>
            )}

            {/* Earning Types Section */}
            <div>
                <h3 className="text-sm font-bold text-zinc-400 mb-4 px-1 uppercase tracking-wider">
                    Total Earnings by Type
                </h3>
                <div className="space-y-3">
                    {earningTypesData.map((type, index) => (
                        <EarningsCard
                            key={index}
                            title={type.title}
                            amount={type.amount}
                            icon={type.icon}
                            color={type.color}
                            description={type.description}
                        />
                    ))}
                </div>
            </div>

            {/* Total Lifetime Earnings */}
            <Card className="p-8 border-2 border-primary-400 bg-gradient-to-r from-primary-800/40 to-violet-800/40 shadow-[0_0_40px_rgba(139,92,246,0.25)]">
                <div className="text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-400 text-sm font-bold uppercase tracking-wider mb-4">
                        <DollarSign size={16} />
                        <span>Total Lifetime Earnings</span>
                    </div>
                    <p className="text-4xl font-black text-primary-400 mb-2">
                        {formatNumber(earnings.totals.allTime)}
                    </p>
                    <p className="text-sm text-zinc-400">
                        Accumulated across all earning sources
                    </p>
                </div>
            </Card>
        </div>
    );
};

export default EarningsDashboard;