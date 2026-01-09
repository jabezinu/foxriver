import { useState, useEffect } from 'react';
import { adminReferralAPI } from '../services/api';
import { toast } from 'react-hot-toast';
import { 
    HiCurrencyDollar, HiUserGroup, HiTrendingUp, HiSearch, 
    HiCog, HiSave, HiAdjustments, HiChartBar 
} from 'react-icons/hi';
import Loading from '../components/Loading';

export default function ReferralManagement() {
    const [activeTab, setActiveTab] = useState('commissions');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [commissions, setCommissions] = useState([]);
    const [search, setSearch] = useState('');
    const [settings, setSettings] = useState({
        commissionPercentA: 10,
        commissionPercentB: 5,
        commissionPercentC: 2,
        maxReferralsPerUser: 0,
        salaryDirect15Threshold: 15,
        salaryDirect15Amount: 15000,
        salaryDirect20Threshold: 20,
        salaryDirect20Amount: 20000,
        salaryDirect10Threshold: 10,
        salaryDirect10Amount: 10000,
        salaryNetwork40Threshold: 40,
        salaryNetwork40Amount: 48000
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [commissionsRes, settingsRes] = await Promise.all([
                adminReferralAPI.getCommissions(),
                adminReferralAPI.getSettings()
            ]);
            setCommissions(commissionsRes.data.commissions);
            setSettings(settingsRes.data.settings);
        } catch (error) {
            toast.error('Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveSettings = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await adminReferralAPI.updateSettings(settings);
            toast.success('Settings updated successfully');
        } catch (error) {
            toast.error('Failed to update settings');
        } finally {
            setSaving(false);
        }
    };

    const filteredCommissions = commissions.filter(c =>
        c.user?.phone?.includes(search) ||
        c.downlineUser?.phone?.includes(search) ||
        c.level?.includes(search)
    );

    const totalEarned = commissions.reduce((sum, c) => sum + c.amountEarned, 0);

    if (loading) return <Loading />;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <h1 className="text-2xl font-bold text-gray-800">Referral Management</h1>
                
                {/* Tab Navigation */}
                <div className="flex bg-gray-100 p-1 rounded-xl">
                    <button
                        onClick={() => setActiveTab('commissions')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                            activeTab === 'commissions'
                                ? 'bg-white text-indigo-600 shadow-sm'
                                : 'text-gray-600 hover:text-gray-800'
                        }`}
                    >
                        <HiChartBar className="text-lg" />
                        Commissions
                    </button>
                    <button
                        onClick={() => setActiveTab('settings')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                            activeTab === 'settings'
                                ? 'bg-white text-indigo-600 shadow-sm'
                                : 'text-gray-600 hover:text-gray-800'
                        }`}
                    >
                        <HiAdjustments className="text-lg" />
                        Settings
                    </button>
                </div>
            </div>

            {activeTab === 'commissions' && (
                <div className="space-y-6">
                    {/* Search */}
                    <div className="flex justify-end">
                        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border shadow-sm">
                            <HiSearch className="text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search phone or level..."
                                className="outline-none text-sm w-48"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-green-100 rounded-xl">
                                    <HiCurrencyDollar className="text-2xl text-green-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 uppercase font-semibold">Total Paid</p>
                                    <h3 className="text-2xl font-bold">{totalEarned.toLocaleString()} ETB</h3>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-blue-100 rounded-xl">
                                    <HiUserGroup className="text-2xl text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 uppercase font-semibold">Total Transactions</p>
                                    <h3 className="text-2xl font-bold">{commissions.length}</h3>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-purple-100 rounded-xl">
                                    <HiTrendingUp className="text-2xl text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 uppercase font-semibold">Today's Commissions</p>
                                    <h3 className="text-2xl font-bold">
                                        {commissions.filter(c => new Date(c.createdAt).toDateString() === new Date().toDateString())
                                            .reduce((sum, c) => sum + c.amountEarned, 0).toLocaleString()} ETB
                                    </h3>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Commissions Table */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 uppercase text-xs font-bold tracking-wider">
                                        <th className="px-6 py-4">Inviter (Earnings)</th>
                                        <th className="px-6 py-4">Invitee (Source)</th>
                                        <th className="px-6 py-4">Level</th>
                                        <th className="px-6 py-4">Amount</th>
                                        <th className="px-6 py-4">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50 font-medium">
                                    {filteredCommissions.map((c) => (
                                        <tr key={c._id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <p className="text-gray-800">{c.user?.phone}</p>
                                                <p className="text-xs text-gray-500">Level: {c.user?.membershipLevel}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-gray-800">{c.downlineUser?.phone}</p>
                                                <p className="text-xs text-blue-500">{c.sourceMembership || 'Task Completion'}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                                                    c.level === 'A' ? 'bg-green-100 text-green-700' :
                                                    c.level === 'B' ? 'bg-blue-100 text-blue-700' :
                                                    'bg-purple-100 text-purple-700'
                                                }`}>
                                                    Level {c.level}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-green-600 font-bold">
                                                +{c.amountEarned.toLocaleString()} ETB
                                            </td>
                                            <td className="px-6 py-4 text-gray-500 text-sm">
                                                {new Date(c.createdAt).toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredCommissions.length === 0 && (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-10 text-center text-gray-500 italic">
                                                No commissions found
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'settings' && (
                <div className="max-w-2xl mx-auto space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-indigo-100 rounded-2xl">
                            <HiCog className="text-2xl text-indigo-600" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-800">Referral System Settings</h2>
                    </div>

                    <form onSubmit={handleSaveSettings} className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-8">
                        <div className="space-y-6">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Commission Percentages</h3>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Level A (Direct)</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                            value={settings.commissionPercentA}
                                            onChange={(e) => setSettings({ ...settings, commissionPercentA: Number(e.target.value) })}
                                            required
                                        />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">%</span>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Level B</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                            value={settings.commissionPercentB}
                                            onChange={(e) => setSettings({ ...settings, commissionPercentB: Number(e.target.value) })}
                                            required
                                        />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">%</span>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Level C</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                            value={settings.commissionPercentC}
                                            onChange={(e) => setSettings({ ...settings, commissionPercentC: Number(e.target.value) })}
                                            required
                                        />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">%</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6 pt-6 border-t border-gray-50">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Monthly Salary Settings</h3>

                            <div className="space-y-8">
                                {/* Rule 1: Lower Direct */}
                                <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100 space-y-4">
                                    <p className="text-xs font-bold text-indigo-600 uppercase tracking-tighter">Rule 1: Lower Direct Threshold</p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Threshold (Invites)</label>
                                            <input
                                                type="number"
                                                className="w-full px-4 py-2 text-sm rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                                                value={settings.salaryDirect15Threshold}
                                                onChange={(e) => setSettings({ ...settings, salaryDirect15Threshold: Number(e.target.value) })}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Amount (ETB)</label>
                                            <input
                                                type="number"
                                                className="w-full px-4 py-2 text-sm rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                                                value={settings.salaryDirect15Amount}
                                                onChange={(e) => setSettings({ ...settings, salaryDirect15Amount: Number(e.target.value) })}
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Rule 2: Higher Direct */}
                                <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100 space-y-4">
                                    <p className="text-xs font-bold text-indigo-600 uppercase tracking-tighter">Rule 2: Higher Direct Threshold</p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Threshold (Invites)</label>
                                            <input
                                                type="number"
                                                className="w-full px-4 py-2 text-sm rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                                                value={settings.salaryDirect20Threshold}
                                                onChange={(e) => setSettings({ ...settings, salaryDirect20Threshold: Number(e.target.value) })}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Amount (ETB)</label>
                                            <input
                                                type="number"
                                                className="w-full px-4 py-2 text-sm rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                                                value={settings.salaryDirect20Amount}
                                                onChange={(e) => setSettings({ ...settings, salaryDirect20Amount: Number(e.target.value) })}
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Rule 3: Network */}
                                <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100 space-y-4">
                                    <p className="text-xs font-bold text-purple-600 uppercase tracking-tighter">Rule 3: Total Network Threshold (A+B+C)</p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Threshold (Users)</label>
                                            <input
                                                type="number"
                                                className="w-full px-4 py-2 text-sm rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                                                value={settings.salaryNetwork40Threshold}
                                                onChange={(e) => setSettings({ ...settings, salaryNetwork40Threshold: Number(e.target.value) })}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Amount (ETB)</label>
                                            <input
                                                type="number"
                                                className="w-full px-4 py-2 text-sm rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                                                value={settings.salaryNetwork40Amount}
                                                onChange={(e) => setSettings({ ...settings, salaryNetwork40Amount: Number(e.target.value) })}
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Rule 4: Fourth Direct Threshold (identical to Rule 1) */}
                                <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100 space-y-4">
                                    <p className="text-xs font-bold text-indigo-600 uppercase tracking-tighter">Rule 4: Fourth Direct Threshold</p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Threshold (Invites)</label>
                                            <input
                                                type="number"
                                                className="w-full px-4 py-2 text-sm rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                                                value={settings.salaryDirect10Threshold}
                                                onChange={(e) => setSettings({ ...settings, salaryDirect10Threshold: Number(e.target.value) })}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Amount (ETB)</label>
                                            <input
                                                type="number"
                                                className="w-full px-4 py-2 text-sm rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                                                value={settings.salaryDirect10Amount}
                                                onChange={(e) => setSettings({ ...settings, salaryDirect10Amount: Number(e.target.value) })}
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={saving}
                            className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 disabled:opacity-50"
                        >
                            <HiSave className="text-xl" />
                            {saving ? 'Saving Changes...' : 'Save Settings'}
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}
