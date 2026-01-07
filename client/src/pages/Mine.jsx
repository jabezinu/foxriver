import { useState, useEffect } from 'react';
import { userAPI } from '../services/api';
import { toast } from 'react-hot-toast';
import { Wallet, Briefcase, ChevronRight, User, Settings, Users, ArrowUpRight, ArrowDownLeft, Clock, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Loading from '../components/Loading';
import Card from '../components/ui/Card';
import { formatNumber } from '../utils/formatNumber';
import { useAuthStore } from '../store/authStore';

export default function Mine() {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState(null);
    const [wallet, setWallet] = useState({ incomeWallet: 0, personalWallet: 0 });

    // Calculate Intern restriction info
    const getInternRestrictionInfo = () => {
        if (!user || user.membershipLevel !== 'Intern') return null;
        
        const now = new Date();
        const activationDate = new Date(user.membershipActivatedAt || user.createdAt);
        const daysSinceActivation = Math.floor((now - activationDate) / (1000 * 60 * 60 * 24));
        const daysRemaining = Math.max(0, 4 - daysSinceActivation);
        const canEarn = daysSinceActivation < 4;
        
        return {
            canEarn,
            daysRemaining,
            daysSinceActivation,
            activationDate
        };
    };

    const internInfo = getInternRestrictionInfo();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [profileRes, walletRes] = await Promise.all([
                userAPI.getProfile(),
                userAPI.getWallet()
            ]);
            setProfile(profileRes.data.user);
            setWallet(walletRes.data.wallet);
        } catch (error) {
            toast.error('Failed to load profile data');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <Loading />;

    return (
        <div className="animate-fade-in min-h-screen pb-24">
            {/* Top User Header */}
            <div className="bg-zinc-900/80 backdrop-blur-xl sticky top-0 z-30 border-b border-zinc-800 px-5 py-4 flex justify-between items-center">
                <h1 className="text-xl font-bold text-white">My Profile</h1>
                <button onClick={() => navigate('/settings')} className="p-2 -mr-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-full transition-all">
                    <Settings size={24} />
                </button>
            </div>

            <div className="px-5 pt-6 pb-2">
                {/* User Info Card */}
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-violet-600 flex items-center justify-center text-white text-3xl font-black shadow-glow">
                        {profile.phone.slice(-1)}
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-2">{profile.phone}</h2>
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-800 text-primary-500 text-xs font-bold uppercase tracking-wider border border-zinc-700">
                            <User size={12} fill="currentColor" />
                            <span>{profile.membershipLevel} Member</span>
                        </div>
                    </div>
                </div>

                {/* Intern Restriction Info */}
                {internInfo && (
                    <Card className={`p-4 mb-6 border-2 ${
                        internInfo.canEarn 
                            ? 'bg-amber-900/20 border-amber-600/50' 
                            : 'bg-red-900/20 border-red-600/50'
                    }`}>
                        <div className="flex items-start gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                                internInfo.canEarn 
                                    ? 'bg-amber-500/20 text-amber-400' 
                                    : 'bg-red-500/20 text-red-400'
                            }`}>
                                {internInfo.canEarn ? <Clock size={16} /> : <AlertTriangle size={16} />}
                            </div>
                            <div className="flex-1">
                                <h3 className={`font-bold text-sm mb-1 ${
                                    internInfo.canEarn ? 'text-amber-300' : 'text-red-300'
                                }`}>
                                    {internInfo.canEarn ? 'Intern Trial Period' : 'Trial Period Ended'}
                                </h3>
                                <p className="text-xs text-zinc-300 mb-2">
                                    {internInfo.canEarn 
                                        ? `You have ${internInfo.daysRemaining} day${internInfo.daysRemaining !== 1 ? 's' : ''} remaining to earn from tasks.`
                                        : 'Your 4-day Intern trial period has ended. Task earning is no longer available.'
                                    }
                                </p>
                                <p className="text-xs text-zinc-400">
                                    {internInfo.canEarn 
                                        ? 'Upgrade to V1 before your trial ends to continue earning.'
                                        : 'Upgrade to V1 membership to resume earning from tasks.'
                                    }
                                </p>
                                {internInfo.canEarn && (
                                    <button
                                        onClick={() => navigate('/tier-list')}
                                        className="mt-2 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-black text-xs font-bold rounded-lg transition-colors"
                                    >
                                        Upgrade Now
                                    </button>
                                )}
                                <div className="mt-3 flex items-center gap-2 text-xs text-zinc-500">
                                    <span>Trial started: {internInfo.activationDate.toLocaleDateString()}</span>
                                    <span>•</span>
                                    <span>Day {internInfo.daysSinceActivation + 1} of 4</span>
                                </div>
                            </div>
                        </div>
                    </Card>
                )}

                {/* Wallets */}
                <h3 className="text-sm font-bold text-zinc-400 mb-4 px-1 uppercase tracking-wider">My Assets</h3>
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <Card className="p-4 border-zinc-800 hover:border-primary-500/30 transition-shadow bg-zinc-900">
                        <div className="flex items-start justify-between mb-2">
                            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500 border border-emerald-500/20">
                                <Wallet size={20} />
                            </div>
                            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Available</span>
                        </div>
                        <p className="text-xl font-bold text-emerald-400">{formatNumber(wallet.incomeWallet)}</p>
                        <p className="text-xs text-zinc-500 font-medium">Income Balance</p>
                    </Card>

                    <Card className="p-4 border-zinc-800 hover:border-blue-500/30 transition-shadow bg-zinc-900">
                        <div className="flex items-start justify-between mb-2">
                            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500 border border-blue-500/20">
                                <Briefcase size={20} />
                            </div>
                            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Fixed</span>
                        </div>
                        <p className="text-xl font-bold text-blue-400">{formatNumber(wallet.personalWallet)}</p>
                        <p className="text-xs text-zinc-500 font-medium">Personal Balance</p>
                    </Card>
                </div>

                {/* Quick Actions */}
                <h3 className="text-sm font-bold text-zinc-400 mb-4 px-1 uppercase tracking-wider">Financial Management</h3>
                <div className="space-y-3 mb-8">
                    <div
                        onClick={() => navigate('/deposit')}
                        className="group bg-zinc-900 rounded-2xl p-4 flex items-center gap-4 border border-zinc-800 shadow-sm hover:border-primary-500/30 transition-all cursor-pointer active:scale-[0.98]"
                    >
                        <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center text-green-500 group-hover:scale-110 transition-transform border border-green-500/20">
                            <ArrowDownLeft size={24} />
                        </div>
                        <div className="flex-1">
                            <p className="font-bold text-white text-sm">Deposit History</p>
                            <p className="text-xs text-zinc-500">View all your top-up records</p>
                        </div>
                        <ChevronRight className="text-zinc-600" size={20} />
                    </div>

                    <div
                        onClick={() => navigate('/withdraw')}
                        className="group bg-zinc-900 rounded-2xl p-4 flex items-center gap-4 border border-zinc-800 shadow-sm hover:border-primary-500/30 transition-all cursor-pointer active:scale-[0.98]"
                    >
                        <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-500 group-hover:scale-110 transition-transform border border-violet-500/20">
                            <ArrowUpRight size={24} />
                        </div>
                        <div className="flex-1">
                            <p className="font-bold text-white text-sm">Withdrawal History</p>
                            <p className="text-xs text-zinc-500">Track payout status</p>
                        </div>
                        <ChevronRight className="text-zinc-600" size={20} />
                    </div>
                </div>

                {/* Team Banner */}
                <div
                    onClick={() => navigate('/team')}
                    className="relative overflow-hidden rounded-3xl bg-zinc-900 p-6 text-white shadow-xl cursor-pointer group border border-zinc-800"
                >
                    <div className="relative z-10 flex items-center justify-between">
                        <div>
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-xs font-bold uppercase tracking-wider mb-2 text-primary-400">
                                <Users size={12} />
                                <span>Team Center</span>
                            </div>
                            <h4 className="text-2xl font-bold mb-1">My Referral Team</h4>
                            <p className="text-zinc-400 text-sm">Check commissions & members</p>
                        </div>
                        <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors border border-white/10">
                            <ChevronRight size={24} />
                        </div>
                    </div>

                    {/* Decorative Elements */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary-600 rounded-full blur-3xl opacity-10 -mr-10 -mt-10" />
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-600 rounded-full blur-2xl opacity-10 -ml-10 -mb-10" />
                </div>

            </div>
        </div>
    );
}
