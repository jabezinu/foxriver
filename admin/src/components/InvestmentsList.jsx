import React from 'react';
import Badge from './shared/Badge';
import Card from './shared/Card';
import { formatNumber } from '../utils/formatNumber';

export default function InvestmentsList({ investments, renderImageUrl }) {
    return (
        <Card noPadding className="overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-100">
                            <th className="table-header">Investor</th>
                            <th className="table-header">Fund</th>
                            <th className="table-header">Amount</th>
                            <th className="table-header">Ends In</th>
                            <th className="table-header">Status</th>
                            <th className="table-header text-right">Revenue</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {investments.map((inv) => (
                            <tr key={inv.id || inv._id} className="table-row">
                                <td className="px-6 py-4">
                                    <div className="font-bold text-gray-800 text-xs">{inv.investor?.phone || 'Unknown User'}</div>
                                    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">{inv.investor?.membershipLevel || 'Customer'}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        {inv.fund?.image && (
                                            <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 border border-gray-100">
                                                <img src={renderImageUrl(inv.fund.image)} className="w-full h-full object-cover" />
                                            </div>
                                        )}
                                        <span className="text-xs font-bold text-gray-700 truncate max-w-[120px]">{inv.fund?.name || 'Deleted Fund'}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-xs font-bold text-gray-800">{inv.amount} ETB</div>
                                    <div className="text-[9px] text-gray-400 font-mono">
                                        I: {inv.fundingSource?.incomeWallet} | P: {inv.fundingSource?.personalWallet}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-[11px] font-bold text-gray-500">
                                    {new Date(inv.endDate).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4">
                                    <Badge variant={inv.status === 'active' ? 'green' : inv.status === 'completed' ? 'indigo' : 'red'}>
                                        {inv.status}
                                    </Badge>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="text-xs font-black text-emerald-600">{formatNumber(inv.totalRevenue || 0)} ETB</div>
                                    <div className="text-[9px] text-gray-400 font-bold uppercase tracking-tighter">
                                        +{inv.profitType === 'percentage' ? `${inv.dailyProfit}%` : `${inv.dailyProfit} ETB`}/day
                                    </div>
                                </td>
                            </tr>
                        ))}

                        {investments.length === 0 && (
                            <tr>
                                <td colSpan="6" className="py-20 text-center text-gray-400 font-bold uppercase tracking-widest text-[10px] bg-gray-50/10">
                                    No active investments found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </Card>
    );
}
