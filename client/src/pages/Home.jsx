import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { membershipAPI, userAPI } from '../services/api';
import {
    HiDownload, HiUpload, HiViewGrid, HiLightningBolt,
    HiBriefcase, HiInformationCircle, HiNewspaper,
    HiQuestionMarkCircle, HiShare, HiGlobeAlt, HiCog
} from 'react-icons/hi';
import Modal from '../components/Modal';
import Loading from '../components/Loading';

export default function Home() {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [wallet, setWallet] = useState({ incomeWallet: 0, personalWallet: 0 });
    const [showInvitation, setShowInvitation] = useState(false);
    const [referralLink, setReferralLink] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const walletRes = await userAPI.getWallet();
                setWallet(walletRes.data);
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
        alert('Referral link copied to clipboard!');
    };

    const menuItems = [
        { icon: HiDownload, label: 'Deposit', color: 'bg-green-100 text-green-600', path: '/deposit' },
        { icon: HiUpload, label: 'Withdraw', color: 'bg-blue-100 text-blue-600', path: '/withdraw' },
        { icon: HiViewGrid, label: 'Tier List', color: 'bg-purple-100 text-purple-600', action: () => alert('Tier List feature coming soon!') },
        { icon: HiLightningBolt, label: 'Wealth Fund', color: 'bg-yellow-100 text-yellow-600', path: '/wealth' },
        { icon: HiLightningBolt, label: 'Lucky Wheel', color: 'bg-pink-100 text-pink-600', action: () => alert('Lucky Wheel coming soon!') },
        { icon: HiInformationCircle, label: 'About Us', color: 'bg-indigo-100 text-indigo-600', action: () => alert('Foxriver: Ethiopia\'s leading digital earning platform.') },
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
                    alert('Referral link only available for V1+ users');
                }
            }
        },
    ];

    if (loading) return <Loading />;

    return (
        <div className="animate-fadeIn">
            {/* Top Bar */}
            <div className="bg-white px-4 py-3 flex justify-between items-center sticky top-0 z-10 shadow-sm">
                <h1 className="text-xl font-bold text-green-600">Foxriver</h1>
                <div className="flex gap-4">
                    <button className="text-gray-600 text-2xl" onClick={() => alert('Language: English')}>
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
                    <h2 className="text-3xl font-bold mb-6">ETB {wallet.incomeWallet + wallet.personalWallet}</h2>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/20 rounded-2xl p-3">
                            <p className="text-xs text-green-100">Income Wallet</p>
                            <p className="font-semibold">{wallet.incomeWallet} ETB</p>
                        </div>
                        <div className="bg-white/20 rounded-2xl p-3">
                            <p className="text-xs text-green-100">Personal Wallet</p>
                            <p className="font-semibold">{wallet.personalWallet} ETB</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Menu Grid */}
            <div className="px-4 pb-6">
                <div className="grid grid-cols-3 gap-4">
                    {menuItems.map((item, index) => (
                        <div
                            key={index}
                            onClick={item.path ? () => navigate(item.path) : item.action}
                            className="flex flex-col items-center justify-center bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-all active:scale-95 cursor-pointer"
                        >
                            <div className={`p-3 rounded-xl mb-2 ${item.color}`}>
                                <item.icon className="text-2xl" />
                            </div>
                            <span className="text-[10px] font-bold text-gray-700 text-center uppercase tracking-wider">
                                {item.label}
                            </span>
                        </div>
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
        </div>
    );
}
