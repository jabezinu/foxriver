import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { referralAPI } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { toast } from 'react-hot-toast';
import {
    HiChevronLeft,
    HiUserGroup,
    HiShare,
    HiDuplicate,
    HiArrowSmRight,
    HiCurrencyDollar,
    HiChevronDown,
    HiChevronUp
} from 'react-icons/hi';
import Loading from '../components/Loading';
import { formatNumber } from '../utils/formatNumber';

export default function Team() {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [downline, setDownline] = useState(null);
    const [commissions, setCommissions] = useState([]);
    const [commissionTotals, setCommissionTotals] = useState({ A: 0, B: 0, C: 0, total: 0 });
    const [expandedLevel, setExpandedLevel] = useState('a'); // 'a', 'b', 'c', or null

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [downlineRes, commissionRes] = await Promise.all([
                referralAPI.getDownline(),
                referralAPI.getCommissions()
            ]);
            setDownline(downlineRes.data.downline);
            setCommissions(commissionRes.data.commissions);
            setCommissionTotals(commissionRes.data.totals);
        } catch (error) {
            toast.error('Failed to load team data');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleCopyLink = () => {
        const link = `${window.location.origin}/register?ref=${user?.invitationCode}`;
        navigator.clipboard.writeText(link);
        toast.success('Invitation link copied!');
    };

    const handleCopyCode = () => {
        navigator.clipboard.writeText(user?.invitationCode);
        toast.success('Invitation code copied!');
    };

    if (loading) return <Loading />;

    const levelColors = {
        a: 'from-blue-500 to-indigo-600',
        b: 'from-emerald-500 to-teal-600',
        c: 'from-purple-500 to-violet-600'
    };

    const renderUserList = (users) => {
        if (!users || users.length === 0) {
            return <p className="text-center py-4 text-gray-400 text-xs italic">No users in this level yet</p>;
        }

        return (
            <div className="space-y-2 mt-2 max-h-60 overflow-y-auto pr-1">
                {users.map((u, idx) => (
                    <div key={idx} className="flex justify-between items-center p-2 bg-gray-50 rounded-lg border border-gray-100">
                        <div className="flex flex-col">
                            <span className="text-xs font-bold text-gray-700">{u.phone.replace(/(\+\d{3})(\d{2})(\d{3})(\d{4})/, '$1 $2 *** $4')}</span>
                            <span className="text-[10px] text-gray-400">{new Date(u.createdAt).toLocaleDateString()}</span>
                        </div>
                        <span className="px-2 py-0.5 bg-white border border-gray-200 rounded text-[9px] font-bold text-gray-600 uppercase">
                            {u.membershipLevel}
                        </span>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20 animate-fadeIn">
            {/* Header */}
            <div className="bg-white px-4 py-4 flex items-center gap-4 sticky top-0 z-20 shadow-sm">
                <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <HiChevronLeft className="text-2xl text-gray-600" />
                </button>
                <h1 className="text-xl font-bold text-gray-800">My Team</h1>
            </div>

            <div className="p-4 space-y-4">
                {/* Invitation Card */}
                <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
                    <HiUserGroup className="absolute -bottom-8 -right-8 text-[12rem] text-white/5 rotate-12" />
                    <div className="relative z-10">
                        <p className="text-xs text-white/50 font-bold uppercase mb-1 tracking-widest">Your Rewards</p>
                        <h2 className="text-3xl font-black mb-6">{formatNumber(commissionTotals.total)} <span className="text-sm font-bold opacity-60">ETB</span></h2>

                        <div className="space-y-3">
                            <div className="flex gap-2">
                                <div className="flex-1 bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10 flex justify-between items-center">
                                    <div className="overflow-hidden">
                                        <p className="text-[8px] text-white/40 font-bold uppercase mb-0.5">Invite Code</p>
                                        <p className="font-bold text-sm tracking-widest uppercase truncate">{user?.invitationCode}</p>
                                    </div>
                                    <button onClick={handleCopyCode} className="p-2 bg-white/10 rounded-xl hover:bg-white/20 transition-colors">
                                        <HiDuplicate className="text-lg" />
                                    </button>
                                </div>
                                <button
                                    onClick={handleCopyLink}
                                    className="px-5 bg-green-500 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-green-600 transition-all active:scale-95"
                                >
                                    <HiShare className="text-lg" />
                                    <span className="text-xs uppercase tracking-widest">Link</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Team Stats Grid */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100">
                        <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">Total Team</p>
                        <p className="text-2xl font-black text-gray-800">{downline?.total || 0}</p>
                    </div>
                    <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100">
                        <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">A-Level</p>
                        <p className="text-2xl font-black text-blue-600">{downline?.aLevel.count || 0}</p>
                    </div>
                </div>

                {/* Level Breakdown */}
                <div className="space-y-3">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] ml-2">Team Levels</h3>

                    {['a', 'b', 'c'].map((lvl) => {
                        const levelData = downline ? downline[`${lvl}Level`] : null;
                        const isExpanded = expandedLevel === lvl;
                        const label = lvl === 'a' ? 'Direct Referrals' : lvl === 'b' ? '1st Indirect' : '2nd Indirect';
                        const percent = lvl === 'a' ? '10%' : lvl === 'b' ? '5%' : '2%';

                        return (
                            <div key={lvl} className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
                                <div
                                    className={`p-4 flex items-center justify-between cursor-pointer transition-colors ${isExpanded ? 'bg-gray-50' : ''}`}
                                    onClick={() => setExpandedLevel(isExpanded ? null : lvl)}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${levelColors[lvl]} flex items-center justify-center text-white font-black text-xl shadow-lg`}>
                                            {lvl.toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-800 text-sm italic">{label}</p>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Earnings: {percent}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="text-right">
                                            <p className="text-sm font-black text-gray-800">{levelData?.count || 0}</p>
                                            <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">{formatNumber(commissionTotals[lvl.toUpperCase()])} ETB</p>
                                        </div>
                                        {isExpanded ? <HiChevronUp className="text-gray-400" /> : <HiChevronDown className="text-gray-400" />}
                                    </div>
                                </div>
                                {isExpanded && (
                                    <div className="px-4 pb-4 animate-slideDown">
                                        <div className="border-t border-gray-100 pt-3">
                                            {renderUserList(levelData?.users)}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Recent Commissions */}
                <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-4 border-b border-gray-50 flex justify-between items-center">
                        <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                            <HiCurrencyDollar className="text-yellow-500 text-lg" />
                            Recent Income
                        </h3>
                        {/* <span className="text-[9px] font-bold text-blue-600 uppercase underline">View All</span> */}
                    </div>
                    <div className="p-2">
                        {commissions.length === 0 ? (
                            <div className="py-10 text-center">
                                <HiCurrencyDollar className="text-4xl text-gray-100 mx-auto mb-2" />
                                <p className="text-xs text-gray-400 font-medium">No commissions earned yet</p>
                            </div>
                        ) : (
                            <div className="space-y-1">
                                {commissions.slice(0, 10).map((comm, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-2xl transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center font-bold text-xs ${comm.level === 'A' ? 'text-blue-600' : comm.level === 'B' ? 'text-emerald-600' : 'text-purple-600'
                                                }`}>
                                                {comm.level}
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-gray-800 leading-none mb-1">
                                                    {comm.downlineUser ? comm.downlineUser.phone.slice(-4) : 'User'} Upgrade
                                                </p>
                                                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tighter">
                                                    {new Date(comm.createdAt).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-black text-green-600">+{formatNumber(comm.amountEarned)}</p>
                                            <p className="text-[8px] font-bold text-gray-400 uppercase tracking-[0.1em]">ETB</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
