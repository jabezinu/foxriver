import { useState, useEffect } from 'react';
import { userAPI, membershipAPI } from '../services/api';
import { toast } from 'react-hot-toast';
import { HiArrowLeft, HiCurrencyDollar, HiBriefcase, HiLightningBolt } from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';
import Loading from '../components/Loading';

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

    return (
        <div className="animate-fadeIn px-4 py-8">
            {/* User Header */}
            <div className="flex flex-col items-center mb-10">
                <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center text-white text-4xl font-bold shadow-xl mb-4 border-4 border-white">
                    {profile.phone.slice(-1)}
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">{profile.phone}</h2>
                <div className="bg-green-100 text-green-700 text-[10px] font-bold px-4 py-1.5 rounded-full uppercase tracking-widest">
                    {profile.membershipLevel} MEMBER
                </div>
            </div>

            {/* Asset Grid */}
            <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-50">
                    <div className="flex justify-between items-center mb-4">
                        <HiCurrencyDollar className="text-2xl text-green-500" />
                        <span className="text-[10px] font-bold text-gray-400 uppercase">Available</span>
                    </div>
                    <p className="text-xl font-bold text-gray-900">{wallet.incomeWallet} ETB</p>
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-tighter">Income Balance</p>
                </div>
                <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-50">
                    <div className="flex justify-between items-center mb-4">
                        <HiBriefcase className="text-2xl text-blue-500" />
                        <span className="text-[10px] font-bold text-gray-400 uppercase">Settled</span>
                    </div>
                    <p className="text-xl font-bold text-gray-900">{wallet.personalWallet} ETB</p>
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-tighter">Personal Balance</p>
                </div>
            </div>

            {/* Action List */}
            <div className="space-y-4">
                <h3 className="font-bold text-gray-800 text-sm uppercase tracking-widest mb-4">Financial Records</h3>
                <div
                    onClick={() => navigate('/deposit')}
                    className="card flex items-center gap-4 cursor-pointer hover:bg-gray-50 transition-colors"
                >
                    <div className="p-3 bg-green-50 rounded-xl text-green-600">
                        <HiLightningBolt className="text-xl" />
                    </div>
                    <div className="flex-1">
                        <p className="font-bold text-gray-800 text-sm">Deposit History</p>
                        <p className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter">View all top-up requests</p>
                    </div>
                </div>
                <div
                    onClick={() => navigate('/withdraw')}
                    className="card flex items-center gap-4 cursor-pointer hover:bg-gray-50 transition-colors"
                >
                    <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
                        <HiBriefcase className="text-xl" />
                    </div>
                    <div className="flex-1">
                        <p className="font-bold text-gray-800 text-sm">Withdrawal History</p>
                        <p className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter">Track your payouts</p>
                    </div>
                </div>
            </div>

            {/* Statistics Teaser */}
            <div className="mt-8 bg-gradient-to-r from-gray-900 to-gray-800 rounded-3xl p-6 text-white shadow-lg overflow-hidden relative">
                <div className="relative z-10">
                    <p className="text-xs text-white/50 font-bold uppercase mb-1">Referral Team</p>
                    <h4 className="text-2xl font-bold mb-4">Commission Center</h4>
                    <button
                        onClick={() => navigate('/team')} // Updated from /mine
                        className="bg-white text-gray-900 text-[10px] font-bold px-6 py-3 rounded-xl uppercase tracking-widest hover:bg-green-50 transition-all"
                    >
                        Check Rewards
                    </button>
                </div>
                <HiCurrencyDollar className="absolute -bottom-6 -right-6 text-9xl text-white/5 rotate-12" />
            </div>
        </div>
    );
}
