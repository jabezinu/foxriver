import { useState, useEffect } from 'react';
import { adminManagementAPI } from '../services/api';
import { HiPlus } from 'react-icons/hi';
import { toast } from 'react-hot-toast';
import ConfirmModal from '../components/ConfirmModal';
import { useAdminAuthStore } from '../store/authStore';
import PageHeader from '../components/shared/PageHeader';
import AdminTable from '../components/AdminTable';
import AdminAccessModal from '../components/AdminAccessModal';

export default function AdminManagement() {
    const { admin: currentAdmin } = useAdminAuthStore();
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingAdmin, setEditingAdmin] = useState(null);
    const [deleteId, setDeleteId] = useState(null);
    const [isAddingAdmin, setIsAddingAdmin] = useState(false);

    const [modalForm, setModalForm] = useState({
        phone: '', password: '', role: 'admin', permissions: []
    });

    useEffect(() => { fetchAdmins(); }, []);

    const fetchAdmins = async () => {
        setLoading(true);
        try {
            const res = await adminManagementAPI.getAdmins();
            setAdmins(res.data.admins);
        } catch (error) { toast.error('Registry Access Error'); } finally { setLoading(false); }
    };

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
        try {
            if (editingAdmin) {
                await adminManagementAPI.updatePermissions(editingAdmin.id, {
                    role: modalForm.role, permissions: modalForm.permissions
                });
                toast.success('Clearance Updated');
            } else {
                await adminManagementAPI.createAdmin(modalForm);
                toast.success('Personnel Authorized');
            }
            setEditingAdmin(null);
            setIsAddingAdmin(false);
            fetchAdmins();
        } catch (error) { toast.error(error.response?.data?.message || 'Uplink Interference'); }
    };

    const confirmDelete = async () => {
        try {
            await adminManagementAPI.deleteAdmin(deleteId);
            toast.success('Access Revoked');
            fetchAdmins();
        } catch (error) { toast.error('Command Rejected'); } finally { setDeleteId(null); }
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
