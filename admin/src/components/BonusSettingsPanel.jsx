import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { HiStar, HiPencil, HiCheck, HiX } from 'react-icons/hi';
import { adminSystemAPI } from '../services/api';
import Card from './shared/Card';

export default function BonusSettingsPanel({ settings, onSettingsUpdate }) {
    const [isEditing, setIsEditing] = useState(false);
    const [bonusPercent, setBonusPercent] = useState(settings?.rankUpgradeBonusPercent || 15);
    const [updating, setUpdating] = useState(false);

    const handleSave = async () => {
        if (bonusPercent < 0 || bonusPercent > 100) {
            toast.error('Bonus percentage must be between 0% and 100%');
            return;
        }

        setUpdating(true);
        try {
            const response = await adminSystemAPI.updateSettings({ 
                rankUpgradeBonusPercent: parseFloat(bonusPercent) 
            });
            
            if (response.data.success) {
                toast.success('Bonus percentage updated successfully');
                setIsEditing(false);
                if (onSettingsUpdate) {
                    onSettingsUpdate(response.data.data);
                }
            }
        } catch (error) {
            toast.error('Failed to update bonus percentage');
            console.error(error);
        } finally {
            setUpdating(false);
        }
    };

    const handleCancel = () => {
        setBonusPercent(settings?.rankUpgradeBonusPercent || 15);
        setIsEditing(false);
    };

    return (
        <Card noPadding className="overflow-hidden">
            <div className="bg-emerald-800 px-8 py-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="bg-white/10 p-2.5 rounded-xl text-white">
                        <HiStar className="text-xl" />
                    </div>
                    <div>
                        <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">Rank Upgrade Bonus</h3>
                        <p className="text-[9px] text-emerald-200 font-bold uppercase">Dynamic bonus percentage control</p>
                    </div>
                </div>
                
                {!isEditing && (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-lg transition-all"
                        title="Edit Bonus Percentage"
                    >
                        <HiPencil className="text-sm" />
                    </button>
                )}
            </div>

            <div className="p-8">
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h4 className="text-sm font-black text-emerald-900 uppercase tracking-widest mb-1">
                                Current Bonus Rate
                            </h4>
                            <p className="text-xs text-emerald-600 font-bold">
                                Applied to Rank 2+ upgrades only
                            </p>
                        </div>
                        
                        {isEditing ? (
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2">
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        step="0.01"
                                        value={bonusPercent}
                                        onChange={(e) => setBonusPercent(e.target.value)}
                                        className="w-20 px-3 py-2 border border-emerald-300 rounded-lg text-center font-bold text-emerald-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                        disabled={updating}
                                    />
                                    <span className="text-emerald-700 font-bold">%</span>
                                </div>
                                
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleSave}
                                        disabled={updating}
                                        className="bg-emerald-600 hover:bg-emerald-700 text-white p-2 rounded-lg transition-all disabled:opacity-50"
                                        title="Save Changes"
                                    >
                                        <HiCheck className="text-sm" />
                                    </button>
                                    <button
                                        onClick={handleCancel}
                                        disabled={updating}
                                        className="bg-gray-500 hover:bg-gray-600 text-white p-2 rounded-lg transition-all disabled:opacity-50"
                                        title="Cancel"
                                    >
                                        <HiX className="text-sm" />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="text-right">
                                <div className="text-3xl font-black text-emerald-600 tracking-tighter">
                                    {settings?.rankUpgradeBonusPercent || 15}%
                                </div>
                                <div className="text-xs text-emerald-500 font-bold uppercase tracking-widest">
                                    Bonus Rate
                                </div>
                            </div>
                        )}
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                        <div className="bg-white/50 rounded-xl p-4 border border-emerald-200/50">
                            <div className="flex items-center gap-2 mb-2">
                                <HiStar className="text-emerald-500" />
                                <span className="text-xs font-black text-emerald-700 uppercase tracking-widest">
                                    Example: Rank 2
                                </span>
                            </div>
                            <div className="text-sm text-emerald-600">
                                <span className="font-bold">9,600 ETB</span> upgrade = 
                                <span className="font-black text-emerald-700 ml-1">
                                    +{((9600 * (settings?.rankUpgradeBonusPercent || 15)) / 100).toLocaleString()} ETB
                                </span> bonus
                            </div>
                        </div>
                        
                        <div className="bg-white/50 rounded-xl p-4 border border-emerald-200/50">
                            <div className="flex items-center gap-2 mb-2">
                                <HiStar className="text-emerald-500" />
                                <span className="text-xs font-black text-emerald-700 uppercase tracking-widest">
                                    Example: Rank 3
                                </span>
                            </div>
                            <div className="text-sm text-emerald-600">
                                <span className="font-bold">27,000 ETB</span> upgrade = 
                                <span className="font-black text-emerald-700 ml-1">
                                    +{((27000 * (settings?.rankUpgradeBonusPercent || 15)) / 100).toLocaleString()} ETB
                                </span> bonus
                            </div>
                        </div>
                    </div>
                    
                    <div className="mt-6 pt-4 border-t border-emerald-200">
                        <div className="flex items-start gap-3">
                            <HiStar className="text-emerald-400 mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="text-xs font-bold text-emerald-700 mb-1">Important Notes:</p>
                                <ul className="text-xs text-emerald-600 space-y-1">
                                    <li>• No bonus applied for Intern → Rank 1 upgrades</li>
                                    <li>• Bonus is credited to user's income wallet</li>
                                    <li>• Changes apply to new upgrades immediately</li>
                                    <li>• Valid range: 0% to 100%</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
}