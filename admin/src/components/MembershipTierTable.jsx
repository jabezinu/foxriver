import React from 'react';
import { HiPencil, HiSave, HiX, HiCurrencyDollar, HiIdentification, HiEye, HiEyeOff, HiExclamationCircle } from 'react-icons/hi';
import Badge from './shared/Badge';
import Card from './shared/Card';
import { formatNumber } from '../utils/formatNumber';

export default function MembershipTierTable({ tiers, editingPrices, onEditPrice, onCancelEdit, onPriceChange, onSavePrice, savingPrices, onToggleVisibility, togglingVisibility }) {
    return (
        <Card noPadding className="overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gray-50/50">
                <div>
                    <h2 className="font-bold text-gray-800 flex items-center gap-2">
                        <HiIdentification className="text-indigo-600 text-xl" />
                        Membership Tier Matrix
                    </h2>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Global personnel hierarchy configuration</p>
                </div>
                <Badge variant="indigo" className="flex items-center gap-1">
                    <HiCurrencyDollar className="text-sm" /> Dynamic Core Pricing
                </Badge>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="bg-white border-b border-gray-100">
                            <th className="table-header">Tier Designation</th>
                            <th className="table-header">Valuation (ETB)</th>
                            <th className="table-header">Daily Yield</th>
                            <th className="table-header">Yield/Unit</th>
                            <th className="table-header">Visibility</th>
                            <th className="table-header text-right">Commands</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {tiers.map((tier) => {
                            const isEditing = editingPrices.hasOwnProperty(tier.id);
                            const isSaving = savingPrices[tier.id];
                            const isToggling = togglingVisibility[tier.id];
                            const isIntern = tier.level === 'Intern';

                            return (
                                <tr key={tier.id} className={`table-row ${tier.hidden ? 'bg-gray-50/80 grayscale-[0.2]' : ''}`}>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2 h-8 rounded-full ${tier.hidden ? 'bg-gray-300' : 'bg-indigo-500 shadow-lg shadow-indigo-100'}`} />
                                            <span className="font-bold text-gray-800 tracking-tight">{tier.level}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {isEditing ? (
                                            <input
                                                type="number"
                                                value={editingPrices[tier.id]}
                                                onChange={(e) => onPriceChange(tier.id, e.target.value)}
                                                onWheel={(e) => e.target.blur()}
                                                disabled={isSaving || isIntern}
                                                className="w-28 admin-input py-1 px-2 text-xs font-black"
                                                min="0"
                                            />
                                        ) : (
                                            <span className="text-xs font-black text-gray-700">{tier.price.toLocaleString()} ETB</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-xs font-bold text-emerald-600">
                                        {formatNumber(tier.dailyIncome)} ETB
                                    </td>
                                    <td className="px-6 py-4 text-xs font-bold text-blue-600">
                                        {formatNumber(tier.perVideoIncome)} ETB
                                    </td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => onToggleVisibility(tier.id)}
                                            disabled={isToggling}
                                            className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                                                tier.hidden ? 'bg-gray-300' : 'bg-green-500'
                                            } ${isToggling ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                            title={tier.hidden ? 'Click to show' : 'Click to hide'}
                                        >
                                            <span
                                                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform ${
                                                    tier.hidden ? 'translate-x-1' : 'translate-x-8'
                                                }`}
                                            />
                                            <span className={`absolute text-[9px] font-bold uppercase ${tier.hidden ? 'left-7 text-gray-600' : 'left-1.5 text-white'}`}>
                                                {tier.hidden ? 'Off' : 'On'}
                                            </span>
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {isEditing ? (
                                            <div className="flex items-center justify-end gap-2">
                                                <button onClick={() => onSavePrice(tier)} disabled={isSaving} className="w-8 h-8 rounded-lg bg-green-500 text-white flex items-center justify-center hover:bg-green-600 shadow-md">
                                                    <HiSave />
                                                </button>
                                                <button onClick={() => onCancelEdit(tier.id)} disabled={isSaving} className="w-8 h-8 rounded-lg bg-gray-500 text-white flex items-center justify-center hover:bg-gray-600 shadow-md">
                                                    <HiX />
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => onEditPrice(tier.id, tier.price)}
                                                disabled={isIntern}
                                                className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                                            >
                                                <HiPencil />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <div className="p-5 bg-amber-50/50 border-t border-amber-100 flex gap-4">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 shrink-0 mt-1">
                    <HiExclamationCircle className="text-xl" />
                </div>
                <div className="text-[10px] text-amber-900 leading-relaxed font-bold uppercase tracking-tight">
                    <p className="mb-2 underline">Global Revenue Protocol:</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1">
                        <p>• Yield calculation: Level Price ÷ 26 Cycles (Excl. Sundays)</p>
                        <p>• Unit distribution: Daily Yield ÷ 4 Units</p>
                        <p>• Sequential lock overrides skip protocol in restricted zones</p>
                        <p>• Modifications propagate instantly to all active terminals</p>
                    </div>
                </div>
            </div>
        </Card>
    );
}
