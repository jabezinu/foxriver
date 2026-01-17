import { useState, useEffect } from 'react';
import { adminBankAPI } from '../services/api';
import { toast } from 'react-hot-toast';
import { HiPlus } from 'react-icons/hi';
import Loading from '../components/Loading';
import PageHeader from '../components/shared/PageHeader';
import BankCard from '../components/BankCard';
import BankAccountModal from '../components/BankAccountModal';

export default function BankSettings() {
    const [banks, setBanks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBank, setEditingBank] = useState(null);
    const [formData, setFormData] = useState({
        bankName: '', accountNumber: '', accountHolderName: '', serviceType: 'Bank', isActive: true
    });

    useEffect(() => { fetchBanks(); }, []);

    const fetchBanks = async () => {
        setLoading(true);
        try {
            const res = await adminBankAPI.getAll();
            setBanks(res.data.data);
        } catch (error) { toast.error('Communication Link Failure'); }
        finally { setLoading(false); }
    };

    const handleOpenModal = (bank = null) => {
        if (bank) {
            setEditingBank(bank);
            setFormData({
                bankName: bank.bankName,
                accountNumber: bank.accountNumber,
                accountHolderName: bank.accountHolderName,
                serviceType: bank.serviceType || 'Bank',
                isActive: bank.isActive
            });
        } else {
            setEditingBank(null);
            setFormData({
                bankName: '', accountNumber: '', accountHolderName: '', serviceType: 'Bank', isActive: true
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingBank) {
                await adminBankAPI.update(editingBank.id, formData);
                toast.success('Protocol Parameters Re-linked');
            } else {
                await adminBankAPI.create(formData);
                toast.success('New Financial Node Deployed');
            }
            setIsModalOpen(false);
            fetchBanks();
        } catch (error) { toast.error('Command Execution Failure'); }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Initiate termination of this financial node? This will sever the deposit relay.')) {
            try {
                await adminBankAPI.delete(id);
                toast.success('Node Decommissioned');
                fetchBanks();
            } catch (error) { toast.error('Termination Aborted'); }
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
