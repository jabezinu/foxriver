import React from 'react';
import { FiRefreshCw, FiFilter } from 'react-icons/fi';
import Loading from '../components/Loading';
import StatCard from './shared/StatCard';
import { HiChartBar, HiCurrencyDollar, HiBriefcase, HiLightningBolt } from 'react-icons/hi';
import Badge from './shared/Badge';
import Card from './shared/Card';
import { formatNumber } from '../utils/formatNumber';

export default function SpinResults({ spins, stats, loading, pagination, setPagination, filters, onFilterChange, onClearFilters, onRefresh, onExport }) {
    return (
        <div className="animate-fadeIn">
            <div className="flex justify-end gap-3 mb-6">
                <button onClick={onExport} className="admin-btn-secondary py-2 px-4 flex items-center gap-2">
                    <span className="text-lg">📥</span> Export CSV
                </button>
                <button onClick={onRefresh} className="admin-btn-primary py-2 px-4 flex items-center gap-2">
                    <FiRefreshCw className={loading ? 'animate-spin' : ''} /> Refresh
                </button>
            </div>

            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatCard
                        label="Total Plays"
                        value={stats.totalSpins}
                        icon={<HiChartBar className="text-2xl" />}
                        color="indigo"
                    />
                    <StatCard
                        label="Total Jackpots"
                        value={stats.wins}
                        icon={<HiLightningBolt className="text-2xl" />}
                        color="green"
                        trendLabel="Win Rate"
                        trend={stats.totalSpins > 0 ? Number(((stats.wins / stats.totalSpins) * 100).toFixed(1)) : 0}
                    />
                    <StatCard
                        label="Total Collected"
                        value={`${stats.totalPaid} ETB`}
                        icon={<HiCurrencyDollar className="text-2xl" />}
                        color="blue"
                    />
                    <StatCard
                        label="Total Paid Out"
                        value={`${stats.totalWon} ETB`}
                        icon={<HiBriefcase className="text-2xl" />}
                        color="red"
                        trendLabel="Net Profit"
                        trend={stats.totalPaid - stats.totalWon}
                    />
                </div>
            )}

            <Card className="mb-8">
                <div className="flex items-center gap-3 mb-6">
                    <div className="bg-indigo-50 p-2 rounded-lg"><FiFilter className="text-indigo-600" /></div>
                    <h3 className="font-bold text-gray-800">Advanced Filters</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <select
                        name="result"
                        value={filters.result}
                        onChange={onFilterChange}
                        className="admin-input"
                    >
                        <option value="">All Results</option>
                        <option value="Win 100 ETB">🎉 Jackpots Only</option>
                        <option value="Try Again">❌ No Match Only</option>
                    </select>
                    <input type="date" name="startDate" value={filters.startDate} onChange={onFilterChange} className="admin-input" />
                    <input type="date" name="endDate" value={filters.endDate} onChange={onFilterChange} className="admin-input" />
                    <button onClick={onClearFilters} className="admin-btn-secondary">Clear Filters</button>
                </div>
            </Card>

            <Card noPadding className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                <th className="table-header">Date & Time</th>
                                <th className="table-header">User</th>
                                <th className="table-header">Membership</th>
                                <th className="table-header">Result</th>
                                <th className="table-header">Paid</th>
                                <th className="table-header">Won</th>
                                <th className="table-header">Balance After</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr><td colSpan="7" className="py-20"><Loading /></td></tr>
                            ) : spins.length === 0 ? (
                                <tr><td colSpan="7" className="py-20 text-center text-gray-400 font-bold uppercase text-xs">No records found</td></tr>
                            ) : (
                                spins.map((spin) => (
                                    <tr key={spin.id || spin._id} className="table-row">
                                        <td className="px-6 py-4 text-[11px] font-bold text-gray-500 font-mono">
                                            {new Date(spin.createdAt).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 text-xs font-bold text-gray-800">
                                            {spin.player?.phone || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge variant="indigo">{spin.player?.membershipLevel || 'N/A'}</Badge>
                                        </td>
                                        <td className="px-6 py-4">
                                            {spin.result === 'Win 100 ETB' ? (
                                                <Badge variant="green" className="py-1">🎉 {spin.result} ({spin.player?.phone || 'N/A'})</Badge>
                                            ) : (
                                                <Badge variant="red" className="py-1">❌ {spin.result} </Badge>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-xs font-bold text-red-600">-{spin.amountPaid} ETB</td>
                                        <td className="px-6 py-4 text-xs font-bold text-green-600">
                                            {spin.amountWon > 0 ? `+${spin.amountWon} ETB` : '0 ETB'}
                                        </td>
                                        <td className="px-6 py-4 text-xs font-bold text-gray-700">
                                            {formatNumber(spin.balanceAfter || 0)} ETB
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {pagination.pages > 1 && (
                    <div className="px-6 py-4 border-t border-gray-50 flex items-center justify-between bg-gray-50/50">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Page {pagination.page} of {pagination.pages}</span>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                                disabled={pagination.page === 1}
                                className="admin-btn-secondary px-4 py-1.5 text-[10px]"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                                disabled={pagination.page === pagination.pages}
                                className="admin-btn-secondary px-4 py-1.5 text-[10px]"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </Card>
        </div>
    );
}
