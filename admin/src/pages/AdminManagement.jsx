import { useState, useEffect } from 'react';
import { adminManagementAPI } from '../services/api';
import { HiShieldCheck, HiPencil, HiX, HiCheck, HiOutlineShieldExclamation, HiPlus, HiTrash } from 'react-icons/hi';
import { toast } from 'react-hot-toast';
import Loading from '../components/Loading';
import ConfirmModal from '../components/ConfirmModal';
import { useAdminAuthStore } from '../store/authStore';

const ALL_PERMISSIONS = [
    { id: 'manage_users', label: 'Manage Users', description: 'Can view, edit, and delete users' },
    { id: 'manage_deposits', label: 'Manage Deposits', description: 'Can approve or reject deposits' },
    { id: 'manage_withdrawals', label: 'Manage Withdrawals', description: 'Can approve or reject withdrawals' },
    { id: 'manage_tasks', label: 'Manage Tasks', description: 'Can create and delete tasks and playlists' },
    { id: 'manage_courses', label: 'Manage Courses', description: 'Can manage course categories and contents' },
    { id: 'manage_wealth', label: 'Manage Wealth', description: 'Can manage wealth funds and view investments' },
    { id: 'manage_qna', label: 'Manage Q&A', description: 'Can upload and delete Q&A content' },
    { id: 'manage_messages', label: 'Manage Messages', description: 'Can send and manage system messages' },
    { id: 'manage_news', label: 'Manage News', description: 'Can create and update news items' },
    { id: 'manage_slot_machine', label: 'Manage Slot Machine', description: 'Can view slot machine results' },
    { id: 'manage_bank_settings', label: 'Manage Bank Settings', description: 'Can manage available bank accounts' },
    { id: 'manage_referrals', label: 'Manage Referrals', description: 'Can view commissions' },
    { id: 'manage_membership', label: 'Manage Membership', description: 'Can manage membership tiers and pricing' },
    { id: 'manage_system_settings', label: 'Manage System Settings', description: 'Can change global system configurations' },
];

export default function AdminManagement() {
    const { admin: currentAdmin } = useAdminAuthStore();
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingAdmin, setEditingAdmin] = useState(null);
    const [deleteId, setDeleteId] = useState(null);
    const [isAddingAdmin, setIsAddingAdmin] = useState(false);

    const [editForm, setEditForm] = useState({
        role: '',
        permissions: []
    });

    const [addForm, setAddForm] = useState({
        phone: '',
        password: '',
        role: 'admin',
        permissions: []
    });

    useEffect(() => {
        fetchAdmins();
    }, []);

    const fetchAdmins = async () => {
        setLoading(true);
        try {
            const res = await adminManagementAPI.getAdmins();
            setAdmins(res.data.admins);
        } catch (error) {
            toast.error('Failed to load administrators');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (admin) => {
        setEditingAdmin(admin);
        setEditForm({
            role: admin.role,
            permissions: admin.permissions || []
        });
    };

    const handleTogglePermission = (permissionId) => {
        setEditForm(prev => {
            if (prev.permissions.includes(permissionId)) {
                return { ...prev, permissions: prev.permissions.filter(p => p !== permissionId) };
            } else {
                return { ...prev, permissions: [...prev.permissions, permissionId] };
            }
        });
    };

    const handleSavePermissions = async (e) => {
        e.preventDefault();
        try {
            await adminManagementAPI.updatePermissions(editingAdmin.id, editForm);
            toast.success('Admin permissions updated successfully');
            setEditingAdmin(null);
            fetchAdmins();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Update failed');
        }
    };

    const handleAddAdmin = async (e) => {
        e.preventDefault();
        try {
            await adminManagementAPI.createAdmin(addForm);
            toast.success('Administrator created successfully');
            setIsAddingAdmin(false);
            setAddForm({ phone: '', password: '', role: 'admin', permissions: [] });
            fetchAdmins();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Creation failed');
        }
    };

    const confirmDelete = async () => {
        try {
            await adminManagementAPI.deleteAdmin(deleteId);
            toast.success('Administrator deleted successfully');
            fetchAdmins();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Delete failed');
        } finally {
            setDeleteId(null);
        }
    };

    return (
        <div className="animate-fadeIn">
            <ConfirmModal
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={confirmDelete}
                title="Revoke Administrator Access"
                message="Are you sure you want to delete this administrator? This will immediately revoke their access to the system."
                confirmText="Delete Admin"
                isDangerous={true}
            />

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Administrator Management</h1>
                    <p className="text-sm text-gray-500">Manage administrator roles and granular access permissions.</p>
                </div>
                <button
                    onClick={() => setIsAddingAdmin(true)}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold text-xs uppercase hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                >
                    <HiPlus className="text-lg" />
                    New Administrator
                </button>
            </div>

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
                                    <th className="table-header">Admin ID</th>
                                    <th className="table-header">Role</th>
                                    <th className="table-header">Permissions</th>
                                    <th className="table-header">Joined Date</th>
                                    <th className="table-header text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {admins.map((admin) => (
                                    <tr key={admin.id} className="table-row">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-lg ${admin.role === 'superadmin' ? 'bg-indigo-500' : 'bg-gray-500'} flex items-center justify-center text-white font-bold text-sm`}>
                                                    {admin.phone?.slice(-1)}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-gray-800 tracking-tight">{admin.phone}</div>
                                                    <div className="text-[10px] text-gray-400 font-bold uppercase">{admin.role}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${admin.role === 'superadmin'
                                                ? 'bg-indigo-50 text-indigo-600'
                                                : 'bg-gray-100 text-gray-600'
                                                }`}>
                                                {admin.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {admin.role === 'superadmin' ? (
                                                <span className="text-xs font-bold text-indigo-500 uppercase tracking-wider italic flex items-center gap-1">
                                                    <HiShieldCheck /> All Access Granted
                                                </span>
                                            ) : (
                                                <div className="flex flex-wrap gap-1">
                                                    {admin.permissions?.length > 0 ? (
                                                        admin.permissions.map(p => (
                                                            <span key={p} className="bg-blue-50 text-blue-600 text-[9px] font-bold px-2 py-0.5 rounded uppercase">
                                                                {p.replace('manage_', '')}
                                                            </span>
                                                        ))
                                                    ) : (
                                                        <span className="text-[10px] text-red-300 font-bold uppercase italic -tracking-tighter">No Access Permissions</span>
                                                    )}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-xs text-gray-500 font-medium whitespace-nowrap">
                                            {new Date(admin.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => handleEdit(admin)}
                                                    className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all"
                                                    title="Manage Permissions"
                                                >
                                                    <HiPencil />
                                                </button>
                                                {admin.id !== currentAdmin?.id && (
                                                    <button
                                                        onClick={() => setDeleteId(admin.id)}
                                                        className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-600 hover:text-white transition-all"
                                                        title="Delete Administrator"
                                                    >
                                                        <HiTrash />
                                                    </button>
                                                )}
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
            {editingAdmin && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fadeIn">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 shrink-0">
                            <div>
                                <h3 className="font-bold text-gray-800">Manage Access: {editingAdmin.phone}</h3>
                                <p className="text-[10px] text-gray-400 font-bold uppercase">Configure role and granular permissions</p>
                            </div>
                            <button onClick={() => setEditingAdmin(null)} className="text-gray-400 hover:text-red-500">
                                <HiX className="text-xl" />
                            </button>
                        </div>

                        <form onSubmit={handleSavePermissions} className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-6">
                            {/* Role Selection */}
                            <div className="grid grid-cols-2 gap-4">
                                <div
                                    onClick={() => setEditForm(prev => ({ ...prev, role: 'admin' }))}
                                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${editForm.role === 'admin'
                                        ? 'border-indigo-600 bg-indigo-50'
                                        : 'border-gray-100 bg-white hover:border-gray-200'
                                        }`}
                                >
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className={`p-2 rounded-lg ${editForm.role === 'admin' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                                            <HiShieldCheck className="text-xl" />
                                        </div>
                                        <span className="font-bold text-sm text-gray-800 uppercase">Administrator</span>
                                    </div>
                                    <p className="text-[10px] text-gray-500 font-medium">Standard admin role with granular permission controls.</p>
                                </div>

                                <div
                                    onClick={() => setEditForm(prev => ({ ...prev, role: 'superadmin' }))}
                                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${editForm.role === 'superadmin'
                                        ? 'border-indigo-600 bg-indigo-50'
                                        : 'border-gray-100 bg-white hover:border-gray-200'
                                        }`}
                                >
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className={`p-2 rounded-lg ${editForm.role === 'superadmin' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                                            <HiOutlineShieldExclamation className="text-xl" />
                                        </div>
                                        <span className="font-bold text-sm text-gray-800 uppercase">Super Admin</span>
                                    </div>
                                    <p className="text-[10px] text-gray-500 font-medium">Full system access. Bypasses all permission checks.</p>
                                </div>
                            </div>

                            {/* Permissions Grid */}
                            {editForm.role === 'admin' && (
                                <div className="space-y-4 animate-fadeIn">
                                    <div className="flex justify-between items-center">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Access Permissions</label>
                                        <button
                                            type="button"
                                            onClick={() => setEditForm(prev => ({
                                                ...prev,
                                                permissions: prev.permissions.length === ALL_PERMISSIONS.length ? [] : ALL_PERMISSIONS.map(p => p.id)
                                            }))}
                                            className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 uppercase"
                                        >
                                            {editForm.permissions.length === ALL_PERMISSIONS.length ? 'Revoke All' : 'Grant All Access'}
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {ALL_PERMISSIONS.map(permission => (
                                            <div
                                                key={permission.id}
                                                onClick={() => handleTogglePermission(permission.id)}
                                                className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${editForm.permissions.includes(permission.id)
                                                    ? 'border-indigo-100 bg-indigo-50/50'
                                                    : 'border-gray-50 bg-gray-50/30 hover:bg-gray-50'
                                                    }`}
                                            >
                                                <div className={`mt-0.5 w-5 h-5 rounded flex items-center justify-center border transition-all ${editForm.permissions.includes(permission.id)
                                                    ? 'bg-indigo-600 border-indigo-600 text-white'
                                                    : 'bg-white border-gray-200'
                                                    }`}>
                                                    {editForm.permissions.includes(permission.id) && <HiCheck className="text-xs" />}
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-gray-800">{permission.label}</p>
                                                    <p className="text-[10px] text-gray-400 font-medium">{permission.description}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {editForm.role === 'superadmin' && (
                                <div className="bg-indigo-50 p-6 rounded-2xl border-2 border-indigo-100 border-dashed flex flex-col items-center justify-center text-center animate-fadeIn">
                                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-indigo-600 shadow-sm mb-3">
                                        <HiShieldCheck className="text-2xl" />
                                    </div>
                                    <p className="text-sm font-bold text-indigo-900 mb-1">Full Access Mode</p>
                                    <p className="text-xs text-indigo-600 max-w-sm">Super admins automatically possess all permissions. Individual permission configuration is disabled for this role.</p>
                                </div>
                            )}

                            <div className="pt-6 border-t border-gray-100 flex gap-3 shrink-0">
                                <button type="button" onClick={() => setEditingAdmin(null)} className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-bold text-xs uppercase hover:bg-gray-50">Cancel</button>
                                <button type="submit" className="flex-1 py-3 rounded-xl bg-indigo-600 text-white font-bold text-xs uppercase hover:bg-indigo-700 shadow-lg shadow-indigo-200">Commit Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Add Admin Modal */}
            {isAddingAdmin && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fadeIn">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 shrink-0">
                            <div>
                                <h3 className="font-bold text-gray-800">New Administrator</h3>
                                <p className="text-[10px] text-gray-400 font-bold uppercase">Create a new administrative account</p>
                            </div>
                            <button onClick={() => setIsAddingAdmin(false)} className="text-gray-400 hover:text-red-500">
                                <HiX className="text-xl" />
                            </button>
                        </div>

                        <form onSubmit={handleAddAdmin} className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Phone Number</label>
                                    <input
                                        type="text"
                                        placeholder="+251..."
                                        className="admin-input"
                                        value={addForm.phone}
                                        onChange={e => setAddForm({ ...addForm, phone: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Password</label>
                                    <input
                                        type="password"
                                        placeholder="Min 6 characters"
                                        className="admin-input"
                                        value={addForm.password}
                                        onChange={e => setAddForm({ ...addForm, password: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Role Selection */}
                            <div className="grid grid-cols-2 gap-4">
                                <div
                                    onClick={() => setAddForm(prev => ({ ...prev, role: 'admin' }))}
                                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${addForm.role === 'admin'
                                            ? 'border-indigo-600 bg-indigo-50'
                                            : 'border-gray-100 bg-white hover:border-gray-200'
                                        }`}
                                >
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className={`p-2 rounded-lg ${addForm.role === 'admin' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                                            <HiShieldCheck className="text-xl" />
                                        </div>
                                        <span className="font-bold text-sm text-gray-800 uppercase">Administrator</span>
                                    </div>
                                    <p className="text-[10px] text-gray-500 font-medium">Standard admin with granular permissions.</p>
                                </div>

                                <div
                                    onClick={() => setAddForm(prev => ({ ...prev, role: 'superadmin' }))}
                                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${addForm.role === 'superadmin'
                                            ? 'border-indigo-600 bg-indigo-50'
                                            : 'border-gray-100 bg-white hover:border-gray-200'
                                        }`}
                                >
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className={`p-2 rounded-lg ${addForm.role === 'superadmin' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                                            <HiOutlineShieldExclamation className="text-xl" />
                                        </div>
                                        <span className="font-bold text-sm text-gray-800 uppercase">Super Admin</span>
                                    </div>
                                    <p className="text-[10px] text-gray-500 font-medium">Full system access. Bypasses all checks.</p>
                                </div>
                            </div>

                            {/* Permissions Grid */}
                            {addForm.role === 'admin' && (
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Initial Permissions</label>
                                        <button
                                            type="button"
                                            onClick={() => setAddForm(prev => ({
                                                ...prev,
                                                permissions: prev.permissions.length === ALL_PERMISSIONS.length ? [] : ALL_PERMISSIONS.map(p => p.id)
                                            }))}
                                            className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 uppercase"
                                        >
                                            {addForm.permissions.length === ALL_PERMISSIONS.length ? 'Revoke All' : 'Grant All Access'}
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {ALL_PERMISSIONS.map(permission => (
                                            <div
                                                key={permission.id}
                                                onClick={() => {
                                                    setAddForm(prev => {
                                                        const permissions = prev.permissions.includes(permission.id)
                                                            ? prev.permissions.filter(p => p !== permission.id)
                                                            : [...prev.permissions, permission.id];
                                                        return { ...prev, permissions };
                                                    });
                                                }}
                                                className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${addForm.permissions.includes(permission.id)
                                                        ? 'border-indigo-100 bg-indigo-50/50'
                                                        : 'border-gray-50 bg-gray-50/30 hover:bg-gray-50'
                                                    }`}
                                            >
                                                <div className={`mt-0.5 w-5 h-5 rounded flex items-center justify-center border transition-all ${addForm.permissions.includes(permission.id)
                                                        ? 'bg-indigo-600 border-indigo-600 text-white'
                                                        : 'bg-white border-gray-200'
                                                    }`}>
                                                    {addForm.permissions.includes(permission.id) && <HiCheck className="text-xs" />}
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-gray-800">{permission.label}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="pt-6 border-t border-gray-100 flex gap-3 shrink-0">
                                <button type="button" onClick={() => setIsAddingAdmin(false)} className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-bold text-xs uppercase hover:bg-gray-50">Cancel</button>
                                <button type="submit" className="flex-1 py-3 rounded-xl bg-indigo-600 text-white font-bold text-xs uppercase hover:bg-indigo-700 shadow-lg shadow-indigo-200">Create Admin</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
