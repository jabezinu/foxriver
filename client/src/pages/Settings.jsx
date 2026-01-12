import { useState, useEffect } from 'react';
import { userAPI } from '../services/api';
import { toast } from 'react-hot-toast';
import { ArrowLeft, Landmark, Lock, ShieldCheck, LogOut, User, Fingerprint, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import Loading from '../components/Loading';
import Modal from '../components/Modal';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { getServerUrl } from '../config/api.config';

export default function Settings() {
    const navigate = useNavigate();
    const { logout, user, updateUser } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState(null);

    const [modalType, setModalType] = useState(null); // bank, transPass, loginPass
    const [formData, setFormData] = useState({
        bankName: '',
        accountNumber: '',
        accountName: '',
        bankPhone: '',
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
        transactionPassword: ''
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await userAPI.getProfile();
            setProfile(res.data.user);
            setFormData(prev => ({
                ...prev,
                bankName: res.data.user.bankAccount?.bankName || '',
                accountNumber: res.data.user.bankAccount?.accountNumber || '',
                accountName: res.data.user.bankAccount?.accountName || '',
                bankPhone: res.data.user.bankAccount?.phone || ''
            }));
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateBank = async () => {
        try {
            const res = await userAPI.setBankAccount({
                bank: formData.bankName,
                accountNumber: formData.accountNumber,
                accountName: formData.accountName,
                phone: formData.bankPhone
            });
            toast.success(res.data.message || 'Bank account updated!');
            setModalType(null);
            fetchProfile();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Update failed.');
        }
    };

    const handleChangeLoginPass = async () => {
        if (formData.newPassword !== formData.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }
        try {
            await userAPI.changeLoginPassword({
                currentPassword: formData.oldPassword,
                newPassword: formData.newPassword
            });
            toast.success('Login password updated!');
            setModalType(null);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update password');
        }
    };

    const handleSetTransactionPass = async () => {
        if (formData.transactionPassword.length !== 6) {
            toast.error('Transaction password must be exactly 6 digits');
            return;
        }

        if (profile.hasTransactionPassword && formData.oldPassword === formData.transactionPassword) {
            toast.error("You didn't change the password");
            return;
        }

        try {
            await userAPI.setTransactionPassword({
                currentPassword: formData.oldPassword,
                newPassword: formData.transactionPassword
            });
            toast.success('Transaction password updated!');
            setModalType(null);
            fetchProfile(); // Refresh profile to get updated hasTransactionPassword
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update transaction password');
        }
    };

    if (loading) return <Loading />;

    const settingsItems = [
        {
            label: 'App Rules & Guide',
            icon: BookOpen,
            desc: 'Learn how the platform works',
            action: () => navigate('/app-rules'),
            color: 'text-primary-500 bg-primary-500/10 border-primary-500/20'
        },
        {
            label: 'Bank Account',
            icon: Landmark,
            desc: profile.bankAccount?.isSet ? `${profile.bankAccount.bankName} (...${profile.bankAccount.accountNumber.slice(-4)})` : 'Not linked',
            action: () => {
                setModalType('bank');
            },
            color: 'text-blue-500 bg-blue-500/10 border-blue-500/20'
        },
        {
            label: 'Transaction Password',
            icon: ShieldCheck,
            desc: 'Verify withdrawals securely',
            action: () => setModalType('transPass'),
            color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20'
        },
        {
            label: 'Login Password',
            icon: Lock,
            desc: 'Secure your account access',
            action: () => setModalType('loginPass'),
            color: 'text-primary-500 bg-primary-500/10 border-primary-500/20'
        }
    ];

    return (
        <div className="animate-fade-in min-h-screen bg-zinc-950 pb-8">
            {/* Header */}
            <div className="bg-zinc-900/80 backdrop-blur-md px-4 py-3 flex items-center gap-4 sticky top-0 z-30 border-b border-zinc-800">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 -ml-2 rounded-full text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
                >
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-xl font-bold text-white">Settings</h1>
            </div>

            <div className="max-w-md mx-auto px-4 py-6">
                {/* User Card */}
                <div className="bg-zinc-900 rounded-2xl p-5 shadow-lg mb-8 flex items-center gap-4 border border-zinc-800">
                    {profile.profilePhoto ? (
                        <img
                            src={profile.profilePhoto.startsWith('http') ? profile.profilePhoto : `${getServerUrl()}${profile.profilePhoto}`}
                            alt="Profile"
                            className="w-14 h-14 rounded-full object-cover border-2 border-zinc-700"
                        />
                    ) : (
                        <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-violet-600 rounded-full flex items-center justify-center text-white text-xl font-black border-2 border-zinc-700">
                            {profile.name ? profile.name.charAt(0).toUpperCase() : <User size={28} />}
                        </div>
                    )}
                    <div>
                        <p className="font-bold text-white text-lg">{profile.name || 'User'}</p>
                        <p className="text-sm text-zinc-400">{profile.phone}</p>
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-primary-500/10 text-primary-500 text-xs font-bold uppercase tracking-wide border border-primary-500/20 mt-1">
                            <span>Level {profile.membershipLevel}</span>
                        </div>
                    </div>
                </div>

                <div className="space-y-3 mb-10">
                    {settingsItems.map((item, idx) => (
                        <div
                            key={idx}
                            onClick={item.action}
                            className="bg-zinc-900 rounded-2xl p-4 flex items-center gap-4 cursor-pointer border border-zinc-800 shadow-sm hover:border-zinc-700 hover:bg-zinc-800 transition-all active:scale-[0.98]"
                        >
                            <div className={`p-3 rounded-xl border ${item.color}`}>
                                <item.icon size={22} />
                            </div>
                            <div className="flex-1">
                                <p className="font-bold text-zinc-200 text-sm">{item.label}</p>
                                <p className="text-xs text-zinc-500 font-medium">{item.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <Button
                    onClick={logout}
                    variant="danger"
                    size="lg"
                    className="w-full flex items-center justify-center gap-2"
                >
                    <LogOut size={20} />
                    Log Out
                </Button>
            </div>

            {/* Bank Modal */}
            <Modal isOpen={modalType === 'bank'} onClose={() => setModalType(null)} title="Bank Details">
                <div className="space-y-4">
                    {profile.bankChangeStatus === 'pending' && (
                        <div className="bg-violet-500/10 p-4 rounded-xl border border-violet-500/20 mb-2">
                            <p className="text-violet-500 font-bold text-xs uppercase tracking-wide mb-1">
                                Change Pending
                            </p>
                            <p className="text-violet-200/80 text-xs leading-relaxed">
                                Requested: {new Date(profile.bankChangeRequestDate).toLocaleDateString()}<br />
                                Effective: {new Date(new Date(profile.bankChangeRequestDate).getTime() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                            </p>
                        </div>
                    )}

                    {profile.bankAccount?.isSet && profile.bankChangeStatus !== 'pending' && (
                        <p className="text-xs text-blue-400 bg-blue-500/10 p-3 rounded-xl font-medium mb-2 border border-blue-500/20">
                            Changes to bank details will take 3 days to verify.
                        </p>
                    )}

                    <Input
                        label="Bank Name"
                        placeholder="e.g. CBE, Dashen"
                        value={formData.bankName}
                        onChange={e => setFormData({ ...formData, bankName: e.target.value })}
                        disabled={profile.bankChangeStatus === 'pending'}
                    />
                    <Input
                        label="Account Number"
                        placeholder="1000..."
                        value={formData.accountNumber}
                        onChange={e => setFormData({ ...formData, accountNumber: e.target.value })}
                        disabled={profile.bankChangeStatus === 'pending'}
                    />
                    <Input
                        label="Account Holder Name"
                        placeholder="Full Name"
                        value={formData.accountName}
                        onChange={e => setFormData({ ...formData, accountName: e.target.value })}
                        disabled={profile.bankChangeStatus === 'pending'}
                    />
                    <Input
                        label="Phone Number"
                        placeholder="09..."
                        value={formData.bankPhone}
                        onChange={e => setFormData({ ...formData, bankPhone: e.target.value })}
                        disabled={profile.bankChangeStatus === 'pending'}
                    />

                    {profile.bankChangeStatus !== 'pending' && (
                        <div className="pt-2">
                            <Button onClick={handleUpdateBank} fullWidth className="shadow-glow">
                                {profile.bankAccount?.isSet ? 'Request Change' : 'Save Account'}
                            </Button>
                        </div>
                    )}
                </div>
            </Modal>

            {/* Login Password Modal */}
            <Modal isOpen={modalType === 'loginPass'} onClose={() => setModalType(null)} title="Change Password">
                <div className="space-y-4">
                    <Input
                        label="Old Password"
                        type="password"
                        value={formData.oldPassword}
                        onChange={e => setFormData({ ...formData, oldPassword: e.target.value })}
                    />
                    <Input
                        label="New Password"
                        type="password"
                        value={formData.newPassword}
                        onChange={e => setFormData({ ...formData, newPassword: e.target.value })}
                    />
                    <Input
                        label="Confirm New Password"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                    />
                    <div className="pt-2">
                        <Button onClick={handleChangeLoginPass} fullWidth className="shadow-glow">
                            Update Password
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Transaction Password Modal */}
            <Modal isOpen={modalType === 'transPass'} onClose={() => setModalType(null)} title={profile.hasTransactionPassword ? "Change PIN" : "Set PIN"}>
                <div className="space-y-5">
                    <p className="text-sm text-zinc-400 mb-2 leading-relaxed">
                        {profile.hasTransactionPassword
                            ? "Enter your current 6-digit PIN and the new one to change it."
                            : "Set a 6-digit numeric PIN for withdrawal authorization."}
                    </p>

                    {profile.hasTransactionPassword && (
                        <div>
                            <label className="block text-xs font-bold text-zinc-500 mb-2 text-center uppercase">Current PIN</label>
                            <input
                                type="password"
                                maxLength={6}
                                className="w-full text-center text-xl tracking-[0.5em] py-3 border-b-2 border-zinc-700 focus:border-primary-500 outline-none transition-colors bg-transparent placeholder:tracking-normal font-mono text-white"
                                value={formData.oldPassword}
                                onChange={e => setFormData({ ...formData, oldPassword: e.target.value })}
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-bold text-zinc-500 mb-2 text-center uppercase">
                            {profile.hasTransactionPassword ? "New PIN" : "6-Digit PIN"}
                        </label>
                        <input
                            type="password"
                            maxLength={6}
                            className="w-full text-center text-xl tracking-[0.5em] py-3 border-b-2 border-zinc-700 focus:border-primary-500 outline-none transition-colors bg-transparent placeholder:tracking-normal font-mono text-white"
                            value={formData.transactionPassword}
                            onChange={e => setFormData({ ...formData, transactionPassword: e.target.value })}
                        />
                    </div>

                    <div className="pt-4">
                        <Button onClick={handleSetTransactionPass} fullWidth className="shadow-glow">
                            {profile.hasTransactionPassword ? "Update PIN" : "Set PIN"}
                        </Button>
                    </div>
                </div>
            </Modal>
        </div >
    );
}
