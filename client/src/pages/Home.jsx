import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { membershipAPI, userAPI, messageAPI } from '../services/api';
import { toast } from 'react-hot-toast';
import { formatNumber } from '../utils/formatNumber';
import {
    HiDownload, HiUpload, HiViewGrid, HiLightningBolt,
    HiBriefcase, HiInformationCircle, HiNewspaper,
    HiQuestionMarkCircle, HiShare, HiGlobeAlt, HiCog
} from 'react-icons/hi';
import Modal from '../components/Modal';
import Loading from '../components/Loading';

const MenuItem = ({ item, navigate, isLarge = false }) => (
    <div
        onClick={item.path ? () => navigate(item.path) : item.action}
        className={`group relative flex flex-col items-center justify-center bg-white/70 backdrop-blur-md rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] transition-all duration-300 active:scale-95 cursor-pointer border border-white/40 ${isLarge ? 'flex-row gap-4 justify-start px-6 py-4' : ''}`}
    >
        <div className={`p-4 rounded-2xl mb-2 transition-transform duration-300 group-hover:scale-110 shadow-inner ${item.color} ${isLarge ? 'mb-0' : ''}`}>
            <item.icon className={`${isLarge ? 'text-3xl' : 'text-2xl'}`} />
        </div>
        <div className={`${isLarge ? 'flex flex-col items-start' : 'text-center'}`}>
            <span className={`font-bold text-gray-800 tracking-tight leading-tight ${isLarge ? 'text-base' : 'text-[11px] uppercase tracking-wide'}`}>
                {item.label}
            </span>
            {isLarge && <span className="text-xs text-gray-500">Invite and earn commission</span>}
        </div>

        {/* Subtle highlight effect */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
    </div>
);

export default function Home() {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [wallet, setWallet] = useState({ incomeWallet: 0, personalWallet: 0 });
    const [showInvitation, setShowInvitation] = useState(false);
    const [referralLink, setReferralLink] = useState('');

    // Message Popup State
    const [messageQueue, setMessageQueue] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Determine if we should show the welcome popup
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
                    // Consume the flag so it doesn't show again on reload/navigation
                    sessionStorage.removeItem('showWelcome');
                }

            } catch (error) {
                toast.error('Failed to update data');
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleCopyLink = () => {
        navigator.clipboard.writeText(referralLink);
        toast.success('Referral link copied to clipboard!');
    };

    const handleNextMessage = () => {
        // Simply move to the next message in the local queue
        if (messageQueue.length > 0) {
            setMessageQueue(prev => prev.slice(1));
        }
    };

    const menuItems = [
        { icon: HiDownload, label: 'Deposit', color: 'bg-green-100 text-green-600', path: '/deposit' },
        { icon: HiUpload, label: 'Withdraw', color: 'bg-blue-100 text-blue-600', path: '/withdraw' },
        { icon: HiViewGrid, label: 'Tier List', color: 'bg-purple-100 text-purple-600', path: '/tiers' },
        { icon: HiLightningBolt, label: 'Wealth', color: 'bg-yellow-100 text-yellow-600', path: '/wealth' },
        { icon: HiLightningBolt, label: 'Lucky Wheel', color: 'bg-pink-100 text-pink-600', action: () => toast('Lucky Wheel coming soon!') },
        { icon: HiInformationCircle, label: 'About Us', color: 'bg-indigo-100 text-indigo-600', action: () => toast.success('Foxriver: Ethiopia\'s leading digital earning platform.') },
        { icon: HiNewspaper, label: 'Company News', color: 'bg-orange-100 text-orange-600', path: '/news' },
        { icon: HiQuestionMarkCircle, label: 'Q&A', color: 'bg-teal-100 text-teal-600', path: '/qna' },
        {
            icon: HiShare,
            label: 'Invitation Link',
            color: 'bg-red-100 text-red-600',
            action: async () => {
                try {
                    const res = await userAPI.getReferralLink();
                    setReferralLink(res.data.referralLink);
                    setShowInvitation(true);
                } catch (error) {
                    toast.error('Referral link only available for V1+ users');
                }
            }
        },
    ];

    if (loading) return <Loading />;

    return (
        <div className="animate-fadeIn min-h-screen bg-[#f8fafc] bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]">
            <div className="fixed inset-0 bg-gradient-to-b from-green-50/50 to-transparent pointer-events-none" />

            {/* Top Bar */}
            <div className="bg-white/80 backdrop-blur-md px-4 py-3 flex justify-between items-center sticky top-0 z-10 shadow-sm border-b border-gray-100">
                <h1 className="text-xl font-bold text-green-600">Foxriver</h1>
                <div className="flex gap-4">
                    <button className="text-gray-600 text-2xl" onClick={() => toast('Language: English')}>
                        <HiGlobeAlt />
                    </button>
                    <button className="text-gray-600 text-2xl" onClick={() => navigate('/settings')}>
                        <HiCog />
                    </button>
                </div>
            </div>

            {/* Hero / Balance Card */}
            <div className="px-4 py-6">
                <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl p-6 text-white shadow-xl">
                    <p className="text-green-100 text-sm mb-1">Total Balance</p>
                    <h2 className="text-3xl font-bold mb-6">ETB {formatNumber(wallet.incomeWallet + wallet.personalWallet)}</h2>


                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/20 rounded-2xl p-3">
                            <p className="text-xs text-green-100">Income Balance</p>
                            <p className="font-semibold">{formatNumber(wallet.incomeWallet)} ETB</p>
                        </div>
                        <div className="bg-white/20 rounded-2xl p-3">
                            <p className="text-xs text-green-100">Personal Balance</p>
                            <p className="font-semibold">{formatNumber(wallet.personalWallet)} ETB</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Menu Grid */}
            <div className="px-4 pb-6 space-y-4">
                {/* Row 1: Deposit, Withdraw */}
                <div className="grid grid-cols-2 gap-4">
                    {menuItems.slice(0, 2).map((item, index) => (
                        <MenuItem key={index} item={item} navigate={navigate} />
                    ))}
                </div>

                {/* Row 2: Tier List, Wealth, Lucky Wheel */}
                <div className="grid grid-cols-3 gap-4">
                    {menuItems.slice(2, 5).map((item, index) => (
                        <MenuItem key={index + 2} item={item} navigate={navigate} />
                    ))}
                </div>

                {/* Row 3: About Us, Company Name, Q&A */}
                <div className="grid grid-cols-3 gap-4">
                    {menuItems.slice(5, 8).map((item, index) => (
                        <MenuItem key={index + 5} item={item} navigate={navigate} />
                    ))}
                </div>

                {/* Row 4: Invitation Link (Featured Card) */}
                <div className="grid grid-cols-1">
                    {menuItems.slice(8, 9).map((item, index) => (
                        <MenuItem key={index + 8} item={item} navigate={navigate} isLarge={true} />
                    ))}
                </div>
            </div>

            {/* Recent Activity / Ads Area (Placeholder) */}
            <div className="px-4 mb-8">
                <div className="bg-white rounded-2xl p-4 shadow-sm">
                    <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        Platform News
                    </h3>
                    <div className="space-y-3">
                        <div className="flex gap-3 items-center p-2 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer" onClick={() => navigate('/news')}>
                            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                                <HiNewspaper className="text-green-600 text-xl" />
                            </div>
                            <div className="flex-1">
                                <p className="text-xs font-semibold text-gray-800">New V-tier levels released!</p>
                                <p className="text-[10px] text-gray-500">Upgrade today for higher daily income.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Invitation Modal */}
            <Modal
                isOpen={showInvitation}
                onClose={() => setShowInvitation(false)}
                title="Invite Friends"
            >
                <div className="text-center">
                    <p className="text-gray-600 mb-4">Share your referral link to earn A/B/C level commissions!</p>
                    <div className="bg-gray-50 p-4 rounded-xl break-all mb-6 text-sm font-mono text-green-700">
                        {referralLink}
                    </div>
                    <button onClick={handleCopyLink} className="btn-primary w-full">
                        Copy Link
                    </button>
                </div>
            </Modal>

            {/* Message/Announcement Popup */}
            {messageQueue.length > 0 && (
                <Modal
                    isOpen={true}
                    onClose={handleNextMessage}
                    title={messageQueue[0].title}
                >
                    <div className="space-y-4">
                        <div className="py-4 bg-gray-50 rounded-xl p-4 max-h-60 overflow-y-auto">
                            <p className="text-gray-800 whitespace-pre-wrap">{messageQueue[0].content}</p>
                        </div>

                        <div className="pt-2">
                            <button
                                onClick={handleNextMessage}
                                className="btn-primary w-full py-3 rounded-xl font-bold text-sm"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
}
