import { useState, useEffect } from 'react';
import { useAdminBankStore } from '../store/bankStore';
import { toast } from 'react-hot-toast';
import { HiPlus } from 'react-icons/hi';
import Loading from '../components/Loading';
import PageHeader from '../components/shared/PageHeader';
import BankCard from '../components/BankCard';
import BankAccountModal from '../components/BankAccountModal';

export default function BankSettings() {
    const { banks, loading, fetchBanks, createBank, updateBank, deleteBank } = useAdminBankStore();
    const [submitting, setSubmitting] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        bankName: '', accountNumber: '', accountHolderName: '', serviceType: 'Bank', isActive: true
    });

    useEffect(() => { fetchBanks(); }, [fetchBanks]);

    const resetForm = () => {
        setEditingId(null);
        setFormData({
            bankName: '', accountNumber: '', accountHolderName: '', serviceType: 'Bank', isActive: true
        });
    };

    const handleOpenModal = (bank = null) => {
        if (bank) {
            setEditingId(bank.id);
            setFormData({
                bankName: bank.bankName,
                accountNumber: bank.accountNumber,
                accountHolderName: bank.accountHolderName,
                serviceType: bank.serviceType || 'Bank',
                isActive: bank.isActive
            });
        } else {
            resetForm();
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        let res;
        if (editingId) {
            res = await updateBank(editingId, formData);
        } else {
            res = await createBank(formData);
        }

        if (res.success) {
            toast.success(editingId ? 'Protocol Parameters Re-linked' : 'New Financial Node Deployed');
            setIsModalOpen(false);
            resetForm();
        } else {
            toast.error(res.message || 'Command Execution Failure');
        }
        setSubmitting(false);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Deactivate this financial node? It will be hidden from users but historical data will be preserved.')) {
            const res = await deleteBank(id);
            if (res.success) {
                toast.success('Node Deactivated Successfully');
            } else {
                toast.error(res.message);
            }
        }
    };

    const handleReactivate = async (id) => {
        if (window.confirm('Reactivate this financial node? It will become available for deposits again.')) {
            const bank = banks.find(b => b.id === id);
            const res = await updateBank(id, { ...bank, isActive: true });
            if (res.success) {
                toast.success('Node Reactivated Successfully');
            } else {
                toast.error(res.message);
            }
        }
    };

    if (loading) return <Loading />;

    return (
        <div className="animate-fadeIn space-y-8">
            <PageHeader
                title="Financial Node Topology"
                subtitle="Configure and monitor administrative bank accounts for global capital intake."
                extra={
                    <button onClick={() => handleOpenModal()} className="admin-btn-primary flex items-center gap-2">
                        <HiPlus /> Register Node
                    </button>
                }
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {banks.map((bank) => (
                    <BankCard
                        key={bank.id}
                        bank={bank}
                        onEdit={handleOpenModal}
                        onDelete={handleDelete}
                        onReactivate={handleReactivate}
                    />
                ))}
            </div>

            {banks.length === 0 && (
                <div className="py-24 text-center border-2 border-dashed border-gray-100 rounded-3xl flex flex-col items-center justify-center text-gray-300">
                    <p className="font-black uppercase tracking-[0.3em] text-[10px] mb-4">No active financial nodes in local matrix</p>
                    <button onClick={() => handleOpenModal()} className="text-indigo-600 font-black text-xs uppercase hover:underline">
                        Deploy Initial Gateway
                    </button>
                </div>
            )}

            <BankAccountModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                bank={editingBank}
                formData={formData}
                onChange={setFormData}
                onSubmit={handleSubmit}
            />
        </div>
    );
}
