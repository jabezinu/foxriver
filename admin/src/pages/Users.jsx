import { useState, useEffect } from 'react';
import { useAdminUserStore } from '../store/userStore';
import { HiSearch, HiIdentification, HiPencil, HiTrash, HiClipboardList, HiUsers } from 'react-icons/hi';
import { toast } from 'react-hot-toast';
import Loading from '../components/Loading';
import { getServerUrl } from '../config/api.config';
import { TIERS } from '../config/constants';

import ConfirmModal from '../components/ConfirmModal';
import UserHistoryModal from '../components/UserHistoryModal';
import UserEditModal from '../components/UserEditModal';
import GlobalRestrictionModal from '../components/GlobalRestrictionModal';
import ReferenceTreeModal from '../components/ReferenceTreeModal';
import { formatNumber } from '../utils/formatNumber';
import Card from '../components/shared/Card';
import Badge from '../components/shared/Badge';
import PageHeader from '../components/shared/PageHeader';

export default function UserManagement() {
    const { users, loading, fetchUsers, updateUser, deleteUser, restrictAllUsers } = useAdminUserStore();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterLevel, setFilterLevel] = useState('all');
    const [deleteId, setDeleteId] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [historyUser, setHistoryUser] = useState(null);
    const [referenceTreeUserId, setReferenceTreeUserId] = useState(null);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalUsers, setTotalUsers] = useState(0);
    const limit = 10;

    // Edit Modal State
    const [editingUser, setEditingUser] = useState(null);
    const [editForm, setEditForm] = useState({
        membershipLevel: '',
        incomeWallet: '',
        personalWallet: '',
        withdrawalRestrictedUntil: '',
        withdrawalRestrictedDays: [],
        password: ''
    });

    // Restrict All Modal State
    const [restrictModalOpen, setRestrictModalOpen] = useState(false);
    const [restrictDate, setRestrictDate] = useState('');
    const [isLiftRestriction, setIsLiftRestriction] = useState(false);
    const [restrictedDays, setRestrictedDays] = useState([]);
    const [restrictionType, setRestrictionType] = useState('date');

    useEffect(() => {
        fetchUserData();
    }, [filterLevel]);

    const fetchUserData = async (page = currentPage) => {
        const res = await fetchUsers({
            membershipLevel: filterLevel === 'all' ? undefined : filterLevel,
            search: searchTerm || undefined,
            page,
            limit
        });
        if (res.success) {
            setTotalPages(res.data.totalPages);
            setTotalUsers(res.data.totalUsers);
            setCurrentPage(res.data.currentPage);
        } else {
            toast.error('Failed to load operative data');
            console.error(res.message);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchUserData(1);
    };

    const handleEdit = (user) => {
        setEditingUser(user);
        setEditForm({
            membershipLevel: user.membershipLevel,
            incomeWallet: user.incomeWallet,
            personalWallet: user.personalWallet,
            withdrawalRestrictedUntil: user.withdrawalRestrictedUntil ? new Date(user.withdrawalRestrictedUntil).toISOString().split('T')[0] : '',
            withdrawalRestrictedDays: user.withdrawalRestrictedDays || [],
            bank: user.bankAccount?.bank || '',
            accountNumber: user.bankAccount?.accountNumber || '',
            accountName: user.bankAccount?.accountName || '',
            bankPhone: user.bankAccount?.phone || '',
            password: ''
        });
    };

    const handleDelete = (id) => {
        setDeleteId(id);
    };

    const confirmDelete = async () => {
        setSubmitting(true);
        const res = await deleteUser(deleteId);
        if (res.success) {
            toast.success('Personnel Entry Purged');
            fetchUserData();
        } else {
            toast.error(res.message);
        }
        setDeleteId(null);
        setSubmitting(false);
    };

    const handleEditUser = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        const res = await updateUser(editingUser.id, editForm);
        if (res.success) {
            toast.success('Registry Entry Updated');
            setEditingUser(null);
            fetchUserData();
        } else {
            toast.error(res.message);
        }
        setSubmitting(false);
    };

    const handleRestrictAll = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        
        let payload = {};
        
        if (isLiftRestriction) {
            payload = { date: null, restrictedDays: [] };
        } else {
            if (restrictionType === 'date') {
                payload = { date: restrictDate, restrictedDays: [] };
            } else {
                payload = { date: null, restrictedDays: restrictedDays };
            }
        }

        const res = await restrictAllUsers(payload);
        if (res.success) {
            toast.success(res.data.message || 'Global Restriction Updated');
            setRestrictModalOpen(false);
            fetchUserData();
        } else {
            toast.error(res.message);
        }
        setSubmitting(false);
    };

    return (
        <div className="animate-fadeIn relative">
            <ConfirmModal
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={confirmDelete}
                title="Delete User Account"
                message="WARNING: You are about to PERMANENTLY delete this user. This will remove all their financial history, wallet balances, and commissions. This action cannot be undone."
                confirmText="Delete Permanently"
                isDangerous={true}
            />

            <UserHistoryModal
                isOpen={!!historyUser}
                user={historyUser}
                onClose={() => setHistoryUser(null)}
            />

            <UserEditModal
                user={editingUser}
                form={editForm}
                onChange={setEditForm}
                onClose={() => setEditingUser(null)}
                onSave={handleEditUser}
            />

            <ReferenceTreeModal
                isOpen={!!referenceTreeUserId}
                userId={referenceTreeUserId}
                onClose={() => setReferenceTreeUserId(null)}
            />

            <GlobalRestrictionModal
                isOpen={restrictModalOpen}
                onClose={() => setRestrictModalOpen(false)}
                onSave={handleRestrictAll}
                date={restrictDate}
                setDate={setRestrictDate}
                lift={isLiftRestriction}
                setLift={setIsLiftRestriction}
                restrictedDays={restrictedDays}
                setRestrictedDays={setRestrictedDays}
                restrictionType={restrictionType}
                setRestrictionType={setRestrictionType}
            />

            <PageHeader
                title="Personnel Database"
                subtitle="Monitor and manage all system operatives."
                extra={
                    <button
                        onClick={() => setRestrictModalOpen(true)}
                        className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-xl font-bold text-xs uppercase hover:bg-red-100 transition-all border border-red-100"
                    >
                        <HiPencil className="text-lg" />
                        Global Restriction
                    </button>
                }
            />

            <Card className="mb-8">
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
                        {TIERS.map(v => (
                            <option key={v} value={v}>{v}</option>
                        ))}
                    </select>
                    <button onClick={fetchUsers} className="admin-btn-primary px-8">Filter</button>
                </div>
            </Card>

            <Card noPadding className="overflow-hidden">
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
                                    <th className="table-header text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user) => (
                                    <tr key={user.id} className="table-row">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                {user.profilePhoto ? (
                                                    <img
                                                        src={user.profilePhoto.startsWith('http') ? user.profilePhoto : `${getServerUrl()}${user.profilePhoto}`}
                                                        alt={user.name || 'User'}
                                                        className="w-10 h-10 rounded-xl object-cover shadow-sm border border-gray-100"
                                                    />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                                                        {user.name ? user.name.charAt(0).toUpperCase() : <HiIdentification className="text-xl" />}
                                                    </div>
                                                )}
                                                <div>
                                                    <div className="font-bold text-gray-800 tracking-tight leading-none mb-1">{user.name || 'No name set'}</div>
                                                    <div className="text-[10px] text-gray-400 font-bold font-mono tracking-tighter">{user.phone}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                <Badge variant={user.membershipLevel === 'Intern' ? 'gray' : 'indigo'}>
                                                    {user.membershipLevel}
                                                </Badge>
                                                {user.bankAccount?.isSet ? (
                                                    <div className="text-[9px] text-gray-400 font-bold uppercase tracking-tighter">
                                                        {user.bankAccount.bank} • {String(user.bankAccount.accountNumber || '').slice(-4)}
                                                    </div>
                                                ) : (
                                                    <span className="text-[9px] text-red-300 font-bold uppercase italic tracking-tighter">No Bank linked</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-bold text-green-600">{formatNumber(user.incomeWallet)} ETB</td>
                                        <td className="px-6 py-4 text-sm font-bold text-blue-600">{formatNumber(user.personalWallet)} ETB</td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-purple-600">{formatNumber(user.monthlySalary || 0)} ETB</span>
                                                <span className="text-[9px] text-gray-400 font-bold uppercase tracking-tighter">Per Month</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => handleEdit(user)}
                                                    className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                                                    title="Edit User"
                                                >
                                                    <HiPencil />
                                                </button>
                                                <button
                                                    onClick={() => setHistoryUser(user)}
                                                    className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center hover:bg-purple-600 hover:text-white transition-all shadow-sm"
                                                    title="View History"
                                                >
                                                    <HiClipboardList />
                                                </button>
                                                <button
                                                    onClick={() => setReferenceTreeUserId(user.id)}
                                                    className="w-8 h-8 rounded-lg bg-green-50 text-green-600 flex items-center justify-center hover:bg-green-600 hover:text-white transition-all shadow-sm"
                                                    title="Reference Tree"
                                                >
                                                    <HiUsers />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(user.id)}
                                                    className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-600 hover:text-white transition-all shadow-sm"
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
            </Card>

            {/* Pagination Controls */}
            {!loading && totalPages > 1 && (
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-6 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="text-sm text-gray-500 font-medium">
                        Showing <span className="text-gray-900 font-bold">{users.length}</span> of <span className="text-gray-900 font-bold">{totalUsers}</span> operatives
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => fetchUsers(currentPage - 1)}
                            disabled={currentPage === 1}
                            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${
                                currentPage === 1
                                    ? 'bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed'
                                    : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-500 hover:text-indigo-600'
                            }`}
                        >
                            Previous
                        </button>
                        
                        <div className="flex items-center gap-1">
                            {[...Array(totalPages)].map((_, i) => {
                                const pageNum = i + 1;
                                // Simple logic to show only a few page numbers if there are many
                                if (
                                    totalPages <= 7 ||
                                    pageNum === 1 ||
                                    pageNum === totalPages ||
                                    (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                                ) {
                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => fetchUsers(pageNum)}
                                            className={`w-9 h-9 rounded-xl text-xs font-bold transition-all ${
                                                currentPage === pageNum
                                                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                                                    : 'bg-white text-gray-600 hover:bg-gray-50'
                                            }`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                } else if (
                                    (pageNum === 2 && currentPage > 4) ||
                                    (pageNum === totalPages - 1 && currentPage < totalPages - 3)
                                ) {
                                    return <span key={pageNum} className="text-gray-400">...</span>;
                                }
                                return null;
                            })}
                        </div>

                        <button
                            onClick={() => fetchUsers(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${
                                currentPage === totalPages
                                    ? 'bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed'
                                    : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-500 hover:text-indigo-600'
                            }`}
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
