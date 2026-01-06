import { useState, useEffect } from 'react';
import { userAPI } from '../services/api';
import { toast } from 'react-hot-toast';
import { Wallet, Briefcase, ChevronRight, User, Settings, Users, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Loading from '../components/Loading';
import Card from '../components/ui/Card';
import { formatNumber } from '../utils/formatNumber';

export default function Mine() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState(null);
    const [wallet, setWallet] = useState({ incomeWallet: 0, personalWallet: 0 });

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

    const quickStats = [
        {
            label: 'Total Assets',
            value: formatNumber(wallet.personalWallet + wallet.incomeWallet),
            unit: 'ETB',
            color: 'text-gray-900',
        }
    ];

    return (
        <div className="animate-fade-in min-h-screen bg-gray-50 pb-24">
            {/* Top User Header */}
            <div className="bg-white/80 backdrop-blur-xl sticky top-0 z-30 border-b border-gray-100 px-5 py-4 flex justify-between items-center">
                <h1 className="text-xl font-bold text-gray-900">My Profile</h1>
                <button onClick={() => navigate('/settings')} className="p-2 -mr-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all">
                    <Settings size={24} />
                </button>
            </div>

            <div className="px-5 pt-6 pb-2">
                {/* User Info Card */}
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-emerald-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-emerald-500/20">
                        {profile.phone.slice(-1)}
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 mb-1">{profile.phone}</h2>
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-50 text-primary-700 text-xs font-bold uppercase tracking-wider border border-primary-100">
                            <User size={12} fill="currentColor" />
                            <span>{profile.membershipLevel} Member</span>
                        </div>
                    </div>
                </div>

                {/* Wallets */}
                <h3 className="text-sm font-bold text-gray-900 mb-4 px-1">My Assets</h3>
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <Card className="p-4 border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-2">
                            <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                                <Wallet size={20} />
                            </div>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Available</span>
                        </div>
                        <p className="text-xl font-bold text-emerald-600">{formatNumber(wallet.incomeWallet)}</p>
                        <p className="text-xs text-gray-400">Income Balance</p>
                    </Card>

                    <Card className="p-4 border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-2">
                            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                                <Briefcase size={20} />
                            </div>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Fixed</span>
                        </div>
                        <p className="text-xl font-bold text-blue-600">{formatNumber(wallet.personalWallet)}</p>
                        <p className="text-xs text-gray-400">Personal Balance</p>
                    </Card>
                </div>

                {/* Quick Actions */}
                <h3 className="text-sm font-bold text-gray-900 mb-4 px-1">Financial Management</h3>
                <div className="space-y-3 mb-8">
                    <div
                        onClick={() => navigate('/deposit')}
                        className="group bg-white rounded-2xl p-4 flex items-center gap-4 border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer active:scale-[0.98]"
                    >
                        <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center text-green-600 group-hover:scale-110 transition-transform">
                            <ArrowDownLeft size={24} />
                        </div>
                        <div className="flex-1">
                            <p className="font-bold text-gray-900 text-sm">Deposit History</p>
                            <p className="text-xs text-gray-500">View all your top-up records</p>
                        </div>
                        <ChevronRight className="text-gray-300" size={20} />
                    </div>

                    <div
                        onClick={() => navigate('/withdraw')}
                        className="group bg-white rounded-2xl p-4 flex items-center gap-4 border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer active:scale-[0.98]"
                    >
                        <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600 group-hover:scale-110 transition-transform">
                            <ArrowUpRight size={24} />
                        </div>
                        <div className="flex-1">
                            <p className="font-bold text-gray-900 text-sm">Withdrawal History</p>
                            <p className="text-xs text-gray-500">Track payout status</p>
                        </div>
                        <ChevronRight className="text-gray-300" size={20} />
                    </div>
                </div>

                {/* Team Banner */}
                <div
                    onClick={() => navigate('/team')}
                    className="relative overflow-hidden rounded-3xl bg-gray-900 p-6 text-white shadow-xl cursor-pointer group"
                >
                    <div className="relative z-10 flex items-center justify-between">
                        <div>
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold uppercase tracking-wider mb-2">
                                <Users size={12} />
                                <span>Team Center</span>
                            </div>
                            <h4 className="text-2xl font-bold mb-1">My Referral Team</h4>
                            <p className="text-gray-400 text-sm">Check commissions & members</p>
                        </div>
                        <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                            <ChevronRight size={24} />
                        </div>
                    </div>

                    {/* Decorative Elements */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500 rounded-full blur-3xl opacity-20 -mr-10 -mt-10" />
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-500 rounded-full blur-2xl opacity-20 -ml-10 -mb-10" />
                </div>

            </div>
        </div>
    );
}
