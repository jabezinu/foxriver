import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { userAPI } from '../services/api';
import { toast } from 'react-hot-toast';
import { formatNumber } from '../utils/formatNumber';
import {
    Download, Upload, LayoutGrid, Zap,
    HelpCircle, Settings, Bell, Newspaper, GraduationCap, Gamepad2, Sparkles, Trophy, RotateCw,
    Users, Briefcase, TrendingUp, UserPlus, DollarSign, Copy, Share2
} from 'lucide-react';
import Modal from '../components/Modal';
import Loading from '../components/Loading';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import LanguageSelector from '../components/LanguageSelector';
import BankChangeConfirmation from '../components/BankChangeConfirmation';
import TransactionNotifications from '../components/TransactionNotifications';
import { useUserStore } from '../store/userStore';
import logo from '../assets/logo.png';

const MenuItem = ({ item, navigate, isLarge = false }) => (
    <div
        onClick={item.path ? () => navigate(item.path) : item.action}
        className={`
            group relative flex flex-col items-center justify-center 
            bg-zinc-900 rounded-2xl p-4 
            border border-zinc-800 shadow-sm
            hover:shadow-glow hover:border-primary-500/30 hover:-translate-y-0.5
            transition-all duration-300 active:scale-95 cursor-pointer 
            ${isLarge ? 'flex-row gap-4 justify-start px-6 py-5' : 'aspect-square'}
        `}
    >
        <div className={`
            p-3.5 rounded-2xl mb-3 
            transition-transform duration-300 group-hover:scale-110 
            ${item.color} 
            ${isLarge ? 'mb-0' : ''}
        `}>
            <item.icon size={isLarge ? 28 : 24} strokeWidth={isLarge ? 1.5 : 2} />
        </div>
        <div className={`${isLarge ? 'flex flex-col items-start' : 'text-center'}`}>
            <span className={`font-semibold text-zinc-100 leading-tight ${isLarge ? 'text-base' : 'text-xs'}`}>
                {item.label}
            </span>
            {isLarge && item.description && <span className="text-xs text-zinc-400 mt-1">{item.description}</span>}
        </div>
    </div>
);

const DashboardCard = ({ icon: Icon, label, color, gradient, onClick }) => (
    <div
        onClick={onClick}
        className="group relative flex flex-col items-center justify-center rounded-2xl p-4 border border-zinc-800/50 shadow-2xl hover:border-white/10 hover:-translate-y-1.5 transition-all duration-500 active:scale-95 cursor-pointer aspect-square overflow-hidden"
        style={{
            background: gradient || 'linear-gradient(135deg, rgba(24, 24, 27, 0.95) 0%, rgba(39, 39, 42, 0.95) 100%)'
        }}
    >
        {/* Color-specific glow effect */}
        <div className={`absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity duration-500 ${color.split(' ')[0]}`}></div>
        
        {/* Subtle inner shadow match */}
        <div className="absolute inset-0 shadow-[inset_0_0_20px_rgba(0,0,0,0.4)] pointer-events-none"></div>
        
        {/* Icon with enhanced styling and brighter background */}
        <div className={`relative p-3.5 rounded-2xl mb-2 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 ${color.replace('300', '200')} backdrop-blur-md shadow-lg`}
            style={{
                backgroundColor: `${color.split(' ')[1].replace('text-', 'rgba(').replace('300', '0.4').replace('400', '0.4')}`,
                border: `1px solid ${color.split(' ')[1].replace('text-', 'rgba(').replace('300', '0.5').replace('400', '0.5')}`
            }}
        >
            <Icon size={24} strokeWidth={2.5} className="drop-shadow-md" />
        </div>
        
        {/* Label with better visibility */}
        <span className="relative font-black text-white leading-tight text-[11px] text-center drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] uppercase tracking-tight">
            {label}
        </span>
        
        {/* Stronger shine effect on hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
        </div>
    </div>
);

const SlotMachineButton = ({ onClick }) => (
    <div
        onClick={onClick}
        className="group relative overflow-hidden rounded-3xl cursor-pointer active:scale-[0.98] transition-transform duration-200"
    >
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-500 to-yellow-500 animate-gradient-x"></div>

        {/* Glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-pink-500/50 via-purple-500/50 to-yellow-500/50 blur-xl group-hover:blur-2xl transition-all duration-300"></div>

        {/* Sparkle effects */}
        <div className="absolute top-2 right-4 text-yellow-300 animate-pulse">
            <Sparkles size={20} />
        </div>
        <div className="absolute bottom-3 left-6 text-pink-300 animate-pulse delay-150">
            <Sparkles size={16} />
        </div>
        <div className="absolute top-1/2 right-8 text-purple-300 animate-pulse delay-300">
            <Sparkles size={14} />
        </div>

        {/* Content */}
        <div className="relative flex items-center justify-between px-6 py-6 bg-gradient-to-br from-pink-600/90 via-purple-600/90 to-yellow-600/90 backdrop-blur-sm">
            <div className="flex items-center gap-4">
                {/* Icon container with animation */}
                <div className="relative">
                    <div className="absolute inset-0 bg-white/30 rounded-2xl blur-md animate-pulse"></div>
                    <div className="relative p-4 bg-white/20 backdrop-blur-sm rounded-2xl border-2 border-white/40 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                        <Gamepad2 size={32} className="text-white drop-shadow-lg" strokeWidth={2.5} />
                    </div>
                </div>

                {/* Text content */}
                <div className="flex flex-col">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="font-black text-white text-xl tracking-tight drop-shadow-lg">
                            Games
                        </span>
                        <Trophy size={20} className="text-yellow-300 animate-bounce" />
                    </div>
                    <span className="text-sm text-white/90 font-semibold drop-shadow">
                        🎰 Spin to win amazing prizes!
                    </span>
                </div>
            </div>

            {/* Arrow indicator */}
            <div className="text-white/80 group-hover:translate-x-1 transition-transform duration-300">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
            </div>
        </div>

        {/* Shine effect on hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 group-hover:animate-shine"></div>
        </div>
    </div>
);

export default function Home() {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { wallet, fetchWallet, syncData, loading: storeLoading } = useUserStore();

    // Local loading state just for initial mount if we want to show a spinner
    // However, with the new store, we might want to just show the skeleton or cached data immediately.
    // Let's keep a simple effective loading state for the very first fetch if wallet is empty.
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    const [isSyncing, setIsSyncing] = useState(false);
    const [bankChangeInfo, setBankChangeInfo] = useState(null);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [invitationCode, setInvitationCode] = useState('');

    useEffect(() => {
        const init = async () => {
            await fetchWallet();
            await checkBankChangeStatus();
            await fetchInvitationCode();
            setIsInitialLoad(false);
        };
        init();
    }, [fetchWallet]);

    const fetchInvitationCode = async () => {
        try {
            const res = await userAPI.getProfile();
            if (res.data.user?.invitationCode) {
                setInvitationCode(res.data.user.invitationCode);
            }
        } catch (error) {
            console.error('Failed to fetch invitation code:', error);
        }
    };

    const checkBankChangeStatus = async () => {
        try {
            const res = await userAPI.getProfile();
            if (res.data.bankChangeInfo) {
                setBankChangeInfo(res.data.bankChangeInfo);
            }
        } catch (error) {
            console.error('Failed to check bank change status:', error);
        }
    };

    const handleSync = async () => {
        setIsSyncing(true);
        try {
            await syncData();
            toast.success(t('common.synced', 'Data synced successfully'));
        } catch (error) {
            toast.error('Sync failed');
        } finally {
            setIsSyncing(false);
        }
    };

    const handleCopyInviteLink = () => {
        const link = `${window.location.origin}/register?ref=${invitationCode}`;
        navigator.clipboard.writeText(link);
        toast.success('Invitation link copied!');
    };

    const handleShareToTelegram = () => {
        const link = `${window.location.origin}/register?ref=${invitationCode}`;
        const message = `Join me on this amazing platform! Use my invitation link: ${link}`;
        const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(message)}`;
        window.open(telegramUrl, '_blank');
    };

    const handleShareToWhatsApp = () => {
        const link = `${window.location.origin}/register?ref=${invitationCode}`;
        const message = `Join me on this amazing platform! Use my invitation link: ${link}`;
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    };

    const handleShareToFacebook = () => {
        const link = `${window.location.origin}/register?ref=${invitationCode}`;
        const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}`;
        window.open(facebookUrl, '_blank');
    };

    const menuItems = [
        { icon: Download, label: t('home.deposit'), color: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20', path: '/deposit' },
        { icon: Upload, label: t('home.withdraw'), color: 'bg-blue-500/10 text-blue-400 border border-blue-500/20', path: '/withdraw' },
        { icon: LayoutGrid, label: 'Upgrade Rank', color: 'bg-purple-500/10 text-purple-400 border border-purple-500/20', path: '/rank-upgrade' },
        { icon: Gamepad2, label: t('home.slotMachine'), color: 'bg-gradient-to-br from-pink-500 to-purple-600 text-white border-0 shadow-lg shadow-pink-500/50', path: '/spin', description: t('home.spinToWin') },
        { icon: Zap, label: t('home.wealth'), color: 'bg-violet-500/10 text-violet-400 border border-violet-500/20', path: '/wealth' },
        { icon: GraduationCap, label: t('home.courses'), color: 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20', path: '/courses' },
        { icon: Newspaper, label: t('home.news'), color: 'bg-amber-500/10 text-amber-400 border border-amber-500/20', path: '/news' },

    ];

    if (isInitialLoad && wallet.incomeWallet === 0 && wallet.personalWallet === 0 && wallet.tasksWallet === 0) return <Loading />;

    return (
        <div className="min-h-screen pb-6">
            {/* Top Bar */}
            <div className="bg-zinc-900/80 backdrop-blur-md px-5 py-4 flex justify-between items-center sticky top-0 z-30 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                    <img src={logo} alt="Novis2026" className="w-8 h-8 rounded-lg object-contain shadow-glow" />
                    <span className="font-bold text-white text-lg tracking-tight">Novis2026</span>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={handleSync}
                        disabled={isSyncing}
                        className={`
                            flex items-center gap-2 px-3 py-1.5 rounded-full 
                            bg-zinc-800 text-zinc-400 text-xs font-bold
                            hover:bg-zinc-700 hover:text-white transition-colors
                            ${isSyncing ? 'opacity-70 cursor-not-allowed' : ''}
                        `}
                    >
                        <RotateCw size={14} className={isSyncing ? 'animate-spin' : ''} />
                        <span>{isSyncing ? 'Refreshing...' : 'Refresh'}</span>
                    </button>
                    <LanguageSelector />
                    <button className="relative p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white rounded-full transition-colors" onClick={() => navigate('/settings')}>
                        <Settings size={20} />
                    </button>
                </div>
            </div>

            {/* Hero Section */}
            <div className="px-5 pt-6 pb-2">
                {/* Dashboard Section */}
                <div className="mb-6">
                    <h3 className="font-bold text-white text-sm mb-3 uppercase tracking-wide flex items-center gap-2">
                        <LayoutGrid size={16} className="text-primary-500" />
                        Dashboard
                    </h3>
                    
                    {/* Dashboard Cards - 4 per row */}
                    <div className="grid grid-cols-4 gap-2 mb-2">
                        {/* Featured Tasks Card - Extra Eye-Catching */}
                        <div
                            onClick={() => navigate('/task')}
                            className="group relative flex flex-col items-center justify-center rounded-2xl p-4 border border-cyan-500/30 shadow-2xl hover:border-cyan-400/50 hover:shadow-[0_0_40px_rgba(6,182,212,0.6)] hover:-translate-y-2 transition-all duration-500 active:scale-95 cursor-pointer aspect-square overflow-hidden animate-pulse-slow"
                            style={{
                                background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.3) 0%, rgba(8, 145, 178, 0.3) 100%)'
                            }}
                        >
                            {/* Animated ring effect */}
                            <div className="absolute inset-0 rounded-2xl border-2 border-cyan-400/50 animate-ping-slow"></div>
                            
                            {/* Strong glow effect */}
                            <div className="absolute inset-0 bg-cyan-500/30 opacity-50 group-hover:opacity-70 transition-opacity duration-300 blur-xl"></div>
                            
                            {/* Sparkle effects */}
                            <div className="absolute top-1 right-1 w-2 h-2 bg-cyan-300 rounded-full animate-pulse"></div>
                            <div className="absolute bottom-1 left-1 w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse delay-150"></div>
                            
                            {/* Icon with enhanced styling */}
                            <div className="relative p-3 rounded-xl mb-2 transition-all duration-300 group-hover:scale-150 group-hover:rotate-12 bg-cyan-500/40 text-cyan-200 border-2 border-cyan-400/70">
                                <Zap size={24} strokeWidth={3} className="drop-shadow-[0_0_12px_rgba(6,182,212,1)]" />
                            </div>
                            
                            {/* Label with glow */}
                            <span className="relative font-black text-white leading-tight text-xs text-center drop-shadow-[0_0_8px_rgba(6,182,212,0.8)] uppercase tracking-wider">
                                Tasks
                            </span>
                            
                            {/* Badge indicator */}
                            <div className="absolute top-2 right-2 w-2 h-2 bg-primary-400 rounded-full animate-bounce shadow-[0_0_10px_rgba(234,179,8,0.8)]"></div>
                            
                            {/* Shine effect on hover */}
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
                            </div>
                        </div>
                        
                        <DashboardCard
                            icon={Download}
                            label="Deposit"
                            color="bg-emerald-500/30 text-emerald-300"
                            gradient="linear-gradient(135deg, rgba(16, 185, 129, 0.25) 0%, rgba(5, 150, 105, 0.25) 100%)"
                            onClick={() => navigate('/deposit')}
                        />
                        <DashboardCard
                            icon={LayoutGrid}
                            label="Upgrade"
                            color="bg-purple-500/30 text-purple-300"
                            gradient="linear-gradient(135deg, rgba(168, 85, 247, 0.25) 0%, rgba(126, 34, 206, 0.25) 100%)"
                            onClick={() => navigate('/rank-upgrade')}
                        />
                        <DashboardCard
                            icon={UserPlus}
                            label="Invite"
                            color="bg-rose-500/30 text-rose-300"
                            gradient="linear-gradient(135deg, rgba(251, 113, 133, 0.25) 0%, rgba(244, 63, 94, 0.25) 100%)"
                            onClick={() => setShowInviteModal(true)}
                        />
                    </div>
                    
                    <div className="grid grid-cols-4 gap-2">
                        <DashboardCard
                            icon={Users}
                            label="My Team"
                            color="bg-blue-500/30 text-blue-300"
                            gradient="linear-gradient(135deg, rgba(59, 130, 246, 0.25) 0%, rgba(37, 99, 235, 0.25) 100%)"
                            onClick={() => {
                                navigate('/team');
                                setTimeout(() => {
                                    const teamSection = document.getElementById('team-section');
                                    if (teamSection) {
                                        teamSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                    }
                                }, 100);
                            }}
                        />
                        <DashboardCard
                            icon={DollarSign}
                            label="Salary"
                            color="bg-amber-500/30 text-amber-300"
                            gradient="linear-gradient(135deg, rgba(245, 158, 11, 0.25) 0%, rgba(217, 119, 6, 0.25) 100%)"
                            onClick={() => navigate('/team')}
                        />
                        <DashboardCard
                            icon={Briefcase}
                            label="Investments"
                            color="bg-violet-500/30 text-violet-300"
                            gradient="linear-gradient(135deg, rgba(139, 92, 246, 0.25) 0%, rgba(109, 40, 217, 0.25) 100%)"
                            onClick={() => navigate('/my-investments')}
                        />
                        <DashboardCard
                            icon={Gamepad2}
                            label="Game"
                            color="bg-pink-500/30 text-pink-300"
                            gradient="linear-gradient(135deg, rgba(236, 72, 153, 0.25) 0%, rgba(219, 39, 119, 0.25) 100%)"
                            onClick={() => navigate('/spin')}
                        />
                    </div>
                    
                    <div className="grid grid-cols-4 gap-2 mt-2">
                        <DashboardCard
                            icon={Upload}
                            label="Withdrawal"
                            color="bg-orange-500/30 text-orange-300"
                            gradient="linear-gradient(135deg, rgba(249, 115, 22, 0.25) 0%, rgba(234, 88, 12, 0.25) 100%)"
                            onClick={() => navigate('/withdraw')}
                        />
                        <DashboardCard
                            icon={Newspaper}
                            label="News"
                            color="bg-indigo-500/30 text-indigo-300"
                            gradient="linear-gradient(135deg, rgba(99, 102, 241, 0.25) 0%, rgba(79, 70, 229, 0.25) 100%)"
                            onClick={() => navigate('/news')}
                        />
                        <DashboardCard
                            icon={GraduationCap}
                            label="Courses"
                            color="bg-teal-500/30 text-teal-300"
                            gradient="linear-gradient(135deg, rgba(20, 184, 166, 0.25) 0%, rgba(13, 148, 136, 0.25) 100%)"
                            onClick={() => navigate('/courses')}
                        />
                    </div>
                </div>

                <div className="bg-gradient-to-br from-primary-600 via-primary-500 to-violet-400 rounded-[2rem] p-6 text-white shadow-lg shadow-primary-500/20 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 rounded-full -mr-16 -mt-16 blur-2xl pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/10 rounded-full -ml-10 -mb-10 blur-xl pointer-events-none"></div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2 opacity-80">
                            <span className="text-sm font-bold uppercase tracking-wide">{t('home.totalBalance')}</span>
                            <EyeToggle />
                        </div>
                        <h2 className="text-4xl font-black mb-8 tracking-tight text-white drop-shadow-sm">
                            {formatNumber(wallet.incomeWallet + wallet.personalWallet + wallet.tasksWallet)} <span className="text-lg font-bold opacity-80">{t('common.currency')}</span>
                        </h2>

                        <div className="grid grid-cols-3 gap-2">
                            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-3 border border-white/10 hover:bg-white/30 transition-colors">
                                <p className="text-[9px] font-bold text-white/70 mb-1 uppercase">{t('home.incomeWallet')}</p>
                                <p className="font-bold text-sm text-white">{formatNumber(wallet.incomeWallet)}</p>
                            </div>
                            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-3 border border-white/10 hover:bg-white/30 transition-colors">
                                <p className="text-[9px] font-bold text-white/70 mb-1 uppercase">{t('home.personalWallet')}</p>
                                <p className="font-bold text-sm text-white">{formatNumber(wallet.personalWallet)}</p>
                            </div>
                            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-3 border border-white/10 hover:bg-white/30 transition-colors">
                                <p className="text-[9px] font-bold text-white/70 mb-1 uppercase">Tasks Wallet</p>
                                <p className="font-bold text-sm text-white">{formatNumber(wallet.tasksWallet)}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Transaction Notifications */}
            <div className="px-5">
                <TransactionNotifications />
            </div>

            {/* News / Updates */}
            <div className="px-5 mb-8">
                <h3 className="font-bold text-white text-lg mb-4">{t('home.latestUpdates')}</h3>
                <Card className="flex items-start gap-4 p-4 bg-zinc-900 border-zinc-800" hover onClick={() => navigate('/news')}>
                    <div className="w-12 h-12 bg-primary-500/10 rounded-xl flex items-center justify-center shrink-0 text-primary-500 border border-primary-500/20">
                        <Bell size={24} />
                    </div>
                    <div>
                        <h4 className="font-bold text-white text-sm mb-1">{t('home.systemUpgradeNotice')}</h4>
                        <p className="text-xs text-zinc-400 leading-relaxed">
                            {t('home.systemUpgradeDesc')}
                        </p>
                    </div>
                </Card>
            </div>

            {/* Bank Change Confirmation Modal */}
            <BankChangeConfirmation
                bankChangeInfo={bankChangeInfo}
                onConfirmed={checkBankChangeStatus}
                onDeclined={checkBankChangeStatus}
            />

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
                        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 mb-3">
                            <p className="font-mono text-xs text-zinc-300 break-all">
                                {window.location.origin}/register?ref={invitationCode}
                            </p>
                        </div>
                        <Button
                            onClick={handleCopyInviteLink}
                            fullWidth
                            className="bg-primary-500 hover:bg-primary-600 text-black font-bold shadow-glow border-none"
                        >
                            <Copy size={16} className="mr-2" />
                            Copy Link
                        </Button>
                    </div>

                    {/* Share Options */}
                    <div>
                        <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wide mb-3">
                            Share Via
                        </label>
                        <div className="space-y-2">
                            {/* Telegram */}
                            <button
                                onClick={handleShareToTelegram}
                                className="w-full flex items-center gap-3 p-4 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-blue-500/30 rounded-xl transition-all group"
                            >
                                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18 1.897-.962 6.502-1.359 8.627-.168.9-.5 1.201-.82 1.23-.697.064-1.226-.461-1.901-.903-1.056-.692-1.653-1.123-2.678-1.799-1.185-.781-.417-1.21.258-1.911.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.139-5.062 3.345-.479.329-.913.489-1.302.481-.428-.008-1.252-.241-1.865-.44-.752-.244-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.831-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635.099-.002.321.023.465.141.121.099.155.232.171.326.016.094.036.308.02.475z"/>
                                    </svg>
                                </div>
                                <div className="flex-1 text-left">
                                    <p className="font-bold text-white text-sm">Telegram</p>
                                    <p className="text-xs text-zinc-500">Share via Telegram</p>
                                </div>
                                <Share2 size={16} className="text-zinc-600 group-hover:text-blue-500 transition-colors" />
                            </button>

                            {/* WhatsApp */}
                            <button
                                onClick={handleShareToWhatsApp}
                                className="w-full flex items-center gap-3 p-4 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-green-500/30 rounded-xl transition-all group"
                            >
                                <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-500 group-hover:scale-110 transition-transform">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                                    </svg>
                                </div>
                                <div className="flex-1 text-left">
                                    <p className="font-bold text-white text-sm">WhatsApp</p>
                                    <p className="text-xs text-zinc-500">Share via WhatsApp</p>
                                </div>
                                <Share2 size={16} className="text-zinc-600 group-hover:text-green-500 transition-colors" />
                            </button>

                            {/* Facebook */}
                            <button
                                onClick={handleShareToFacebook}
                                className="w-full flex items-center gap-3 p-4 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-blue-600/30 rounded-xl transition-all group"
                            >
                                <div className="w-10 h-10 rounded-full bg-blue-600/10 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                                    </svg>
                                </div>
                                <div className="flex-1 text-left">
                                    <p className="font-bold text-white text-sm">Facebook</p>
                                    <p className="text-xs text-zinc-500">Share via Facebook</p>
                                </div>
                                <Share2 size={16} className="text-zinc-600 group-hover:text-blue-600 transition-colors" />
                            </button>
                        </div>
                    </div>
                </div>
            </Modal>
        </div>
    );
}

// Simple Eye Toggle Component for the balance (could be moved)
function EyeToggle() {
    // Logic for toggling visibility could be added here later if requested
    // For now it's just visual
    return null;
}
