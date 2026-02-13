import { useState, useEffect } from 'react';
import { useAdminWealthStore } from '../store/wealthStore';
import { getServerUrl } from '../config/api.config';
import { toast } from 'react-hot-toast';
import { HiPlus, HiTrendingUp, HiUsers } from 'react-icons/hi';
import Loading from '../components/Loading';
import ConfirmModal from '../components/ConfirmModal';
import PageHeader from '../components/shared/PageHeader';
import WealthFundModal from '../components/WealthFundModal';
import WealthFundsList from '../components/WealthFundsList';
import InvestmentsList from '../components/InvestmentsList';

export default function WealthFunds() {
    const { 
        funds, 
        investments, 
        loading, 
        fetchFunds, 
        fetchInvestments, 
        createFund, 
        updateFund, 
        deleteFund 
    } = useAdminWealthStore();
    const [activeTab, setActiveTab] = useState('funds'); // 'funds' or 'investments'
    const [showModal, setShowModal] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const [editingFund, setEditingFund] = useState(null);

    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [formData, setFormData] = useState({
        name: '', days: '', profitType: 'percentage', dailyProfit: '', minimumDeposit: '', description: '', isActive: true
    });

    useEffect(() => {
        if (activeTab === 'funds') fetchFunds();
        else fetchInvestments();
    }, [activeTab, fetchFunds, fetchInvestments]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = new FormData();
        Object.keys(formData).forEach(key => data.append(key, formData[key]));
        if (selectedFile) data.append('image', selectedFile);

        let res;
        if (editingFund) {
            res = await updateFund(editingFund._id, data);
        } else {
            if (!selectedFile) return toast.error('Image required');
            res = await createFund(data);
        }

        if (res.success) {
            toast.success(editingFund ? 'Fund updated' : 'Fund created');
            handleCloseModal();
        } else {
            toast.error(res.message);
        }
    };

    const handleDelete = async () => {
        const res = await deleteFund(deleteId);
        if (res.success) {
            toast.success('Fund deleted');
        } else {
            toast.error(res.message);
        }
        setDeleteId(null);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingFund(null);
        setSelectedFile(null);
        setPreviewUrl(null);
        setFormData({ name: '', days: '', profitType: 'percentage', dailyProfit: '', minimumDeposit: '', description: '', isActive: true });
    };

    const renderImageUrl = (image) => {
        if (!image) return null;
        return image.startsWith('http') ? image : `${getServerUrl()}${image}`;
    };

    return (
        <div className="animate-fadeIn">
            <ConfirmModal
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={handleDelete}
                title="Delete Wealth Fund"
                message="Critical: Are you sure you want to remove this fund?"
                isDangerous={true}
            />

            <PageHeader
                title="Wealth Management"
                subtitle="Manage investment funds and monitor user participation."
                extra={activeTab === 'funds' && (
                    <button onClick={() => setShowModal(true)} className="admin-btn-primary flex items-center gap-2">
                        <HiPlus /> Create New Fund
                    </button>
                )}
            />

            <div className="flex bg-white p-1 rounded-xl shadow-sm border border-gray-100 mb-8 max-w-sm">
                <button
                    onClick={() => setActiveTab('funds')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${activeTab === 'funds' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-400'}`}
                >
                    <HiTrendingUp /> Wealth Funds
                </button>
                <button
                    onClick={() => setActiveTab('investments')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${activeTab === 'investments' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-400'}`}
                >
                    <HiUsers /> Investments
                </button>
            </div>

            {loading ? (
                <div className="h-64 flex items-center justify-center"><Loading /></div>
            ) : activeTab === 'funds' ? (
                <WealthFundsList
                    funds={funds}
                    renderImageUrl={renderImageUrl}
                    onEdit={(fund) => {
                        setEditingFund(fund);
                        setFormData({
                            name: fund.name, days: fund.days, profitType: fund.profitType,
                            dailyProfit: fund.dailyProfit, minimumDeposit: fund.minimumDeposit,
                            description: fund.description, isActive: fund.isActive
                        });
                        if (fund.image) setPreviewUrl(renderImageUrl(fund.image));
                        setShowModal(true);
                    }}
                    onDelete={setDeleteId}
                />
            ) : (
                <InvestmentsList investments={investments} renderImageUrl={renderImageUrl} />
            )}

            <WealthFundModal
                isOpen={showModal}
                fund={editingFund}
                form={formData}
                onChange={setFormData}
                onClose={handleCloseModal}
                onSave={handleSubmit}
                onFileChange={handleFileChange}
                previewUrl={previewUrl}
            />
        </div>
    );
}
