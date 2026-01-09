import { useState, useEffect } from 'react';
import { adminMembershipAPI } from '../services/api';
import Loading from '../components/Loading';
import { Eye, EyeOff } from 'lucide-react';

export default function MembershipManagement() {
    const [tiers, setTiers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [startRank, setStartRank] = useState('');
    const [endRank, setEndRank] = useState('');
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        fetchTiers();
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

    if (loading) return <Loading />;

    const rankOptions = Array.from({ length: 10 }, (_, i) => i + 1);

    return (
        <div className="p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Membership Management</h1>
                <p className="text-gray-600">Hide or unhide membership tiers by rank range</p>
            </div>

            {/* Control Panel */}
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
                <h2 className="text-lg font-bold text-gray-800 mb-6">All Membership Tiers</h2>
                
                <div className="overflow-x-auto">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Level
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Price
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
                            </tr>
                        </thead>
                        <tbody>
                            {tiers.map((tier) => (
                                <tr key={tier._id} className={tier.hidden ? 'bg-gray-50' : ''}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="font-semibold text-gray-800">{tier.level}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-gray-700">{tier.price.toLocaleString()} ETB</span>
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
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
