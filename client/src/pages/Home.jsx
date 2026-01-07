import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userAPI } from '../services/api';
import { toast } from 'react-hot-toast';
import { formatNumber } from '../utils/formatNumber';
import {
    Download, Upload, LayoutGrid, Zap,
    Briefcase,
    HelpCircle, Share2, Globe, Settings, Bell
} from 'lucide-react';
import Modal from '../components/Modal';
import Loading from '../components/Loading';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

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
            {isLarge && <span className="text-xs text-zinc-400 mt-1">Invite friends and earn commission together</span>}
        </div>
    </div>
);

export default function Home() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [wallet, setWallet] = useState({ incomeWallet: 0, personalWallet: 0 });
    const [showInvitation, setShowInvitation] = useState(false);
    const [referralLink, setReferralLink] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const walletRes = await userAPI.getWallet();
                setWallet(walletRes.data.wallet);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleCopyLink = () => {
        navigator.clipboard.writeText(referralLink);
        toast.success('Link copied to clipboard');
    };

    const menuItems = [
        { icon: Download, label: 'Deposit', color: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20', path: '/deposit' },
        { icon: Upload, label: 'Withdraw', color: 'bg-blue-500/10 text-blue-400 border border-blue-500/20', path: '/withdraw' },
        { icon: LayoutGrid, label: 'Tiers', color: 'bg-purple-500/10 text-purple-400 border border-purple-500/20', path: '/tiers' },
        { icon: Zap, label: 'Wealth', color: 'bg-violet-500/10 text-violet-400 border border-violet-500/20', path: '/wealth' },
        { icon: Globe, label: 'Spin', color: 'bg-pink-500/10 text-pink-400 border border-pink-500/20', action: () => toast('Lucky Wheel coming soon!') },
        { icon: HelpCircle, label: 'Q&A', color: 'bg-teal-500/10 text-teal-400 border border-teal-500/20', path: '/qna' },
        {
            icon: Share2,
            label: 'Invite Friends',
            color: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
            action: async () => {
                try {
                    const res = await userAPI.getReferralLink();
                    setReferralLink(res.data.referralLink);
                    setShowInvitation(true);
                } catch (error) {
                    toast.error('Failed to get link');
                }
            }
        },
    ];

    if (loading) return <Loading />;

    return (
        <div className="min-h-screen pb-6">
            {/* Top Bar */}
            <div className="bg-zinc-900/80 backdrop-blur-md px-5 py-4 flex justify-between items-center sticky top-0 z-30 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-black text-sm shadow-glow">F</div>
                    <span className="font-bold text-white text-lg tracking-tight">Foxriver</span>
                </div>
                <div className="flex gap-3">
                    <button className="relative p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white rounded-full transition-colors" onClick={() => toast('Language: English')}>
                        <Globe size={20} />
                    </button>
                    <button className="relative p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white rounded-full transition-colors" onClick={() => navigate('/settings')}>
                        <Settings size={20} />
                    </button>
                </div>
            </div>

            {/* Hero Section */}
            <div className="px-5 pt-6 pb-2">
                <div className="bg-gradient-to-br from-primary-600 via-primary-500 to-violet-400 rounded-[2rem] p-6 text-white shadow-lg shadow-primary-500/20 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 rounded-full -mr-16 -mt-16 blur-2xl pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/10 rounded-full -ml-10 -mb-10 blur-xl pointer-events-none"></div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2 opacity-80">
                            <span className="text-sm font-bold uppercase tracking-wide">Total Balance</span>
                            <EyeToggle />
                        </div>
                        <h2 className="text-4xl font-black mb-8 tracking-tight text-white drop-shadow-sm">
                            {formatNumber(wallet.incomeWallet + wallet.personalWallet)} <span className="text-lg font-bold opacity-80">ETB</span>
                        </h2>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 border border-white/10 hover:bg-white/30 transition-colors">
                                <p className="text-[10px] font-bold text-white/70 mb-1 uppercase">Income Wallet</p>
                                <p className="font-bold text-lg text-white">{formatNumber(wallet.incomeWallet)}</p>
                            </div>
                            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 border border-white/10 hover:bg-white/30 transition-colors">
                                <p className="text-[10px] font-bold text-white/70 mb-1 uppercase">Asset Wallet</p>
                                <p className="font-bold text-lg text-white">{formatNumber(wallet.personalWallet)}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Menu Grid */}
            <div className="px-5 py-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-white text-lg">Quick Actions</h3>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-4">
                    {menuItems.slice(0, 6).map((item, index) => (
                        <MenuItem key={index} item={item} navigate={navigate} />
                    ))}
                </div>

                {/* Featured Large Card */}
                <div className="grid grid-cols-1">
                    {menuItems.slice(6, 7).map((item, index) => (
                        <MenuItem key={index + 6} item={item} navigate={navigate} isLarge={true} />
                    ))}
                </div>
            </div>

            {/* News / Updates */}
            <div className="px-5 mb-8">
                <h3 className="font-bold text-white text-lg mb-4">Latest Updates</h3>
                <Card className="flex items-start gap-4 p-4 bg-zinc-900 border-zinc-800" hover onClick={() => navigate('/news')}>
                    <div className="w-12 h-12 bg-primary-500/10 rounded-xl flex items-center justify-center shrink-0 text-primary-500 border border-primary-500/20">
                        <Bell size={24} />
                    </div>
                    <div>
                        <h4 className="font-bold text-white text-sm mb-1">System Upgrade Notice</h4>
                        <p className="text-xs text-zinc-400 leading-relaxed">
                            We have upgraded the tier system. Check out the new VIP levels for higher returns!
                        </p>
                    </div>
                </Card>
            </div>

            {/* Modals */}
            <Modal
                isOpen={showInvitation}
                onClose={() => setShowInvitation(false)}
                title="Invite Friends"
            >
                <div className="text-center pt-2">
                    <div className="w-16 h-16 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-4 text-rose-500 border border-rose-500/20">
                        <Share2 size={32} />
                    </div>
                    <p className="text-zinc-400 mb-6 text-sm">
                        Share your unique link. Earn commisions when your friends join and deposit!
                    </p>
                    <div className="bg-white/30 p-4 rounded-xl break-all mb-6 text-xs font-mono text-primary-500 border border-zinc-800 selection:bg-primary-500 selection:text-white">
                        {referralLink}
                    </div>
                    <Button onClick={handleCopyLink} fullWidth>
                        Copy Link
                    </Button>
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
