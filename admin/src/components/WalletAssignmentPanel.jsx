import { useState } from 'react';
import { HiLightningBolt, HiCurrencyDollar, HiBriefcase, HiRefresh } from 'react-icons/hi';

const WalletAssignmentPanel = ({ settings, onUpdate, updating }) => {
    const [localSettings, setLocalSettings] = useState({
        salaryWallet: settings?.salaryWallet || 'income',
        taskWallet: settings?.taskWallet || 'income',
        commissionWallet: settings?.commissionWallet || 'income',
        rankUpgradeRefundWallet: settings?.rankUpgradeRefundWallet || 'personal',
        spinWallet: settings?.spinWallet || 'income',
        depositWallet: settings?.depositWallet || 'personal'
    });

    const handleChange = (field, value) => {
        setLocalSettings(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = () => {
        onUpdate(localSettings);
    };

    const walletOptions = [
        { id: 'income', name: 'Income Wallet', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
        { id: 'personal', name: 'Personal Wallet', color: 'text-indigo-500', bg: 'bg-indigo-500/10' }
    ];

    const settingItems = [
        { 
            id: 'salaryWallet', 
            label: 'Salary Destination', 
            description: 'Where monthly user salaries are deposited.',
            icon: <HiBriefcase className="text-xl" />
        },
        { 
            id: 'taskWallet', 
            label: 'Task Reward Destination', 
            description: 'Where daily video task rewards are deposited.',
            icon: <HiLightningBolt className="text-xl" />
        },
        { 
            id: 'commissionWallet', 
            label: 'Commission Destination', 
            description: 'Where referral and upgrade commissions are deposited.',
            icon: <HiCurrencyDollar className="text-xl" />
        },
        { 
            id: 'rankUpgradeRefundWallet', 
            label: 'Rank Refund Destination', 
            description: 'Where previous rank refunds go during an upgrade.',
            icon: <HiRefresh className="text-xl" />
        },
        { 
            id: 'spinWallet', 
            label: 'Spin Reward Destination', 
            description: 'Where lucky wheel win rewards are deposited.',
            icon: <HiLightningBolt className="text-xl" />
        },
        { 
            id: 'depositWallet', 
            label: 'Deposit Destination', 
            description: 'Where approved manual deposits are credited.',
            icon: <HiCurrencyDollar className="text-xl" />
        }
    ];

    return (
        <div className="bg-white/80 backdrop-blur-xl border border-zinc-200 rounded-[2.5rem] p-8 shadow-sm">
            <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center">
                    <HiCurrencyDollar className="text-2xl text-indigo-600" />
                </div>
                <div>
                    <h2 className="text-xl font-black text-zinc-900 uppercase tracking-tighter">Wallet Flow Matrix</h2>
                    <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest">Configure dynamic fund distribution protocols.</p>
                </div>
            </div>

            <div className="space-y-6">
                {settingItems.map((item) => (
                    <div key={item.id} className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-3xl bg-zinc-50 border border-zinc-100 transition-all hover:border-indigo-200">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-white rounded-xl shadow-sm border border-zinc-100 flex items-center justify-center text-zinc-600">
                                {item.icon}
                            </div>
                            <div>
                                <h3 className="text-sm font-black text-zinc-800 uppercase tracking-tight">{item.label}</h3>
                                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">{item.description}</p>
                            </div>
                        </div>

                        <div className="flex gap-2 bg-zinc-200/50 p-1.5 rounded-2xl">
                            {walletOptions.map((opt) => (
                                <button
                                    key={opt.id}
                                    onClick={() => handleChange(item.id, opt.id)}
                                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                        localSettings[item.id] === opt.id
                                            ? `bg-white text-zinc-900 shadow-md`
                                            : 'text-zinc-500 hover:text-zinc-700'
                                    }`}
                                >
                                    {opt.name}
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <button
                onClick={handleSave}
                disabled={updating}
                className="w-full mt-8 bg-zinc-900 text-white py-4 rounded-3xl font-black text-xs uppercase tracking-[0.3em] hover:bg-zinc-800 transition-all shadow-xl shadow-zinc-900/10 flex items-center justify-center gap-2 disabled:opacity-50"
            >
                {updating ? (
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                ) : (
                    <>Apply New Protocol</>
                )}
            </button>
        </div>
    );
};

export default WalletAssignmentPanel;
