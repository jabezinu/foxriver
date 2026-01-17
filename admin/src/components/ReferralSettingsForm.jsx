import React from 'react';
import { HiSave, HiAdjustments, HiLightningBolt } from 'react-icons/hi';
import Card from './shared/Card';

export default function ReferralSettingsForm({ settings, onChange, onSave, saving }) {
    return (
        <form onSubmit={onSave} className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
            <Card noPadding className="overflow-hidden">
                <div className="bg-indigo-600 px-8 py-5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-white/20 p-2 rounded-xl text-white"><HiAdjustments /></div>
                        <div>
                            <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">Incentive Protocol Configuration</h3>
                            <p className="text-[9px] text-indigo-200 font-bold uppercase">Define system-wide commission and salary parameters</p>
                        </div>
                    </div>
                </div>

                <div className="p-8 space-y-10">
                    <section>
                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                            <span className="w-8 h-px bg-gray-100"></span> Task Commission Scales (%)
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <ScaleInput label="Primary (Level A)" value={settings.commissionPercentA} onChange={(v) => onChange({ ...settings, commissionPercentA: v })} />
                            <ScaleInput label="Secondary (Level B)" value={settings.commissionPercentB} onChange={(v) => onChange({ ...settings, commissionPercentB: v })} />
                            <ScaleInput label="Tertiary (Level C)" value={settings.commissionPercentC} onChange={(v) => onChange({ ...settings, commissionPercentC: v })} />
                        </div>
                    </section>

                    <section>
                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                            <span className="w-8 h-px bg-gray-100"></span> Membership Upgrade Scales (%)
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <ScaleInput label="Primary (Level A)" value={settings.upgradeCommissionPercentA} onChange={(v) => onChange({ ...settings, upgradeCommissionPercentA: v })} />
                            <ScaleInput label="Secondary (Level B)" value={settings.upgradeCommissionPercentB} onChange={(v) => onChange({ ...settings, upgradeCommissionPercentB: v })} />
                            <ScaleInput label="Tertiary (Level C)" value={settings.upgradeCommissionPercentC} onChange={(v) => onChange({ ...settings, upgradeCommissionPercentC: v })} />
                        </div>
                    </section>

                    <section>
                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                            <span className="w-8 h-px bg-gray-100"></span> System Protocol Architecture
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-gray-500 uppercase px-1">Referral Commission Cap (Max Referrals)</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={settings.maxReferralsPerUser}
                                        onChange={(e) => onChange({ ...settings, maxReferralsPerUser: Number(e.target.value) })}
                                        className="admin-input pr-10 font-black text-indigo-600"
                                        placeholder="0 for unlimited"
                                        required
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 font-black text-[10px]">USERS</span>
                                </div>
                                <p className="text-[9px] text-gray-400 font-bold uppercase px-1 italic">Sets the maximum number of referrals a user can earn commissions from. Use 0 for unlimited.</p>
                            </div>
                        </div>
                    </section>

                    <section className="space-y-6">
                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                            <span className="w-8 h-px bg-gray-100"></span> Monthly Salary Matrix
                        </h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <SalaryRule
                                title="Tier Alpha"
                                thresholdLabel="Direct Ref. Threshold"
                                threshold={settings.salaryDirect10Threshold}
                                amount={settings.salaryDirect10Amount}
                                onThresholdChange={(v) => onChange({ ...settings, salaryDirect10Threshold: v })}
                                onAmountChange={(v) => onChange({ ...settings, salaryDirect10Amount: v })}
                                variant="blue"
                            />
                            <SalaryRule
                                title="Tier Beta"
                                thresholdLabel="Direct Ref. Threshold"
                                threshold={settings.salaryDirect15Threshold}
                                amount={settings.salaryDirect15Amount}
                                onThresholdChange={(v) => onChange({ ...settings, salaryDirect15Threshold: v })}
                                onAmountChange={(v) => onChange({ ...settings, salaryDirect15Amount: v })}
                                variant="indigo"
                            />
                            <SalaryRule
                                title="Tier Gamma"
                                thresholdLabel="Direct Ref. Threshold"
                                threshold={settings.salaryDirect20Threshold}
                                amount={settings.salaryDirect20Amount}
                                onThresholdChange={(v) => onChange({ ...settings, salaryDirect20Threshold: v })}
                                onAmountChange={(v) => onChange({ ...settings, salaryDirect20Amount: v })}
                                variant="purple"
                            />
                            <SalaryRule
                                title="Network Delta"
                                thresholdLabel="Total Network (A+B+C)"
                                threshold={settings.salaryNetwork40Threshold}
                                amount={settings.salaryNetwork40Amount}
                                onThresholdChange={(v) => onChange({ ...settings, salaryNetwork40Threshold: v })}
                                onAmountChange={(v) => onChange({ ...settings, salaryNetwork40Amount: v })}
                                variant="green"
                            />
                        </div>
                    </section>
                </div>

                <div className="p-8 bg-gray-50 border-t border-gray-100">
                    <button
                        type="submit"
                        disabled={saving}
                        className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all disabled:opacity-50"
                    >
                        {saving ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> : <HiSave className="text-xl" />}
                        {saving ? 'Synchronizing Protocols...' : 'Commit System Configuration'}
                    </button>
                </div>
            </Card>
        </form>
    );
}

function ScaleInput({ label, value, onChange }) {
    return (
        <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-500 uppercase px-1">{label}</label>
            <div className="relative">
                <input
                    type="number"
                    value={value}
                    onChange={(e) => onChange(Number(e.target.value))}
                    className="admin-input pr-10 font-black text-indigo-600"
                    required
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 font-black">%</span>
            </div>
        </div>
    );
}

function SalaryRule({ title, thresholdLabel, threshold, amount, onThresholdChange, onAmountChange, variant }) {
    const variants = {
        blue: 'border-blue-100 bg-blue-50/30 text-blue-600',
        indigo: 'border-indigo-100 bg-indigo-50/30 text-indigo-600',
        purple: 'border-purple-100 bg-purple-50/30 text-purple-600',
        green: 'border-green-100 bg-green-50/30 text-green-600',
    };

    return (
        <div className={`p-6 rounded-3xl border-2 space-y-4 ${variants[variant]}`}>
            <div className="flex items-center gap-2">
                <HiLightningBolt className="text-lg" />
                <h5 className="text-[10px] font-black uppercase tracking-widest">{title}</h5>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-[9px] font-black uppercase text-gray-400 mb-1 block">{thresholdLabel}</label>
                    <input
                        type="number"
                        className="admin-input py-2 text-xs font-black"
                        value={threshold}
                        onChange={(e) => onThresholdChange(Number(e.target.value))}
                        required
                    />
                </div>
                <div>
                    <label className="text-[9px] font-black uppercase text-gray-400 mb-1 block">Yield (ETB)</label>
                    <input
                        type="number"
                        className="admin-input py-2 text-xs font-black"
                        value={amount}
                        onChange={(e) => onAmountChange(Number(e.target.value))}
                        required
                    />
                </div>
            </div>
        </div>
    );
}
