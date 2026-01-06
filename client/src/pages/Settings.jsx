import { useState, useEffect } from 'react';
import { userAPI } from '../services/api';
import { toast } from 'react-hot-toast';
import { ArrowLeft, Landmark, Lock, ShieldCheck, LogOut, User, Fingerprint } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import Loading from '../components/Loading';
import Modal from '../components/Modal';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

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
            label: 'Bank Account',
            icon: Landmark,
            desc: profile.bankAccount?.isSet ? `${profile.bankAccount.bankName} (...${profile.bankAccount.accountNumber.slice(-4)})` : 'Not linked',
            action: () => {
                setModalType('bank');
            },
            color: 'text-blue-600 bg-blue-50'
        },
        {
            label: 'Transaction Password',
            icon: ShieldCheck,
            desc: 'Verify withdrawals securely',
            action: () => setModalType('transPass'),
            color: 'text-emerald-600 bg-emerald-50'
        },
        {
            label: 'Login Password',
            icon: Lock,
            desc: 'Secure your account access',
            action: () => setModalType('loginPass'),
            color: 'text-purple-600 bg-purple-50'
        }
    ];

    return (
        <div className="animate-fade-in min-h-screen bg-gray-50 pb-8">
            {/* Header */}
            <div className="bg-white/80 backdrop-blur-md px-4 py-3 flex items-center gap-4 sticky top-0 z-30 border-b border-gray-100">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 -ml-2 rounded-full text-gray-600 hover:bg-gray-100 transition-colors"
                >
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-xl font-bold text-gray-900">Settings</h1>
            </div>

            <div className="max-w-md mx-auto px-4 py-6">
                {/* User Card */}
                <div className="bg-white rounded-2xl p-5 shadow-sm mb-8 flex items-center gap-4 border border-gray-100">
                    <div className="w-14 h-14 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center text-gray-500">
                        <User size={28} />
                    </div>
                    <div>
                        <p className="font-bold text-gray-900 text-lg">{profile.phone}</p>
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-primary-50 text-primary-700 text-xs font-bold uppercase tracking-wide">
                            {/* <User size={10} strokeWidth={3} /> */}
                            <span>Level {profile.membershipLevel}</span>
                        </div>
                    </div>
                </div>

                <div className="space-y-3 mb-10">
                    {settingsItems.map((item, idx) => (
                        <div
                            key={idx}
                            onClick={item.action}
                            className="bg-white rounded-2xl p-4 flex items-center gap-4 cursor-pointer border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all active:scale-[0.98]"
                        >
                            <div className={`p-3 rounded-xl ${item.color}`}>
                                <item.icon size={22} />
                            </div>
                            <div className="flex-1">
                                <p className="font-bold text-gray-900 text-sm">{item.label}</p>
                                <p className="text-xs text-gray-500 font-medium">{item.desc}</p>
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
                        <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 mb-2">
                            <p className="text-amber-800 font-bold text-xs uppercase tracking-wide mb-1">
                                Change Pending
                            </p>
                            <p className="text-amber-700 text-xs leading-relaxed">
                                Requested: {new Date(profile.bankChangeRequestDate).toLocaleDateString()}<br />
                                Effective: {new Date(new Date(profile.bankChangeRequestDate).getTime() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                            </p>
                        </div>
                    )}

                    {profile.bankAccount?.isSet && profile.bankChangeStatus !== 'pending' && (
                        <p className="text-xs text-blue-600 bg-blue-50 p-3 rounded-xl font-medium mb-2 border border-blue-100">
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
                            <Button onClick={handleUpdateBank} fullWidth>
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
                        <Button onClick={handleChangeLoginPass} fullWidth>
                            Update Password
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Transaction Password Modal */}
            <Modal isOpen={modalType === 'transPass'} onClose={() => setModalType(null)} title={profile.hasTransactionPassword ? "Change PIN" : "Set PIN"}>
                <div className="space-y-5">
                    <p className="text-sm text-gray-500 mb-2 leading-relaxed">
                        {profile.hasTransactionPassword
                            ? "Enter your current 6-digit PIN and the new one to change it."
                            : "Set a 6-digit numeric PIN for withdrawal authorization."}
                    </p>

                    {profile.hasTransactionPassword && (
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-2 text-center uppercase">Current PIN</label>
                            <input
                                type="password"
                                maxLength={6}
                                className="w-full text-center text-xl tracking-[0.5em] py-3 border-b-2 border-gray-200 focus:border-primary-500 outline-none transition-colors bg-transparent placeholder:tracking-normal font-mono"
                                value={formData.oldPassword}
                                onChange={e => setFormData({ ...formData, oldPassword: e.target.value })}
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-2 text-center uppercase">
                            {profile.hasTransactionPassword ? "New PIN" : "6-Digit PIN"}
                        </label>
                        <input
                            type="password"
                            maxLength={6}
                            className="w-full text-center text-xl tracking-[0.5em] py-3 border-b-2 border-gray-200 focus:border-primary-500 outline-none transition-colors bg-transparent placeholder:tracking-normal font-mono"
                            value={formData.transactionPassword}
                            onChange={e => setFormData({ ...formData, transactionPassword: e.target.value })}
                        />
                    </div>

                    <div className="pt-4">
                        <Button onClick={handleSetTransactionPass} fullWidth>
                            {profile.hasTransactionPassword ? "Update PIN" : "Set PIN"}
                        </Button>
                    </div>
                </div>
            </Modal>
        </div >
    );
}
