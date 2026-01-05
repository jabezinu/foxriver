import { useState, useEffect } from 'react';
import { adminReferralAPI } from '../services/api';
import { toast } from 'react-hot-toast';
import { HiCog, HiSave } from 'react-icons/hi';
import Loading from '../components/Loading';

export default function ReferralSettings() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState({
        commissionPercentA: 10,
        commissionPercentB: 5,
        commissionPercentC: 2,
        maxReferralsPerUser: 0,
        salaryDirect15Threshold: 15,
        salaryDirect15Amount: 15000,
        salaryDirect20Threshold: 20,
        salaryDirect20Amount: 20000,
        salaryNetwork40Threshold: 40,
        salaryNetwork40Amount: 48000
    });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await adminReferralAPI.getSettings();
            setSettings(res.data.settings);
        } catch (error) {
            toast.error('Failed to fetch settings');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
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

    if (loading) return <Loading />;

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center gap-3">
                <div className="p-3 bg-indigo-100 rounded-2xl">
                    <HiCog className="text-2xl text-indigo-600" />
                </div>
                <h1 className="text-2xl font-bold text-gray-800">Referral System Settings</h1>
            </div>

            <form onSubmit={handleSave} className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-8">
                <div className="space-y-6">
                    <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Commission Percentages</h2>

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
                    <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Monthly Salary Settings</h2>

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
    );
}
