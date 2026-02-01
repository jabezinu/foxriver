import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { referralAPI } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { useSettings } from '../contexts/SettingsContext';
import { toast } from 'react-hot-toast';
import { getServerUrl } from '../config/api.config';
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
import Modal from '../components/Modal';

export default function Team() {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const { settings } = useSettings();
    const [loading, setLoading] = useState(true);
    const [downline, setDownline] = useState(null);
    const [commissions, setCommissions] = useState([]);
    const [commissionTotals, setCommissionTotals] = useState({ A: 0, B: 0, C: 0, total: 0 });
    const [salaryData, setSalaryData] = useState(null);
    const [expandedLevel, setExpandedLevel] = useState('a'); // 'a', 'b', 'c', or null
    const [showInviteModal, setShowInviteModal] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async (forceRefresh = false) => {
        try {
            // Add a small delay to prevent rapid successive calls
            await new Promise(resolve => setTimeout(resolve, 100));
            
            const [downlineRes, commissionRes, salaryRes] = await Promise.all([
                referralAPI.getDownline(),
                referralAPI.getCommissions(),
                referralAPI.getSalary()
            ]);
            
            // Set data with fallbacks
            setDownline(downlineRes.data.downline || null);
            setCommissions(commissionRes.data.commissions || []);
            setCommissionTotals(commissionRes.data.totals || { A: 0, B: 0, C: 0, total: 0 });
            setSalaryData(salaryRes.data || null);
            
            if (forceRefresh) {
                toast.success('Team data refreshed');
            }
        } catch (error) {
            // Check if it's a rate limit error
            if (error.response?.status === 429) {
                toast.error('Too many requests. Please wait a moment and try again.');
            } else {
                toast.error('Failed to load team data');
            }
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

    const handleShareToTelegram = () => {
        const link = `${window.location.origin}/register?ref=${user?.invitationCode}`;
        const message = `Join me on this amazing platform! Use my invitation link: ${link}`;
        const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(message)}`;
        window.open(telegramUrl, '_blank');
    };

    const handleShareToWhatsApp = () => {
        const link = `${window.location.origin}/register?ref=${user?.invitationCode}`;
        const message = `Join me on this amazing platform! Use my invitation link: ${link}`;
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    };

    const handleShareToFacebook = () => {
        const link = `${window.location.origin}/register?ref=${user?.invitationCode}`;
        const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}`;
        window.open(facebookUrl, '_blank');
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

        const serverUrl = getServerUrl();

        return (
            <div className="space-y-2 mt-2 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
                {users.map((u, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 bg-zinc-950/50 rounded-xl border border-zinc-800 hover:border-zinc-700 transition-colors">
                        <div className="flex items-center gap-3">
                            {u.profilePhoto ? (
                                <img
                                    src={u.profilePhoto.startsWith('http') ? u.profilePhoto : `${serverUrl}${u.profilePhoto}`}
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
                        <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 border rounded-lg text-[10px] font-bold uppercase tracking-wider shadow-sm ${
                                u.membershipLevel === 'Intern' 
                                    ? 'bg-zinc-800 text-zinc-400 border-zinc-700' 
                                    : 'bg-zinc-900 border-zinc-800 text-primary-500'
                            }`}>
                                {u.membershipLevel}
                            </span>
                            {u.membershipLevel === 'Intern' && (
                                <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" title="No commission until upgraded"></div>
                            )}
                        </div>
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
                <h1 className="text-xl font-bold text-white flex-1">My Team</h1>
                <button
                    onClick={() => fetchData(true)}
                    disabled={loading}
                    className="p-2 rounded-full text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors disabled:opacity-50"
                    title="Refresh team data"
                >
                    <svg className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                </button>
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
                                    onClick={() => setShowInviteModal(true)}
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
                        
                        // Get dynamic referral commission percentages (for membership upgrades) from settings
                        const getCommissionPercent = () => {
                            if (!settings) return lvl === 'a' ? '10%' : lvl === 'b' ? '5%' : '2%';
                            // Use upgrade commission percentages, fallback to regular commission if not set
                            if (lvl === 'a') return `${settings.upgradeCommissionPercentA || settings.commissionPercentA || 10}%`;
                            if (lvl === 'b') return `${settings.upgradeCommissionPercentB || settings.commissionPercentB || 5}%`;
                            return `${settings.upgradeCommissionPercentC || settings.commissionPercentC || 2}%`;
                        };
                        
                        const percent = getCommissionPercent();
                        const commissionEligibleCount = levelData?.count || 0; // Commission-eligible users
                        const totalCount = levelData?.totalCount || 0; // All users including Interns

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
                                                <span>Referral Commission:</span>
                                                <span className="text-primary-400">{percent}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <div className="flex items-center gap-2">
                                                <div className="text-right">
                                                    <p className="text-lg font-black text-white">{totalCount}</p>
                                                    <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-wide">Total</p>
                                                </div>
                                                {commissionEligibleCount !== totalCount && (
                                                    <div className="text-right">
                                                        <p className="text-sm font-bold text-primary-400">({commissionEligibleCount})</p>
                                                        <p className="text-[8px] font-bold text-primary-500 uppercase tracking-wide">Eligible</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        {isExpanded ? <ChevronUp className="text-zinc-500" size={20} /> : <ChevronDown className="text-zinc-500" size={20} />}
                                    </div>
                                </div>
                                {isExpanded && (
                                    <div className="px-4 pb-4 animate-slide-up">
                                        <div className="border-t border-zinc-800 pt-3">
                                            {commissionEligibleCount !== totalCount && (
                                                <div className="mb-3 p-2 bg-zinc-950/50 rounded-lg border border-zinc-800">
                                                    <p className="text-[10px] text-zinc-400 font-medium">
                                                        <span className="text-primary-400 font-bold">{commissionEligibleCount}</span> of <span className="text-white font-bold">{totalCount}</span> members are commission-eligible (Rank 1+)
                                                    </p>
                                                </div>
                                            )}
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
                                {commissions && commissions.length > 0 && commissions.slice(0, 10).map((comm, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-3 hover:bg-zinc-800 rounded-xl transition-colors border border-transparent hover:border-zinc-800">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shadow-sm text-white ${comm.level === 'A' ? 'bg-primary-600 shadow-primary-500/20' : comm.level === 'B' ? 'bg-emerald-600 shadow-emerald-500/20' : 'bg-blue-600 shadow-blue-500/20'
                                                }`}>
                                                {comm.level}
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-white leading-none mb-1">
                                                    {comm.downlineUser?.phone ? comm.downlineUser.phone.slice(-4) : 'User'} Upgrade
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

            {/* Invite Modal */}
            <Modal
                isOpen={showInviteModal}
                onClose={() => setShowInviteModal(false)}
                title="Share Invitation"
            >
                <div className="space-y-6">
                    {/* Invitation Link */}
                    <div>
                        <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wide mb-2">
                            Your Invitation Link
                        </label>
                        <div className="flex gap-2">
                            <div className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl p-3 overflow-hidden">
                                <p className="font-mono text-xs text-zinc-300 truncate">
                                    {window.location.origin}/register?ref={user?.invitationCode}
                                </p>
                            </div>
                            <Button
                                onClick={handleCopyLink}
                                className="bg-zinc-800 hover:bg-zinc-700 text-white border-zinc-700 min-w-[80px]"
                            >
                                <Copy size={16} className="mr-2" />
                                Copy
                            </Button>
                        </div>
                    </div>

                    {/* Social Share Buttons */}
                    <div>
                        <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wide mb-3">
                            Share via Social Media
                        </label>
                        <div className="space-y-3">
                            {/* Telegram */}
                            <button
                                onClick={handleShareToTelegram}
                                className="w-full flex items-center gap-3 p-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-xl transition-all shadow-lg hover:shadow-blue-500/20 group"
                            >
                                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18.717-1.969 9.3-2.098 9.98-.055.29-.163.387-.267.396-.22.02-.365-.145-.566-.284-.314-.217-4.918-3.152-5.288-3.424-.096-.07-.203-.21-.006-.374.451-.376 4.182-3.794 4.27-3.88.088-.086.044-.14-.061-.088-.105.052-5.26 3.34-5.482 3.48-.222.14-.48.21-.692.07-.212-.14-1.294-.413-1.478-.47-.184-.057-.397-.18-.397-.42 0-.24.214-.375.428-.495.214-.12 8.094-3.14 8.488-3.29.394-.15.788-.07.788.36z"/>
                                    </svg>
                                </div>
                                <div className="flex-1 text-left">
                                    <p className="font-bold text-white text-sm">Share on Telegram</p>
                                    <p className="text-xs text-blue-100 opacity-90">Send to your Telegram contacts</p>
                                </div>
                                <ArrowRight className="text-white opacity-70 group-hover:translate-x-1 transition-transform" size={20} />
                            </button>

                            {/* WhatsApp */}
                            <button
                                onClick={handleShareToWhatsApp}
                                className="w-full flex items-center gap-3 p-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 rounded-xl transition-all shadow-lg hover:shadow-green-500/20 group"
                            >
                                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                                    </svg>
                                </div>
                                <div className="flex-1 text-left">
                                    <p className="font-bold text-white text-sm">Share on WhatsApp</p>
                                    <p className="text-xs text-green-100 opacity-90">Send to your WhatsApp contacts</p>
                                </div>
                                <ArrowRight className="text-white opacity-70 group-hover:translate-x-1 transition-transform" size={20} />
                            </button>

                            {/* Facebook */}
                            <button
                                onClick={handleShareToFacebook}
                                className="w-full flex items-center gap-3 p-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-xl transition-all shadow-lg hover:shadow-blue-600/20 group"
                            >
                                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                                    </svg>
                                </div>
                                <div className="flex-1 text-left">
                                    <p className="font-bold text-white text-sm">Share on Facebook</p>
                                    <p className="text-xs text-blue-100 opacity-90">Post to your Facebook timeline</p>
                                </div>
                                <ArrowRight className="text-white opacity-70 group-hover:translate-x-1 transition-transform" size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
