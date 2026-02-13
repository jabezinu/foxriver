import { useState, useEffect } from 'react';
import { useAdminReferralStore } from '../store/referralStore';
import { toast } from 'react-hot-toast';
import { HiSearch, HiAdjustments, HiChartBar } from 'react-icons/hi';
import Loading from '../components/Loading';
import PageHeader from '../components/shared/PageHeader';
import ReferralStats from '../components/ReferralStats';
import CommissionTable from '../components/CommissionTable';
import ReferralSettingsForm from '../components/ReferralSettingsForm';

export default function ReferralManagement() {
    const { commissions, settings, loading, fetchData, updateSettings } = useAdminReferralStore();
    const [activeTab, setActiveTab] = useState('commissions');
    const [saving, setSaving] = useState(false);
    const [search, setSearch] = useState('');
    const [localSettings, setLocalSettings] = useState(settings);

    useEffect(() => {
        setLocalSettings(settings);
    }, [settings]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleSaveSettings = async (e) => {
        e.preventDefault();
        setSaving(true);
        const res = await updateSettings(localSettings);
        if (res.success) {
            toast.success('System Parameters Synchronized');
        } else {
            toast.error(res.message);
        }
        setSaving(false);
    };

    const filteredCommissions = commissions.filter(c =>
        c.user?.phone?.includes(search) ||
        c.downlineUser?.phone?.includes(search) ||
        c.level?.includes(search)
    );

    if (loading) return <Loading />;

    return (
        <div className="animate-fadeIn">
            <PageHeader
                title="Affiliate Network Oversight"
                subtitle="Monitor commission velocity and configure multi-level incentive protocols."
                extra={
                    <div className="flex bg-gray-100 p-1.5 rounded-2xl shadow-inner border border-gray-200">
                        <TabButton
                            active={activeTab === 'commissions'}
                            onClick={() => setActiveTab('commissions')}
                            icon={<HiChartBar />}
                            label="Commissions"
                        />
                        <TabButton
                            active={activeTab === 'settings'}
                            onClick={() => setActiveTab('settings')}
                            icon={<HiAdjustments />}
                            label="Protocols"
                        />
                    </div>
                }
            />

            {activeTab === 'commissions' ? (
                <div className="space-y-8">
                    <ReferralStats commissions={commissions} />

                    <div className="flex justify-end">
                        <div className="relative group max-w-sm w-full">
                            <HiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="Filter by phone or tier level..."
                                className="admin-input pl-12 bg-white border-gray-200 shadow-sm"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    <CommissionTable commissions={filteredCommissions} />
                </div>
            ) : (
                <ReferralSettingsForm
                    settings={localSettings}
                    onChange={setLocalSettings}
                    onSave={handleSaveSettings}
                    saving={saving}
                />
            )}
        </div>
    );
}

function TabButton({ active, onClick, icon, label }) {
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-2 px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${active ? 'bg-white text-indigo-600 shadow-md border border-gray-100' : 'text-gray-400 hover:text-gray-600'
                }`}
        >
            <span className="text-lg">{icon}</span>
            {label}
        </button>
    );
}
