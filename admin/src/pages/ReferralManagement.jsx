import { useState, useEffect } from 'react';
import { adminReferralAPI } from '../services/api';
import { toast } from 'react-hot-toast';
import { HiSearch, HiAdjustments, HiChartBar } from 'react-icons/hi';
import Loading from '../components/Loading';
import PageHeader from '../components/shared/PageHeader';
import ReferralStats from '../components/ReferralStats';
import CommissionTable from '../components/CommissionTable';
import ReferralSettingsForm from '../components/ReferralSettingsForm';

export default function ReferralManagement() {
    const [activeTab, setActiveTab] = useState('commissions');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [commissions, setCommissions] = useState([]);
    const [search, setSearch] = useState('');
    const [settings, setSettings] = useState({
        commissionPercentA: 10, commissionPercentB: 5, commissionPercentC: 2,
        upgradeCommissionPercentA: 10, upgradeCommissionPercentB: 5, upgradeCommissionPercentC: 2,
        maxReferralsPerUser: 0,
        salaryDirect15Threshold: 15, salaryDirect15Amount: 15000,
        salaryDirect20Threshold: 20, salaryDirect20Amount: 20000,
        salaryDirect10Threshold: 10, salaryDirect10Amount: 10000,
        salaryNetwork40Threshold: 40, salaryNetwork40Amount: 48000
    });

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [commRes, setRes] = await Promise.all([
                adminReferralAPI.getCommissions(),
                adminReferralAPI.getSettings()
            ]);
            setCommissions(commRes.data.commissions);
            setSettings(setRes.data.settings);
        } catch (error) {
            toast.error('Network Intelligence Offline');
        } finally { setLoading(false); }
    };

    const handleSaveSettings = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await adminReferralAPI.updateSettings(settings);
            toast.success('System Parameters Synchronized');
        } catch (error) {
            toast.error('Protocol Update Failed');
        } finally { setSaving(false); }
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
                    settings={settings}
                    onChange={setSettings}
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
