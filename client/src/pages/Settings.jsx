import { useState, useEffect } from 'react';
import { userAPI } from '../services/api';
import { HiArrowLeft, HiLibrary, HiLockClosed, HiShieldCheck, HiLogout, HiIdentification } from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import Loading from '../components/Loading';
import Modal from '../components/Modal';

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
                accountName: res.data.user.bankAccount?.accountName || ''
            }));
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateBank = async () => {
        try {
            await userAPI.setBankAccount({
                bankName: formData.bankName,
                accountNumber: formData.accountNumber,
                accountName: formData.accountName
            });
            alert('Bank account linked successfully!');
            setModalType(null);
            fetchProfile();
        } catch (error) {
            alert(error.response?.data?.message || 'Update failed. Bank details can only be set once.');
        }
    };

    const handleChangeLoginPass = async () => {
        if (formData.newPassword !== formData.confirmPassword) {
            alert('Passwords do not match');
            return;
        }
        try {
            await userAPI.changeLoginPassword({
                oldPassword: formData.oldPassword,
                newPassword: formData.newPassword
            });
            alert('Login password updated!');
            setModalType(null);
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to update password');
        }
    };

    const handleSetTransactionPass = async () => {
        try {
            await userAPI.setTransactionPassword({
                transactionPassword: formData.transactionPassword
            });
            alert('Transaction password set!');
            setModalType(null);
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to set transaction password');
        }
    };

    if (loading) return <Loading />;

    const settingsItems = [
        {
            label: 'Bank Account',
            icon: HiLibrary,
            desc: profile.bankAccount?.isSet ? `${profile.bankAccount.bankName} (...${profile.bankAccount.accountNumber.slice(-4)})` : 'Not linked',
            action: () => setModalType('bank')
        },
        {
            label: 'Transaction Password',
            icon: HiShieldCheck,
            desc: 'Verify withdrawals securely',
            action: () => setModalType('transPass')
        },
        {
            label: 'Login Password',
            icon: HiLockClosed,
            desc: 'Last changed: Recently',
            action: () => setModalType('loginPass')
        }
    ];

    return (
        <div className="animate-fadeIn">
            {/* Header */}
            <div className="bg-white px-4 py-4 flex items-center gap-4 sticky top-0 z-10 shadow-sm border-b border-gray-100">
                <button onClick={() => navigate(-1)} className="text-2xl text-gray-800">
                    <HiArrowLeft />
                </button>
                <h1 className="text-xl font-bold text-gray-900">Security Settings</h1>
            </div>

            <div className="px-4 py-6">
                {/* User Card */}
                <div className="bg-white rounded-3xl p-6 shadow-sm mb-8 flex items-center gap-4 border border-gray-50">
                    <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center text-green-600 text-3xl font-bold">
                        <HiIdentification />
                    </div>
                    <div>
                        <p className="font-bold text-gray-900 text-lg">{profile.phone}</p>
                        <span className="bg-green-100 text-green-600 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                            Level {profile.membershipLevel}
                        </span>
                    </div>
                </div>

                <div className="space-y-4 mb-10">
                    {settingsItems.map((item, idx) => (
                        <div
                            key={idx}
                            onClick={item.action}
                            className="card flex items-center gap-4 cursor-pointer hover:bg-gray-50 transition-colors"
                        >
                            <div className="p-3 bg-gray-50 rounded-xl text-gray-500">
                                <item.icon className="text-xl" />
                            </div>
                            <div className="flex-1">
                                <p className="font-bold text-gray-800 text-sm">{item.label}</p>
                                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter">{item.desc}</p>
                            </div>
                            <div className="w-2 h-2 rounded-full bg-gray-200"></div>
                        </div>
                    ))}
                </div>

                <button
                    onClick={logout}
                    className="btn-outline w-full border-red-500 text-red-500 hover:bg-red-50 flex items-center justify-center gap-2 py-4 uppercase text-xs font-bold tracking-widest"
                >
                    <HiLogout className="text-xl" />
                    Log Out
                </button>
            </div>

            {/* Bank Modal */}
            <Modal isOpen={modalType === 'bank'} onClose={() => setModalType(null)} title="Bank Details">
                <div className="space-y-4">
                    <p className="text-[10px] text-red-400 bg-red-50 p-3 rounded-xl font-bold uppercase mb-2">Warning: Bank details can only be set ONCE. For changes, contact manager.</p>
                    <input
                        type="text" placeholder="Bank Name (e.g. CBE)" className="input-field"
                        value={formData.bankName} onChange={e => setFormData({ ...formData, bankName: e.target.value })}
                        disabled={profile.bankAccount?.isSet}
                    />
                    <input
                        type="text" placeholder="Account Number" className="input-field"
                        value={formData.accountNumber} onChange={e => setFormData({ ...formData, accountNumber: e.target.value })}
                        disabled={profile.bankAccount?.isSet}
                    />
                    <input
                        type="text" placeholder="Account Holder Name" className="input-field"
                        value={formData.accountName} onChange={e => setFormData({ ...formData, accountName: e.target.value })}
                        disabled={profile.bankAccount?.isSet}
                    />
                    {!profile.bankAccount?.isSet && (
                        <button onClick={handleUpdateBank} className="btn-primary w-full py-4 tracking-widest text-xs font-bold uppercase">Save Account</button>
                    )}
                </div>
            </Modal>

            {/* Login Password Modal */}
            <Modal isOpen={modalType === 'loginPass'} onClose={() => setModalType(null)} title="Change Login Password">
                <div className="space-y-4">
                    <input type="password" placeholder="Old Password" className="input-field"
                        onChange={e => setFormData({ ...formData, oldPassword: e.target.value })} />
                    <input type="password" placeholder="New Password" className="input-field"
                        onChange={e => setFormData({ ...formData, newPassword: e.target.value })} />
                    <input type="password" placeholder="Confirm New Password" className="input-field"
                        onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })} />
                    <button onClick={handleChangeLoginPass} className="btn-primary w-full py-4 tracking-widest text-xs font-bold uppercase">Update Password</button>
                </div>
            </Modal>

            {/* Transaction Password Modal */}
            <Modal isOpen={modalType === 'transPass'} onClose={() => setModalType(null)} title="Set Transaction Password">
                <div className="space-y-4">
                    <p className="text-xs text-gray-500 mb-4">Set a 6-digit numeric password for withdrawal authorization.</p>
                    <input type="password" placeholder="6-digit Password" maxLength={6} className="input-field text-center tracking-widest"
                        onChange={e => setFormData({ ...formData, transactionPassword: e.target.value })} />
                    <button onClick={handleSetTransactionPass} className="btn-primary w-full py-4 tracking-widest text-xs font-bold uppercase">Update Secure Password</button>
                </div>
            </Modal>
        </div>
    );
}
