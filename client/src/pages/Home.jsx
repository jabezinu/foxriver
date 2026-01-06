import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useAppStore } from '../store/appStore';
import { userAPI, messageAPI } from '../services/api';
import { toast } from 'react-hot-toast';
import { formatNumber } from '../utils/formatNumber';
import {
    Download, Upload, LayoutGrid, Zap,
    Briefcase, Info, Newspaper,
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
            bg-white rounded-2xl p-4 
            border border-gray-100 shadow-sm
            hover:shadow-md hover:-translate-y-0.5
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
            <span className={`font-semibold text-gray-800 leading-tight ${isLarge ? 'text-base' : 'text-xs'}`}>
                {item.label}
            </span>
            {isLarge && <span className="text-xs text-gray-500 mt-1">Invite friends and earn commission together</span>}
        </div>
    </div>
);

export default function Home() {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const { unreadMessages } = useAppStore(); // Assuming you updated useAppStore to expose this, or we can fetch locally if not
    const [loading, setLoading] = useState(true);
    const [wallet, setWallet] = useState({ incomeWallet: 0, personalWallet: 0 });
    const [showInvitation, setShowInvitation] = useState(false);
    const [referralLink, setReferralLink] = useState('');

    // Message Popup State
    const [messageQueue, setMessageQueue] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const shouldShowWelcome = sessionStorage.getItem('showWelcome');
                const promises = [userAPI.getWallet()];
                if (shouldShowWelcome === 'true') {
                    promises.push(messageAPI.getUserMessages());
                }

                const results = await Promise.all(promises);
                const walletRes = results[0];

                setWallet(walletRes.data.wallet);

                if (shouldShowWelcome === 'true' && results[1]) {
                    const messagesRes = results[1];
                    setMessageQueue(messagesRes.data.messages);
                    sessionStorage.removeItem('showWelcome');
                }

            } catch (error) {
                // Silent fail or low-key toast
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

    const handleNextMessage = () => {
        if (messageQueue.length > 0) {
            setMessageQueue(prev => prev.slice(1));
        }
    };

    const menuItems = [
        { icon: Download, label: 'Deposit', color: 'bg-emerald-100 text-emerald-600', path: '/deposit' },
        { icon: Upload, label: 'Withdraw', color: 'bg-blue-100 text-blue-600', path: '/withdraw' },
        { icon: LayoutGrid, label: 'Tiers', color: 'bg-purple-100 text-purple-600', path: '/tiers' },
        { icon: Zap, label: 'Wealth', color: 'bg-amber-100 text-amber-600', path: '/wealth' },
        { icon: Globe, label: 'Spin', color: 'bg-pink-100 text-pink-600', action: () => toast('Lucky Wheel coming soon!') },
        { icon: Info, label: 'About', color: 'bg-indigo-100 text-indigo-600', action: () => toast.success('Foxriver: Digital Earning Platform') },
        { icon: Newspaper, label: 'News', color: 'bg-orange-100 text-orange-600', path: '/news' },
        { icon: HelpCircle, label: 'Q&A', color: 'bg-teal-100 text-teal-600', path: '/qna' },
        {
            icon: Share2,
            label: 'Invite Friends',
            color: 'bg-rose-100 text-rose-600',
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
        <div className="min-h-screen bg-gray-50 pb-6">
            {/* Top Bar */}
            <div className="bg-white/80 backdrop-blur-md px-5 py-4 flex justify-between items-center sticky top-0 z-30 border-b border-gray-100">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-black text-sm">F</div>
                    <span className="font-bold text-gray-900 text-lg">Foxriver</span>
                </div>
                <div className="flex gap-3">
                    <button className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors" onClick={() => toast('Language: English')}>
                        <Globe size={20} />
                    </button>
                    <button className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors" onClick={() => navigate('/settings')}>
                        <Settings size={20} />
                    </button>
                </div>
            </div>

            {/* Hero Section */}
            <div className="px-5 pt-6 pb-2">
                <div className="bg-gradient-to-br from-[#10b981] to-[#059669] rounded-[2rem] p-6 text-white shadow-xl shadow-emerald-500/20 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl pointer-events-none"></div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2 opacity-90">
                            <span className="text-sm font-medium">Total Balance</span>
                            <EyeToggle />
                        </div>
                        <h2 className="text-4xl font-bold mb-8 tracking-tight">
                            {formatNumber(wallet.incomeWallet + wallet.personalWallet)} <span className="text-lg font-medium opacity-80">ETB</span>
                        </h2>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-black/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                                <p className="text-xs text-emerald-100 mb-1">Income Wallet</p>
                                <p className="font-bold text-lg">{formatNumber(wallet.incomeWallet)}</p>
                            </div>
                            <div className="bg-black/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                                <p className="text-xs text-emerald-100 mb-1">Asset Wallet</p>
                                <p className="font-bold text-lg">{formatNumber(wallet.personalWallet)}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Menu Grid */}
            <div className="px-5 py-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-gray-900 text-lg">Quick Actions</h3>
                </div>

                <div className="grid grid-cols-4 gap-3 mb-4">
                    {menuItems.slice(0, 8).map((item, index) => (
                        <MenuItem key={index} item={item} navigate={navigate} />
                    ))}
                </div>

                {/* Featured Large Card */}
                <div className="grid grid-cols-1">
                    {menuItems.slice(8, 9).map((item, index) => (
                        <MenuItem key={index + 8} item={item} navigate={navigate} isLarge={true} />
                    ))}
                </div>
            </div>

            {/* News / Updates */}
            <div className="px-5 mb-8">
                <h3 className="font-bold text-gray-900 text-lg mb-4">Latest Updates</h3>
                <Card className="flex items-start gap-4 p-4" hover onClick={() => navigate('/news')}>
                    <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center shrink-0 text-primary-600">
                        <Bell size={24} />
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-900 text-sm mb-1">System Upgrade Notice</h4>
                        <p className="text-xs text-gray-500 leading-relaxed">
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
                    <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4 text-rose-600">
                        <Share2 size={32} />
                    </div>
                    <p className="text-gray-600 mb-6 text-sm">
                        Share your unique link. Earn commisions when your friends join and deposit!
                    </p>
                    <div className="bg-gray-50 p-4 rounded-xl break-all mb-6 text-xs font-mono text-gray-700 border border-gray-100">
                        {referralLink}
                    </div>
                    <Button onClick={handleCopyLink} fullWidth>
                        Copy Link
                    </Button>
                </div>
            </Modal>

            {messageQueue.length > 0 && (
                <Modal
                    isOpen={true}
                    onClose={handleNextMessage}
                    title={messageQueue[0].title}
                >
                    <div className="space-y-6">
                        <div className="bg-gray-50 rounded-2xl p-4 max-h-60 overflow-y-auto border border-gray-100">
                            <p className="text-gray-700 text-sm whitespace-pre-wrap leading-relaxed">{messageQueue[0].content}</p>
                        </div>
                        <Button onClick={handleNextMessage} fullWidth>
                            Got it
                        </Button>
                    </div>
                </Modal>
            )}
        </div>
    );
}

// Simple Eye Toggle Component for the balance (could be moved)
function EyeToggle() {
    // Logic for toggling visibility could be added here later if requested
    // For now it's just visual
    return null;
}
