import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { referralAPI } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { toast } from 'react-hot-toast';
import {
    ChevronLeft,
    Users,
    Share2,
    Copy,
    ArrowRight,
    DollarSign,
    ChevronDown,
    ChevronUp,
    Trophy,
    Target,
    Award
} from 'lucide-react';
import Loading from '../components/Loading';
import { formatNumber } from '../utils/formatNumber';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

export default function Team() {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [downline, setDownline] = useState(null);
    const [commissions, setCommissions] = useState([]);
    const [commissionTotals, setCommissionTotals] = useState({ A: 0, B: 0, C: 0, total: 0 });
    const [salaryData, setSalaryData] = useState(null);
    const [expandedLevel, setExpandedLevel] = useState('a'); // 'a', 'b', 'c', or null

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [downlineRes, commissionRes, salaryRes] = await Promise.all([
                referralAPI.getDownline(),
                referralAPI.getCommissions(),
                referralAPI.getSalary()
            ]);
            setDownline(downlineRes.data.downline);
            setCommissions(commissionRes.data.commissions);
            setCommissionTotals(commissionRes.data.totals);
            setSalaryData(salaryRes.data);
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
        a: 'from-primary-600 to-violet-600',
        b: 'from-emerald-600 to-green-600',
        c: 'from-blue-600 to-indigo-600'
    };

    const renderUserList = (users) => {
        if (!users || users.length === 0) {
            return <p className="text-center py-4 text-zinc-500 text-xs italic">No users in this level yet</p>;
        }

        const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api$/, '');

        return (
            <div className="space-y-2 mt-2 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
                {users.map((u, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 bg-zinc-950/50 rounded-xl border border-zinc-800 hover:border-zinc-700 transition-colors">
                        <div className="flex items-center gap-3">
                            {u.profilePhoto ? (
                                <img
                                    src={u.profilePhoto.startsWith('http') ? u.profilePhoto : `${API_URL}${u.profilePhoto}`}
                                    alt={u.name || 'User'}
                                    className="w-8 h-8 rounded-full object-cover"
                                />
                            ) : (
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-violet-600 flex items-center justify-center text-white font-bold text-xs">
                                    {u.name ? u.name.charAt(0).toUpperCase() : u.phone.slice(-1)}
                                </div>
                            )}
                            <div className="flex flex-col">
                                <span className="text-xs font-bold text-zinc-300">{u.name || 'User'}</span>
                                <span className="text-[10px] text-zinc-500">{u.phone.replace(/(\+\d{3})(\d{2})(\d{3})(\d{4})/, '$1 $2 *** $4')}</span>
                            </div>
                        </div>
                        <span className="px-2 py-1 bg-zinc-900 border border-zinc-800 rounded-lg text-[10px] font-bold text-primary-500 uppercase tracking-wider shadow-sm">
                            {u.membershipLevel}
                        </span>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-zinc-950 pb-24 animate-fade-in">
            {/* Header */}
            <div className="bg-zinc-900/80 backdrop-blur-md px-4 py-3 flex items-center gap-4 sticky top-0 z-30 border-b border-zinc-800">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 -ml-2 rounded-full text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
                >
                    <ChevronLeft size={24} />
                </button>
                <h1 className="text-xl font-bold text-white">My Team</h1>
            </div>

            <div className="px-4 py-6 space-y-6">
                {/* Invitation Card */}
                <div className="relative overflow-hidden rounded-3xl bg-zinc-900 p-6 text-white shadow-xl border border-zinc-800">
                    <div className="relative z-10">
                        <p className="text-xs text-primary-200 font-bold uppercase mb-1 tracking-widest flex items-center gap-2">
                            <Trophy size={14} className="text-yellow-400" />
                            Your Rewards
                        </p>
                        <h2 className="text-4xl font-black mb-8 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-400">
                            {formatNumber(commissionTotals.total)}
                            <span className="text-lg font-bold text-primary-400 ml-2">ETB</span>
                        </h2>

                        <div className="space-y-3">
                            <div className="flex gap-2">
                                <div className="flex-1 bg-black/20 backdrop-blur-md rounded-xl p-3 border border-white/5 flex justify-between items-center overflow-hidden">
                                    <div className="truncate mr-2">
                                        <p className="text-[9px] text-zinc-400 font-bold uppercase mb-0.5">Invitation Link</p>
                                        <p className="font-mono text-xs truncate opacity-90 text-primary-100">
                                            {window.location.origin}/register?ref={user?.invitationCode}
                                        </p>
                                    </div>
                                </div>
                                <Button
                                    onClick={handleCopyLink}
                                    className="bg-primary-500 hover:bg-primary-600 text-black font-bold min-w-[100px] shadow-glow border-none"
                                >
                                    <Share2 size={16} className="mr-2" />
                                    Invite
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Background Decorative */}
                    <Users className="absolute -bottom-8 -right-8 text-white/5 rotate-12" size={200} />
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
                </div>

                {/* Team Stats Grid */}
                <div className="grid grid-cols-2 gap-4">
                    <Card className="p-4 border-zinc-800 bg-zinc-900">
                        <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 mb-3 border border-blue-500/20">
                            <Users size={20} />
                        </div>
                        <p className="text-[10px] uppercase font-bold text-zinc-500 mb-1 tracking-wide">Total Team</p>
                        <p className="text-2xl font-black text-white">{downline?.total || 0}</p>
                    </Card>
                    <Card className="p-4 border-zinc-800 bg-zinc-900">
                        <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-3 border border-emerald-500/20">
                            <Award size={20} />
                        </div>
                        <p className="text-[10px] uppercase font-bold text-zinc-500 mb-1 tracking-wide">A-Level</p>
                        <p className="text-2xl font-black text-emerald-400">{downline?.aLevel.count || 0}</p>
                    </Card>
                </div>

                {/* Salary Status */}
                <Card className="p-6 border-zinc-800 bg-zinc-900 overflow-hidden relative">
                    <div className="flex justify-between items-start mb-6 relative z-10">
                        <div>
                            <p className="text-xs uppercase font-bold text-zinc-500 mb-1 tracking-widest flex items-center gap-1.5">
                                <Target size={14} />
                                Salary Status
                            </p>
                            <h3 className="text-2xl font-black text-white">
                                {salaryData?.salary > 0 ? formatNumber(salaryData.salary) : '0'}
                                <span className="text-sm font-bold text-zinc-500 ml-1">ETB / Month</span>
                            </h3>
                        </div>
                        <div className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${salaryData?.salary > 0 ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-zinc-800 text-zinc-500 border-zinc-700'
                            }`}>
                            {salaryData?.salary > 0 ? 'Eligible' : 'Ineligible'}
                        </div>
                    </div>

                    <div className="space-y-4 relative z-10">
                        {/* Rule 4 Progress */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-end text-xs">
                                <span className="font-bold text-zinc-400 opacity-80">{salaryData?.breakdown?.settings?.direct10?.threshold || 10} Direct Invites</span>
                                <span className="font-bold text-cyan-500">{downline?.aLevel.count || 0} / {salaryData?.breakdown?.settings?.direct10?.threshold || 10}</span>
                            </div>
                            <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-cyan-500 rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(6,182,212,0.5)]"
                                    style={{ width: `${Math.min(((downline?.aLevel.count || 0) / (salaryData?.breakdown?.settings?.direct10?.threshold || 10)) * 100, 100)}%` }}
                                />
                            </div>
                            <p className="text-[10px] text-zinc-500 font-medium">Earn {formatNumber(salaryData?.breakdown?.settings?.direct10?.amount || 10000)} ETB/month</p>
                        </div>

                        {/* Rule 1 Progress */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-end text-xs">
                                <span className="font-bold text-zinc-400 opacity-80">{salaryData?.breakdown?.settings?.direct15?.threshold || 15} Direct Invites</span>
                                <span className="font-bold text-primary-500">{downline?.aLevel.count || 0} / {salaryData?.breakdown?.settings?.direct15?.threshold || 15}</span>
                            </div>
                            <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-primary-500 rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(234,179,8,0.5)]"
                                    style={{ width: `${Math.min(((downline?.aLevel.count || 0) / (salaryData?.breakdown?.settings?.direct15?.threshold || 15)) * 100, 100)}%` }}
                                />
                            </div>
                            <p className="text-[10px] text-zinc-500 font-medium">Earn {formatNumber(salaryData?.breakdown?.settings?.direct15?.amount || 15000)} ETB/month</p>
                        </div>

                        {/* Rule 2 Progress */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-end text-xs">
                                <span className="font-bold text-zinc-400 opacity-80">{salaryData?.breakdown?.settings?.direct20?.threshold || 20} Direct Invites</span>
                                <span className="font-bold text-violet-500">{downline?.aLevel.count || 0} / {salaryData?.breakdown?.settings?.direct20?.threshold || 20}</span>
                            </div>
                            <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-violet-500 rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(139,92,246,0.5)]"
                                    style={{ width: `${Math.min(((downline?.aLevel.count || 0) / (salaryData?.breakdown?.settings?.direct20?.threshold || 20)) * 100, 100)}%` }}
                                />
                            </div>
                            <p className="text-[10px] text-zinc-500 font-medium">Earn {formatNumber(salaryData?.breakdown?.settings?.direct20?.amount || 20000)} ETB/month</p>
                        </div>

                        {/* Rule 3 Progress */}
                        <div className="space-y-2 pt-2 border-t border-zinc-800">
                            <div className="flex justify-between items-end text-xs">
                                <span className="font-bold text-zinc-400 opacity-80">{salaryData?.breakdown?.settings?.network40?.threshold || 40} Total Team</span>
                                <span className="font-bold text-emerald-500">{downline?.total || 0} / {salaryData?.breakdown?.settings?.network40?.threshold || 40}</span>
                            </div>
                            <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-emerald-500 rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                                    style={{ width: `${Math.min(((downline?.total || 0) / (salaryData?.breakdown?.settings?.network40?.threshold || 40)) * 100, 100)}%` }}
                                />
                            </div>
                            <p className="text-[10px] text-zinc-500 font-medium">Earn {formatNumber(salaryData?.breakdown?.settings?.network40?.amount || 48000)} ETB/month</p>
                        </div>
                    </div>
                </Card>

                {/* Level Breakdown */}
                <div className="space-y-4">
                    <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest px-2">Team Levels</h3>

                    {['a', 'b', 'c'].map((lvl) => {
                        const levelData = downline ? downline[`${lvl}Level`] : null;
                        const isExpanded = expandedLevel === lvl;
                        const label = lvl === 'a' ? 'Direct Referrals' : lvl === 'b' ? '1st Indirect' : '2nd Indirect';
                        const percent = lvl === 'a' ? '10%' : lvl === 'b' ? '5%' : '2%';

                        return (
                            <Card key={lvl} className={`overflow-hidden transition-all duration-300 border-zinc-800 bg-zinc-900 ${isExpanded ? 'ring-1 ring-primary-500/30 shadow-glow' : ''}`}>
                                <div
                                    className={`p-4 flex items-center justify-between cursor-pointer ${isExpanded ? 'bg-zinc-800/50' : 'bg-zinc-900 hover:bg-zinc-800/30'}`}
                                    onClick={() => setExpandedLevel(isExpanded ? null : lvl)}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${levelColors[lvl]} flex items-center justify-center text-white font-black text-xl shadow-lg shadow-black/30`}>
                                            {lvl.toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-bold text-white text-sm">{label}</p>
                                            <div className="inline-flex items-center gap-1 bg-zinc-950/50 border border-zinc-800 px-2 py-0.5 rounded text-[10px] font-bold text-zinc-400 uppercase mt-1">
                                                <span>Commission:</span>
                                                <span className="text-primary-400">{percent}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <p className="text-lg font-black text-white">{levelData?.count || 0}</p>
                                            <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-wide">Members</p>
                                        </div>
                                        {isExpanded ? <ChevronUp className="text-zinc-500" size={20} /> : <ChevronDown className="text-zinc-500" size={20} />}
                                    </div>
                                </div>
                                {isExpanded && (
                                    <div className="px-4 pb-4 animate-slide-up">
                                        <div className="border-t border-zinc-800 pt-3">
                                            {renderUserList(levelData?.users)}
                                        </div>
                                    </div>
                                )}
                            </Card>
                        );
                    })}
                </div>

                {/* Recent Commissions */}
                <Card className="overflow-hidden border-zinc-800 bg-zinc-900">
                    <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
                        <h3 className="font-bold text-zinc-200 text-sm flex items-center gap-2">
                            <DollarSign className="text-primary-500" size={18} />
                            Recent Income
                        </h3>
                    </div>
                    <div className="p-2">
                        {commissions.length === 0 ? (
                            <div className="py-12 text-center">
                                <div className="w-16 h-16 bg-zinc-950/50 rounded-full flex items-center justify-center mx-auto mb-3 border border-zinc-800">
                                    <DollarSign className="text-zinc-600" size={24} />
                                </div>
                                <p className="text-xs text-zinc-500 font-medium">No commissions earned yet</p>
                            </div>
                        ) : (
                            <div className="space-y-1">
                                {commissions.slice(0, 10).map((comm, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-3 hover:bg-zinc-800 rounded-xl transition-colors border border-transparent hover:border-zinc-800">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shadow-sm text-white ${comm.level === 'A' ? 'bg-primary-600 shadow-primary-500/20' : comm.level === 'B' ? 'bg-emerald-600 shadow-emerald-500/20' : 'bg-blue-600 shadow-blue-500/20'
                                                }`}>
                                                {comm.level}
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-white leading-none mb-1">
                                                    {comm.downlineUser ? comm.downlineUser.phone.slice(-4) : 'User'} Upgrade
                                                </p>
                                                <p className="text-[10px] text-zinc-500 font-medium uppercase tracking-wide">
                                                    {new Date(comm.createdAt).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-black text-emerald-400">+{formatNumber(comm.amountEarned)}</p>
                                            <p className="text-[9px] font-bold text-zinc-500 uppercase">ETB</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
}
