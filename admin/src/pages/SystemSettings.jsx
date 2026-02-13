import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { HiRefresh, HiShieldExclamation, HiLightningBolt } from 'react-icons/hi';
import { useSystemStore } from '../store/systemStore';
import PageHeader from '../components/shared/PageHeader';
import SalaryPanel from '../components/SalaryPanel';
import ControlTogglePanel from '../components/ControlTogglePanel';
import SystemInfoPanel from '../components/SystemInfoPanel';
import WalletAssignmentPanel from '../components/WalletAssignmentPanel';


export default function SystemSettings() {
    const { settings, loading, fetchSettings, updateSettings, processSalaries } = useSystemStore();
    const [updating, setUpdating] = useState(false);
    const [processingSalaries, setProcessingSalaries] = useState(false);

    useEffect(() => { fetchSettings(); }, [fetchSettings]);

    const toggleTasks = async () => {
        const newValue = !settings?.tasksDisabled;
        setUpdating(true);
        const res = await updateSettings({ tasksDisabled: newValue });
        if (res.success) {
            toast.success(`Protocol ${newValue ? 'Halted' : 'Resumed'}`);
        } else {
            toast.error(res.message);
        }
        setUpdating(false);
    };

    const toggleFrontend = async () => {
        const newValue = !settings?.frontendDisabled;
        setUpdating(true);
        const res = await updateSettings({ frontendDisabled: newValue });
        if (res.success) {
            toast.success(`Gateway ${newValue ? 'Severed' : 'Restored'}`);
        } else {
            toast.error(res.message);
        }
        setUpdating(false);
    };

    const handleUpdateSettings = async (data) => {
        setUpdating(true);
        const res = await updateSettings(data);
        if (res.success) {
            toast.success('Core Protocols Updated');
        } else {
            toast.error(res.message);
        }
        setUpdating(false);
    };

    const handleProcessSalaries = async () => {
        setProcessingSalaries(true);
        const res = await processSalaries();
        if (res.success) {
            toast.success(`Disbursement Complete: ${res.data.totalPaid} ETB`);
        } else {
            toast.error(res.message);
        }
        setProcessingSalaries(false);
    };

    if (loading) {
        return (
            <div className="p-32 flex flex-col items-center justify-center text-gray-400">
                <div className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-600 rounded-full animate-spin mb-6"></div>
                <p className="font-black uppercase tracking-[0.3em] text-[10px]">Accessing Core Registry...</p>
            </div>
        );
    }

    if (!settings) {
        return (
            <div className="animate-fadeIn p-8 max-w-2xl mx-auto my-20">
                <div className="bg-rose-50 border-2 border-rose-100 rounded-3xl p-10 text-center space-y-6">
                    <div className="w-20 h-20 bg-rose-100 rounded-full flex items-center justify-center mx-auto shadow-xl shadow-rose-100">
                        <HiShieldExclamation className="text-4xl text-rose-600" />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-rose-900 uppercase tracking-widest mb-2">Registry Offline</h3>
                        <p className="text-sm text-rose-600/80 font-bold leading-relaxed uppercase">The local matrix cannot establish a secure uplink with the database core. Ensure system services are active.</p>
                    </div>
                    <button onClick={fetchSettings} className="bg-rose-600 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-rose-700 transition-all flex items-center gap-2 mx-auto">
                        <HiRefresh className="text-lg" /> Initiate Re-Link
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="animate-fadeIn space-y-8">
            <PageHeader
                title="System Core Matrix"
                subtitle="High-level operational control and global configuration oversight."
                extra={
                    <button onClick={fetchSettings} className="admin-btn-secondary flex items-center gap-2">
                        <HiRefresh /> Re-Sync
                    </button>
                }
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-8">
                    <ControlTogglePanel
                        settings={settings}
                        onToggleFrontend={toggleFrontend}
                        onToggleTasks={toggleTasks}
                        updating={updating}
                    />
                    <WalletAssignmentPanel
                        settings={settings}
                        onUpdate={handleUpdateSettings}
                        updating={updating}
                    />
                </div>

                <div className="space-y-8">
                    <SalaryPanel
                        onProcess={handleProcessSalaries}
                        processing={processingSalaries}
                    />
                    <SystemInfoPanel settings={settings} />
                </div>
            </div>
        </div>
    );
}
