import { useState, useEffect } from 'react';
import { adminUserAPI } from '../services/api';
import { HiSearch, HiIdentification, HiExternalLink, HiPencil, HiTrash, HiX } from 'react-icons/hi';
import { toast } from 'react-hot-toast';
import Loading from '../components/Loading';

export default function UserManagement() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterLevel, setFilterLevel] = useState('');

    // Edit Modal State
    const [editingUser, setEditingUser] = useState(null);
    const [editForm, setEditForm] = useState({
        membershipLevel: '',
        incomeWallet: '',
        personalWallet: ''
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
            personalWallet: user.personalWallet
        });
    };

    const handleDelete = async (id) => {
        if (!window.confirm('CRITICAL: Are you sure you want to delete this user? This cannot be undone.')) return;
        try {
            await adminUserAPI.deleteUser(id);
            toast.success('User deleted successfully');
            fetchUsers();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Delete failed');
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

    return (
        <div className="animate-fadeIn relative">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Personnel Database</h1>
                    <p className="text-sm text-gray-500">Monitor and manage all system operatives.</p>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="admin-card mb-8">
                <div className="flex flex-col md:flex-row gap-4">
                    <form onSubmit={handleSearch} className="flex-1 relative">
                        <HiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
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
                        {['Intern', 'V1', 'V2', 'V3', 'V4', 'V5', 'V6', 'V7', 'V8', 'V9', 'V10'].map(v => (
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
                    <table className="w-full">
                        <thead>
                            <tr>
                                <th className="table-header">Operative ID</th>
                                <th className="table-header">Tier</th>
                                <th className="table-header">Income Wallet</th>
                                <th className="table-header">Personal Wallet</th>
                                <th className="table-header">Joined Date</th>
                                <th className="table-header text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user._id} className="table-row">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400">
                                                <HiIdentification />
                                            </div>
                                            <span className="font-bold text-gray-800 tracking-tight">{user.phone}</span>
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
                                    <td className="px-6 py-4 text-sm font-bold text-green-600">{user.incomeWallet} ETB</td>
                                    <td className="px-6 py-4 text-sm font-bold text-blue-600">{user.personalWallet} ETB</td>
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
                                    {['Intern', 'V1', 'V2', 'V3', 'V4', 'V5', 'V6', 'V7', 'V8', 'V9', 'V10'].map(v => (
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
                            <div className="pt-4 flex gap-3">
                                <button type="button" onClick={() => setEditingUser(null)} className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-bold text-xs uppercase hover:bg-gray-50">Cancel</button>
                                <button type="submit" className="flex-1 py-3 rounded-xl bg-indigo-600 text-white font-bold text-xs uppercase hover:bg-indigo-700 shadow-lg shadow-indigo-200">Save Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
