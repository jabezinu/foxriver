import React, { useState } from 'react';
import { HiX, HiEye, HiEyeOff } from 'react-icons/hi';
import { TIERS } from '../config/constants';

export default function UserEditModal({ user, form, onChange, onClose, onSave }) {
    const [showPassword, setShowPassword] = useState(false);

    if (!user) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden max-h-[90vh] overflow-y-auto">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 sticky top-0 z-10">
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
                    <div className="grid grid-cols-2 gap-3">
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
                    <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                        <p className="text-red-800 font-bold text-xs uppercase mb-3">Password Management</p>
                        
                        <div className="space-y-3">
                            <div>
                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                                    Login Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        className="admin-input pr-10"
                                        placeholder="Enter new password (leave empty to keep current)"
                                        value={form.password || ''}
                                        onChange={e => onChange({ ...form, password: e.target.value })}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showPassword ? <HiEyeOff /> : <HiEye />}
                                    </button>
                                </div>
                                <p className="text-[10px] text-gray-400 mt-1 italic">Only fill to change password</p>
                            </div>

                        </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <label className="flex items-center gap-2 cursor-pointer mb-3">
                            <input
                                type="checkbox"
                                className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                                checked={!!form.withdrawalRestrictedUntil || (form.withdrawalRestrictedDays && form.withdrawalRestrictedDays.length > 0)}
                                onChange={e => {
                                    if (e.target.checked) {
                                        const tomorrow = new Date();
                                        tomorrow.setDate(tomorrow.getDate() + 1);
                                        onChange({ ...form, withdrawalRestrictedUntil: tomorrow.toISOString().split('T')[0] });
                                    } else {
                                        onChange({ ...form, withdrawalRestrictedUntil: '', withdrawalRestrictedDays: [] });
                                    }
                                }}
                            />
                            <span className="text-xs font-bold text-gray-700 uppercase tracking-tight">Restrict Withdrawals</span>
                        </label>

                        {(form.withdrawalRestrictedUntil || (form.withdrawalRestrictedDays && form.withdrawalRestrictedDays.length > 0)) && (
                            <div className="animate-fadeIn space-y-4">
                                {/* Restriction Type Toggle */}
                                <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
                                    <button
                                        type="button"
                                        onClick={() => onChange({ ...form, withdrawalRestrictedDays: [], restrictionType: 'date' })}
                                        className={`flex-1 py-2 px-3 rounded-md text-xs font-bold uppercase transition-all ${
                                            !form.withdrawalRestrictedDays || form.withdrawalRestrictedDays.length === 0
                                                ? 'bg-white shadow-sm text-indigo-600'
                                                : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                    >
                                        Until Date
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => onChange({ ...form, withdrawalRestrictedUntil: '', restrictionType: 'days' })}
                                        className={`flex-1 py-2 px-3 rounded-md text-xs font-bold uppercase transition-all ${
                                            form.withdrawalRestrictedDays && form.withdrawalRestrictedDays.length > 0
                                                ? 'bg-white shadow-sm text-indigo-600'
                                                : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                    >
                                        Specific Days
                                    </button>
                                </div>

                                {/* Date-based restriction */}
                                {(!form.withdrawalRestrictedDays || form.withdrawalRestrictedDays.length === 0) && (
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Restricted Until</label>
                                        <input
                                            type="date"
                                            className="admin-input"
                                            value={form.withdrawalRestrictedUntil || ''}
                                            onChange={e => onChange({ ...form, withdrawalRestrictedUntil: e.target.value })}
                                        />
                                        <p className="text-[10px] text-gray-400 mt-1 italic">User cannot withdraw until this date passes.</p>
                                    </div>
                                )}

                                {/* Day-based restriction */}
                                {form.withdrawalRestrictedDays && form.withdrawalRestrictedDays.length >= 0 && form.restrictionType === 'days' && (
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Restricted Days</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day, index) => (
                                                <label key={day} className="flex items-center gap-2 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        className="w-3 h-3 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                                                        checked={(form.withdrawalRestrictedDays || []).includes(index)}
                                                        onChange={e => {
                                                            const currentDays = form.withdrawalRestrictedDays || [];
                                                            const newDays = e.target.checked
                                                                ? [...currentDays, index]
                                                                : currentDays.filter(d => d !== index);
                                                            onChange({ ...form, withdrawalRestrictedDays: newDays });
                                                        }}
                                                    />
                                                    <span className="text-xs text-gray-600">{day}</span>
                                                </label>
                                            ))}
                                        </div>
                                        <p className="text-[10px] text-gray-400 mt-2 italic">User cannot withdraw on selected days each week.</p>
                                    </div>
                                )}
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
