import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { adminSpinAPI, adminSlotTierAPI } from '../services/api';
import PageHeader from '../components/shared/PageHeader';
import SpinResults from '../components/SpinResults';
import SlotTiers from '../components/SlotTiers';
import SlotTierModal from '../components/SlotTierModal';

const SlotMachine = () => {
    const [activeTab, setActiveTab] = useState('results'); // 'results' or 'tiers'

    // Spin Results State
    const [spins, setSpins] = useState([]);
    const [stats, setStats] = useState(null);
    const [loadingSpins, setLoadingSpins] = useState(true);
    const [pagination, setPagination] = useState({ page: 1, limit: 50, total: 0, pages: 0 });
    const [filters, setFilters] = useState({ result: '', startDate: '', endDate: '' });

    // Slot Tiers State
    const [tiers, setTiers] = useState([]);
    const [loadingTiers, setLoadingTiers] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingTier, setEditingTier] = useState(null);
    const [formData, setFormData] = useState({
        name: '', betAmount: '', winAmount: '', winProbability: '10', description: '', order: '0'
    });

    useEffect(() => {
        if (activeTab === 'results') {
            fetchSpinResults();
        } else {
            fetchTiers();
        }
    }, [activeTab, pagination.page, filters]);

    const fetchSpinResults = async () => {
        setLoadingSpins(true);
        try {
            const params = { page: pagination.page, limit: pagination.limit, ...filters };
            const response = await adminSpinAPI.getAllSpins(params);
            setSpins(response.data.data.spins);
            setStats(response.data.data.stats);
            setPagination(prev => ({
                ...prev,
                total: response.data.data.pagination.total,
                pages: response.data.data.pagination.pages
            }));
        } catch (error) {
            toast.error('Failed to fetch slot machine data');
        } finally {
            setLoadingSpins(false);
        }
    };

    const fetchTiers = async () => {
        setLoadingTiers(true);
        try {
            const response = await adminSlotTierAPI.getAll();
            if (response.data.success) setTiers(response.data.data);
        } catch (error) {
            toast.error('Error fetching tiers');
        } finally {
            setLoadingTiers(false);
        }
    };

    const handleTierSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = editingTier
                ? await adminSlotTierAPI.update(editingTier.id || editingTier._id, formData)
                : await adminSlotTierAPI.create(formData);

            if (response.data.success) {
                toast.success(editingTier ? 'Tier updated' : 'Tier created');
                setShowModal(false);
                fetchTiers();
            } else {
                toast.error(response.data.message || 'Operation failed');
            }
        } catch (error) {
            toast.error('Error saving tier');
        }
    };

    const handleToggleTier = async (id) => {
        try {
            const response = await adminSlotTierAPI.toggle(id);
            if (response.data.success) {
                toast.success('Status updated');
                fetchTiers();
            }
        } catch (error) {
            toast.error('Error updating status');
        }
    };

    const exportToCSV = () => {
        const headers = ['Date', 'User Phone', 'Membership', 'Result', 'Paid', 'Won'];
        const rows = spins.map(spin => [
            new Date(spin.createdAt).toLocaleString(),
            spin.player?.phone || 'N/A',
            spin.player?.membershipLevel || 'N/A',
            spin.result,
            spin.amountPaid,
            spin.amountWon
        ]);

        const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `slot-results-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="animate-fadeIn">
            <PageHeader
                title="Gaming System"
                subtitle="Control slot machine betting tiers and monitor performance statistics."
            />

            <div className="bg-white rounded-2xl shadow-sm mb-8 overflow-hidden border border-gray-100 flex p-1">
                <button
                    onClick={() => setActiveTab('results')}
                    className={`flex-1 py-4 text-center font-bold text-xs uppercase tracking-widest rounded-xl transition-all ${activeTab === 'results' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    📊 Spin Results
                </button>
                <button
                    onClick={() => setActiveTab('tiers')}
                    className={`flex-1 py-4 text-center font-bold text-xs uppercase tracking-widest rounded-xl transition-all ${activeTab === 'tiers' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    🎯 Betting Tiers
                </button>
            </div>

            {activeTab === 'results' ? (
                <SpinResults
                    spins={spins}
                    stats={stats}
                    loading={loadingSpins}
                    pagination={pagination}
                    setPagination={setPagination}
                    filters={filters}
                    onFilterChange={(e) => {
                        const { name, value } = e.target;
                        setFilters(prev => ({ ...prev, [name]: value }));
                        setPagination(prev => ({ ...prev, page: 1 }));
                    }}
                    onClearFilters={() => {
                        setFilters({ result: '', startDate: '', endDate: '' });
                        setPagination(prev => ({ ...prev, page: 1 }));
                    }}
                    onRefresh={fetchSpinResults}
                    onExport={exportToCSV}
                />
            ) : (
                <SlotTiers
                    tiers={tiers}
                    loading={loadingTiers}
                    onCreate={() => {
                        setEditingTier(null);
                        setFormData({ name: '', betAmount: '', winAmount: '', winProbability: '10', description: '', order: '0' });
                        setShowModal(true);
                    }}
                    onEdit={(tier) => {
                        setEditingTier(tier);
                        setFormData({
                            name: tier.name, betAmount: tier.betAmount, winAmount: tier.winAmount,
                            winProbability: tier.winProbability, description: tier.description, order: tier.order
                        });
                        setShowModal(true);
                    }}
                    onDelete={async (id) => {
                        if (confirm('Delete this tier?')) {
                            try {
                                await adminSlotTierAPI.delete(id);
                                toast.success('Deleted');
                                fetchTiers();
                            } catch (e) { toast.error('Error'); }
                        }
                    }}
                    onToggle={handleToggleTier}
                />
            )}

            <SlotTierModal
                isOpen={showModal}
                tier={editingTier}
                form={formData}
                onChange={setFormData}
                onClose={() => setShowModal(false)}
                onSave={handleTierSubmit}
            />
        </div>
    );
};

export default SlotMachine;
