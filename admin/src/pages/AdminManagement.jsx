import { useState, useEffect } from 'react';
import { useAdminManagementStore } from '../store/adminStore';
import { HiPlus } from 'react-icons/hi';
import { toast } from 'react-hot-toast';
import ConfirmModal from '../components/ConfirmModal';
import { useAdminAuthStore } from '../store/authStore';
import PageHeader from '../components/shared/PageHeader';
import AdminTable from '../components/AdminTable';
import AdminAccessModal from '../components/AdminAccessModal';

export default function AdminManagement() {
    const { admin: currentAdmin } = useAdminAuthStore();
    const { admins, loading, fetchAdmins, createAdmin, updatePermissions, deleteAdmin } = useAdminManagementStore();
    const [editingAdmin, setEditingAdmin] = useState(null);
    const [deleteId, setDeleteId] = useState(null);
    const [isAddingAdmin, setIsAddingAdmin] = useState(false);

    const [modalForm, setModalForm] = useState({
        phone: '', password: '', role: 'admin', permissions: []
    });

    useEffect(() => { fetchAdmins(); }, [fetchAdmins]);

    const handleOpenEdit = (admin) => {
        setEditingAdmin(admin);
        setModalForm({
            phone: admin.phone, password: '',
            role: admin.role, permissions: admin.permissions || []
        });
    };

    const handleOpenAdd = () => {
        setIsAddingAdmin(true);
        setModalForm({ phone: '', password: '', role: 'admin', permissions: [] });
    };

    const handleSyncPermissions = async (e) => {
        e.preventDefault();
        let res;
        if (editingAdmin) {
            res = await updatePermissions(editingAdmin.id, {
                role: modalForm.role, permissions: modalForm.permissions
            });
        } else {
            res = await createAdmin(modalForm);
        }

        if (res.success) {
            toast.success(editingAdmin ? 'Clearance Updated' : 'Personnel Authorized');
            setEditingAdmin(null);
            setIsAddingAdmin(false);
        } else {
            toast.error(res.message);
        }
    };

    const confirmDelete = async () => {
        const res = await deleteAdmin(deleteId);
        if (res.success) {
            toast.success('Access Revoked');
        } else {
            toast.error(res.message);
        }
        setDeleteId(null);
    };

    return (
        <div className="animate-fadeIn">
            <ConfirmModal
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={confirmDelete}
                title="Revoke Personnel Access"
                message="This action will immediately terminate the subject's access to the terminal matrix. Recovery is not possible without re-authorization."
                isDangerous
            />

            <PageHeader
                title="Personnel Oversight"
                subtitle="Designate clearance levels and manage granular access protocols for the administrative core."
                extra={
                    <button onClick={handleOpenAdd} className="admin-btn-primary flex items-center gap-2">
                        <HiPlus className="text-xl" /> Authorized New Entry
                    </button>
                }
            />

            <AdminTable
                admins={admins}
                currentAdminId={currentAdmin?.id}
                onEdit={handleOpenEdit}
                onDelete={setDeleteId}
                loading={loading}
            />

            <AdminAccessModal
                isOpen={!!editingAdmin || isAddingAdmin}
                admin={editingAdmin}
                form={modalForm}
                onChange={setModalForm}
                onClose={() => { setEditingAdmin(null); setIsAddingAdmin(false); }}
                onSave={handleSyncPermissions}
            />
        </div>
    );
}
