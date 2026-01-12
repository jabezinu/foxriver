import { useState, useEffect } from 'react';
import { adminUserAPI } from '../services/api';
import { HiSearch, HiIdentification, HiExternalLink, HiPencil, HiTrash, HiX, HiClipboardList } from 'react-icons/hi';
import { toast } from 'react-hot-toast';
import Loading from '../components/Loading';

import ConfirmModal from '../components/ConfirmModal';
import UserHistoryModal from '../components/UserHistoryModal';
import { formatNumber } from '../utils/formatNumber';

export default function UserManagement() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterLevel, setFilterLevel] = useState('');
    const [deleteId, setDeleteId] = useState(null);
    const [historyUser, setHistoryUser] = useState(null);

    // Edit Modal State
    const [editingUser, setEditingUser] = useState(null);
    const [editForm, setEditForm] = useState({
        membershipLevel: '',
        incomeWallet: '',
        personalWallet: '',
        withdrawalRestrictedUntil: ''
    });

    useEffect(() => {
        fetchUsers();
    }, [filterLevel]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await adminUserAPI.getAllUsers({
                membershipLevel: filterLevel || undefined,
                search: searchTerm || undefined
            });
            setUsers(res.data.users);
        } catch (error) {
            toast.error('Failed to load operative data');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchUsers();
    };

    const handleEdit = (user) => {
        setEditingUser(user);
        setEditForm({
            membershipLevel: user.membershipLevel,
            incomeWallet: user.incomeWallet,
            personalWallet: user.personalWallet,
            withdrawalRestrictedUntil: user.withdrawalRestrictedUntil ? new Date(user.withdrawalRestrictedUntil).toISOString().split('T')[0] : ''
        });
    };

    const handleDelete = (id) => {
        setDeleteId(id);
    };

    const confirmDelete = async () => {
        try {
            await adminUserAPI.deleteUser(deleteId);
            toast.success('User deleted successfully');
            fetchUsers();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Delete failed');
        } finally {
            setDeleteId(null);
        }
    };

    const handleSaveEdit = async (e) => {
        e.preventDefault();
        try {
            await adminUserAPI.updateUser(editingUser._id, editForm);
            toast.success('User updated successfully');
            setEditingUser(null);
            fetchUsers();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Update failed');
        }
    };

    // Restrict All Modal State
    const [restrictModalOpen, setRestrictModalOpen] = useState(false);
    const [restrictDate, setRestrictDate] = useState('');
    const [isLiftRestriction, setIsLiftRestriction] = useState(false);

    const handleRestrictAll = async (e) => {
        e.preventDefault();

        if (!isLiftRestriction && !restrictDate) return toast.error('Please select a date');

        const message = isLiftRestriction
            ? 'Are you sure you want to LIFT withdrawal restrictions for ALL users?'
            : 'Are you sure you want to restrict withdrawals for ALL users until this date?';

        if (!confirm(message)) return;

        try {
            await adminUserAPI.restrictAllUsers({ date: isLiftRestriction ? null : restrictDate });
            toast.success(isLiftRestriction ? 'Restrictions lifted for all users' : 'Restriction applied to all users');
            setRestrictModalOpen(false);
            setRestrictDate('');
            setIsLiftRestriction(false);
            fetchUsers();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Operation failed');
        }
    };

    return (
        <div className="animate-fadeIn relative">
            <ConfirmModal
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={confirmDelete}
                title="Deactivate Operative"
                message="CRITICAL: Are you sure you want to delete this user? This action cannot be undone and will remove all their data."
                confirmText="Delete User"
                isDangerous={true}
            />

            <UserHistoryModal
                isOpen={!!historyUser}
                user={historyUser}
                onClose={() => setHistoryUser(null)}
            />

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Personnel Database</h1>
                    <p className="text-sm text-gray-500">Monitor and manage all system operatives.</p>
                </div>
                <button
                    onClick={() => setRestrictModalOpen(true)}
                    className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-xl font-bold text-xs uppercase hover:bg-red-100 transition-all border border-red-100"
                >
                    <HiPencil className="text-lg" />
                    Global Restriction
                </button>
            </div>

            {/* Filters Bar */}
            <div className="admin-card mb-8">
                <div className="flex flex-col md:flex-row gap-4">
                    <form onSubmit={handleSearch} className="flex-1 relative">
                        <input
                            type="text"
                            placeholder="Search by phone number (+251...)"
                            className="admin-input pl-12"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </form>
                    <select
                        className="admin-input md:w-48"
                        value={filterLevel}
                        onChange={(e) => setFilterLevel(e.target.value)}
                    >
                        <option value="">All Tiers</option>
                        {['Intern', 'Rank 1', 'Rank 2', 'Rank 3', 'Rank 4', 'Rank 5', 'Rank 6', 'Rank 7', 'Rank 8', 'Rank 9', 'Rank 10'].map(v => (
                            <option key={v} value={v}>{v}</option>
                        ))}
                    </select>
                    <button onClick={fetchUsers} className="admin-btn-primary px-8">Filter</button>
                </div>
            </div>

            {/* Users Table */}
            <div className="admin-card p-0 overflow-hidden">
                {loading ? (
                    <div className="h-64">
                        <Loading />
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr>
                                    <th className="table-header">Operative ID</th>
                                    <th className="table-header">Tier</th>
                                    <th className="table-header">Income Wallet</th>
                                    <th className="table-header">Personal Wallet</th>
                                    <th className="table-header">Monthly Salary</th>
                                    <th className="table-header">Joined Date</th>
                                    <th className="table-header text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user) => (
                                    <tr key={user._id} className="table-row">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                {user.profilePhoto ? (
                                                    <img
                                                        src={user.profilePhoto.startsWith('http') ? user.profilePhoto : `${(import.meta.env.VITE_API_URL || 'http://localhost:5002/api').replace(/\/api$/, '')}${user.profilePhoto}`}
                                                        alt={user.name || 'User'}
                                                        className="w-8 h-8 rounded-lg object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                                                        {user.name ? user.name.charAt(0).toUpperCase() : <HiIdentification />}
                                                    </div>
                                                )}
                                                <div>
                                                    <div className="font-bold text-gray-800 tracking-tight">{user.name || 'No name set'}</div>
                                                    <div className="text-xs text-gray-500 font-medium">{user.phone}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="bg-indigo-50 text-indigo-600 text-[10px] font-bold px-3 py-1 rounded-full uppercase w-fit mb-1">
                                                    {user.membershipLevel}
                                                </span>
                                                {user.bankAccount?.isSet ? (
                                                    <div className="text-[9px] text-gray-400 font-bold uppercase">
                                                        {user.bankAccount.bankName} • {user.bankAccount.accountNumber.slice(-4)}
                                                    </div>
                                                ) : (
                                                    <span className="text-[9px] text-red-300 font-bold uppercase italic">No Bank linked</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-bold text-green-600">{formatNumber(user.incomeWallet)} ETB</td>
                                        <td className="px-6 py-4 text-sm font-bold text-blue-600">{formatNumber(user.personalWallet)} ETB</td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-purple-600">{formatNumber(user.monthlySalary || 0)} ETB</span>
                                                <span className="text-[9px] text-gray-400 font-bold uppercase">Per Month</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-xs text-gray-500 font-medium">
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => handleEdit(user)}
                                                    className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all pointer-events-auto"
                                                    title="Edit User"
                                                >
                                                    <HiPencil />
                                                </button>
                                                <button
                                                    onClick={() => setHistoryUser(user)}
                                                    className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center hover:bg-purple-600 hover:text-white transition-all pointer-events-auto"
                                                    title="View History"
                                                >
                                                    <HiClipboardList />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(user._id)}
                                                    className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-600 hover:text-white transition-all pointer-events-auto"
                                                    title="Delete User"
                                                >
                                                    <HiTrash />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Edit Modal */}
            {editingUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fadeIn">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="font-bold text-gray-800">Edit Operative: {editingUser.phone}</h3>
                            <button onClick={() => setEditingUser(null)} className="text-gray-400 hover:text-red-500">
                                <HiX className="text-xl" />
                            </button>
                        </div>
                        <form onSubmit={handleSaveEdit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Membership Level</label>
                                <select
                                    className="admin-input"
                                    value={editForm.membershipLevel}
                                    onChange={e => setEditForm({ ...editForm, membershipLevel: e.target.value })}
                                >
                                    {['Intern', 'Rank 1', 'Rank 2', 'Rank 3', 'Rank 4', 'Rank 5', 'Rank 6', 'Rank 7', 'Rank 8', 'Rank 9', 'Rank 10'].map(v => (
                                        <option key={v} value={v}>{v}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Income Wallet (ETB)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    className="admin-input"
                                    value={editForm.incomeWallet}
                                    onChange={e => setEditForm({ ...editForm, incomeWallet: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Personal Wallet (ETB)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    className="admin-input"
                                    value={editForm.personalWallet}
                                    onChange={e => setEditForm({ ...editForm, personalWallet: e.target.value })}
                                />
                            </div>
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                <label className="flex items-center gap-2 cursor-pointer mb-3">
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                                        checked={!!editForm.withdrawalRestrictedUntil}
                                        onChange={e => {
                                            if (e.target.checked) {
                                                // Default to tomorrow if checked
                                                const tomorrow = new Date();
                                                tomorrow.setDate(tomorrow.getDate() + 1);
                                                setEditForm({ ...editForm, withdrawalRestrictedUntil: tomorrow.toISOString().split('T')[0] });
                                            } else {
                                                setEditForm({ ...editForm, withdrawalRestrictedUntil: '' });
                                            }
                                        }}
                                    />
                                    <span className="text-xs font-bold text-gray-700 uppercase">Restrict Withdrawals</span>
                                </label>

                                {editForm.withdrawalRestrictedUntil && (
                                    <div className="animate-fadeIn">
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Restricted Until</label>
                                        <input
                                            type="date"
                                            className="admin-input"
                                            value={editForm.withdrawalRestrictedUntil}
                                            onChange={e => setEditForm({ ...editForm, withdrawalRestrictedUntil: e.target.value })}
                                        />
                                        <p className="text-[10px] text-gray-400 mt-1">User cannot withdraw until this date passes.</p>
                                    </div>
                                )}
                            </div>

                            {editingUser.bankChangeStatus === 'pending' && editingUser.pendingBankAccount && (
                                <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100">
                                    <p className="text-yellow-800 font-bold text-xs uppercase mb-2">Pending Bank Change</p>
                                    <div className="text-xs text-gray-600 space-y-1 mb-3">
                                        <p><span className="font-bold">Bank:</span> {editingUser.pendingBankAccount.bank}</p>
                                        <p><span className="font-bold">Account:</span> {editingUser.pendingBankAccount.accountNumber}</p>
                                        <p><span className="font-bold">Name:</span> {editingUser.pendingBankAccount.accountName}</p>
                                        <p><span className="font-bold">Phone:</span> {editingUser.pendingBankAccount.phone}</p>
                                        <p className="text-[10px] text-gray-400 mt-2">Requested: {new Date(editingUser.bankChangeRequestDate).toLocaleDateString()}</p>
                                    </div>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                                            checked={editForm.approveBankChange || false}
                                            onChange={e => setEditForm({ ...editForm, approveBankChange: e.target.checked })}
                                        />
                                        <span className="text-sm font-bold text-gray-700">Approve Change Immediately</span>
                                    </label>
                                </div>
                            )}

                            <div className="pt-4 flex gap-3">
                                <button type="button" onClick={() => setEditingUser(null)} className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-bold text-xs uppercase hover:bg-gray-50">Cancel</button>
                                <button type="submit" className="flex-1 py-3 rounded-xl bg-indigo-600 text-white font-bold text-xs uppercase hover:bg-indigo-700 shadow-lg shadow-indigo-200">Save Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Restrict All Modal */}
            {restrictModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fadeIn">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="font-bold text-gray-800">Global Withdrawal Restriction</h3>
                            <button onClick={() => setRestrictModalOpen(false)} className="text-gray-400 hover:text-red-500">
                                <HiX className="text-xl" />
                            </button>
                        </div>
                        <form onSubmit={handleRestrictAll} className="p-6 space-y-4">
                            <div className="flex gap-2 p-1 bg-gray-100 rounded-xl mb-4">
                                <button
                                    type="button"
                                    onClick={() => setIsLiftRestriction(false)}
                                    className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase transition-all ${!isLiftRestriction ? 'bg-white shadow text-red-600' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    Apply Restriction
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsLiftRestriction(true)}
                                    className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase transition-all ${isLiftRestriction ? 'bg-white shadow text-green-600' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    Lift Restrictions
                                </button>
                            </div>

                            {!isLiftRestriction ? (
                                <>
                                    <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                                        <p className="text-red-800 font-bold text-xs uppercase mb-2">Warning</p>
                                        <p className="text-xs text-gray-600">
                                            This will restrict withdrawals for <span className="font-bold">ALL</span> users until the selected date. This action overwrites any existing individual restrictions.
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Restricted Until</label>
                                        <input
                                            type="date"
                                            className="admin-input"
                                            value={restrictDate}
                                            onChange={e => setRestrictDate(e.target.value)}
                                            required={!isLiftRestriction}
                                        />
                                    </div>
                                </>
                            ) : (
                                <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                                    <p className="text-green-800 font-bold text-xs uppercase mb-2">Lift All Restrictions</p>
                                    <p className="text-xs text-gray-600">
                                        This will remove withdrawal restrictions for <span className="font-bold">ALL</span> users immediately. They will be able to withdraw funds if they meet other criteria.
                                    </p>
                                </div>
                            )}

                            <div className="pt-4 flex gap-3">
                                <button type="button" onClick={() => setRestrictModalOpen(false)} className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-bold text-xs uppercase hover:bg-gray-50">Cancel</button>
                                <button
                                    type="submit"
                                    className={`flex-1 py-3 rounded-xl text-white font-bold text-xs uppercase shadow-lg transition-all ${isLiftRestriction ? 'bg-green-600 hover:bg-green-700 shadow-green-200' : 'bg-red-600 hover:bg-red-700 shadow-red-200'}`}
                                >
                                    {isLiftRestriction ? 'Lift Restrictions' : 'Apply to All'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
