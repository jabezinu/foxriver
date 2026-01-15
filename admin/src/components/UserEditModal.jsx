import React from 'react';
import { HiX } from 'react-icons/hi';
import { TIERS } from '../config/constants';

export default function UserEditModal({ user, form, onChange, onClose, onSave }) {
    if (!user) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h3 className="font-bold text-gray-800">Edit Operative: {user.phone}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-red-500">
                        <HiX className="text-xl" />
                    </button>
                </div>
                <form onSubmit={onSave} className="p-6 space-y-4">
                    <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Membership Level</label>
                        <select
                            className="admin-input"
                            value={form.membershipLevel}
                            onChange={e => onChange({ ...form, membershipLevel: e.target.value })}
                        >
                            {TIERS.map(v => (
                                <option key={v} value={v}>{v}</option>
                            ))}
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Income Wallet</label>
                            <input
                                type="number"
                                step="0.01"
                                className="admin-input font-bold text-green-600"
                                value={form.incomeWallet}
                                onChange={e => onChange({ ...form, incomeWallet: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Personal Wallet</label>
                            <input
                                type="number"
                                step="0.01"
                                className="admin-input font-bold text-blue-600"
                                value={form.personalWallet}
                                onChange={e => onChange({ ...form, personalWallet: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <label className="flex items-center gap-2 cursor-pointer mb-3">
                            <input
                                type="checkbox"
                                className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                                checked={!!form.withdrawalRestrictedUntil}
                                onChange={e => {
                                    if (e.target.checked) {
                                        const tomorrow = new Date();
                                        tomorrow.setDate(tomorrow.getDate() + 1);
                                        onChange({ ...form, withdrawalRestrictedUntil: tomorrow.toISOString().split('T')[0] });
                                    } else {
                                        onChange({ ...form, withdrawalRestrictedUntil: '' });
                                    }
                                }}
                            />
                            <span className="text-xs font-bold text-gray-700 uppercase tracking-tight">Restrict Withdrawals</span>
                        </label>

                        {form.withdrawalRestrictedUntil && (
                            <div className="animate-fadeIn">
                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Restricted Until</label>
                                <input
                                    type="date"
                                    className="admin-input"
                                    value={form.withdrawalRestrictedUntil}
                                    onChange={e => onChange({ ...form, withdrawalRestrictedUntil: e.target.value })}
                                />
                                <p className="text-[10px] text-gray-400 mt-1 italic">User cannot withdraw until this date passes.</p>
                            </div>
                        )}
                    </div>

                    {user.bankChangeStatus === 'pending' && user.pendingBankAccount && (
                        <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100">
                            <p className="text-yellow-800 font-bold text-xs uppercase mb-2">Pending Bank Change</p>
                            <div className="text-xs text-gray-600 space-y-1 mb-3">
                                <p><span className="font-bold">Bank:</span> {user.pendingBankAccount.bank}</p>
                                <p><span className="font-bold">Account:</span> {user.pendingBankAccount.accountNumber}</p>
                                <p><span className="font-bold">Name:</span> {user.pendingBankAccount.accountName}</p>
                                <p><span className="font-bold">Phone:</span> {user.pendingBankAccount.phone}</p>
                                <p className="text-[10px] text-gray-400 mt-2">Requested: {new Date(user.bankChangeRequestDate).toLocaleDateString()}</p>
                            </div>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                                    checked={form.approveBankChange || false}
                                    onChange={e => onChange({ ...form, approveBankChange: e.target.checked })}
                                />
                                <span className="text-sm font-bold text-gray-700">Approve Change Immediately</span>
                            </label>
                        </div>
                    )}

                    <div className="pt-4 flex gap-3">
                        <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-bold text-xs uppercase hover:bg-gray-50 transition-all">Cancel</button>
                        <button type="submit" className="flex-1 py-3 rounded-xl bg-indigo-600 text-white font-bold text-xs uppercase hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all">Save Changes</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
