import React from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiToggleLeft, FiToggleRight } from 'react-icons/fi';
import Loading from '../components/Loading';
import Card from './shared/Card';
import Badge from './shared/Badge';

export default function SlotTiers({ tiers, loading, onCreate, onEdit, onDelete, onToggle }) {
    return (
        <div className="animate-fadeIn">
            <div className="flex justify-end mb-6">
                <button onClick={onCreate} className="admin-btn-primary flex items-center gap-2">
                    <FiPlus /> Create New Tier
                </button>
            </div>

            {loading ? (
                <div className="py-20 text-center"><Loading /></div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {tiers.map((tier) => (
                        <Card
                            key={tier.id || tier._id}
                            className={`transition-all duration-300 ${tier.isActive ? 'border-green-200 ring-4 ring-green-50' : ''}`}
                            noPadding
                        >
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-800 tracking-tight">{tier.name}</h3>
                                        <Badge variant={tier.isActive ? 'green' : 'gray'} className="mt-2">
                                            {tier.isActive ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </div>
                                    <button onClick={() => onToggle(tier.id || tier._id)} className="text-3xl transition-transform hover:scale-110">
                                        {tier.isActive ? <FiToggleRight className="text-green-600" /> : <FiToggleLeft className="text-gray-300" />}
                                    </button>
                                </div>

                                <div className="space-y-3 mb-6 bg-gray-50 rounded-xl p-4">
                                    <div className="flex justify-between items-center text-xs font-bold uppercase tracking-tight">
                                        <span className="text-gray-400">Bet Amount</span>
                                        <span className="text-red-600">{tier.betAmount} ETB</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs font-bold uppercase tracking-tight">
                                        <span className="text-gray-400">Win Amount</span>
                                        <span className="text-green-600">{tier.winAmount} ETB</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs font-bold uppercase tracking-tight">
                                        <span className="text-gray-400">Win Rate</span>
                                        <span className="text-blue-600">{tier.winProbability}%</span>
                                    </div>
                                </div>

                                {tier.description && (
                                    <p className="text-[11px] text-gray-500 mb-6 italic leading-relaxed border-l-2 border-indigo-200 pl-3">
                                        {tier.description}
                                    </p>
                                )}

                                <div className="flex gap-2 pt-4 border-t border-gray-50">
                                    <button onClick={() => onEdit(tier)} className="flex-1 py-2 text-[10px] font-bold uppercase bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all">
                                        Edit
                                    </button>
                                    <button onClick={() => onDelete(tier.id || tier._id)} className="flex-1 py-2 text-[10px] font-bold uppercase bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-all">
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </Card>
                    ))}

                    {tiers.length === 0 && (
                        <div className="col-span-full py-20 bg-white rounded-2xl border-2 border-dashed border-gray-100 flex flex-col items-center justify-center text-gray-400">
                            <span className="text-6xl mb-4">🎯</span>
                            <p className="font-bold uppercase text-xs tracking-widest">No tiers configured yet</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
