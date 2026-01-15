import React from 'react';
import { HiPencil, HiTrash, HiCalendar, HiTrendingUp, HiCurrencyDollar } from 'react-icons/hi';
import Badge from './shared/Badge';
import Card from './shared/Card';

export default function WealthFundsList({ funds, onEdit, onDelete, renderImageUrl }) {
    if (funds.length === 0) {
        return (
            <div className="col-span-full py-20 text-center bg-white rounded-2xl border-2 border-dashed border-gray-100 flex flex-col items-center justify-center text-gray-400">
                <HiTrendingUp className="text-6xl mb-4 text-gray-100" />
                <p className="font-bold uppercase tracking-widest text-xs">No wealth funds found</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {funds.map((fund) => (
                <Card key={fund._id} className="overflow-hidden group" noPadding>
                    <div className="relative h-48 mb-4">
                        <img
                            src={renderImageUrl(fund.image)}
                            alt={fund.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-4 right-4">
                            <Badge variant={fund.isActive ? 'green' : 'gray'}>
                                {fund.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                        </div>
                    </div>

                    <div className="px-6 pb-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-2 truncate">{fund.name}</h3>
                        <p className="text-[11px] text-gray-500 mb-6 line-clamp-2 min-h-[2rem]">
                            {fund.description}
                        </p>

                        <div className="space-y-3 mb-8 bg-gray-50 p-4 rounded-xl">
                            <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                                <span className="text-gray-400 flex items-center gap-1"><HiCalendar /> Duration</span>
                                <span className="text-gray-800">{fund.days} Days</span>
                            </div>
                            <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                                <span className="text-gray-400 flex items-center gap-1"><HiTrendingUp /> Daily Profit</span>
                                <span className="text-emerald-600">
                                    {fund.profitType === 'percentage' ? `${fund.dailyProfit}%` : `${fund.dailyProfit} ETB`}
                                </span>
                            </div>
                            <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                                <span className="text-gray-400 flex items-center gap-1"><HiCurrencyDollar /> Min. Deposit</span>
                                <span className="text-gray-800">{fund.minimumDeposit} ETB</span>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => onEdit(fund)}
                                className="flex-1 flex items-center justify-center gap-2 bg-indigo-50 text-indigo-600 py-3 rounded-xl hover:bg-indigo-600 hover:text-white transition-all text-[10px] font-bold uppercase tracking-wider"
                            >
                                <HiPencil /> Edit
                            </button>
                            <button
                                onClick={() => onDelete(fund._id)}
                                className="w-12 h-12 flex items-center justify-center bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"
                            >
                                <HiTrash className="text-lg" />
                            </button>
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    );
}
