import { useState, useEffect } from 'react';
import { userAPI } from '../services/api';
import { toast } from 'react-hot-toast';
import { Wallet, Briefcase, ChevronRight, User, Settings, Users, ArrowUpRight, ArrowDownLeft, Clock, AlertTriangle, Edit2, Camera, Trash2, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Loading from '../components/Loading';
import Card from '../components/ui/Card';
import { formatNumber } from '../utils/formatNumber';
import { useAuthStore } from '../store/authStore';
import { useUserStore } from '../store/userStore';
import Modal from '../components/Modal';
import { getServerUrl } from '../config/api.config';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import logo from '../assets/logo.png';

export default function Mine() {
    const navigate = useNavigate();
    const { user: authUser } = useAuthStore();
    const { profile, wallet, fetchProfile, fetchWallet } = useUserStore();

    // Local state for UI interactions only
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [profileName, setProfileName] = useState('');
    const [updating, setUpdating] = useState(false);
    const [uploadingPhoto, setUploadingPhoto] = useState(false);

    // Initial load logic
    const [isInitialLoad, setIsInitialLoad] = useState(true);

    useEffect(() => {
        const init = async () => {
            await Promise.all([
                fetchProfile(),
                fetchWallet()
            ]);
            setIsInitialLoad(false);
        };
        init();
    }, [fetchProfile, fetchWallet]);

    useEffect(() => {
        if (profile) {
            setProfileName(profile.name || '');
        }
    }, [profile]);

    // Helper to refresh data after updates
    const refreshData = async () => {
        await Promise.all([
            fetchProfile(true), // Force refresh
            fetchWallet(true)
        ]);
    };

    const handleUpdateProfile = async () => {
        if (!profileName.trim()) {
            toast.error('Name cannot be empty');
            return;
        }

        setUpdating(true);
        try {
            await userAPI.updateProfile({ name: profileName.trim() });
            toast.success('Profile updated successfully');
            setShowProfileModal(false);
            refreshData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update profile');
        } finally {
            setUpdating(false);
        }
    };

    const handlePhotoUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast.error('Please select an image file');
            return;
        }

        // Validate file size (5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image size must be less than 5MB');
            return;
        }

        setUploadingPhoto(true);
        try {
            const formData = new FormData();
            formData.append('photo', file);

            await userAPI.uploadProfilePhoto(formData);
            toast.success('Profile photo updated successfully');
            refreshData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to upload photo');
        } finally {
            setUploadingPhoto(false);
        }
    };

    const handleDeletePhoto = async () => {
        if (!confirm('Are you sure you want to delete your profile photo?')) return;

        try {
            await userAPI.deleteProfilePhoto();
            toast.success('Profile photo deleted successfully');
            refreshData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete photo');
        }
    };

    const getProfileImageUrl = () => {
        if (!profile.profilePhoto) return null;
        // If it's a Cloudinary URL (starts with http), use it directly
        if (profile.profilePhoto.startsWith('http')) {
            return profile.profilePhoto;
        }
        // Otherwise, construct URL for legacy local files
        return `${getServerUrl()}${profile.profilePhoto}`;
    };

    // Calculate Intern restriction info
    // Use profile if available, otherwise authUser
    const currentUser = profile || authUser;

    const getInternRestrictionInfo = () => {
        if (!currentUser || currentUser.membershipLevel !== 'Intern') return null;

        const now = new Date();
        const activationDate = new Date(currentUser.membershipActivatedAt || currentUser.createdAt);
        const daysSinceActivation = Math.floor((now - activationDate) / (1000 * 60 * 60 * 24));
        const daysRemaining = Math.max(0, 4 - daysSinceActivation);
        const canEarn = daysSinceActivation < 4;

        return {
            canEarn,
            daysRemaining,
            daysSinceActivation,
            activationDate
        };
    };

    const internInfo = getInternRestrictionInfo();

    // We can use isInitialLoad to show the skeleton/spinner only on the VERY first visit 
    // or if we really have no data.
    // If we have profile data in store, we render immediately.
    const isLoading = isInitialLoad && !profile;

    if (isLoading) return <Loading />;

    // Safety check if profile failed to load
    if (!profile) {
        return (
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
                <div className="text-center">
                    <p className="text-zinc-500 mb-4">Failed to load profile data.</p>
                    <Button onClick={refreshData} size="sm">Retry</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="animate-fade-in min-h-screen pb-24">
            {/* Top User Header */}
            <div className="bg-zinc-900/80 backdrop-blur-xl sticky top-0 z-30 border-b border-zinc-800 px-5 py-4 flex justify-between items-center">
                <h1 className="text-xl font-bold text-white">My Profile</h1>
                <button onClick={() => navigate('/settings')} className="p-2 -mr-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-full transition-all">
                    <Settings size={24} />
                </button>
            </div>

            <div className="px-5 pt-6 pb-2">
                {/* User Info Card (Luminous Orange Glass) */}
                <div className="group relative p-[2.5px] rounded-[2.5rem] overflow-hidden mb-8">
                    <div className="absolute inset-[-150%] bg-[conic-gradient(from_0deg,transparent_25%,#f97316_50%,transparent_75%)] animate-spin-slow opacity-70 group-hover:opacity-100 transition-all duration-500 pointer-events-none"></div>
                    <div className="relative z-10 bg-orange-500/[0.08] backdrop-blur-3xl rounded-[calc(2.5rem-2px)] p-6 shadow-[0_0_50px_rgba(249,115,22,0.15)] border-2 border-orange-500/40 overflow-hidden group-hover:bg-orange-500/15 transition-all duration-500">
                        {/* Supercharged Orange Illumination */}
                        <div className="absolute inset-0 bg-gradient-to-br from-orange-400/40 via-orange-400/5 to-transparent pointer-events-none opacity-100"></div>
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03] pointer-events-none"></div>
                        <div className="flex items-center gap-5 relative z-10">
                            <div className="relative">
                                {profile.profilePhoto ? (
                                    <div className="p-1 rounded-2xl bg-gradient-to-br from-yellow-400 to-amber-600 shadow-lg">
                                        <img
                                            src={getProfileImageUrl()}
                                            alt="Profile"
                                            className="w-20 h-20 rounded-xl object-cover border-2 border-black/20"
                                        />
                                    </div>
                                ) : (
                                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center text-zinc-950 text-3xl font-black shadow-[0_0_20px_rgba(234,179,8,0.3)] border-2 border-white/20">
                                        {profile.name ? profile.name.charAt(0).toUpperCase() : profile.phone.slice(-1)}
                                    </div>
                                )}
                                <label
                                    htmlFor="photo-upload"
                                    className="absolute -bottom-1 -right-1 w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-yellow-400 transition-all shadow-xl border-2 border-black/50 text-zinc-950"
                                >
                                    {uploadingPhoto ? (
                                        <div className="w-4 h-4 border-2 border-zinc-950 border-t-transparent animate-spin rounded-full"></div>
                                    ) : (
                                        <Camera size={16} strokeWidth={3} />
                                    )}
                                </label>
                                <input
                                    id="photo-upload"
                                    type="file"
                                    accept="image/*"
                                    onChange={handlePhotoUpload}
                                    className="hidden"
                                    disabled={uploadingPhoto}
                                />
                            </div>
                            <div className="flex-1">
                                <h2 className="text-2xl font-black text-white tracking-tight leading-none mb-1.5 drop-shadow-sm">
                                    {profile.name || 'Set your name'}
                                </h2>
                                <p className="text-sm font-bold text-zinc-500 mb-3 tracking-wide">{profile.phone}</p>
                                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-yellow-500/10 text-yellow-500 text-[10px] font-black uppercase tracking-widest border border-yellow-500/20 shadow-inner">
                                    <User size={12} strokeWidth={3} />
                                    <span>{profile.membershipLevel} Founder</span>
                                </div>
                            </div>
                            <div className="flex flex-col gap-2">
                                <button
                                    onClick={() => setShowProfileModal(true)}
                                    className="p-2.5 bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:bg-white/10 rounded-xl transition-all shadow-xl"
                                >
                                    <Edit2 size={18} strokeWidth={2.5} />
                                </button>
                                {profile.profilePhoto && (
                                    <button
                                        onClick={handleDeletePhoto}
                                        className="p-2.5 bg-red-500/5 border border-red-500/10 text-zinc-500 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                                    >
                                        <Trash2 size={18} strokeWidth={2.5} />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Intern Restriction Info */}
                {internInfo && (
                    <Card className={`p-4 mb-6 border-2 ${internInfo.canEarn
                        ? 'bg-amber-900/20 border-amber-600/50'
                        : 'bg-red-900/20 border-red-600/50'
                        }`}>
                        <div className="flex items-start gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${internInfo.canEarn
                                ? 'bg-amber-500/20 text-amber-400'
                                : 'bg-red-500/20 text-red-400'
                                }`}>
                                {internInfo.canEarn ? <Clock size={16} /> : <AlertTriangle size={16} />}
                            </div>
                            <div className="flex-1">
                                <h3 className={`font-bold text-sm mb-1 ${internInfo.canEarn ? 'text-amber-300' : 'text-red-300'
                                    }`}>
                                    {internInfo.canEarn ? 'Intern Trial Period' : 'Trial Period Ended'}
                                </h3>
                                <p className="text-xs text-zinc-300 mb-2">
                                    {internInfo.canEarn
                                        ? `You have ${internInfo.daysRemaining} day${internInfo.daysRemaining !== 1 ? 's' : ''} remaining to earn from tasks.`
                                        : 'Your 4-day Intern trial period has ended. Task earning is no longer available.'
                                    }
                                </p>
                                <p className="text-xs text-zinc-400">
                                    {internInfo.canEarn
                                        ? 'Upgrade to Rank 1 before your trial ends to continue earning.'
                                        : 'Upgrade to Rank 1 membership to resume earning from tasks.'
                                    }
                                </p>
                                {internInfo.canEarn && (
                                    <button
                                        onClick={() => navigate('/tier-list')}
                                        className="mt-2 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-black text-xs font-bold rounded-lg transition-colors"
                                    >
                                        Upgrade Now
                                    </button>
                                )}
                                <div className="mt-3 flex items-center gap-2 text-xs text-zinc-500">
                                    <span>Trial started: {internInfo.activationDate.toLocaleDateString()}</span>
                                    <span>•</span>
                                    <span>Day {internInfo.daysSinceActivation + 1} of 4</span>
                                </div>
                            </div>
                        </div>
                    </Card>
                )}

                {/* Wallets (Electric Glass) */}
                <h3 className="text-[10px] font-black text-zinc-500 px-2 uppercase tracking-[0.2em] mb-4">Capital Allocation</h3>
                <div className="grid grid-cols-2 gap-4 mb-8">
                    <Card className="p-5 border-2 border-orange-500/30 bg-orange-500/[0.08] backdrop-blur-3xl rounded-[2rem] relative overflow-hidden group shadow-[0_10px_30px_rgba(0,0,0,0.3)]">
                        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-500/0 via-emerald-500/50 to-emerald-500/0 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="flex items-start justify-between mb-3 relative z-10">
                            <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-400 border border-emerald-500/20 shadow-inner">
                                <Wallet size={20} strokeWidth={2.5} />
                            </div>
                            <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mt-1">Liquid</span>
                        </div>
                        <p className="text-xl font-black text-white leading-none mb-1 drop-shadow-[0_0_10px_rgba(16,185,129,0.3)]">{formatNumber(wallet.incomeWallet)}</p>
                        <p className="text-[10px] text-zinc-500 font-black uppercase tracking-tighter">Income Wallet</p>
                    </Card>

                    <Card className="p-4 border border-white/10 bg-zinc-950/40 backdrop-blur-xl rounded-3xl relative overflow-hidden group shadow-2xl">
                        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-yellow-500/0 via-yellow-500/50 to-yellow-500/0 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="flex items-start justify-between mb-3 relative z-10">
                            <div className="p-2.5 bg-yellow-500/10 rounded-xl text-yellow-500 border border-yellow-500/20 shadow-inner">
                                <Briefcase size={20} strokeWidth={2.5} />
                            </div>
                            <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mt-1">Locked</span>
                        </div>
                        <p className="text-xl font-black text-white leading-none mb-1 drop-shadow-[0_0_10px_rgba(234,179,8,0.3)]">{formatNumber(wallet.personalWallet)}</p>
                        <p className="text-[10px] text-zinc-500 font-black uppercase tracking-tighter">Personal Assets</p>
                    </Card>
                </div>

                {/* Quick Actions (Electric Glass) */}
                <h3 className="text-[10px] font-black text-zinc-500 px-1 uppercase tracking-[0.2em] mb-4">Banking HUB</h3>
                <div className="space-y-3 mb-8">
                    {[
                        { icon: Clock, label: 'Transaction Ledger', sub: 'Historical records of all movements', color: 'text-yellow-500', bg: 'bg-yellow-500/10', path: '/transaction-status' },
                        { icon: ArrowDownLeft, label: 'Deposit Log', sub: 'Inbound capital verification', color: 'text-emerald-500', bg: 'bg-emerald-500/10', path: '/deposit' },
                        { icon: ArrowUpRight, label: 'Withdrawal Log', sub: 'Outbound payout status', color: 'text-violet-500', bg: 'bg-violet-500/10', path: '/withdraw' }
                    ].map((btn, i) => (
                        <div
                            key={i}
                            onClick={() => navigate(btn.path)}
                            className="group relative bg-orange-500/[0.08] backdrop-blur-2xl border-2 border-orange-500/30 rounded-[2rem] p-5 flex items-center gap-5 transition-all cursor-pointer hover:bg-orange-500/15 active:scale-[0.98] shadow-lg overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-orange-400/30 via-transparent to-transparent pointer-events-none"></div>
                            <div className={`w-14 h-14 rounded-2xl ${btn.bg} flex items-center justify-center ${btn.color} border border-white/5 transition-transform group-hover:scale-110 shadow-inner`}>
                                <btn.icon size={28} strokeWidth={2.5} />
                            </div>
                            <div className="flex-1">
                                <p className="font-black text-white text-base tracking-tight leading-none mb-1.5">{btn.label}</p>
                                <p className="text-xs font-bold text-zinc-600 uppercase tracking-tighter">{btn.sub}</p>
                            </div>
                            <ChevronRight className="text-zinc-700 group-hover:text-yellow-500 group-hover:translate-x-1 transition-all" size={24} strokeWidth={3} />
                        </div>
                    ))}
                </div>

                {/* Team Banner - Intense Luminous Orange Glass */}
                <div
                    onClick={() => navigate('/team')}
                    className="group relative overflow-hidden rounded-[2.5rem] bg-orange-500/[0.12] backdrop-blur-3xl p-7 border-2 border-orange-500/50 shadow-[0_0_60px_rgba(249,115,22,0.15)] cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                    <div className="absolute inset-[-150%] bg-[conic-gradient(from_0deg,transparent_25%,#f97316_50%,transparent_75%)] animate-spin-slow opacity-80 group-hover:opacity-100 transition-all duration-500 pointer-events-none"></div>
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-400/60 via-transparent to-transparent opacity-80 pointer-events-none"></div>
                    
                    <div className="relative z-10 flex items-center justify-between">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-yellow-500 text-zinc-950 text-[10px] font-black uppercase tracking-[0.1em] mb-4 shadow-xl border border-white/30">
                                <Users size={14} strokeWidth={3} />
                                <span>Collaborators hub</span>
                            </div>
                            <h4 className="text-2xl font-black text-white tracking-tight mb-1">Affiliate Network</h4>
                            <p className="text-zinc-500 font-bold text-sm uppercase tracking-tighter">Scale your passive revenue</p>
                        </div>
                        <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-yellow-500 group-hover:text-zinc-950 transition-all border border-white/10 backdrop-blur-md shadow-2xl">
                            <ChevronRight size={28} strokeWidth={3} />
                        </div>
                    </div>
                </div>

                {/* App Validity Information */}
                <div className="mt-8 pt-6 border-t border-zinc-800/50 text-center space-y-3">
                    <div className="space-y-1">
                        <p className="text-[10px] uppercase tracking-widest text-zinc-600 font-medium">App Validity Period</p>
                        <p className="text-xs text-primary-400 font-semibold">
                            January 15, 2026 - January 14, 2027
                        </p>
                    </div>
                </div>

            </div>

            {/* Profile Edit Modal */}
            <Modal isOpen={showProfileModal} onClose={() => setShowProfileModal(false)} title="Edit Profile">
                <div className="space-y-4">
                    <Input
                        label="Your Name"
                        placeholder="Enter your name"
                        value={profileName}
                        onChange={e => setProfileName(e.target.value)}
                        maxLength={50}
                    />
                    <p className="text-xs text-zinc-500">This name will be displayed on your profile.</p>
                    <div className="pt-2">
                        <Button
                            onClick={handleUpdateProfile}
                            fullWidth
                            className="shadow-glow"
                            disabled={updating}
                        >
                            {updating ? 'Saving...' : 'Save Profile'}
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
