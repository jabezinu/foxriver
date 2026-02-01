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
                {/* User Info Card */}
                <div className="bg-zinc-900 rounded-2xl p-5 shadow-lg mb-6 border border-zinc-800">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            {profile.profilePhoto ? (
                                <img
                                    src={getProfileImageUrl()}
                                    alt="Profile"
                                    className="w-20 h-20 rounded-2xl object-cover shadow-glow"
                                />
                            ) : (
                                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-violet-600 flex items-center justify-center text-white text-3xl font-black shadow-glow">
                                    {profile.name ? profile.name.charAt(0).toUpperCase() : profile.phone.slice(-1)}
                                </div>
                            )}
                            <label
                                htmlFor="photo-upload"
                                className="absolute -bottom-1 -right-1 w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-primary-600 transition-colors shadow-lg border-2 border-zinc-900"
                            >
                                {uploadingPhoto ? (
                                    <img 
                                        src={logo} 
                                        alt="Uploading" 
                                        className="w-4 h-4 object-contain animate-pulse"
                                    />
                                ) : (
                                    <Camera size={16} className="text-white" />
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
                            <h2 className="text-2xl font-bold text-white mb-1">
                                {profile.name || 'Set your name'}
                            </h2>
                            <p className="text-sm text-zinc-400 mb-2">{profile.phone}</p>
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-800 text-primary-500 text-xs font-bold uppercase tracking-wider border border-zinc-700">
                                <User size={12} fill="currentColor" />
                                <span>{profile.membershipLevel} Member</span>
                            </div>
                        </div>
                        <div className="flex flex-col gap-2">
                            <button
                                onClick={() => setShowProfileModal(true)}
                                className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-full transition-all"
                            >
                                <Edit2 size={20} />
                            </button>
                            {profile.profilePhoto && (
                                <button
                                    onClick={handleDeletePhoto}
                                    className="p-2 text-zinc-400 hover:text-red-500 hover:bg-zinc-800 rounded-full transition-all"
                                >
                                    <Trash2 size={20} />
                                </button>
                            )}
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

                {/* Wallets */}
                <h3 className="text-sm font-bold text-zinc-400 mb-4 px-1 uppercase tracking-wider">My Assets</h3>
                <div className="grid grid-cols-3 gap-3 mb-6">
                    <Card className="p-3 border-zinc-800 hover:border-primary-500/30 transition-shadow bg-zinc-900">
                        <div className="flex items-start justify-between mb-2">
                            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500 border border-emerald-500/20">
                                <Wallet size={18} />
                            </div>
                            <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Available</span>
                        </div>
                        <p className="text-lg font-bold text-emerald-400">{formatNumber(wallet.incomeWallet)}</p>
                        <p className="text-xs text-zinc-500 font-medium">Income</p>
                    </Card>

                    <Card className="p-3 border-zinc-800 hover:border-blue-500/30 transition-shadow bg-zinc-900">
                        <div className="flex items-start justify-between mb-2">
                            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500 border border-blue-500/20">
                                <Briefcase size={18} />
                            </div>
                            <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Fixed</span>
                        </div>
                        <p className="text-lg font-bold text-blue-400">{formatNumber(wallet.personalWallet)}</p>
                        <p className="text-xs text-zinc-500 font-medium">Personal</p>
                    </Card>

                    <Card className="p-3 border-zinc-800 hover:border-purple-500/30 transition-shadow bg-zinc-900">
                        <div className="flex items-start justify-between mb-2">
                            <div className="p-2 bg-purple-500/10 rounded-lg text-purple-500 border border-purple-500/20">
                                <TrendingUp size={18} />
                            </div>
                            <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Tasks</span>
                        </div>
                        <p className="text-lg font-bold text-purple-400">{formatNumber(wallet.tasksWallet)}</p>
                        <p className="text-xs text-zinc-500 font-medium">Tasks</p>
                    </Card>
                </div>

                {/* Quick Actions */}
                <h3 className="text-sm font-bold text-zinc-400 mb-4 px-1 uppercase tracking-wider">Financial Management</h3>
                <div className="space-y-3 mb-8">
                    <div
                        onClick={() => navigate('/transaction-status')}
                        className="group bg-zinc-900 rounded-2xl p-4 flex items-center gap-4 border border-zinc-800 shadow-sm hover:border-primary-500/30 transition-all cursor-pointer active:scale-[0.98]"
                    >
                        <div className="w-12 h-12 rounded-xl bg-primary-500/10 flex items-center justify-center text-primary-500 group-hover:scale-110 transition-transform border border-primary-500/20">
                            <Clock size={24} />
                        </div>
                        <div className="flex-1">
                            <p className="font-bold text-white text-sm">Transaction Status</p>
                            <p className="text-xs text-zinc-500">Track all deposits & withdrawals</p>
                        </div>
                        <ChevronRight className="text-zinc-600" size={20} />
                    </div>

                    <div
                        onClick={() => navigate('/deposit')}
                        className="group bg-zinc-900 rounded-2xl p-4 flex items-center gap-4 border border-zinc-800 shadow-sm hover:border-primary-500/30 transition-all cursor-pointer active:scale-[0.98]"
                    >
                        <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center text-green-500 group-hover:scale-110 transition-transform border border-green-500/20">
                            <ArrowDownLeft size={24} />
                        </div>
                        <div className="flex-1">
                            <p className="font-bold text-white text-sm">Deposit History</p>
                            <p className="text-xs text-zinc-500">View all your top-up records</p>
                        </div>
                        <ChevronRight className="text-zinc-600" size={20} />
                    </div>

                    <div
                        onClick={() => navigate('/withdraw')}
                        className="group bg-zinc-900 rounded-2xl p-4 flex items-center gap-4 border border-zinc-800 shadow-sm hover:border-primary-500/30 transition-all cursor-pointer active:scale-[0.98]"
                    >
                        <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-500 group-hover:scale-110 transition-transform border border-violet-500/20">
                            <ArrowUpRight size={24} />
                        </div>
                        <div className="flex-1">
                            <p className="font-bold text-white text-sm">Withdrawal History</p>
                            <p className="text-xs text-zinc-500">Track payout status</p>
                        </div>
                        <ChevronRight className="text-zinc-600" size={20} />
                    </div>
                </div>

                {/* Team Banner */}
                <div
                    onClick={() => navigate('/team')}
                    className="relative overflow-hidden rounded-3xl bg-zinc-900 p-6 text-white shadow-xl cursor-pointer group border border-zinc-800"
                >
                    <div className="relative z-10 flex items-center justify-between">
                        <div>
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-xs font-bold uppercase tracking-wider mb-2 text-primary-400">
                                <Users size={12} />
                                <span>Team Center</span>
                            </div>
                            <h4 className="text-2xl font-bold mb-1">My Referral Team</h4>
                            <p className="text-zinc-400 text-sm">Check commissions & members</p>
                        </div>
                        <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors border border-white/10">
                            <ChevronRight size={24} />
                        </div>
                    </div>

                    {/* Decorative Elements */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary-600 rounded-full blur-3xl opacity-10 -mr-10 -mt-10" />
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-600 rounded-full blur-2xl opacity-10 -ml-10 -mb-10" />
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
