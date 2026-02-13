import React, { useState, useEffect } from 'react';
import { HiX } from 'react-icons/hi';
import { useAdminUserStore } from '../store/userStore';

export default function GlobalRestrictionModal({ isOpen, onClose, onSave, date, setDate, lift, setLift, restrictedDays, setRestrictedDays, restrictionType, setRestrictionType }) {
    const [currentRestrictions, setCurrentRestrictions] = useState(null);
    const { fetchCurrentRestrictions, loading } = useAdminUserStore();

    // Fetch current global restrictions when modal opens
    useEffect(() => {
        if (isOpen) {
            fetchCurrentRestrictionsData();
        }
    }, [isOpen]);

    const fetchCurrentRestrictionsData = async () => {
        const res = await fetchCurrentRestrictions();
        if (res.success) {
            setCurrentRestrictions(res.data);
        }
    };

    const getCurrentRestrictionsDisplay = () => {
        if (!currentRestrictions) return 'Loading current restrictions...';
        
        const { dateRestriction, dayRestrictions } = currentRestrictions;
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        
        let display = [];
        
        if (dateRestriction) {
            const restrictedDate = new Date(dateRestriction).toLocaleDateString();
            display.push(`Until: ${restrictedDate}`);
        }
        
        if (Array.isArray(dayRestrictions) && dayRestrictions.length > 0) {
            const restrictedDayNames = dayRestrictions.map(day => dayNames[day]).join(', ');
            display.push(`Days: ${restrictedDayNames}`);
        }
        
        if (display.length === 0) {
            return 'No restrictions currently applied';
        }
        
        return display.join(' | ');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden max-h-[90vh] overflow-y-auto">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 sticky top-0 z-10">
                    <h3 className="font-bold text-gray-800">Global Withdrawal Restriction</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-red-500">
                        <HiX className="text-xl" />
                    </button>
                </div>
                
                {/* Current Restrictions Display */}
                <div className="px-6 py-3 bg-blue-50 border-b border-blue-100">
                    <p className="text-blue-800 font-bold text-xs uppercase mb-1">Current Global Restrictions</p>
                    <p className="text-xs text-blue-600 font-medium">
                        {loading ? 'Loading...' : getCurrentRestrictionsDisplay()}
                    </p>
                </div>

                <form onSubmit={onSave} className="p-6 space-y-4">
                    <div className="flex gap-2 p-1 bg-gray-100 rounded-xl mb-4">
                        <button
                            type="button"
                            onClick={() => setLift(false)}
                            className={`flex-1 py-2 rounded-lg text-xs font-extrabold uppercase transition-all ${!lift ? 'bg-white shadow-sm text-red-600' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            Apply Restriction
                        </button>
                        <button
                            type="button"
                            onClick={() => setLift(true)}
                            className={`flex-1 py-2 rounded-lg text-xs font-extrabold uppercase transition-all ${lift ? 'bg-white shadow-sm text-green-600' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            Lift Restrictions
                        </button>
                    </div>

                    {!lift ? (
                        <>
                            <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                                <p className="text-red-800 font-bold text-xs uppercase mb-2">Warning</p>
                                <p className="text-[11px] text-gray-600 font-medium">
                                    This will restrict withdrawals for <span className="font-bold underline">ALL</span> users. This action overwrites any existing individual restrictions.
                                </p>
                            </div>

                            {/* Restriction Type Toggle */}
                            <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
                                <button
                                    type="button"
                                    onClick={() => setRestrictionType('date')}
                                    className={`flex-1 py-2 px-3 rounded-md text-xs font-bold uppercase transition-all ${
                                        restrictionType === 'date'
                                            ? 'bg-white shadow-sm text-indigo-600'
                                            : 'text-gray-500 hover:text-gray-700'
                                    }`}
                                >
                                    Until Date
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setRestrictionType('days')}
                                    className={`flex-1 py-2 px-3 rounded-md text-xs font-bold uppercase transition-all ${
                                        restrictionType === 'days'
                                            ? 'bg-white shadow-sm text-indigo-600'
                                            : 'text-gray-500 hover:text-gray-700'
                                    }`}
                                >
                                    Specific Days
                                </button>
                            </div>

                            {/* Date-based restriction */}
                            {restrictionType === 'date' && (
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Restricted Until</label>
                                    <input
                                        type="date"
                                        className="admin-input"
                                        value={date}
                                        onChange={e => setDate(e.target.value)}
                                        required={!lift && restrictionType === 'date'}
                                    />
                                </div>
                            )}

                            {/* Day-based restriction */}
                            {restrictionType === 'days' && (
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Restricted Days (Recurring Weekly)</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day, index) => (
                                            <label key={day} className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="w-3 h-3 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                                                    checked={(restrictedDays || []).includes(index)}
                                                    onChange={e => {
                                                        const currentDays = restrictedDays || [];
                                                        const newDays = e.target.checked
                                                            ? [...currentDays, index]
                                                            : currentDays.filter(d => d !== index);
                                                        setRestrictedDays(newDays);
                                                    }}
                                                />
                                                <span className="text-xs text-gray-600">{day}</span>
                                            </label>
                                        ))}
                                    </div>
                                    <div className="mt-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                                        <p className="text-[10px] text-amber-700 font-bold uppercase mb-1">Recurring Weekly Restriction</p>
                                        <p className="text-[10px] text-amber-600 leading-relaxed">
                                            Selected days will be restricted <span className="font-bold">every week</span>. 
                                            Users cannot withdraw on these days until restrictions are lifted.
                                        </p>
                                        {Array.isArray(restrictedDays) && restrictedDays.length > 0 && (
                                            <p className="text-[10px] text-amber-800 font-medium mt-2">
                                                🚫 Restricted: {restrictedDays.map(day => 
                                                    ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][day]
                                                ).join(', ')}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                            <p className="text-green-800 font-bold text-xs uppercase mb-2">Lift All Restrictions</p>
                            <p className="text-[11px] text-gray-600 font-medium">
                                This will remove withdrawal restrictions for <span className="font-bold underline">ALL</span> users immediately. They will be able to withdraw funds if they meet other criteria.
                            </p>
                        </div>
                    )}

                    <div className="pt-4 flex gap-3">
                        <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-bold text-xs uppercase hover:bg-gray-50 transition-all">Cancel</button>
                        <button
                            type="submit"
                            className={`flex-1 py-3 rounded-xl text-white font-bold text-xs uppercase shadow-lg transition-all ${lift ? 'bg-green-600 hover:bg-green-700 shadow-green-100' : 'bg-red-600 hover:bg-red-700 shadow-red-100'}`}
                        >
                            {lift ? 'Lift Restrictions' : 'Apply to All'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
