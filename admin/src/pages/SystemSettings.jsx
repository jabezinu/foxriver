import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { HiRefresh, HiShieldExclamation, HiLightningBolt } from 'react-icons/hi';
import { adminSystemAPI } from '../services/api';
import PageHeader from '../components/shared/PageHeader';
import SalaryPanel from '../components/SalaryPanel';
import ControlTogglePanel from '../components/ControlTogglePanel';
import SystemInfoPanel from '../components/SystemInfoPanel';
import BonusSettingsPanel from '../components/BonusSettingsPanel';

export default function SystemSettings() {
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [processingSalaries, setProcessingSalaries] = useState(false);

    useEffect(() => { fetchSettings(); }, []);

    const fetchSettings = async () => {
        setLoading(true);
        try {
            const response = await adminSystemAPI.getSettings();
            if (response.data.success) {
                setSettings(response.data.settings || response.data.data);
            } else { toast.error('Registry Access Error'); }
        } catch (error) { toast.error('Matrix Connection Lost'); }
        finally { setLoading(false); }
    };

    const toggleTasks = async () => {
        setUpdating(true);
        try {
            const response = await adminSystemAPI.updateSettings({ tasksDisabled: !settings?.tasksDisabled });
            if (response.data.success) {
                setSettings(response.data.settings || response.data.data);
                toast.success(`Protocol ${!settings?.tasksDisabled ? 'Halted' : 'Resumed'}`);
            }
        } catch (error) { toast.error('Command Failed'); }
        finally { setUpdating(false); }
    };

    const toggleFrontend = async () => {
        setUpdating(true);
        try {
            const response = await adminSystemAPI.updateSettings({ frontendDisabled: !settings?.frontendDisabled });
            if (response.data.success) {
                setSettings(response.data.settings || response.data.data);
                toast.success(`Gateway ${!settings?.frontendDisabled ? 'Severed' : 'Restored'}`);
            }
        } catch (error) { toast.error('Command Failed'); }
        finally { setUpdating(false); }
    };

    const processSalaries = async () => {
        setProcessingSalaries(true);
        try {
            const response = await adminSystemAPI.processSalaries();
            if (response.data.success) {
                toast.success(`Disbursement Complete: ${response.data.totalPaid} ETB`);
            } else { toast.error(response.data.message); }
        } catch (error) { toast.error('Uplink Interrupted'); }
        finally { setProcessingSalaries(false); }
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
                    <BonusSettingsPanel 
                        settings={settings} 
                        onSettingsUpdate={setSettings}
                    />
                </div>

                <div className="space-y-8">
                    <SalaryPanel
                        onProcess={processSalaries}
                        processing={processingSalaries}
                    />
                    <SystemInfoPanel settings={settings} />
                </div>
            </div>
        </div>
    );
}
