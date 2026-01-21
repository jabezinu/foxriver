import React from 'react';
import { HiX, HiShieldCheck, HiOutlineShieldExclamation, HiCheck } from 'react-icons/hi';

const ALL_PERMISSIONS = [
    { id: 'manage_users', label: 'Identity Control', description: 'User lifecycle management' },
    { id: 'manage_deposits', label: 'Financial Intake', description: 'Credit authorization' },
    { id: 'manage_withdrawals', label: 'Financial Output', description: 'Debit authorization' },
    { id: 'manage_tasks', label: 'Task Matrix', description: 'Operational assignments' },
    { id: 'manage_courses', label: 'Knowledge Base', description: 'Educational content' },
    { id: 'manage_wealth', label: 'Equity Assets', description: 'Investment oversight' },
    { id: 'manage_qna', label: 'Information Desk', description: 'Technical documentation' },
    { id: 'manage_news', label: 'Intel Feed', description: 'Public bulletins' },
    { id: 'manage_slot_machine', label: 'Probability Engine', description: 'Algorithmic results' },
    { id: 'manage_bank_settings', label: 'Fiscal Nodes', description: 'Banking infrastructure' },
    { id: 'manage_referrals', label: 'Network Growth', description: 'Affiliate commissions' },
    { id: 'manage_membership', label: 'Clearance Tiers', description: 'Personnel hierarchy' },
    { id: 'manage_system_settings', label: 'Core Configuration', description: 'Global parameters' },
];

export default function AdminAccessModal({ isOpen, admin, form, onChange, onClose, onSave }) {
    if (!isOpen) return null;

    const togglePermission = (id) => {
        const permissions = form.permissions.includes(id)
            ? form.permissions.filter(p => p !== id)
            : [...form.permissions, id];
        onChange({ ...form, permissions });
    };

    const isAllGranted = form.permissions.length === ALL_PERMISSIONS.length;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fadeIn">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col border border-gray-100">
                <div className="px-8 py-5 border-b border-gray-50 flex justify-between items-center bg-gray-50/50 shrink-0">
                    <div>
                        <h3 className="font-black text-gray-800 uppercase tracking-widest">{admin ? 'Override Clearance' : 'Designate Personnel'}</h3>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{admin ? `Subject: ${admin.phone}` : 'New System Entry'}</p>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 rounded-full flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all">
                        <HiX className="text-xl" />
                    </button>
                </div>

                <form onSubmit={onSave} className="flex-1 overflow-y-auto no-scrollbar p-8 space-y-8">
                    {!admin && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block ml-1">Personnel Uplink (Phone)</label>
                                <input
                                    type="text"
                                    placeholder="+251..."
                                    className="admin-input"
                                    value={form.phone}
                                    onChange={e => onChange({ ...form, phone: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block ml-1">Access Key (Password)</label>
                                <input
                                    type="password"
                                    placeholder="Secure Hash"
                                    className="admin-input"
                                    value={form.password}
                                    onChange={e => onChange({ ...form, password: e.target.value })}
                                    required={!admin}
                                />
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <RoleOption
                            selected={form.role === 'admin'}
                            onClick={() => onChange({ ...form, role: 'admin' })}
                            icon={<HiShieldCheck />}
                            label="Operational Admin"
                            desc="Restricted access governed by granular protocols."
                        />
                        <RoleOption
                            selected={form.role === 'superadmin'}
                            onClick={() => onChange({ ...form, role: 'superadmin' })}
                            icon={<HiOutlineShieldExclamation />}
                            label="Prime Overseer"
                            desc="Absolute clearance. Bypasses all security checks."
                        />
                    </div>

                    {form.role === 'admin' ? (
                        <div className="space-y-4 animate-slideUp">
                            <div className="flex justify-between items-center px-1">
                                <label className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">Operational Protocols</label>
                                <button
                                    type="button"
                                    onClick={() => onChange({ ...form, permissions: isAllGranted ? [] : ALL_PERMISSIONS.map(p => p.id) })}
                                    className="text-[10px] font-black text-indigo-600 hover:underline uppercase tracking-widest"
                                >
                                    {isAllGranted ? 'Purge All' : 'Grant Absolute Clearance'}
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {ALL_PERMISSIONS.map(permission => (
                                    <div
                                        key={permission.id}
                                        onClick={() => togglePermission(permission.id)}
                                        className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 ${form.permissions.includes(permission.id) ? 'bg-indigo-50 border-indigo-100' : 'bg-gray-50/50 border-gray-100 hover:border-gray-200'}`}
                                    >
                                        <div className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${form.permissions.includes(permission.id) ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-white border-gray-200'}`}>
                                            {form.permissions.includes(permission.id) && <HiCheck className="text-[10px]" />}
                                        </div>
                                        <div>
                                            <p className="text-[11px] font-black text-gray-800 uppercase tracking-tighter leading-none mb-1">{permission.label}</p>
                                            <p className="text-[9px] text-gray-400 font-bold leading-none">{permission.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="bg-indigo-900 p-8 rounded-3xl border border-indigo-800 text-center animate-pulse shadow-2xl overflow-hidden relative">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                            <HiOutlineShieldExclamation className="text-4xl text-indigo-400 mx-auto mb-4" />
                            <p className="text-xs font-black text-white uppercase tracking-[0.3em] mb-2">Omnipotent Access Active</p>
                            <p className="text-[10px] text-indigo-300 font-bold leading-relaxed max-w-sm mx-auto uppercase">Individual protocol configurations are bypassed for Prime Overseer designation.</p>
                        </div>
                    )}

                    <div className="pt-8 border-t border-gray-50 flex gap-4">
                        <button type="button" onClick={onClose} className="flex-1 py-4 rounded-2xl border border-gray-200 text-gray-500 font-black text-[10px] uppercase tracking-[0.2em] hover:bg-gray-50 transition-all">Abort</button>
                        <button type="submit" className="flex-1 py-4 rounded-2xl bg-indigo-600 text-white font-black text-[10px] uppercase tracking-[0.2em] hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all">Synchronize Permissions</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function RoleOption({ selected, onClick, icon, label, desc }) {
    return (
        <div
            onClick={onClick}
            className={`p-5 rounded-3xl border-2 cursor-pointer transition-all flex flex-col gap-3 group ${selected ? 'border-indigo-600 bg-indigo-50/50 shadow-lg shadow-indigo-100' : 'border-gray-50 bg-gray-50/50 hover:border-gray-200'}`}
        >
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl transition-all ${selected ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200 scale-110' : 'bg-white text-gray-300 group-hover:text-indigo-400'}`}>
                {icon}
            </div>
            <div>
                <p className={`text-xs font-black uppercase tracking-widest ${selected ? 'text-indigo-900' : 'text-gray-400'}`}>{label}</p>
                <p className="text-[10px] text-gray-500 font-bold leading-tight mt-1">{desc}</p>
            </div>
        </div>
    );
}
