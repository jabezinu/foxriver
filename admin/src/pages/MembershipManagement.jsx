import { useState, useEffect } from 'react';
import { adminMembershipAPI } from '../services/api';
import Loading from '../components/Loading';
import { Eye, EyeOff, Lock, Unlock, AlertCircle, Edit2, Save, X, DollarSign } from 'lucide-react';

export default function MembershipManagement() {
    const [tiers, setTiers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [startRank, setStartRank] = useState('');
    const [endRank, setEndRank] = useState('');
    const [actionLoading, setActionLoading] = useState(false);
    
    // Rank progression restriction states
    const [restrictedRange, setRestrictedRange] = useState(null);
    const [restrictStartRank, setRestrictStartRank] = useState('');
    const [restrictEndRank, setRestrictEndRank] = useState('');
    const [restrictionLoading, setRestrictionLoading] = useState(false);

    // Price editing states
    const [editingPrices, setEditingPrices] = useState({});
    const [savingPrices, setSavingPrices] = useState({});

    useEffect(() => {
        fetchTiers();
        fetchRestrictedRange();
    }, []);

    const fetchTiers = async () => {
        try {
            setLoading(true);
            const res = await adminMembershipAPI.getAllTiers();
            setTiers(res.data.tiers);
        } catch (error) {
            console.error('Error fetching tiers:', error);
            alert(error.response?.data?.message || 'Failed to fetch membership tiers');
        } finally {
            setLoading(false);
        }
    };

    const fetchRestrictedRange = async () => {
        try {
            const res = await adminMembershipAPI.getRestrictedRange();
            setRestrictedRange(res.data.restrictedRange);
        } catch (error) {
            console.error('Error fetching restricted range:', error);
        }
    };

    const handleHideRange = async () => {
        if (!startRank || !endRank) {
            alert('Please select both start and end ranks');
            return;
        }

        const start = parseInt(startRank);
        const end = parseInt(endRank);

        if (start > end) {
            alert('Start rank must be less than or equal to end rank');
            return;
        }

        try {
            setActionLoading(true);
            const res = await adminMembershipAPI.hideRange({ startRank: start, endRank: end });
            alert(res.data.message);
            fetchTiers();
            setStartRank('');
            setEndRank('');
        } catch (error) {
            console.error('Error hiding memberships:', error);
            alert(error.response?.data?.message || 'Failed to hide memberships');
        } finally {
            setActionLoading(false);
        }
    };

    const handleUnhideRange = async () => {
        if (!startRank || !endRank) {
            alert('Please select both start and end ranks');
            return;
        }

        const start = parseInt(startRank);
        const end = parseInt(endRank);

        if (start > end) {
            alert('Start rank must be less than or equal to end rank');
            return;
        }

        try {
            setActionLoading(true);
            const res = await adminMembershipAPI.unhideRange({ startRank: start, endRank: end });
            alert(res.data.message);
            fetchTiers();
            setStartRank('');
            setEndRank('');
        } catch (error) {
            console.error('Error unhiding memberships:', error);
            alert(error.response?.data?.message || 'Failed to unhide memberships');
        } finally {
            setActionLoading(false);
        }
    };

    const handleSetRestriction = async () => {
        if (!restrictStartRank || !restrictEndRank) {
            alert('Please select both start and end ranks for restriction');
            return;
        }

        const start = parseInt(restrictStartRank);
        const end = parseInt(restrictEndRank);

        if (start > end) {
            alert('Start rank must be less than or equal to end rank');
            return;
        }

        if (end - start < 1) {
            alert('Restricted range must include at least 2 ranks');
            return;
        }

        try {
            setRestrictionLoading(true);
            const res = await adminMembershipAPI.setRestrictedRange({ startRank: start, endRank: end });
            alert(res.data.message);
            fetchRestrictedRange();
            setRestrictStartRank('');
            setRestrictEndRank('');
        } catch (error) {
            console.error('Error setting restriction:', error);
            alert(error.response?.data?.message || 'Failed to set rank progression restriction');
        } finally {
            setRestrictionLoading(false);
        }
    };

    const handleClearRestriction = async () => {
        if (!confirm('Are you sure you want to clear rank progression restrictions? Users will be able to skip ranks freely.')) {
            return;
        }

        try {
            setRestrictionLoading(true);
            const res = await adminMembershipAPI.clearRestrictedRange();
            alert(res.data.message);
            fetchRestrictedRange();
        } catch (error) {
            console.error('Error clearing restriction:', error);
            alert(error.response?.data?.message || 'Failed to clear rank progression restriction');
        } finally {
            setRestrictionLoading(false);
        }
    };

    const handleEditPrice = (tierId, currentPrice) => {
        setEditingPrices(prev => ({
            ...prev,
            [tierId]: currentPrice
        }));
    };

    const handleCancelEdit = (tierId) => {
        setEditingPrices(prev => {
            const newState = { ...prev };
            delete newState[tierId];
            return newState;
        });
    };

    const handlePriceChange = (tierId, value) => {
        const numValue = parseFloat(value);
        if (!isNaN(numValue) && numValue >= 0) {
            setEditingPrices(prev => ({
                ...prev,
                [tierId]: numValue
            }));
        }
    };

    const handleSavePrice = async (tier) => {
        const newPrice = editingPrices[tier._id];
        
        if (newPrice === undefined || newPrice === tier.price) {
            handleCancelEdit(tier._id);
            return;
        }

        // Prevent changing Intern price
        if (tier.level === 'Intern' && newPrice !== 0) {
            alert('Intern membership must remain free (price = 0)');
            return;
        }

        try {
            setSavingPrices(prev => ({ ...prev, [tier._id]: true }));
            const res = await adminMembershipAPI.updatePrice(tier._id, { price: newPrice });
            alert(res.data.message);
            fetchTiers();
            handleCancelEdit(tier._id);
        } catch (error) {
            console.error('Error updating price:', error);
            alert(error.response?.data?.message || 'Failed to update price');
        } finally {
            setSavingPrices(prev => ({ ...prev, [tier._id]: false }));
        }
    };

    if (loading) return <Loading />;

    const rankOptions = Array.from({ length: 10 }, (_, i) => i + 1);

    return (
        <div className="p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Membership Management</h1>
                <p className="text-gray-600">Manage membership visibility and rank progression rules</p>
            </div>

            {/* Rank Progression Restriction Panel */}
            <div className="admin-card mb-8 border-l-4 border-blue-500">
                <div className="flex items-center gap-2 mb-4">
                    <Lock className="text-blue-600" size={24} />
                    <h2 className="text-lg font-bold text-gray-800">Rank Progression Restrictions</h2>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <div className="flex items-start gap-2">
                        <AlertCircle className="text-blue-600 mt-0.5 flex-shrink-0" size={18} />
                        <div className="text-sm text-blue-800">
                            <p className="font-semibold mb-1">How it works:</p>
                            <ul className="list-disc list-inside space-y-1 ml-2">
                                <li>By default, users can skip ranks freely (e.g., Rank 1 → Rank 5)</li>
                                <li>Set a restricted range to require sequential progression within that range</li>
                                <li>Example: If you set Rank 7-10 as restricted, users must progress 7→8→9→10</li>
                                <li>Outside the restricted range, users can still skip ranks</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Current Restriction Status */}
                {restrictedRange ? (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Lock className="text-yellow-600" size={20} />
                                <div>
                                    <p className="font-semibold text-gray-800">Active Restriction</p>
                                    <p className="text-sm text-gray-600">
                                        Sequential progression required from <span className="font-bold">Rank {restrictedRange.start}</span> to <span className="font-bold">Rank {restrictedRange.end}</span>
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={handleClearRestriction}
                                disabled={restrictionLoading}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                <Unlock size={16} />
                                Clear Restriction
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                        <div className="flex items-center gap-2">
                            <Unlock className="text-green-600" size={20} />
                            <div>
                                <p className="font-semibold text-gray-800">No Restrictions Active</p>
                                <p className="text-sm text-gray-600">Users can skip ranks freely</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Set New Restriction */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Restriction Start Rank</label>
                        <select
                            value={restrictStartRank}
                            onChange={(e) => setRestrictStartRank(e.target.value)}
                            className="admin-input"
                            disabled={restrictionLoading}
                        >
                            <option value="">Select start rank</option>
                            {rankOptions.map(rank => (
                                <option key={rank} value={rank}>Rank {rank}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Restriction End Rank</label>
                        <select
                            value={restrictEndRank}
                            onChange={(e) => setRestrictEndRank(e.target.value)}
                            className="admin-input"
                            disabled={restrictionLoading}
                        >
                            <option value="">Select end rank</option>
                            {rankOptions.map(rank => (
                                <option key={rank} value={rank}>Rank {rank}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <button
                    onClick={handleSetRestriction}
                    disabled={restrictionLoading || !restrictStartRank || !restrictEndRank}
                    className="admin-btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Lock size={18} />
                    {restrictedRange ? 'Update Restriction' : 'Set Restriction'}
                </button>
            </div>

            {/* Hide/Unhide Control Panel */}
            <div className="admin-card mb-8">
                <h2 className="text-lg font-bold text-gray-800 mb-6">Hide/Unhide by Rank Range</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Start Rank</label>
                        <select
                            value={startRank}
                            onChange={(e) => setStartRank(e.target.value)}
                            className="admin-input"
                            disabled={actionLoading}
                        >
                            <option value="">Select start rank</option>
                            {rankOptions.map(rank => (
                                <option key={rank} value={rank}>Rank {rank}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">End Rank</label>
                        <select
                            value={endRank}
                            onChange={(e) => setEndRank(e.target.value)}
                            className="admin-input"
                            disabled={actionLoading}
                        >
                            <option value="">Select end rank</option>
                            {rankOptions.map(rank => (
                                <option key={rank} value={rank}>Rank {rank}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="flex gap-4">
                    <button
                        onClick={handleHideRange}
                        disabled={actionLoading || !startRank || !endRank}
                        className="admin-btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <EyeOff size={18} />
                        Hide Selected Range
                    </button>

                    <button
                        onClick={handleUnhideRange}
                        disabled={actionLoading || !startRank || !endRank}
                        className="admin-btn-secondary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Eye size={18} />
                        Unhide Selected Range
                    </button>
                </div>
            </div>

            {/* Membership Tiers Table */}
            <div className="admin-card">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-lg font-bold text-gray-800">All Membership Tiers</h2>
                        <p className="text-sm text-gray-600 mt-1">Click the edit icon to modify membership prices</p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 px-3 py-2 rounded-lg border border-blue-200">
                        <DollarSign size={16} />
                        <span className="font-semibold">Dynamic Pricing Enabled</span>
                    </div>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Level
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Price (ETB)
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Daily Income
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Per Video
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {tiers.map((tier) => {
                                const isEditing = editingPrices.hasOwnProperty(tier._id);
                                const isSaving = savingPrices[tier._id];
                                const isIntern = tier.level === 'Intern';

                                return (
                                    <tr key={tier._id} className={tier.hidden ? 'bg-gray-50' : ''}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="font-semibold text-gray-800">{tier.level}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {isEditing ? (
                                                <input
                                                    type="number"
                                                    value={editingPrices[tier._id]}
                                                    onChange={(e) => handlePriceChange(tier._id, e.target.value)}
                                                    disabled={isSaving || isIntern}
                                                    className="w-32 px-3 py-1.5 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-semibold"
                                                    min="0"
                                                    step="100"
                                                />
                                            ) : (
                                                <span className="text-gray-700 font-semibold">{tier.price.toLocaleString()} ETB</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-gray-700">{tier.dailyIncome.toFixed(2)} ETB</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-gray-700">{tier.perVideoIncome.toFixed(2)} ETB</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {tier.hidden ? (
                                                <span className="px-3 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 flex items-center gap-1 w-fit">
                                                    <EyeOff size={14} />
                                                    Hidden
                                                </span>
                                            ) : (
                                                <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 flex items-center gap-1 w-fit">
                                                    <Eye size={14} />
                                                    Visible
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {isEditing ? (
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => handleSavePrice(tier)}
                                                        disabled={isSaving}
                                                        className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                        title="Save price"
                                                    >
                                                        <Save size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleCancelEdit(tier._id)}
                                                        disabled={isSaving}
                                                        className="p-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                        title="Cancel"
                                                    >
                                                        <X size={16} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => handleEditPrice(tier._id, tier.price)}
                                                    disabled={isIntern}
                                                    className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                    title={isIntern ? 'Intern price cannot be changed' : 'Edit price'}
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-start gap-2">
                        <AlertCircle className="text-yellow-600 mt-0.5 flex-shrink-0" size={18} />
                        <div className="text-sm text-yellow-800">
                            <p className="font-semibold mb-1">Important Notes:</p>
                            <ul className="list-disc list-inside space-y-1 ml-2">
                                <li>Price changes take effect immediately across the entire system</li>
                                <li>Daily income is automatically calculated as: Price ÷ 30 days</li>
                                <li>Per video income is: Daily Income ÷ 4 videos</li>
                                <li>Intern membership must remain free (0 ETB)</li>
                                <li>All users will see updated prices when upgrading memberships</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
